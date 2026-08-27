import json
from unittest.mock import patch, MagicMock
import django
django.setup()
from django.test import SimpleTestCase, RequestFactory
from django.contrib.auth.models import User, Group
from django.core.files.uploadedfile import SimpleUploadedFile
from helpdesk.views import send_technical_detail_message, upload_technical_detail_file
from services.ticket_service import add_technical_detail_message, add_technical_detail_file


class TechnicalDetailsServicesTests(SimpleTestCase):
    databases = "__all__"

    def setUp(self):
        self.tech_user = MagicMock(spec=User)
        self.tech_user.__class__ = User
        self.tech_user.username = "tech_user"
        self.tech_user.get_full_name.return_value = "Técnico Silva"
        self.tech_user.is_authenticated = True
        self.tech_user.groups.filter.return_value.exists.return_value = True

    @patch("services.ticket_service.SupportTicket.objects")
    @patch("services.ticket_service.get_object_or_404")
    def test_add_technical_detail_message_success(self, mock_get_or_404, mock_ticket_objects):
        """Valida inclusão de mensagem técnica alterando somente o campo details."""
        mock_ticket = MagicMock()
        mock_ticket.id = 1
        mock_ticket.respective_area = type("Area", (), {"code": "TI"})()
        mock_ticket.details = "[[Date:04/08/2026],[System: Nota antiga],[Hours:09:00]],"
        mock_ticket.chat = "[[Date:04/08/2026],[User: Mensagem pública],[Hours:10:00]],"
        mock_get_or_404.return_value = mock_ticket

        details, record = add_technical_detail_message(
            id=1,
            message="Nova nota interna de atendimento",
            date="04/08/2026",
            hours="11:00",
            user=self.tech_user,
        )

        mock_ticket_objects.filter.assert_called_once_with(id=1)
        self.assertEqual(record["author"], "Técnico Silva")
        self.assertEqual(record["message"], "Nova nota interna de atendimento")

    def test_add_technical_detail_message_empty_raises_error(self):
        """Valida que mensagens em branco retornam ValueError."""
        with self.assertRaises(ValueError):
            add_technical_detail_message(
                id=1,
                message="   ",
                date="04/08/2026",
                hours="11:00",
                user=self.tech_user,
            )

    @patch("services.ticket_service.transaction.atomic", lambda f=None: f if f else (lambda fn: fn))
    @patch("services.ticket_service.TicketFile.objects")
    @patch("services.ticket_service.SupportTicket.objects")
    @patch("services.ticket_service.get_object_or_404")
    @patch("services.ticket_service.verify_valid_or_not")
    def test_add_technical_detail_file_success(
        self, mock_verify, mock_get_or_404, mock_ticket_objects, mock_file_objects
    ):
        """Valida salvamento de arquivo técnico em TicketFile e registro em details."""
        from helpdesk.models import SupportTicket
        mock_ticket = MagicMock(spec=SupportTicket)
        mock_ticket._state = MagicMock()
        mock_ticket.id = 1
        mock_ticket.respective_area = type("Area", (), {"code": "TI"})()
        mock_ticket.details = ""
        mock_get_or_404.return_value = mock_ticket
        mock_verify.return_value = (True, "image/png")

        file_dummy = SimpleUploadedFile("relatorio.png", b"fake_png_data", content_type="image/png")

        details, files_meta = add_technical_detail_file(
            id=1,
            files=[file_dummy],
            date="04/08/2026",
            hours="11:30",
            user=self.tech_user,
        )

        mock_file_objects.bulk_create.assert_called_once()
        saved_file = mock_file_objects.bulk_create.call_args.args[0][0]
        self.assertEqual(saved_file.file_type, "technical:image/png")
        self.assertEqual(len(files_meta), 1)
        self.assertEqual(files_meta[0]["name"], "relatorio.png")

    @patch("services.ticket_service.transaction.atomic", lambda f=None: f if f else (lambda fn: fn))
    @patch("services.ticket_service.get_object_or_404")
    @patch("services.ticket_service.verify_valid_or_not")
    def test_add_technical_detail_file_invalid_type_raises_error(self, mock_verify, mock_get_or_404):
        """Valida rejeição de arquivos com tipos não permitidos."""
        mock_ticket = MagicMock()
        mock_ticket.respective_area = type("Area", (), {"code": "TI"})()
        mock_get_or_404.return_value = mock_ticket
        mock_verify.return_value = (False, "application/x-executable")

        file_dummy = SimpleUploadedFile("malware.exe", b"exe_data")

        with self.assertRaises(ValueError):
            add_technical_detail_file(
                id=1,
                files=[file_dummy],
                date="04/08/2026",
                hours="11:30",
                user=self.tech_user,
            )

    def test_technical_file_names_parsing(self):
        """Valida extração de nomes de arquivos em mensagens técnicas com details preenchido, vazio ou None."""
        from helpdesk.views import _technical_file_names

        self.assertEqual(_technical_file_names(None), [])
        self.assertEqual(_technical_file_names(""), [])
        self.assertEqual(
            _technical_file_names("[[Date:04/08/2026],[System: adicionou o arquivo laudo.pdf],[Hours:11:30]],"),
            ["laudo.pdf"],
        )



