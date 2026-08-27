import pytest
from unittest.mock import patch, MagicMock

pytestmark = pytest.mark.django_db

from datetime import datetime, timedelta
from django.utils import timezone
from helpdesk.models import SupportTicket, TicketMail
from services.email_sender import (
    send_pending_emails,
    ticket_removal_email,
    get_last_messages,
    send_mail,
)


@pytest.fixture
def mock_suport_ticket():
    ticket = MagicMock(spec=SupportTicket)
    ticket.id = 1
    ticket.last_sender = "John Doe, User"
    ticket.last_viewer = "John Doe"
    ticket.open = True
    ticket.technician_mail = "tech@example.com"
    ticket.mail = "user@example.com"
    ticket.chat = "[[John Doe, User: Hello]],,[["
    return ticket


@pytest.fixture
def mock_ticket_mail(mock_suport_ticket):
    ticket_mail = MagicMock(spec=TicketMail)
    ticket_mail.pk = 1
    ticket_mail.id = 1
    ticket_mail.ticket = mock_suport_ticket
    ticket_mail.send_date = timezone.now().date()
    return ticket_mail


def test_get_last_messages_user_primary():
    chat = "[[John Doe, User: Hello]],,[[Jane Smith, Technician: Hi there]],,[[John Doe, User: Help me]]"
    mail_user = "user@example.com"
    mail_tech = "tech@example.com"

    last_five, mail_to = get_last_messages(chat, mail_user, mail_tech)

    assert mail_to == "tech@example.com"
    assert last_five == ["Hello", "Help me"]


def test_get_last_messages_tech_primary():
    chat = "[[John Doe, User: Hello]],,[[Jane Smith, Technician: Hi there]]"
    mail_user = "user@example.com"
    mail_tech = "tech@example.com"

    last_five, mail_to = get_last_messages(chat, mail_user, mail_tech)

    assert mail_to == "user@example.com"
    assert last_five == ["Hi there"]


def test_get_last_messages_system():
    chat = "[[System, System: System Message]],,[[John Doe, User: Hello]]"
    mail_user = "user@example.com"
    mail_tech = "tech@example.com"

    last_five, mail_to = get_last_messages(chat, mail_user, mail_tech)

    assert mail_to == "tech@example.com"
    assert last_five == ["Hello"]


def test_get_last_messages_invalid_type():
    chat = "[[Unknown, Unknown: Hello]]"
    mail_user = "user@example.com"
    mail_tech = "tech@example.com"

    last_five, mail_to = get_last_messages(chat, mail_user, mail_tech)

    assert mail_to is None
    assert last_five is None


def test_get_last_messages_empty():
    chat = ""
    mail_user = "user@example.com"
    mail_tech = "tech@example.com"

    last_five, mail_to = get_last_messages(chat, mail_user, mail_tech)

    assert mail_to is None
    assert last_five is None


@patch("services.email_sender.SMTP")
@patch("services.email_sender.ticket_removal_email")
def test_send_mail_success(mock_removal, mock_smtp):
    mock_server = MagicMock()
    mock_smtp.return_value = mock_server

    send_mail("test@example.com", "body", "subject", 1, 1)

    mock_smtp.assert_called_once()
    mock_server.starttls.assert_called_once()
    mock_server.sendmail.assert_called_once()
    mock_server.quit.assert_called_once()
    mock_removal.assert_called_once_with(1, 1)


@patch("services.email_sender.SMTP")
@patch("services.email_sender.logger")
def test_send_mail_exception(mock_logger, mock_smtp):
    mock_smtp.side_effect = Exception("SMTP Error")

    send_mail("test@example.com", "body", "subject", 1, 1)

    mock_logger.error.assert_called_once()


@patch("services.email_sender.TicketMail.objects")
@patch("services.email_sender.logger")
def test_ticket_removal_email(mock_logger, mock_objects):
    mock_qs = MagicMock()
    mock_objects.filter.return_value = mock_qs

    ticket_removal_email(1, 1)

    mock_objects.filter.assert_called_once_with(id__in=[1])
    mock_qs.delete.assert_called_once()


