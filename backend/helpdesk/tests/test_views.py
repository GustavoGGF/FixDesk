import json
from unittest.mock import patch, MagicMock
import django
django.setup()
from django.test import SimpleTestCase, TestCase, RequestFactory
from django.contrib.auth.models import User
from helpdesk.views import (
    verify_names,
    ticket,
    log_error_frontend,
    add_machine_info_to_pdf,
    ticket_stop,
    ticket_close,
    ticket_open,
    change_responsible_technician,
    updating_chat_change_sender,
)
from django.contrib.auth.models import AnonymousUser
from rest_framework.test import force_authenticate

class VerifyNamesTests(SimpleTestCase):

    def test_verify_names_exact_match(self):
        """Test exact name match"""
        self.assertTrue(verify_names("John Doe", "John Doe"))

    def test_verify_names_with_middle_names_in_verify(self):
        """Test where name_verify has extra middle names"""
        self.assertTrue(verify_names("John da Silva Doe", "John Doe"))

    def test_verify_names_missing_words_in_verify(self):
        """Test where responsible_technician has words not in name_verify"""
        self.assertFalse(verify_names("John Doe", "John Silva Doe"))

    def test_verify_names_completely_different(self):
        """Test completely different names"""
        self.assertFalse(verify_names("John Doe", "Jane Smith"))

    def test_verify_names_none_name_verify(self):
        """Test when name_verify is None"""
        self.assertFalse(verify_names(None, "John Doe"))

    def test_verify_names_none_responsible_technician(self):
        """Test when responsible_technician is None"""
        self.assertFalse(verify_names("John Doe", None))

    def test_verify_names_both_none(self):
        """Test when both are None"""
        self.assertFalse(verify_names(None, None))

    def test_verify_names_empty_string_name_verify(self):
        """Test when name_verify is an empty string"""
        self.assertFalse(verify_names("", "John Doe"))

    def test_verify_names_empty_string_responsible_technician(self):
        """Test when responsible_technician is an empty string"""
        self.assertFalse(verify_names("John Doe", ""))

    def test_verify_names_both_empty_strings(self):
        """Test when both are empty strings"""
        self.assertFalse(verify_names("", ""))

class TicketViewTests(TestCase):
    def setUp(self) -> None:
        from rest_framework.test import APIClient, APIRequestFactory
        from helpdesk.models import SupportTicket, Area
        from django.utils import timezone
        self.factory = APIRequestFactory()
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="123")
        self.user.get_full_name = MagicMock(return_value="Test User")
        self.client.force_login(self.user)
        self.client.force_authenticate(user=self.user)
        self.ticket = SupportTicket.objects.create(
            id=1,
            ticketRequester="testuser",
            department="TI",
            mail="testuser@mail.com",
            company="Lupatech",
            sector="TI",
            occurrence="Hardware",
            problemn="Computador",
            start_date=timezone.now(),
            respective_area=Area.objects.get_or_create(code="TI")[0],
            responsible_technician="Tech Antigo",
            PID=self.user.id,
            open=True
        )

    @patch("helpdesk.views.change_responsible_technician")
    def test_ticket_view_post_responsible_technician(self, mock_change_tech: MagicMock) -> None:
        """Valida que a view processa requisições JSON e chama o serviço change_responsible_technician"""
        mock_change_tech.return_value = ("Chat atualizado", "Tech Novo")

        payload = {
            "responsible_technician": "Tech Novo",
            "technician": "Tech Antigo",
            "date": "2023-10-10",
            "hours": "10:00",
            "techMail": "tech@mail.com",
            "mail": "user@mail.com",
            "user": "testuser",
            "helpdesk": "dashboard"
        }

        response = self.client.post("/helpdesk/ticket/1", data=payload, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"total": 1})
        mock_change_tech.assert_called_once_with(
            1,
            "Tech Novo",
            "Tech Antigo",
            "2023-10-10",
            "10:00",
            "tech@mail.com",
            "user@mail.com",
            "testuser"
        )

    def test_ticket_view_post_unsupported_media_type(self) -> None:
        """Valida que a view rejeita requisições sem Content-Type application/json com HTTP 415"""
        payload = {
            "responsible_technician": "Tech Novo",
            "technician": "Tech Antigo"
        }

        response = self.client.post(
            "/helpdesk/ticket/1",
            data=json.dumps(payload),
            content_type="text/plain"
        )

        self.assertEqual(response.status_code, 415)

    @patch("helpdesk.views.process_ticket_files", return_value=(None, None, None))
    @patch("helpdesk.models.SupportTicket.files")
    def test_ticket_view_get_detail_serializable(self, mock_files: MagicMock, mock_process: MagicMock) -> None:
        """Valida que GET /helpdesk/ticket/<id> retorna HTTP 200 e dados serialiáveis em JSON com respective_area e respective_area_code"""
        from helpdesk.models import SupportTicket
        mock_files.exclude.return_value.exclude.return_value = []
        response = self.client.get("/helpdesk/ticket/1")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("data", data)
        self.assertEqual(data["data"]["id"], 1)
        self.assertIsInstance(data["data"]["respective_area"], int)
        self.assertEqual(data["data"]["respective_area_code"], "TI")


    @patch("helpdesk.views.add_technical_detail_message")
    def test_send_technical_detail_message_view(self, mock_add_tech_msg: MagicMock) -> None:
        """Valida que a view send_technical_detail_message invoca o serviço add_technical_detail_message"""
        from helpdesk.views import send_technical_detail_message
        from django.contrib.auth.models import Group
        
        tech_group, _ = Group.objects.get_or_create(name="Helpdesk_Technician_TI")
        self.user.groups.add(tech_group)
        mock_add_tech_msg.return_value = ("Detalhes Atualizados", {"author": "Test", "message": "msg"})
        
        request = self.factory.post(
            "/helpdesk/ticket/1/technical-details/message/",
            data=json.dumps({"message": "teste"}),
            content_type="application/json"
        )
        force_authenticate(request, user=self.user)
        request.user = self.user
        
        response = send_technical_detail_message(request, 1)
        
        self.assertEqual(response.status_code, 200)
        mock_add_tech_msg.assert_called_once()


