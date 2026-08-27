from typing import Any
import pytest
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.contrib.auth.models import User, Group
from django.core.files.uploadedfile import SimpleUploadedFile

from datetime import datetime
from django.utils import timezone

pytestmark = pytest.mark.django_db

from helpdesk.models import SupportTicket, TicketFile, TicketMail, Area
from services.ticket_service import (
    change_responsible_technician,
    add_technical_detail_message,
    add_technical_detail_file,
    update_tech_details,
    updating_chat_change_sender,
    verify_notification_call,
    ticket_stop,
    ticket_close,
    ticket_open,
)
from classes.exceptions.auth_exeption import AuthenticationError


class TicketServiceDomainTests(TestCase):
    def setUp(self) -> None:
        self.group_ti, _ = Group.objects.get_or_create(name="Helpdesk_Technician_TI")
        self.group_fiscal, _ = Group.objects.get_or_create(name="Helpdesk_Technician_Fiscal")
        self.group_leader, _ = Group.objects.get_or_create(name="Helpdesk_Leader_TI")

        self.tech_ti = User.objects.create_user(
            username="tech_ti",
            first_name="Tech",
            last_name="TI",
            email="tech_ti@mail.com",
        )
        self.tech_ti.groups.add(self.group_ti)

        self.tech_fiscal = User.objects.create_user(
            username="tech_fiscal",
            first_name="Tech",
            last_name="Fiscal",
            email="tech_fiscal@mail.com",
        )
        self.tech_fiscal.groups.add(self.group_fiscal)

        self.tech_dual = User.objects.create_user(
            username="tech_dual",
            first_name="Tech",
            last_name="Dual",
            email="tech_dual@mail.com",
        )
        self.tech_dual.groups.add(self.group_ti, self.group_fiscal)

        self.leader_ti = User.objects.create_user(
            username="leader_ti",
            first_name="Leader",
            last_name="TI",
            email="leader_ti@mail.com",
        )
        self.leader_ti.groups.add(self.group_leader)

        self.common_user = User.objects.create_user(
            username="common_user",
            first_name="Common",
            last_name="User",
            email="common@mail.com",
        )

        self.ticket_ti = SupportTicket.objects.create(
            ticketRequester="common_user",
            mail="common@mail.com",
            company="FixDesk",
            sector="Tecnologia",
            occurrence="Incidente",
            problemn="Computador",
            start_date=timezone.now(),
            respective_area=Area.objects.get_or_create(code="TI")[0],
            PID=101,
        )

        self.ticket_fiscal = SupportTicket.objects.create(
            ticketRequester="common_user",
            mail="common@mail.com",
            company="FixDesk",
            sector="Financeiro",
            occurrence="Dúvida",
            problemn="Nota Fiscal",
            start_date=timezone.now(),
            respective_area=Area.objects.get_or_create(code="Fiscal")[0],
            PID=102,
        )

    def test_missing_required_fields(self) -> None:
        """Valida a falha quando campos obrigatórios não são informados."""
        with self.assertRaisesMessage(ValueError, "Campos obrigatórios ausentes"):
            change_responsible_technician(
                id=self.ticket_ti.id,
                responsible_technician="",
                technician="Tech TI",
                date="2026-08-05",
                hours="10:00",
                techMail="tech_ti@mail.com",
                mail="common@mail.com",
                username="tech_ti",
            )

    def test_missing_required_fields_none(self) -> None:
        """Valida a falha quando campos obrigatórios são None."""
        with self.assertRaisesMessage(ValueError, "Campos obrigatórios ausentes"):
            change_responsible_technician(
                id=self.ticket_ti.id,
                responsible_technician=None,
                technician="Tech TI",
                date="2026-08-05",
                hours="10:00",
                techMail="tech_ti@mail.com",
                mail="common@mail.com",
                username="tech_ti",
            )

    @patch("services.ticket_service.Thread")
    def test_valid_assignment_ti_technician_to_ti_ticket(self, mock_thread: MagicMock) -> None:
        """Técnico de TI pode assumir chamado da área TI."""
        chat, responsible = change_responsible_technician(
            id=self.ticket_ti.id,
            responsible_technician="Tech TI",
            technician="Tech TI",
            date="2026-08-05",
            hours="10:00",
            techMail="tech_ti@mail.com",
            mail="common@mail.com",
            username="tech_ti",
        )
        self.assertEqual(responsible, "Tech TI")
        self.assertIn("atendeu ao Chamado", chat)

    def test_invalid_assignment_ti_technician_to_fiscal_ticket(self) -> None:
        """Técnico exclusivo de TI NÃO pode assumir chamado da área Fiscal."""
        with self.assertRaises(ValueError) as cm:
            change_responsible_technician(
                id=self.ticket_fiscal.id,
                responsible_technician="Tech TI",
                technician="Tech TI",
                date="2026-08-05",
                hours="10:00",
                techMail="tech_ti@mail.com",
                mail="common@mail.com",
                username="tech_ti",
            )
        self.assertIn("não possui permissão para a área 'Fiscal'", str(cm.exception))

    @patch("services.ticket_service.Thread")
    def test_valid_assignment_fiscal_technician_to_fiscal_ticket(self, mock_thread: MagicMock) -> None:
        """Técnico Fiscal pode assumir chamado da área Fiscal."""
        chat, responsible = change_responsible_technician(
            id=self.ticket_fiscal.id,
            responsible_technician="Tech Fiscal",
            technician="Tech Fiscal",
            date="2026-08-05",
            hours="10:00",
            techMail="tech_fiscal@mail.com",
            mail="common@mail.com",
            username="tech_fiscal",
        )
        self.assertEqual(responsible, "Tech Fiscal")
        self.assertIn("atendeu ao Chamado", chat)

    def test_invalid_assignment_fiscal_technician_to_ti_ticket(self) -> None:
        """Técnico exclusivo Fiscal NÃO pode assumir chamado da área TI."""
        with self.assertRaises(ValueError) as cm:
            change_responsible_technician(
                id=self.ticket_ti.id,
                responsible_technician="Tech Fiscal",
                technician="Tech Fiscal",
                date="2026-08-05",
                hours="10:00",
                techMail="tech_fiscal@mail.com",
                mail="common@mail.com",
                username="tech_fiscal",
            )
        self.assertIn("não possui permissão para a área 'TI'", str(cm.exception))

    @patch("services.ticket_service.Thread")
    def test_valid_assignment_dual_role_technician_to_both_areas(self, mock_thread: MagicMock) -> None:
        """Técnico dual-role pode ser atribuído a chamados TI e Fiscal."""
        chat1, resp1 = change_responsible_technician(
            id=self.ticket_ti.id,
            responsible_technician="Tech Dual",
            technician="Tech Dual",
            date="2026-08-05",
            hours="10:00",
            techMail="tech_dual@mail.com",
            mail="common@mail.com",
            username="tech_dual",
        )
        self.assertEqual(resp1, "Tech Dual")

        chat2, resp2 = change_responsible_technician(
            id=self.ticket_fiscal.id,
            responsible_technician="Tech Dual",
            technician="Tech Dual",
            date="2026-08-05",
            hours="10:05",
            techMail="tech_dual@mail.com",
            mail="common@mail.com",
            username="tech_dual",
        )
        self.assertEqual(resp2, "Tech Dual")

    def test_invalid_assignment_leader_ti_to_fiscal_ticket(self) -> None:
        """Líder de TI permanece restrito à área TI e não pode assumir Fiscal."""
        with self.assertRaises(ValueError) as cm:
            change_responsible_technician(
                id=self.ticket_fiscal.id,
                responsible_technician="Leader TI",
                technician="Leader TI",
                date="2026-08-05",
                hours="10:00",
                techMail="leader_ti@mail.com",
                mail="common@mail.com",
                username="leader_ti",
            )
        self.assertIn("não possui permissão para a área 'Fiscal'", str(cm.exception))

    @patch("services.ticket_service.Thread")
    def test_transfer_to_same_technician(self, mock_thread: MagicMock) -> None:
        """Lança exceção ao tentar transferir para o mesmo técnico já responsável."""
        change_responsible_technician(
            id=self.ticket_ti.id,
            responsible_technician="Tech TI",
            technician="Tech TI",
            date="2026-08-05",
            hours="10:00",
            techMail="tech_ti@mail.com",
            mail="common@mail.com",
            username="tech_ti",
        )

        with self.assertRaisesMessage(
            ValueError,
            "Metodologia desconhecida para transferir o chamado a alguém que já é responsável por ele.",
        ):
            change_responsible_technician(
                id=self.ticket_ti.id,
                responsible_technician="Tech TI",
                technician="Tech TI",
                date="2026-08-05",
                hours="10:10",
                techMail="tech_ti@mail.com",
                mail="common@mail.com",
                username="other_user",
            )

    @patch("services.ticket_service.Thread")
    def test_transfer_between_authorized_technicians(self, mock_thread: MagicMock) -> None:
        """Transferência válida entre técnicos com permissão na área."""
        change_responsible_technician(
            id=self.ticket_ti.id,
            responsible_technician="Tech TI",
            technician="Tech TI",
            date="2026-08-05",
            hours="10:00",
            techMail="tech_ti@mail.com",
            mail="common@mail.com",
            username="tech_ti",
        )

        chat, resp = change_responsible_technician(
            id=self.ticket_ti.id,
            responsible_technician="Tech Dual",
            technician="Tech TI",
            date="2026-08-05",
            hours="10:15",
            techMail="tech_dual@mail.com",
            mail="common@mail.com",
            username="tech_ti",
        )
        self.assertEqual(resp, "Tech Dual")
        self.assertIn("Tech TI transferiu o Chamado para Tech Dual", chat)

    def test_add_technical_detail_message_valid_and_invalid(self) -> None:
        """Testa adição de notas técnicas por técnicos autorizados e rejeição para não autorizados."""
        details, record = add_technical_detail_message(
            id=self.ticket_ti.id,
            message="Nota técnica TI",
            date="05/08/2026",
            hours="11:00",
            user=self.tech_ti,
        )
        self.assertIn("Nota técnica TI", details)
        self.assertEqual(record["author"], "Tech TI")

        with self.assertRaises(ValueError) as cm1:
            add_technical_detail_message(
                id=self.ticket_fiscal.id,
                message="Tentativa TI em Fiscal",
                date="05/08/2026",
                hours="11:05",
                user=self.tech_ti,
            )
        self.assertIn("não possui permissão técnica para a área 'Fiscal'", str(cm1.exception))

        details_f, _ = add_technical_detail_message(
            id=self.ticket_fiscal.id,
            message="Nota técnica Fiscal",
            date="05/08/2026",
            hours="11:10",
            user=self.tech_fiscal,
        )
        self.assertIn("Nota técnica Fiscal", details_f)

        details_dual_ti, _ = add_technical_detail_message(
            id=self.ticket_ti.id,
            message="Nota Dual em TI",
            date="05/08/2026",
            hours="11:15",
            user=self.tech_dual,
        )
        self.assertIn("Nota Dual em TI", details_dual_ti)

        details_dual_f, _ = add_technical_detail_message(
            id=self.ticket_fiscal.id,
            message="Nota Dual em Fiscal",
            date="05/08/2026",
            hours="11:20",
            user=self.tech_dual,
        )
        self.assertIn("Nota Dual em Fiscal", details_dual_f)

        with self.assertRaises(ValueError) as cm2:
            add_technical_detail_message(
                id=self.ticket_ti.id,
                message="Tentativa Usuário Comum",
                date="05/08/2026",
                hours="11:25",
                user=self.common_user,
            )
        self.assertIn("não possui permissão técnica para a área 'TI'", str(cm2.exception))

    @patch("services.ticket_service.TicketFile.objects")
    @patch("services.ticket_service.verify_valid_or_not", return_value=(True, "image/png"))
    def test_add_technical_detail_file_valid_and_invalid(
        self, mock_verify: MagicMock, mock_ticket_file_objects: MagicMock
    ) -> None:
        """Testa inclusão de anexos técnicos para técnicos das áreas TI, Fiscal e dual-role."""
        file_dummy = SimpleUploadedFile("laudo.png", b"fake_png_data", content_type="image/png")

        details, meta = add_technical_detail_file(
            id=self.ticket_ti.id,
            files=[file_dummy],
            date="05/08/2026",
            hours="11:30",
            user=self.tech_ti,
        )
        self.assertEqual(meta[0]["name"], "laudo.png")

        with self.assertRaises(ValueError) as cm1:
            add_technical_detail_file(
                id=self.ticket_fiscal.id,
                files=[file_dummy],
                date="05/08/2026",
                hours="11:35",
                user=self.tech_ti,
            )
        self.assertIn("não possui permissão técnica para a área 'Fiscal'", str(cm1.exception))

        details_f, meta_f = add_technical_detail_file(
            id=self.ticket_fiscal.id,
            files=[file_dummy],
            date="05/08/2026",
            hours="11:40",
            user=self.tech_fiscal,
        )
        self.assertEqual(meta_f[0]["name"], "laudo.png")

        _, meta_d1 = add_technical_detail_file(
            id=self.ticket_ti.id,
            files=[file_dummy],
            date="05/08/2026",
            hours="11:45",
            user=self.tech_dual,
        )
        self.assertEqual(meta_d1[0]["name"], "laudo.png")

        _, meta_d2 = add_technical_detail_file(
            id=self.ticket_fiscal.id,
            files=[file_dummy],
            date="05/08/2026",
            hours="11:50",
            user=self.tech_dual,
        )
        self.assertEqual(meta_d2[0]["name"], "laudo.png")

        with self.assertRaises(ValueError) as cm2:
            add_technical_detail_file(
                id=self.ticket_ti.id,
                files=[file_dummy],
                date="05/08/2026",
                hours="11:55",
                user=self.common_user,
            )
        self.assertIn("não possui permissão técnica para a área 'TI'", str(cm2.exception))