@patch("services.email_sender.TicketMail.objects")
@patch("services.email_sender.datetime")
@patch("services.email_sender.send_mail")
@patch("services.email_sender.ticket_removal_emails")
def test_send_pending_emails(
    mock_removal_emails, mock_send_mail, mock_datetime, mock_objects, mock_ticket_mail
):
    """
    Input:  um ticket_mail elegível para envio
    Expect: chama send_mail e adiciona o id à lista de remoção em lote
    Result: verificado via mocks
    """
    mock_qs = MagicMock()
    mock_qs.select_related.return_value = [mock_ticket_mail]
    mock_objects.all.return_value = mock_qs

    now = datetime(2023, 1, 1, 12, 0, 0)
    mock_datetime.now.return_value = now
    mock_datetime.combine.return_value = now - timedelta(hours=4)

    # Configura o mock do send_mail para retornar True (sucesso)
    mock_send_mail.return_value = True

    send_pending_emails()

    mock_send_mail.assert_called_once()
    mock_removal_emails.assert_called_once_with([mock_ticket_mail.pk])


@patch("services.email_sender.TicketMail.objects")
@patch("services.email_sender.datetime")
@patch("services.email_sender.ticket_removal_emails")
def test_send_pending_emails_ticket_closed(
    mock_removal_emails, mock_datetime, mock_objects, mock_ticket_mail
):
    """
    Input:  um ticket_mail fechado (open = False)
    Expect: adiciona o id à lista de remoção em lote sem enviar e-mail
    Result: verificado via mocks
    """
    mock_ticket_mail.ticket.open = False

    mock_qs = MagicMock()
    mock_qs.select_related.return_value = [mock_ticket_mail]
    mock_objects.all.return_value = mock_qs

    now = datetime(2023, 1, 1, 12, 0, 0)
    mock_datetime.now.return_value = now
    mock_datetime.combine.return_value = now - timedelta(hours=4)

    send_pending_emails()

    mock_removal_emails.assert_called_once_with([mock_ticket_mail.pk])


@patch("services.email_sender.TicketMail.objects")
@patch("services.email_sender.datetime")
@patch("services.email_sender.ticket_removal_emails")
def test_send_pending_emails_diff_less_than_3h(
    mock_removal_emails, mock_datetime, mock_objects, mock_ticket_mail
):
    """
    Input:  um ticket_mail com diferença de tempo inferior a 3 horas
    Expect: não envia e não adiciona à lista de remoção em lote
    Result: verificado via mocks
    """
    mock_qs = MagicMock()
    mock_qs.select_related.return_value = [mock_ticket_mail]
    mock_objects.all.return_value = mock_qs

    now = datetime(2023, 1, 1, 12, 0, 0)
    mock_datetime.now.return_value = now
    mock_datetime.combine.return_value = now - timedelta(hours=2)  # Apenas 2 horas de diferença

    send_pending_emails()

    mock_removal_emails.assert_not_called()


@patch("services.email_sender.TicketMail.objects")
@patch("services.email_sender.datetime")
@patch("services.email_sender.ticket_removal_emails")
def test_send_pending_emails_no_mail_tech(
    mock_removal_emails, mock_datetime, mock_objects, mock_ticket_mail
):
    """
    Input:  um ticket_mail sem e-mail do técnico associado
    Expect: registra erro e não envia/remove
    Result: verificado via mocks
    """
    mock_ticket_mail.ticket.technician_mail = None

    mock_qs = MagicMock()
    mock_qs.select_related.return_value = [mock_ticket_mail]
    mock_objects.all.return_value = mock_qs

    now = datetime(2023, 1, 1, 12, 0, 0)
    mock_datetime.now.return_value = now
    mock_datetime.combine.return_value = now - timedelta(hours=4)

    send_pending_emails()

    mock_removal_emails.assert_not_called()


@patch("services.email_sender.TicketMail.objects")
@patch("services.email_sender.datetime")
@patch("services.email_sender.ticket_removal_emails")
def test_send_pending_emails_last_sender_viewer_match(
    mock_removal_emails, mock_datetime, mock_objects, mock_ticket_mail
):
    """
    Input:  um ticket_mail onde o último remetente coincide com o último visualizador
    Expect: não remove se não houver envio
    Result: verificado via mocks
    """
    mock_ticket_mail.ticket.last_sender = "John Doe, User"
    mock_ticket_mail.ticket.last_viewer = "John Doe"

    # Mocka get_last_messages para retornar None, evitando o envio
    with patch("services.email_sender.get_last_messages") as mock_get_last:
        mock_get_last.return_value = (None, None)

        mock_qs = MagicMock()
        mock_qs.select_related.return_value = [mock_ticket_mail]
        mock_objects.all.return_value = mock_qs

        now = datetime(2023, 1, 1, 12, 0, 0)
        mock_datetime.now.return_value = now
        mock_datetime.combine.return_value = now - timedelta(hours=4)

        send_pending_emails()

        mock_removal_emails.assert_not_called()