class LogErrorFrontendViewTests(SimpleTestCase):
    databases = "__all__"

    def setUp(self):
        from rest_framework.test import APIRequestFactory
        self.factory = APIRequestFactory()

    @patch("helpdesk.views.log_frontend_error")
    def test_log_error_frontend_success(self, mock_log_service):
        """
        Input:  payload com mensagem, stack e url corretos
        Expect: Chama o serviço log_frontend_error e retorna status 204
        Result: verificado via assert
        """
        payload = {
            "message": "Test error",
            "stack": "Test stack",
            "url": "http://test.com"
        }
        request = self.factory.post(
            "/helpdesk/log-error-frontend/",
            data=json.dumps(payload),
            content_type="application/json"
        )
        response = log_error_frontend(request)
        self.assertEqual(response.status_code, 204, f"Got status {response.status_code}")
        mock_log_service.assert_called_once_with("http://test.com", "Test error", "Test stack")

    def test_log_error_frontend_invalid_json(self):
        """
        Input:  payload malformado (json inválido)
        Expect: Retorna status 400 e JSON de erro
        Result: verificado via assert
        """
        request = self.factory.post(
            "/helpdesk/log-error-frontend/",
            data="not-a-json",
            content_type="application/json"
        )
        response = log_error_frontend(request)
        self.assertEqual(response.status_code, 400, f"Got status {response.status_code}")
        self.assertEqual(json.loads(response.content), {"erro": "Payload inválido"})


