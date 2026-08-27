import pytest
from typing import Any
from django.contrib.auth.models import Group, User
from django.test import Client
from django.urls import reverse
from django.utils import timezone

from fixdesk.permissions import (
    get_user_allowed_areas,
    user_can_access_ticket,
    user_can_manage_ticket,
)
from helpdesk.models import Area, SupportTicket


@pytest.mark.django_db
def test_clean_database_initial_areas() -> None:
    """
    Verificação 1 & 2: Valida se as áreas iniciais TI e Fiscal foram criadas ativas.
    """
    ti_area: Area = Area.objects.get(code="TI")
    fiscal_area: Area = Area.objects.get(code="Fiscal")

    assert ti_area.active is True
    assert fiscal_area.active is True
    assert ti_area.id is not None
    assert fiscal_area.id is not None


@pytest.mark.django_db
def test_submit_ticket_ti_area_persisted() -> None:
    """
    Verificação 3: Abrir chamado TI e confirmar o ID persistido.
    """
    ti_area: Area = Area.objects.get(code="TI")
    user: User = User.objects.create_user(
        username="user_ti", email="user_ti@example.com", password="password"
    )
    client: Client = Client()
    client.force_login(user)

    response: Any = client.post(
        reverse("central-tickets"),
        {
            "company": "Empresa Teste",
            "department": "TI",
            "mail": "user_ti@example.com",
            "observation": "Teste chamado TI",
            "occurrence": "Rede",
            "problemn": "Sem sinal",
            "respective_area": str(ti_area.id),
            "sector": "TI",
            "ticketRequester": "Solicitante TI",
            "start_date": "2026-08-12 10:00",
        },
    )

    assert response.status_code == 200
    ticket: SupportTicket = SupportTicket.objects.get(ticketRequester="Solicitante TI")
    assert ticket.respective_area is not None
    assert ticket.respective_area.id == ti_area.id
    assert ticket.respective_area == ti_area
    assert ticket.respective_area.code == "TI"


@pytest.mark.django_db
def test_submit_ticket_fiscal_area_persisted() -> None:
    """
    Verificação 4: Abrir chamado Fiscal e confirmar o ID persistido.
    """
    fiscal_area: Area = Area.objects.get(code="Fiscal")
    user: User = User.objects.create_user(
        username="user_fiscal", email="user_fiscal@example.com", password="password"
    )
    client: Client = Client()
    client.force_login(user)

    response: Any = client.post(
        reverse("central-tickets"),
        {
            "company": "Empresa Teste",
            "department": "Fiscal",
            "mail": "user_fiscal@example.com",
            "observation": "Teste chamado Fiscal",
            "occurrence": "Nota Fiscal",
            "problemn": "Erro de emissão",
            "respective_area": str(fiscal_area.id),
            "sector": "Fiscal",
            "ticketRequester": "Solicitante Fiscal",
            "start_date": "2026-08-12 11:00",
        },
    )

    assert response.status_code == 200
    ticket: SupportTicket = SupportTicket.objects.get(
        ticketRequester="Solicitante Fiscal"
    )
    assert ticket.respective_area is not None
    assert ticket.respective_area.id == fiscal_area.id
    assert ticket.respective_area == fiscal_area
    assert ticket.respective_area.code == "Fiscal"


@pytest.mark.django_db
def test_submit_ticket_invalid_area_rejection() -> None:
    """
    Verificação 5: Tentar abrir chamado com área inexistente.
    """
    user: User = User.objects.create_user(
        username="user_inv", email="user_inv@example.com", password="password"
    )
    client: Client = Client()
    client.force_login(user)

    response: Any = client.post(
        reverse("central-tickets"),
        {
            "company": "Empresa Teste",
            "department": "RH",
            "mail": "user_inv@example.com",
            "observation": "Chamado com área inválida",
            "occurrence": "Outros",
            "problemn": "Problema",
            "respective_area": "99999",
            "sector": "RH",
            "ticketRequester": "Solicitante Inválido",
            "start_date": "2026-08-12 12:00",
        },
    )

    assert response.status_code == 400
    assert response.json().get("error") == "Área inválida ou inativa."
    assert not SupportTicket.objects.filter(
        ticketRequester="Solicitante Inválido"
    ).exists()