class TechnicalDetailsViewsTests(SimpleTestCase):
    databases = "__all__"

    def setUp(self):
        self.factory = RequestFactory()

        self.tech_user = MagicMock(spec=User)
        self.tech_user.username = "tech_guy"
        self.tech_user.is_authenticated = True
        self.tech_user.is_superuser = False
        mock_group = MagicMock()
        mock_group.name = "Helpdesk_Technician_TI"
        self.tech_user.groups.filter.return_value.exists.return_value = True

        self.common_user = MagicMock(spec=User)
        self.common_user.username = "common_guy"
        self.common_user.is_authenticated = True
        self.common_user.is_superuser = False
        self.common_user.groups.filter.return_value.exists.return_value = False

    def test_send_technical_detail_message_unauthorized_for_common_user(self):
        """Valida que usuários não técnicos recebem 403 Forbidden."""
        payload = {"message": "Tentativa por usuário comum"}
        request = self.factory.post(
            "/helpdesk/ticket/1/technical-details/message/",
            data=json.dumps(payload),
            content_type="application/json",
        )
        request.user = self.common_user

        response = send_technical_detail_message(request, 1)
        self.assertEqual(response.status_code, 403)

    @patch("helpdesk.views.SupportTicket.objects.get")
    @patch("helpdesk.views.add_technical_detail_message")
    def test_send_technical_detail_message_success(self, mock_add_message, mock_get_ticket):
        """Valida adição bem-sucedida de nota técnica por usuário técnico."""
        mock_ticket = MagicMock()
        mock_ticket.respective_area = type("Area", (), {"code": "TI"})()
        mock_get_ticket.return_value = mock_ticket

        mock_add_message.return_value = (
            "[[Date:04/08/2026],[System: Nota de atendimento],[Hours:11:00]],",
            {"author": "Técnico TI", "message": "Nota de atendimento", "date": "04/08/2026", "hours": "11:00"}
        )

        payload = {"message": "Nota de atendimento"}
        request = self.factory.post(
            "/helpdesk/ticket/1/technical-details/message/",
            data=json.dumps(payload),
            content_type="application/json",
        )
        request.user = self.tech_user

        response = send_technical_detail_message(request, 1)
        self.assertEqual(response.status_code, 200)

        res_data = json.loads(response.content)
        self.assertEqual(res_data["detail"], "Mensagem técnica adicionada com sucesso")

    @patch("helpdesk.views.SupportTicket.objects.get")
    @patch("helpdesk.views.add_technical_detail_file")
    def test_upload_technical_detail_file_success(self, mock_add_file, mock_get_ticket):
        """Valida upload bem-sucedido de arquivo técnico pela view."""
        mock_ticket = MagicMock()
        mock_ticket.respective_area = type("Area", (), {"code": "TI"})()
        mock_get_ticket.return_value = mock_ticket

        mock_add_file.return_value = (
            "[[Date:04/08/2026],[System: adicionou o arquivo laudo.pdf],[Hours:11:30]],",
            [{"name": "laudo.pdf", "type": "application/pdf", "size": 100}]
        )

        file_dummy = SimpleUploadedFile("laudo.pdf", b"pdf_data", content_type="application/pdf")

        request = self.factory.post(
            "/helpdesk/ticket/1/technical-details/file/",
            data={"files": [file_dummy]},
        )
        request.user = self.tech_user

        response = upload_technical_detail_file(request, 1)
        self.assertEqual(response.status_code, 200)

        res_data = json.loads(response.content)
        self.assertEqual(res_data["detail"], "Arquivo técnico adicionado com sucesso")