class GetTicketFilterV2ViewTests(TestCase):
    def setUp(self) -> None:
        from rest_framework.test import APIClient
        from helpdesk.models import SupportTicket, Area
        from django.contrib.auth.models import Group
        from django.utils import timezone

        self.client = APIClient()
        self.tech_user = User.objects.create_user(username="tech_ti", password="123")
        tech_group, _ = Group.objects.get_or_create(name="Helpdesk_Technician_TI")
        self.tech_user.groups.add(tech_group)
        self.client.force_login(self.tech_user)

        self.area_ti, _ = Area.objects.get_or_create(code="TI")
        self.ticket = SupportTicket.objects.create(
            id=10,
            ticketRequester="user1",
            department="TI",
            mail="user1@mail.com",
            company="Lupatech",
            sector="TI",
            occurrence="Hardware",
            problemn="Computador",
            start_date=timezone.now(),
            respective_area=self.area_ti,
            responsible_technician="Tech Novo",
            PID=self.tech_user.id,
            open=True,
        )

    def test_get_ticket_filter_v2_dashboard_area_ti(self) -> None:
        """
        Input: GET /helpdesk/tickets/?context=dashboard&area=TI&status=open&order=-id&limit=20
        Expect: 200 OK and list of tickets matching area TI without Field 'id' expected a number exception
        """
        response = self.client.get("/helpdesk/tickets/?context=dashboard&area=TI&status=open&order=-id&limit=20")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("tickets", data)
        self.assertEqual(len(data["tickets"]), 1)
        self.assertEqual(data["tickets"][0]["id"], 10)

    def test_get_ticket_filter_v2_history_area_ti(self) -> None:
        """
        Input: GET /helpdesk/tickets/?context=history&area=TI&status=open&order=-id&limit=20
        Expect: 200 OK and list of tickets matching area TI
        """
        response = self.client.get("/helpdesk/tickets/?context=history&area=TI&status=open&order=-id&limit=20")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("tickets", data)
        self.assertEqual(len(data["tickets"]), 1)
        self.assertEqual(data["tickets"][0]["id"], 10)


class AddMachineInfoToPdfTests(SimpleTestCase):
    @patch("helpdesk.views.get_machine_model")
    def test_add_machine_info_to_pdf_none_equipment(self, mock_get_machine_model: MagicMock) -> None:
        """
        Valida que se ticket.equipament for None, get_machine_model não é invocado.
        """
        ticket = MagicMock()
        ticket.equipament = None
        pdf = MagicMock()

        add_machine_info_to_pdf(ticket, pdf)

        mock_get_machine_model.assert_not_called()

    @patch("helpdesk.views.getUrl")
    @patch("helpdesk.views.get_machine_model")
    def test_add_machine_info_to_pdf_valid_equipment(
        self, mock_get_machine_model: MagicMock, mock_get_url: MagicMock
    ) -> None:
        """
        Valida que se ticket.equipament for uma string MAC válida, get_machine_model é invocado com essa string.
        """
        ticket = MagicMock()
        ticket.equipament = "00:11:22:33:44:55"
        pdf = MagicMock()
        mock_get_machine_model.return_value = "Dell OptiPlex 7090"
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_get_url.return_value = mock_response

        add_machine_info_to_pdf(ticket, pdf)

        mock_get_machine_model.assert_called_once_with("00:11:22:33:44:55")


class TicketChatConcatenationTests(TestCase):
    def setUp(self) -> None:
        from helpdesk.models import SupportTicket, Area
        from django.utils import timezone
        self.area, _ = Area.objects.get_or_create(code="TI")
        self.ticket = SupportTicket.objects.create(
            id=200,
            ticketRequester="user1",
            department="TI",
            mail="user1@mail.com",
            company="Lupatech",
            sector="TI",
            occurrence="Hardware",
            problemn="Computador",
            start_date=timezone.now(),
            respective_area=self.area,
            responsible_technician="Tech Silva",
            PID=1,
            open=True,
            chat=None,
        )

    @patch("helpdesk.views.send_mail")
    def test_ticket_stop_with_none_chat(self, mock_send_mail: MagicMock) -> None:
        """Valida que ticket_stop concatena no chat quando ticket.chat é None sem lançar TypeError."""
        response = ticket_stop(
            id=self.ticket.id,
            technician="Tech Silva",
            date="2026-08-13",
            hours="10:00",
            mail="test@mail.com",
        )
        self.ticket.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(self.ticket.chat)
        self.assertIn("System: Tech Silva Deixou esse chamado em aguardo", self.ticket.chat or "")

    @patch("helpdesk.views.send_mail")
    def test_ticket_close_assigns_datetime_to_end_date(self, mock_send_mail: MagicMock) -> None:
        """Valida que ticket_close atribui uma instância de datetime para ticket.end_date."""
        from datetime import datetime
        response = ticket_close(
            id=self.ticket.id,
            technician="Tech Silva",
            date="2026-08-13",
            hours="10:00",
            mail="test@mail.com",
        )
        self.ticket.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(self.ticket.end_date, datetime)
        self.assertNotIsInstance(self.ticket.end_date, str)

