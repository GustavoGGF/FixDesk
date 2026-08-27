from threading import Thread
import logging
from os import getenv
from typing import Any
from datetime import datetime
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from helpdesk.models import SupportTicket, TicketFile, TicketMail
from services.email_sender import send_mail
from services.ticket_files_processor import verify_valid_or_not
from django.contrib.auth.models import User
from django.core.handlers.wsgi import WSGIRequest
from classes.exceptions.auth_exeption import AuthenticationError
from classes.mapping.chat_entry_conversation import ChatLogEntryConversation
from classes.mapping.chat_entry_file import ChatLogEntryFile
from fixdesk.permissions import is_technician_for_area

logger = logging.getLogger(__name__)

TECHNICAL_FILE_TYPE_PREFIX = "technical:"

def parse_allowed_types() -> list[str]:
    types_str = getenv("VALID_TYPES", "")
    if not types_str:
        return []
    clean_str = types_str.strip("[]")
    return [
        t.strip().strip("'\"").lower()
        for t in clean_str.split(",")
        if t.strip()
    ]

def add_technical_detail_message(
    id: int, message: str, date: str, hours: str, user: User
) -> tuple[str, dict[str, str]]:
    """
    Adiciona uma nota técnica ao campo 'details' do ticket sem alterar 'chat'.

    Args:
        id (int): Identificador do ticket.
        message (str): Conteúdo da nota técnica.
        date (str): Data da inserção (DD/MM/YYYY).
        hours (str): Horário da inserção (HH:MM).
        user (User): Usuário técnico autor da ação.

    Returns:
        tuple[str, dict[str, str]]: (details atualizado, dicionário do registro criado).
    """
    if not message or not message.strip():
        raise ValueError("A mensagem da nota técnica não pode ser vazia.")

    ticket = get_object_or_404(SupportTicket, id=id)

    area = ticket.respective_area.code if ticket.respective_area else "TI"
    if not is_technician_for_area(user, area):
        raise ValueError(f"Usuário não possui permissão técnica para a área '{area}'.")

    full_name = user.get_full_name().strip() or user.username or "Técnico"

    entry = ChatLogEntryConversation(
        date=date,
        user=full_name,
        message=message.strip(),
        hours=hours,
    )

    current_details = str(getattr(ticket, "details", "") or "")
    new_details = current_details + str(entry)

    SupportTicket.objects.filter(id=id).update(details=new_details)
    ticket.refresh_from_db()

    record = {
        "author": full_name,
        "message": message.strip(),
        "date": date,
        "hours": hours,
    }

    return ticket.details or "", record

@transaction.atomic
def add_technical_detail_file(
    id: int, files: list[Any], date: str, hours: str, user: User
) -> tuple[str, list[dict[str, Any]]]:
    """
    Adiciona um ou mais arquivos anexos aos detalhes técnicos do ticket.

    Salva cada arquivo em TicketFile e registra a ação no campo 'details',
    preservando o campo 'chat' intacto.

    Args:
        id (int): Identificador do ticket.
        files (list): Lista de objetos UploadedFile/InMemoryUploadedFile.
        date (str): Data da ação (DD/MM/YYYY).
        hours (str): Hora da ação (HH:MM).
        user (User): Usuário técnico autor da ação.

    Returns:
        tuple[str, list[dict[str, Any]]]: (details atualizado, lista de metadados dos arquivos salvos).
    """
    if not files:
        raise ValueError("Nenhum arquivo enviado.")

    ticket = get_object_or_404(SupportTicket, id=id)

    area = ticket.respective_area.code if ticket.respective_area else "TI"
    if not is_technician_for_area(user, area):
        raise ValueError(f"Usuário não possui permissão técnica para a área '{area}'.")

    allowed_types = parse_allowed_types()
    full_name = user.get_full_name().strip() or user.username or "Técnico"

    current_details = str(getattr(ticket, "details", "") or "")
    new_entries = ""
    ticket_files_to_create: list[TicketFile] = []
    saved_files_meta: list[dict[str, Any]] = []

    for unit_file in files:
        file_bytes: bytes = unit_file.read()
        unit_file.seek(0)

        valid, file_type = verify_valid_or_not(file_bytes, unit_file.name, allowed_types)
        if not valid:
            raise ValueError(f"Tipo de arquivo não permitido: {unit_file.name}")

        entry = ChatLogEntryFile(
            date=date,
            hours=hours,
            user=full_name,
            action=f"adicionou o arquivo {unit_file.name}",
        )
        new_entries += str(entry)

        ticket_file = TicketFile(
            ticket=ticket,
            file_name=unit_file.name,
            file_type=f"{TECHNICAL_FILE_TYPE_PREFIX}{file_type}",
            data=file_bytes,
        )
        ticket_files_to_create.append(ticket_file)
        saved_files_meta.append({
            "name": unit_file.name,
            "type": file_type,
            "size": len(file_bytes),
        })

    if ticket_files_to_create:
        TicketFile.objects.bulk_create(ticket_files_to_create)

    if new_entries:
        SupportTicket.objects.filter(id=id).update(details=current_details + new_entries)

    ticket.refresh_from_db()
    return ticket.details or "", saved_files_meta