class UpdateTechDetailsTests(TestCase):
    def test_unauthenticated_user(self) -> None:
        """Valida se AuthenticationError é lançado quando o request não tem usuário válido."""
        ticket = SupportTicket.objects.create(
            ticketRequester="common_user",
            mail="common@mail.com",
            company="FixDesk",
            sector="Tecnologia",
            occurrence="Incidente",
            problemn="Computador",
            start_date=timezone.now(),
            respective_area=Area.objects.get_or_create(code="TI")[0],
            PID=104,
        )
        mock_request = MagicMock()
        mock_request.user = "invalid_user_object"

        with self.assertRaisesMessage(AuthenticationError, "Usuário não autenticado ou inválido"):
            update_tech_details(
                chat="Detalhes técnicos",
                id=ticket.id,
                date="2023-10-10",
                hours="10:00",
                request=mock_request,
            )

    def test_update_tech_details_success(self) -> None:
        """Valida o sucesso da adição de notas técnicas (detalhes)."""
        group_ti, _ = Group.objects.get_or_create(name="Helpdesk_Technician_TI")
        user = User.objects.create_user(
            username="tech_ti_details",
            first_name="Tech",
            last_name="TI",
        )
        user.groups.add(group_ti)

        ticket = SupportTicket.objects.create(
            ticketRequester="common_user",
            mail="common@mail.com",
            company="FixDesk",
            sector="Tecnologia",
            occurrence="Incidente",
            problemn="Computador",
            start_date=timezone.now(),
            respective_area=Area.objects.get_or_create(code="TI")[0],
            PID=103,
            details="Detalhe anterior. ",
        )

        mock_request = MagicMock()
        mock_request.user = user

        chat_content = update_tech_details(
            chat="Detalhes técnicos",
            id=ticket.id,
            date="2023-10-10",
            hours="10:00",
            request=mock_request,
        )

        self.assertIn("Detalhe anterior.", chat_content)
        self.assertIn("Detalhes técnicos", chat_content)