@pytest.mark.django_db
def test_submit_ticket_inactive_area_rejection() -> None:
    """
    Verificação 6: Desativar uma área e tentar abrir novo chamado.
    """
    ti_area: Area = Area.objects.get(code="TI")
    ti_area.active = False
    ti_area.save()

    user: User = User.objects.create_user(
        username="user_inact", email="user_inact@example.com", password="password"
    )
    client: Client = Client()
    client.force_login(user)

    response: Any = client.post(
        reverse("central-tickets"),
        {
            "company": "Empresa Teste",
            "department": "TI",
            "mail": "user_inact@example.com",
            "observation": "Chamado em área inativa",
            "occurrence": "Rede",
            "problemn": "Erro",
            "respective_area": str(ti_area.id),
            "sector": "TI",
            "ticketRequester": "Solicitante Inativo",
            "start_date": "2026-08-12 13:00",
        },
    )

    assert response.status_code == 400
    assert response.json().get("error") == "Área inválida ou inativa."
    assert not SupportTicket.objects.filter(
        ticketRequester="Solicitante Inativo"
    ).exists()

    # Restaura o estado da área TI
    ti_area.active = True
    ti_area.save()


@pytest.mark.django_db
def test_historical_tickets_accessible() -> None:
    """
    Verificação 7: Confirmar que chamados antigos continuam acessíveis.
    """
    ti_area: Area = Area.objects.get(code="TI")
    fiscal_area: Area = Area.objects.get(code="Fiscal")

    ticket_ti: SupportTicket = SupportTicket.objects.create(
        ticketRequester="Antigo TI",
        mail="old_ti@example.com",
        company="Empresa",
        sector="TI",
        occurrence="Hardware",
        problemn="Troca de mouse",
        start_date=timezone.now(),
        respective_area=ti_area,
        PID=101,
    )

    ticket_fiscal: SupportTicket = SupportTicket.objects.create(
        ticketRequester="Antigo Fiscal",
        mail="old_fiscal@example.com",
        company="Empresa",
        sector="Fiscal",
        occurrence="SPED",
        problemn="Erro validação",
        start_date=timezone.now(),
        respective_area=fiscal_area,
        PID=102,
    )

    assert SupportTicket.objects.filter(respective_area=ti_area).filter(id=ticket_ti.id).exists()
    assert SupportTicket.objects.filter(respective_area=fiscal_area).filter(id=ticket_fiscal.id).exists()
    assert ticket_ti.respective_area.code == "TI"
    assert ticket_fiscal.respective_area.code == "Fiscal"


@pytest.mark.django_db
def test_technician_area_isolation() -> None:
    """
    Verificação 8: Validar isolamento de técnicos por área (TI vs Fiscal).
    """
    group_ti, _ = Group.objects.get_or_create(name="Helpdesk_Technician_TI")
    group_fiscal, _ = Group.objects.get_or_create(name="Helpdesk_Technician_Fiscal")

    tech_ti: User = User.objects.create_user(
        username="tech_ti_only", email="tech_ti@example.com", password="password"
    )
    tech_ti.groups.add(group_ti)

    ti_area: Area = Area.objects.get(code="TI")
    fiscal_area: Area = Area.objects.get(code="Fiscal")

    ticket_ti: SupportTicket = SupportTicket.objects.create(
        ticketRequester="User TI",
        mail="u_ti@example.com",
        company="Empresa",
        sector="TI",
        occurrence="Rede",
        problemn="Sem rede",
        start_date=timezone.now(),
        respective_area=ti_area,
        PID=201,
    )

    ticket_fiscal: SupportTicket = SupportTicket.objects.create(
        ticketRequester="User Fiscal",
        mail="u_fiscal@example.com",
        company="Empresa",
        sector="Fiscal",
        occurrence="Fiscal",
        problemn="Erro fiscal",
        start_date=timezone.now(),
        respective_area=fiscal_area,
        PID=202,
    )

    allowed_areas: list[str] = get_user_allowed_areas(tech_ti)
    assert allowed_areas == ["TI"]

    assert user_can_access_ticket(tech_ti, ticket_ti) is True
    assert user_can_manage_ticket(tech_ti, ticket_ti) is True

    # Técnico de TI não pode gerenciar chamado Fiscal
    assert user_can_manage_ticket(tech_ti, ticket_fiscal) is False