def change_responsible_technician(
    id: int,
    responsible_technician: str | None,
    technician: str | None,
    date: str | None,
    hours: str | None,
    techMail: str | None,
    mail: str | None,
    username: str,
) -> tuple[str, str]:
    """
    Atualiza o técnico responsável de um chamado e registra no histórico do chat.
    
    Esta função verifica se já houve um atendimento anterior e registra adequadamente 
    a entrada no chat. Caso seja o primeiro atendimento, notifica o usuário via e-mail.
    
    Args:
        id (int): ID numérico do chamado de suporte (SupportTicket).
        responsible_technician (str): Nome do novo técnico que está assumindo o chamado.
        technician (str): Nome do técnico atual que está transferindo o chamado.
        date (str): Data em que a ação ocorreu (formatada como string).
        hours (str): Horário em que a ação ocorreu (formatada como string).
        techMail (str): Endereço de e-mail do técnico responsável.
        mail (str): Endereço de e-mail do usuário/solicitante para envio de notificação.
        username (str): Username de quem está executando a ação (para validar a origem).
        
    Returns:
        tuple[str, str]: Retorna uma tupla contendo:
            - chat (str): Histórico de mensagens do chat atualizado.
            - responsible_technician (str): O novo técnico definido.
            
    Raises:
        ValueError: Se algum campo obrigatório estiver ausente ou se for detectada 
            tentativa de transferência para o técnico já responsável ou sem permissão para a área.
        Exception: Em caso de falha de persistência ou erro não previsto.
    """
    if not all([responsible_technician, technician, date, hours, techMail, mail]):
        raise ValueError("Campos obrigatórios ausentes")
        
    try:
        ticket = SupportTicket.objects.get(id=id)

        from helpdesk.views import get_user_by_full_name
        user_new = get_user_by_full_name(responsible_technician)
        if not user_new:
            user_new = User.objects.filter(username=responsible_technician).first()
        if not user_new and techMail:
            user_new = User.objects.filter(email=techMail).first()

        area = ticket.respective_area.code if ticket.respective_area else "TI"
        if not user_new or not is_technician_for_area(user_new, area):
            raise ValueError(
                f"O técnico '{responsible_technician}' não possui permissão para a área '{area}'."
            )

        if not ticket.chat:
            # Caso não haja mensagens no chat, cria o primeiro registro de atendimento
            ticket.chat = f"[[Date:{date}],[System: {responsible_technician} atendeu ao Chamado],[Hours:{hours}]],"

            # Se um e-mail de usuário estiver disponível, envia uma notificação por e-mail
            if mail:
                msg = f"{technician} atendeu ao Chamado"
                msg2 = f"Atendimento do Chamado {ticket.id}"

                Thread(target=send_mail, args=(mail, msg, msg2)).start()
        else:
            user_current = get_user_by_full_name(ticket.responsible_technician)

            if user_new and user_current and user_new.username == user_current.username:
                raise ValueError(
                    "Metodologia desconhecida para transferir o chamado a alguém que já é responsável por ele."
                )

            if user_new and username == user_new.username:
                ticket.chat = (ticket.chat or "") + f"[[Date:{date}],[System: {responsible_technician} atendeu ao Chamado],[Hours:{hours}]],"
            else:
                ticket.chat = (ticket.chat or "") + f"[[Date:{date}],[System: {technician} transferiu o Chamado para {responsible_technician}],[Hours:{hours}]],"

        ticket.responsible_technician = responsible_technician
        ticket.technician_mail = techMail
        ticket.save()

        return ticket.chat or "", ticket.responsible_technician or ""
        
    except ValueError:
        raise
    except Exception as e:
        logger.error(e)
        raise Exception(e)