class UpdatingChatChangeSenderTests(TestCase):
    @patch("services.ticket_service.SupportTicket.objects.get")
    @patch("services.ticket_service.update_last_sender")
    @patch("services.ticket_service.Thread")
    def test_helpdesk_chat_update(
        self, mock_thread: MagicMock, mock_update_last_sender: MagicMock, mock_get: MagicMock
    ) -> None:
        """Valida atualização de chat partindo do helpdesk (usuário comum)."""
        mock_ticket = MagicMock()
        mock_ticket.chat = "Chat prévio"
        mock_get.return_value = mock_ticket

        result = updating_chat_change_sender(
            id=1,
            chat="Mensagem de teste",
            date="2023-10-10",
            hours="10:00",
            user="João",
            helpdesk="helpdesk",
        )

        expected = "Chat prévio,[[Date:2023-10-10],[User: Mensagem de teste],[Hours:10:00]]"
        self.assertEqual(result, expected)
        mock_update_last_sender.assert_called_once_with(mock_ticket, "João", "2023-10-10", "10:00")
        mock_ticket.save.assert_called_once()
        mock_thread.assert_called_once()

    @patch("services.ticket_service.SupportTicket.objects.get")
    @patch("services.ticket_service.update_last_sender")
    @patch("services.ticket_service.Thread")
    def test_dashboard_chat_update(
        self, mock_thread: MagicMock, mock_update_last_sender: MagicMock, mock_get: MagicMock
    ) -> None:
        """Valida atualização de chat partindo do dashboard (técnico)."""
        mock_ticket = MagicMock()
        mock_ticket.chat = "Chat prévio"
        mock_get.return_value = mock_ticket

        result = updating_chat_change_sender(
            id=1,
            chat="Resposta técnica",
            date="2023-10-10",
            hours="10:00",
            user="Tech",
            helpdesk="dashboard",
        )

        expected = "Chat prévio,[[Date:2023-10-10],[Technician: Resposta técnica],[Hours:10:00]]"
        self.assertEqual(result, expected)
        mock_update_last_sender.assert_called_once_with(mock_ticket, "Tech", "2023-10-10", "10:00")
        mock_ticket.save.assert_called_once()
        mock_thread.assert_called_once()

    @patch("services.ticket_service.SupportTicket.objects.get")
    @patch("services.ticket_service.update_last_sender")
    @patch("services.ticket_service.Thread")
    def test_chat_update_when_chat_is_none(
        self, mock_thread: MagicMock, mock_update_last_sender: MagicMock, mock_get: MagicMock
    ) -> None:
        """Valida atualização de chat quando ticket.chat é None."""
        mock_ticket = MagicMock()
        mock_ticket.chat = None
        mock_get.return_value = mock_ticket

        result = updating_chat_change_sender(
            id=1,
            chat="Primeira mensagem",
            date="2023-10-10",
            hours="10:00",
            user="João",
            helpdesk="helpdesk",
        )

        expected = ",[[Date:2023-10-10],[User: Primeira mensagem],[Hours:10:00]]"
        self.assertEqual(result, expected)
        mock_ticket.save.assert_called_once()
        mock_thread.assert_called_once()