@patch("services.email_sender.TicketMail.objects")
@patch("services.email_sender.datetime")
@patch("services.email_sender.ticket_removal_emails")
def test_send_pending_emails_no_last_sender(
    mock_removal_emails, mock_datetime, mock_objects, mock_ticket_mail
):
    """
    Input:  um ticket_mail sem último remetente definido (None)
    Expect: levanta AttributeError
    Result: verificado via pytest.raises
    """
    mock_ticket_mail.ticket.last_sender = None

    mock_qs = MagicMock()
    mock_qs.select_related.return_value = [mock_ticket_mail]
    mock_objects.all.return_value = mock_qs

    now = datetime(2023, 1, 1, 12, 0, 0)
    mock_datetime.now.return_value = now
    mock_datetime.combine.return_value = now - timedelta(hours=4)

    with pytest.raises(AttributeError):
        send_pending_emails()


@patch("services.email_sender.TicketMail.objects")
@patch("services.email_sender.datetime")
@patch("services.email_sender.send_mail")
@patch("services.email_sender.ticket_removal_emails")
def test_send_pending_emails_performance(
    mock_removal_emails, mock_send_mail, mock_datetime, mock_objects, mock_ticket_mail
):
    """
    Valida e mede a performance do envio de e-mails pendentes em lote.

    Executa o teste por 5 rodadas com quantidades crescentes de e-mails
    (começando em 5 e aumentando de 10 em 10: 5, 15, 25, 35, 45) para
    validar se o tempo de processamento é linear e performático.

    Args:
        mock_removal_emails (MagicMock): Mock da função de remoção em lote.
        mock_send_mail (MagicMock): Mock da função de envio de e-mail.
        mock_datetime (MagicMock): Mock do módulo datetime.
        mock_objects (MagicMock): Mock do gerenciador de objetos do TicketMail.
        mock_ticket_mail (MagicMock): Fixture do mock de ticket mail.
    """
    import time

    now = datetime(2023, 1, 1, 12, 0, 0)
    mock_datetime.now.return_value = now
    mock_datetime.combine.return_value = now - timedelta(hours=4)
    mock_send_mail.return_value = True

    # Configuração das rodadas (5, 15, 25, 35, 45)
    rounds = [50, 150, 250, 350, 450]
    results = []

    for num_emails in rounds:
        ticket_mails_list = []
        for i in range(num_emails):
            t_mail = MagicMock(spec=TicketMail)
            t_mail.pk = i
            t_mail.id = i
            t_mail.ticket = MagicMock(spec=SupportTicket)
            t_mail.ticket.id = i
            t_mail.ticket.last_sender = "John Doe, User"
            t_mail.ticket.last_viewer = "John Doe"
            t_mail.ticket.open = True
            t_mail.ticket.technician_mail = f"tech{i}@example.com"
            t_mail.ticket.mail = f"user{i}@example.com"
            t_mail.ticket.chat = f"[[John Doe, User: Hello {i}]],,["
            t_mail.send_date = timezone.now().date()
            ticket_mails_list.append(t_mail)

        mock_qs = MagicMock()
        mock_qs.select_related.return_value = ticket_mails_list
        mock_objects.all.return_value = mock_qs

        mock_send_mail.reset_mock()
        mock_removal_emails.reset_mock()

        start_time = time.perf_counter()
        send_pending_emails()
        end_time = time.perf_counter()

        elapsed = end_time - start_time
        results.append((num_emails, elapsed))

        # Validações de corretude para garantir que todos os e-mails foram processados
        assert mock_send_mail.call_count == num_emails
        mock_removal_emails.assert_called_once_with([t.pk for t in ticket_mails_list])

    # Imprime os resultados para inspeção visual do desenvolvedor
    print("\n--- Resultados de Performance de Envio de E-mails ---")
    for num_emails, elapsed in results:
        print(f"Rodada com {num_emails} e-mails: {elapsed:.6f} segundos")
        # Validação de tempo máximo por e-mail para garantir que o processo é performático
        assert (elapsed / num_emails) < 0.05, f"Performance insatisfatória: {elapsed:.6f}s para {num_emails} e-mails"