def update_tech_details(
    chat: str, id: int, date: str, hours: str, request: WSGIRequest
) -> str:
    """
    Atualiza os detalhes técnicos (notas internas) de um chamado de suporte.
    
    Adiciona uma nova entrada de conversa ao campo de detalhes técnicos do ticket, 
    que é restrito à visão da equipe de TI. A função valida se a requisição provém 
    de um usuário autenticado antes de registrar as notas.
    
    Args:
        chat (str): O conteúdo da nota técnica a ser registrada.
        id (int): Identificador numérico único do ticket.
        date (str): Data de inserção da nota.
        hours (str): Horário de inserção da nota.
        request (WSGIRequest): Objeto da requisição HTTP contendo os dados do usuário.
        
    Returns:
        str: Conteúdo atualizado do campo de detalhes (notas técnicas).
        
    Raises:
        AuthenticationError: Se o `request.user` não for uma instância válida de `User`.
        Exception: Se ocorrer qualquer erro durante o acesso ao banco de dados ou formatação.
    """
    try:
        ticket = SupportTicket.objects.get(id=id)

        if not isinstance(request.user, User):
            logger.error(f"Usuário não autenticado ou inválido ao atualizar detalhes no ticket {id}.")
            raise AuthenticationError("Usuário não autenticado ou inválido")

        full_name = request.user.get_full_name().strip() or "Usuário"

        entry = ChatLogEntryConversation(
            date=date,
            user=full_name,
            message=chat,
            hours=hours,
        )

        current_details = str(getattr(ticket, "details", "") or "")
        SupportTicket.objects.filter(id=id).update(details=current_details + str(entry))

        ticket.refresh_from_db()

        chat_content: str = str(getattr(ticket, "details", "") or "")

        return chat_content
    except AuthenticationError:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar detalhes técnicos do ticket {id}: {e}")
        raise e

@transaction.atomic
def update_last_sender(ticket: SupportTicket, user: str, date: str, hours: str):
    """
    Atualiza o remetente da última mensagem do ticket se a nova data e hora forem posteriores à anterior.

    Args:
        ticket (SupportTicket): O objeto ticket de suporte a ser atualizado.
        user (str): Nome do usuário ou técnico que enviou a última mensagem.
        date (str): Data da última mensagem (DD/MM/YYYY).
        hours (str): Hora da última mensagem (HH:MM).
    """
    if ticket.last_sender:
        try:
            _, old_date_str = ticket.last_sender.split(", ")
            old_date = datetime.strptime(old_date_str, "%d/%m/%Y %H:%M")
            new_date = datetime.strptime(f"{date} {hours}", "%d/%m/%Y %H:%M")

            if new_date > old_date:
                ticket.last_sender = f"{user}, {date} {hours}"
        except ValueError:
            logger.error("Erro ao converter a data, mantendo last_sender inalterado.")
    else:
        ticket.last_sender = f"{user}, {date} {hours}"

    ticket.save()

def verify_notification_call(ticket: SupportTicket) -> None:
    """
    Verifica se o ticket já possui registro em TicketMail e cria um novo se não existir.

    Args:
        ticket (SupportTicket): Instância do ticket de suporte.
    """
    try:
        if not TicketMail.objects.filter(ticket=ticket).exists():
            new_ticket = TicketMail(ticket=ticket, send_date=datetime.now())
            new_ticket.save()
    except Exception as e:
        logger.error(e)


def updating_chat_change_sender(
    id: int,
    chat: str,
    date: str,
    hours: str,
    user: str,
    helpdesk: str,
) -> str:
    """
    Atualiza o histórico do chat e modifica o remetente da última mensagem.
    Dispara notificação assíncrona ao final.

    Args:
        id (int): Identificador numérico único do ticket.
        chat (str): Mensagem do chat enviada.
        date (str): Data em que a mensagem foi enviada.
        hours (str): Hora em que a mensagem foi enviada.
        user (str): Nome do usuário/técnico envolvido na conversa.
        helpdesk (str): Contexto da chamada, podendo ser "helpdesk" (usuário comum) ou "dashboard" (técnico).

    Returns:
        str: O histórico atualizado do chat.
    """
    ticket = SupportTicket.objects.get(id=id)
    chat_message = f",[[Date:{date}],[User: {chat}],[Hours:{hours}]]"
    if helpdesk == "dashboard":
        chat_message = f",[[Date:{date}],[Technician: {chat}],[Hours:{hours}]]"
    update_last_sender(ticket, user, date, hours)

    ticket.chat = (ticket.chat or "") + chat_message
    ticket.save()

    Thread(target=verify_notification_call, args=(ticket,)).start()

    return ticket.chat or ""

