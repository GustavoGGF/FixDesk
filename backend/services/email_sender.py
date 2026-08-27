from logging import basicConfig, INFO, getLogger
from helpdesk.models import TicketMail
from datetime import datetime, time
from django.db import transaction
from email.mime.multipart import MIMEMultipart
from os import getenv
from email.mime.text import MIMEText
from smtplib import SMTP
from dotenv import load_dotenv

basicConfig(level=INFO)
logger = getLogger(__name__)

load_dotenv()
smtp_host = str(getenv("SERVER_SMTP"))
smtp_port = int(getenv("SMPT_PORT", "587"))  # Porta padrão para SMTP com TLS
mail_address = str(getenv("MAIL_FIXDESK"))


# Função responsável por validar e enviar e-mails de notificação de tickets pendentes
def send_pending_emails():
    """
    Valida e envia notificações por e-mail em lote para chamados pendentes.

    Busca todos os registros de notificações de e-mail agendados e verifica se a
    data de envio possui um atraso de no mínimo 3 horas. Para cada registro elegível,
    avalia se o ticket associado está aberto, se há destinatários válidos e se as
    mensagens pendentes justificam o envio. O envio e as remoções de registros do
    banco de dados são otimizados em lote para evitar queries N+1.
    """
    logger.info("iniciando validação de notificações")
    tickets_senders = TicketMail.objects.all().select_related("ticket")
    tickets_to_delete = []

    for ticket in tickets_senders:
        current_hour = datetime.now()
        send_date = datetime.combine(ticket.send_date, time.min)

        msg_title = f"Chamado {ticket.ticket.id}: Menssagem não Visualizada!"

        diff_seconds = (current_hour - send_date).total_seconds()

        # Verifica se o tempo de espera é superior a 3 horas
        if diff_seconds >= 10800:
            suport_ticket = ticket.ticket
            last_sender, _ = suport_ticket.last_sender.split(", ")
            last_viewer = suport_ticket.last_viewer
            status = suport_ticket.open
            mail_tech = suport_ticket.technician_mail
            mail_user = suport_ticket.mail

            # Verifica se o ticket está fechado, e se estiver, remove o e-mail de notificação e passa para o próximo ticket
            if not status:
                tickets_to_delete.append(ticket.pk)
                continue

            if not mail_tech or mail_user is None:
                logger.error(
                    "email do tecnico e/ou do usuário não existe para envio de e-mail de notificação"
                )
                continue

            # Verifica se o último remetente existe
            if last_sender is None:
                tickets_to_delete.append(ticket.pk)
                continue

            # Verifica se o último remetente é diferente do último visualizador
            if last_sender != last_viewer:
                tickets_to_delete.append(ticket.pk)
                continue

            # Obtém as últimas mensagens do chat do ticket e o e-mail de destino
            message_chat, mail_to = get_last_messages(
                suport_ticket.chat, mail_user, mail_tech
            )
            if message_chat is None or mail_to is None:
                continue

            # Cria o corpo da mensagem do e-mail
            msg = f"{last_sender} enviou uma mensagem.\n{chr(10).join(message_chat)}"

            # Envia o e-mail de notificação
            if send_mail(mail_to, msg, msg_title):
                tickets_to_delete.append(ticket.pk)

        else:
            continue

    if tickets_to_delete:
        ticket_removal_emails(tickets_to_delete)


# Função responsável por remover notificações de e-mail em lote do banco de dados
@transaction.atomic
def ticket_removal_emails(ids):
    """
    Remove múltiplos registros de notificações de e-mail em lote do banco de dados.

    Args:
        ids (list): Lista com as chaves primárias dos registros a serem removidos.
    """
    logger.info(f"removendo notificações de chamados em lote: {ids}")
    TicketMail.objects.filter(id__in=ids).delete()


