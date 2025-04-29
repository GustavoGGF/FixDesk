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
smtp_host = getenv("SERVER_SMTP")
smtp_port = getenv("SMPT_PORT")
mail_address = getenv("MAIL_FIXDESK")

# Função responsável por validar e enviar e-mails de notificação de tickets pendentes
def send_pending_emails():
    logger.info("iniciando validação de notificações")
    # Obtém todos os tickets que têm mensagens pendentes de envio
    tickets_senders = TicketMail.objects.all()

    # Itera sobre cada ticket para verificar e enviar o e-mail de notificação
    for ticket in tickets_senders:
        current_hour = datetime.now()  # Obtém a hora atual
        send_date = datetime.combine(ticket.send_date, time.min)  # Combina a data do envio do ticket com a hora mínima (00:00:00)
    
        msg_title = f"Chamado {ticket.ticket.id}: Menssagem não Visualizada!"

        diff_seconds = (current_hour - send_date).total_seconds()  # Calcula a diferença de tempo em segundos entre a hora atual e a data de envio

        # Verifica se o tempo de espera é superior a 3 horas
        if diff_seconds >= 10800:
            suport_ticket = ticket.ticket  # Obtém o objeto do ticket relacionado
            last_sender, _ = suport_ticket.last_sender.split(", ")  # Obtém o último remetente da mensagem
            last_viewer = suport_ticket.last_viewer  # Obtém o último visualizador da mensagem
            status = suport_ticket.open  # Obtém o status do ticket (aberto ou fechado)
            mail_tech = suport_ticket.technician_mail  # Obtém o e-mail do técnico responsável pelo ticket
            mail_user = suport_ticket.mail  # Obtém o e-mail do usuário que abriu o ticket
            
            # Verifica se o ticket está fechado, e se estiver, remove o e-mail de notificação e passa para o próximo ticket
            if not status or status == None or status == False:
                ticket_removal_email(ticket.id, suport_ticket.id)  # Remove o ticket da lista de pendentes
                continue

            # Verifica se os e-mails do técnico e do usuário existem para enviar o e-mail de notificação
            if not mail_tech or mail_user == None:
                logger.error("email do tecnico e/ou do usuário não existe para envio de e-mail de notificação")
                continue

            # Verifica se o último remetente existe
            if last_sender == None:
                ticket_removal_email(ticket.id,  suport_ticket.id)  # Remove o ticket da lista de pendentes
                continue

            # Verifica se o último remetente é diferente do último visualizador
            if last_sender != last_viewer:
                ticket_removal_email(ticket.id,  suport_ticket.id)  # Remove o ticket da lista de pendentes
                continue
            
            # Obtém as últimas mensagens do chat do ticket e o e-mail de destino
            message_chat, mail_to = get_last_messages(suport_ticket.chat, mail_user, mail_tech)
            if message_chat == None or mail_to == None:
                continue

            # Cria o corpo da mensagem do e-mail
            msg = f"{last_sender} enviou uma mensagem.\n{chr(10).join(message_chat)}"

            # Envia o e-mail de notificação
            send_mail(mail_to, msg, msg_title, ticket.id, suport_ticket.id)
        
        else:
            continue

# Função responsável por remover o ticket de notificação do banco de dados
@transaction.atomic  # Garante que a operação de remoção seja atômica, ou seja, realizada completamente ou não realizada
def ticket_removal_email(id,  suport_ticket):
    # Obtém o objeto TicketMail correspondente ao ID fornecido
    ticket = TicketMail.objects.get(id=id)
    # Deleta o ticket do banco de dados
    logger.info(f"removendo notificação de chamado: { suport_ticket}")
    ticket.delete()
    return  # Retorna da função após a remoção do ticket


