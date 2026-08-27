from os import getenv
from django.contrib.auth.models import User
from helpdesk.models import SupportTicket

DJANGO_GROUP_USER: str = getenv("DJANGO_GROUP_USER", "Helpdesk_User")
DJANGO_GROUP_TECH: str = getenv("DJANGO_GROUP_TECH", "Helpdesk_Technician_TI")
DJANGO_GROUP_TECH_FISCAL: str = getenv("DJANGO_GROUP_TECH_FISCAL", "Helpdesk_Technician_Fiscal")
DJANGO_GROUP_LEADER: str = getenv("DJANGO_GROUP_LEADER", "Helpdesk_Leader_TI")


def get_user_allowed_areas(user: User) -> list[str]:
    """
    Retorna as áreas autorizadas para o usuário ("TI", "Fiscal", ambas ou nenhuma).

    :param user: Instância do usuário Django.
    :return: Lista de áreas autorizadas (ex: ["TI"], ["Fiscal"], ["TI", "Fiscal"], []).
    """
    if not isinstance(user, User) or not user.is_authenticated:
        return []

    if user.is_superuser:
        return ["TI", "Fiscal"]

    group_names: set[str] = set(user.groups.values_list("name", flat=True))

    # Suporte a objetos mock em testes onde user.groups.filter foi configurado
    if not group_names and hasattr(user.groups, "filter"):
        if (
            user.groups.filter(name=DJANGO_GROUP_TECH).exists()
            or user.groups.filter(name=DJANGO_GROUP_LEADER).exists()
        ):
            group_names.add(DJANGO_GROUP_TECH)
        if user.groups.filter(name=DJANGO_GROUP_TECH_FISCAL).exists():
            group_names.add(DJANGO_GROUP_TECH_FISCAL)

    allowed: list[str] = []

    if DJANGO_GROUP_TECH in group_names or DJANGO_GROUP_LEADER in group_names:
        allowed.append("TI")

    if DJANGO_GROUP_TECH_FISCAL in group_names:
        allowed.append("Fiscal")

    return allowed


def is_technician(user: User) -> bool:
    """
    Verifica se o usuário é um técnico em pelo menos uma área.

    :param user: Instância do usuário Django.
    :return: True se o usuário tiver acesso técnico, False caso contrário.
    """
    return len(get_user_allowed_areas(user)) > 0


def is_technician_for_area(user: User, area: str) -> bool:
    """
    Verifica se o usuário possui acesso técnico à área especificada.

    :param user: Instância do usuário Django.
    :param area: Nome da área ("TI" ou "Fiscal").
    :return: True se autorizado, False caso contrário.
    """
    return area in get_user_allowed_areas(user)


def user_can_access_ticket(user: User, ticket: SupportTicket) -> bool:
    """
    Verifica se o usuário tem permissão para visualizar/acessar um chamado.
    Técnicos acessam chamados de suas áreas autorizadas.
    Solicitantes acessam seus próprios chamados.

    :param user: Instância do usuário Django.
    :param ticket: Instância do chamado SupportTicket.
    :return: True se tiver acesso, False caso contrário.
    """
    if not isinstance(user, User) or not user.is_authenticated:
        return False

    if user.is_superuser:
        return True

    if is_technician_for_area(user, ticket.respective_area.code if ticket.respective_area else "TI"):
        return True

    return ticket.PID == user.pk or ticket.ticketRequester == user.username


def user_can_manage_ticket(user: User, ticket: SupportTicket) -> bool:
    """
    Verifica se o usuário tem permissão para gerenciar/alterar um chamado tecnicamente.
    Apenas técnicos da área do chamado (ou superusuários) podem gerenciar o chamado.

    :param user: Instância do usuário Django.
    :param ticket: Instância do chamado SupportTicket.
    :return: True se tiver permissão de gerenciar, False caso contrário.
    """
    if not isinstance(user, User) or not user.is_authenticated:
        return False

    if user.is_superuser:
        return True

    return is_technician_for_area(user, ticket.respective_area.code if ticket.respective_area else "TI")