class VerifyNotificationCallTests(TestCase):
    @patch("services.ticket_service.TicketMail.objects.filter")
    @patch("services.ticket_service.TicketMail")
    def test_verify_notification_call_creates_mail_entry(
        self, mock_ticket_mail: MagicMock, mock_filter: MagicMock
    ) -> None:
        """Valida que verify_notification_call cria uma entrada TicketMail quando não existe."""
        mock_ticket = MagicMock()
        mock_filter.return_value.exists.return_value = False

        verify_notification_call(mock_ticket)

        mock_filter.assert_called_once_with(ticket=mock_ticket)
        mock_ticket_mail.assert_called_once()
        mock_ticket_mail.return_value.save.assert_called_once()

    @patch("services.ticket_service.TicketMail.objects.filter")
    @patch("services.ticket_service.TicketMail")
    def test_verify_notification_call_skips_when_exists(
        self, mock_ticket_mail: MagicMock, mock_filter: MagicMock
    ) -> None:
        """Valida que verify_notification_call não cria duplicatas quando TicketMail já existe."""
        mock_ticket = MagicMock()
        mock_filter.return_value.exists.return_value = True

        verify_notification_call(mock_ticket)

        mock_filter.assert_called_once_with(ticket=mock_ticket)
        mock_ticket_mail.assert_not_called()

    @patch("services.ticket_service.TicketMail.objects.filter")
    @patch("services.ticket_service.logger.error")
    def test_verify_notification_call_handles_exception(
        self, mock_logger_error: MagicMock, mock_filter: MagicMock
    ) -> None:
        """Valida captura e log de exceção sem propagar falha."""
        mock_ticket = MagicMock()
        error = Exception("DB error")
        mock_filter.side_effect = error

        verify_notification_call(mock_ticket)

        mock_logger_error.assert_called_once_with(error)