# Função responsável por remover o ticket de notificação do banco de dados (Individual)
@transaction.atomic
def ticket_removal_email(id, suport_ticket):
    """
    Remove um único registro de notificação de e-mail do banco de dados.

    Mantido para fins de retrocompatibilidade com chamadores individuais.

    Args:
        id (int): A chave primária da notificação a ser removida.
        suport_ticket (int): O identificador do chamado relacionado.
    """
    logger.info(f"removendo notificação de chamado: {suport_ticket}")
    ticket_removal_emails([id])



# Função que obtém as últimas mensagens de um chat de um chamado, identifica o remetente e define o e-mail de destino
def get_last_messages(chat, mail_user, mail_tech):
    # Divide o chat em seções com base no delimitador ']],,[['
    sections = chat.split("]],,[[")

    messages = []

    for section in sections:
        section = section.replace("[", "").replace(
            "]", ""
        )  # Remove os colchetes da seção
        parts = section.split(
            ","
        )  # Divide a seção em partes usando a vírgula como delimitador
        parts = [p.strip() for p in parts if p.strip()]

        # Itera sobre as partes do chat em intervalos de 3, onde cada grupo contém remetente, tipo e mensagem
        for i in range(0, len(parts), 3):
            group = parts[i : i + 3]

            message_part = group[1].strip()

            if "System:" in message_part:
                continue
            elif "Technician:" in message_part:
                message_type = "Technician"
                message_text = message_part.split("Technician:")[1].strip()
            elif "User:" in message_part:
                message_type = "User"
                message_text = message_part.split("User:")[1].strip()
            else:
                continue

            messages.append(
                {
                    "type": message_type,
                    "message": message_text,
                }
            )

    # Verifica se foram encontradas mensagens válidas
    if not messages:
        logger.error("Nenhuma mensagem válida encontrada")
        return None, None

    last_message = messages[-1]
    primary = last_message["type"]

    # Define o e-mail de destino com base no remetente da última mensagem
    if primary == "Technician":
        mailTo = mail_user
    elif primary == "User":
        mailTo = mail_tech
    else:
        logger.error("Erro ao detectar quem enviou a última mensagem")
        return None, None

    # Cria uma lista com as últimas 5 mensagens do remetente identificado
    last_five = []
    for message in reversed(messages):
        if message["type"] == primary:
            last_five.append(message["message"])
        if len(last_five) >= 5:
            break

    last_five = last_five[::-1]

    return last_five, mailTo


# Função responsável por enviar e-mail de notificação contendo as últimas 5 mensagens enviadas
# Após o envio, remove o ticket de notificação correspondente do banco de dados se os identificadores forem fornecidos
def send_mail(mail: str, msgm1: str, msgm2: str, id=None, suport_id=None):
    """
    Envia uma mensagem de e-mail de notificação via SMTP.

    Caso os identificadores de notificação e do ticket de suporte sejam informados,
    remove individualmente o registro de notificação agendado após a confirmação do envio.

    Args:
        mail (str): O endereço de e-mail do destinatário.
        msgm1 (str): O conteúdo textual principal do e-mail.
        msgm2 (str): O assunto do e-mail.
        id (int, optional): Chave primária do registro de notificação no banco de dados.
        suport_id (int, optional): Identificador do ticket de suporte associado.

    Returns:
        bool: Retorna True se o e-mail foi enviado com sucesso, caso contrário False.
    """
    try:
        # Cria uma nova mensagem de e-mail multipart
        msg = MIMEMultipart()
        msg["From"] = mail_address  # Define o remetente do e-mail
        msg["To"] = mail  # Define o destinatário do e-mail
        msg["Subject"] = msgm2  # Define o assunto do e-mail

        msg.attach(MIMEText(msgm1, "plain"))

        server_smtp = SMTP(smtp_host, smtp_port)
        server_smtp.starttls()

        text_mail = msg.as_string()

        server_smtp.sendmail(mail_address, mail, text_mail)

        if id is not None and suport_id is not None:
            ticket_removal_email(id, suport_id)
        return True

    except Exception as e:
        logger.error(f"Erro ao enviar e-mail: {e}")
        return False

    finally:
        if "server_smtp" in locals() and server_smtp:
            server_smtp.quit()