class StatusFilteringTests(TestCase):
    def setUp(self) -> None:
        from rest_framework.test import APIClient
        from helpdesk.models import SupportTicket, Area
        from django.contrib.auth.models import Group
        from django.utils import timezone

        self.client = APIClient()
        self.user = User.objects.create_user(username="tech_user", password="123")
        tech_group, _ = Group.objects.get_or_create(name="Helpdesk_Technician_TI")
        self.user.groups.add(tech_group)
        self.client.force_login(self.user)
        self.client.force_authenticate(user=self.user)

        self.area_ti, _ = Area.objects.get_or_create(code="TI")
        now = timezone.now()

        # Ticket 1: open=True (aberto)
        self.ticket_open = SupportTicket.objects.create(
            id=101,
            ticketRequester="user1",
            department="TI",
            mail="user1@mail.com",
            company="Lupatech",
            sector="TI",
            occurrence="Hardware",
            problemn="Computador",
            start_date=now,
            respective_area=self.area_ti,
            PID=self.user.id,
            open=True,
        )
        # Ticket 2: open=False (fechado)
        self.ticket_closed = SupportTicket.objects.create(
            id=102,
            ticketRequester="user2",
            department="TI",
            mail="user2@mail.com",
            company="Lupatech",
            sector="TI",
            occurrence="Hardware",
            problemn="Computador",
            start_date=now,
            respective_area=self.area_ti,
            PID=self.user.id,
            open=False,
        )
        # Ticket 3: open=None (parado)
        self.ticket_stopped = SupportTicket.objects.create(
            id=103,
            ticketRequester="user3",
            department="TI",
            mail="user3@mail.com",
            company="Lupatech",
            sector="TI",
            occurrence="Hardware",
            problemn="Computador",
            start_date=now,
            respective_area=self.area_ti,
            PID=self.user.id,
            open=None,
        )

    def test_history_get_ticket_status_stop_returns_only_stopped_tickets(self) -> None:
        """Valida que /helpdesk/get-ticket/<qty>/<usr>/stop/<order> retorna apenas chamados parados (open=None)."""
        response = self.client.get(f"/helpdesk/get-ticket/10/{self.user.username}/stop/-id")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        ticket_ids = [t["id"] for t in data.get("tickets", [])]
        self.assertEqual(ticket_ids, [103])

    def test_history_get_ticket_status_null_returns_all_tickets(self) -> None:
        """Valida que /helpdesk/get-ticket/<qty>/<usr>/null/<order> não filtra por status e retorna todos os chamados."""
        response = self.client.get(f"/helpdesk/get-ticket/10/{self.user.username}/null/-id")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        ticket_ids = [t["id"] for t in data.get("tickets", [])]
        self.assertEqual(set(ticket_ids), {101, 102, 103})

    def test_history_get_ticket_respects_quantity_limit(self) -> None:
        """Valida que /helpdesk/get-ticket/<qty>/<usr>/null/<order> respeita a quantidade máxima informada."""
        response = self.client.get(f"/helpdesk/get-ticket/2/{self.user.username}/null/-id")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        tickets = data.get("tickets", [])
        self.assertEqual(len(tickets), 2)


    def test_get_ticket_filter_v2_status_stop_returns_only_stopped_tickets(self) -> None:
        """Valida que GET /helpdesk/tickets/?context=history&status=stop retorna apenas chamados parados (open=None)."""
        response = self.client.get("/helpdesk/tickets/?context=history&status=stop&limit=10")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        ticket_ids = [t["id"] for t in data.get("tickets", [])]
        self.assertEqual(ticket_ids, [103])

    def test_get_ticket_filter_v2_status_all_returns_all_tickets(self) -> None:
        """Valida que GET /helpdesk/tickets/?context=history&status=all retorna todos os chamados."""
        response = self.client.get("/helpdesk/tickets/?context=history&status=all&limit=10")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        ticket_ids = [t["id"] for t in data.get("tickets", [])]
        self.assertEqual(set(ticket_ids), {101, 102, 103})