class TicketStatusTests(TestCase):
    @patch("services.ticket_service.get_object_or_404")
    def test_ticket_stop_without_technician(self, mock_get_object: MagicMock) -> None:
        """Valida exceção ao tentar parar um chamado sem técnico definido."""
        mock_ticket = MagicMock()
        mock_ticket.responsible_technician = None
        mock_get_object.return_value = mock_ticket

        with self.assertRaisesMessage(ValueError, "Tecnico não Definido"):
            ticket_stop(
                id=1, technician="Tech", date="2023-10-10", hours="10:00", mail="test@mail.com"
            )

    @patch("services.ticket_service.get_object_or_404")
    def test_ticket_close_success(self, mock_get_object: MagicMock) -> None:
        """Valida que o chamado seja fechado com sucesso pelo técnico correto."""
        mock_ticket = MagicMock()
        mock_ticket.responsible_technician = "Tech Silva"
        mock_ticket.open = True
        mock_ticket.chat = "Chat"
        mock_get_object.return_value = mock_ticket

        with patch("services.ticket_service.Thread") as mock_thread:
            result = ticket_close(
                id=1, technician="Tech Silva", date="2023-10-10", hours="10:00", mail="test@mail.com"
            )

            self.assertEqual(result, "Chamado Finalizado")
            self.assertEqual(mock_ticket.open, False)
            self.assertEqual(mock_ticket.technician_mail, None)
            self.assertIsInstance(mock_ticket.end_date, datetime)
            self.assertNotIsInstance(mock_ticket.end_date, str)
            mock_ticket.save.assert_called_once()
            mock_thread.assert_called_once()

    @patch("services.ticket_service.SupportTicket.objects.filter")
    @patch("services.ticket_service.get_object_or_404")
    def test_ticket_open_success(self, mock_get_object: MagicMock, mock_filter: MagicMock) -> None:
        """Valida que um chamado pode ser reaberto e o total é retornado."""
        mock_ticket = MagicMock()
        mock_ticket.open = False
        mock_ticket.chat = "Chat anterior"
        mock_get_object.return_value = mock_ticket

        mock_qs = MagicMock()
        mock_qs.count.return_value = 5
        mock_filter.return_value = mock_qs

        with patch("services.ticket_service.Thread") as mock_thread:
            total = ticket_open(
                id=1,
                date="2023-10-10",
                technician="Tech",
                hours="10:00",
                techMail="tech@mail.com",
                mail="user@mail.com",
            )

            self.assertEqual(total, 5)
            self.assertEqual(mock_ticket.open, True)
            self.assertEqual(mock_ticket.technician_mail, "tech@mail.com")
            mock_ticket.save.assert_called_once()
            mock_thread.assert_called_once()