@transaction.atomic
def ticket_stop(id: int, technician: str, date: str, hours: str, mail: str) -> str:
    """
    Altera o status do ticket para 'em aguardo', registrando a ação do técnico e notificando.

    Args:
        id (int): Identificador do ticket.
        technician (str): Nome do técnico.
        date (str): Data da ação.
        hours (str): Hora da ação.
        mail (str): Email para envio da notificação.

    Returns:
        str: Mensagem de sucesso.

    Raises:
        ValueError: Caso o ticket não tenha técnico definido, já esteja em aguardo, 
        ou o técnico tentando alterar não seja o responsável.
    """
    ticket = get_object_or_404(SupportTicket, id=id)

    if ticket.responsible_technician is None:
        raise ValueError("Tecnico não Definido")

    if ticket.open is None:
        raise ValueError("Chamado já esta em aguardo")

    partes_nome_pesquisa = ticket.responsible_technician.split()
    present = all(parte in technician for parte in partes_nome_pesquisa)

    if not present:
        raise ValueError("Tecnico não é o responsável pelo chamado")

    ticket.open = None
    ticket.chat = (ticket.chat or "") + f",[[Date:{date}],[System: {technician} Deixou esse chamado em aguardo],[Hours:{hours}]]"
    ticket.save()

    msg = f"{technician} Deixou esse chamado em aguardo"
    msg2 = f"Chamado {ticket.id} em aguardo"
    Thread(target=send_mail, args=(mail, msg, msg2)).start()

    return "Chamado em aguardo"

@transaction.atomic
def ticket_close(id: int, technician: str, date: str, hours: str, mail: str) -> str:
    """
    Altera o status do ticket para 'finalizado'.

    Args:
        id (int): Identificador do ticket.
        technician (str): Nome do técnico.
        date (str): Data da finalização.
        hours (str): Hora da finalização.
        mail (str): Email de notificação.

    Returns:
        str: Mensagem de sucesso.

    Raises:
        ValueError: Caso regras de negócio de finalização sejam violadas.
    """
    ticket = get_object_or_404(SupportTicket, id=id)

    if ticket.responsible_technician is None:
        raise ValueError("Tecnico não Definido")

    if ticket.open is False:
        raise ValueError("Chamado já esta finalizado")

    partes_nome_pesquisa = ticket.responsible_technician.split()
    present = all(parte in technician for parte in partes_nome_pesquisa)

    if not present:
        raise ValueError("Identificado que o Tecnico não é o atribuido ao Chamado")

    ticket.open = False
    ticket.chat = (ticket.chat or "") + f",[[Date:{date}],[System: {technician} Finalizou o Chamado],[Hours:{hours}]]"
    ticket.technician_mail = None
    
    current_date = timezone.now()
    ticket.end_date = current_date
    ticket.save()

    msg = f"{technician} Finalizou o Chamado"
    msg2 = f"Chamado {ticket.id} finalizado com sucesso!!"
    Thread(target=send_mail, args=(mail, msg, msg2)).start()

    return "Chamado Finalizado"

@transaction.atomic
def ticket_open(id: int, date: str, technician: str, hours: str, techMail: str, mail: str) -> int:
    """
    Reabre um ticket, notificando sobre o processo.

    Args:
        id (int): ID do ticket.
        date (str): Data.
        technician (str): Técnico reabrindo o ticket.
        hours (str): Hora.
        techMail (str): E-mail do técnico.
        mail (str): E-mail para notificação.

    Returns:
        int: O total de tickets que o técnico tem na respectiva área TI atualmente.

    Raises:
        ValueError: Caso o chamado já esteja aberto.
    """
    ticket = get_object_or_404(SupportTicket, id=id)

    if ticket.open is True:
        raise ValueError("Chamado já está aberto.")

    ticket.open = True
    ticket.chat = (ticket.chat or "") + f",[[Date:{date}],[System: {technician} Reabriu e atendeu o Chamado],[Hours:{hours}]]"
    ticket.technician_mail = techMail
    ticket.save()

    msg = f"{technician} Reabriu o Chamado"
    msg2 = f"Reabertura do chamado {ticket.id}"
    Thread(target=send_mail, args=(mail, msg, msg2)).start()

    total_tickets = SupportTicket.objects.filter(
        respective_area=ticket.respective_area
    ).count()
    return total_tickets