# Função que obtém as últimas mensagens de um chat de um chamado, identifica o remetente e define o e-mail de destino
def get_last_messages(chat, mail_user, mail_tech):
    # Divide o chat em seções com base no delimitador ']],,[['
    sections = chat.split(']],,[[')

    messages = []  # Lista para armazenar as mensagens processadas

    # Itera sobre cada seção do chat
    for section in sections:
        section = section.replace('[', '').replace(']', '')  # Remove os colchetes da seção
        parts = section.split(',')  # Divide a seção em partes usando a vírgula como delimitador
        parts = [p.strip() for p in parts if p.strip()]  # Remove espaços em branco e partes vazias

        # Itera sobre as partes do chat em intervalos de 3, onde cada grupo contém remetente, tipo e mensagem
        for i in range(0, len(parts), 3):
            group = parts[i:i+3]
            
            message_part = group[1].strip()  # Obtém a parte que contém a mensagem
            # Verifica o tipo de remetente na mensagem e processa a mensagem
            if 'System:' in message_part:
                continue  # Ignora mensagens do sistema
            elif 'Technician:' in message_part:
                message_type = 'Technician'  # Marca como mensagem do técnico
                message_text = message_part.split('Technician:')[1].strip()  # Extrai a mensagem do técnico
            elif 'User:' in message_part:
                message_type = 'User'  # Marca como mensagem do usuário
                message_text = message_part.split('User:')[1].strip()  # Extrai a mensagem do usuário
            else:
                continue

            # Adiciona a mensagem processada à lista de mensagens
            messages.append({
                'type': message_type,
                'message': message_text,
            })

    # Verifica se foram encontradas mensagens válidas
    if not messages:
        logger.error("Nenhuma mensagem válida encontrada")  # Log de erro caso não haja mensagens
        return None, None

    # Obtém a última mensagem da lista
    last_message = messages[-1]
    primary = last_message['type']  # Determina o tipo de remetente da última mensagem

    # Define o e-mail de destino com base no remetente da última mensagem
    if primary == "Technician":
        mailTo = mail_user  # Se o remetente for o técnico, o e-mail é o do usuário
    elif primary == "User":
        mailTo = mail_tech  # Se o remetente for o usuário, o e-mail é o do técnico
    else:
        logger.error("Erro ao detectar quem enviou a última mensagem")  # Log de erro caso não consiga identificar o remetente
        return None, None

    # Cria uma lista com as últimas 5 mensagens do remetente identificado
    last_five = []
    for message in reversed(messages):
        if message['type'] == primary:
            last_five.append(message['message'])  # Adiciona a mensagem à lista de últimas 5
        if len(last_five) >= 5:  # Para quando tiver 5 mensagens
            break

    last_five = last_five[::-1]  # Reverte a lista para manter a ordem correta

    return last_five, mailTo  # Retorna as últimas 5 mensagens e o e-mail de destino

# Função responsável por enviar e-mail de notificação contendo as últimas 5 mensagens enviadas
# Após o envio, remove o ticket de notificação correspondente do banco de dados
def send_mail(mail: str, msgm1: str, msgm2: str, id, suport_id):
    try:
        # Cria uma nova mensagem de e-mail multipart
        msg = MIMEMultipart()
        msg["From"] = mail_address  # Define o remetente do e-mail
        msg["To"] = mail  # Define o destinatário do e-mail
        msg["Subject"] = msgm2  # Define o assunto do e-mail

        # Anexa o corpo do e-mail (mensagens) no formato texto simples
        msg.attach(MIMEText(msgm1, "plain"))

        # Cria uma conexão SMTP com o servidor especificado
        server_smtp = SMTP(smtp_host, smtp_port)
        server_smtp.starttls()  # Inicia a comunicação segura (TLS)

        # Converte a mensagem para o formato string
        text_mail = msg.as_string()

        # Envia o e-mail do remetente para o destinatário
        server_smtp.sendmail(mail_address, mail, text_mail)
        
        # Após envio bem-sucedido, remove o ticket de notificação do banco de dados
        return ticket_removal_email(id, suport_id)

    except Exception as e:
        # Em caso de erro, registra o erro no logger
        return logger.error(e)

    finally:
        # Encerra a conexão SMTP, se aberta
        if server_smtp:
            return server_smtp.quit()
        else:
            return
