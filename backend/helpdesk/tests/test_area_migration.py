import pytest
from django.db import IntegrityError
from django.db.models import ProtectedError
from helpdesk.models import SupportTicket, Area
from django.utils import timezone

@pytest.mark.django_db
def test_area_creation_and_initial_data():
    """
    Testa se as áreas TI e Fiscal estão presentes no banco (criadas via migration ou defaults).
    E valida se podemos criar uma nova área.
    """
    ti_area = Area.objects.get(code="TI")
    fiscal_area = Area.objects.get(code="Fiscal")
    
    assert ti_area.active is True
    assert fiscal_area.active is True
    assert str(ti_area) == "TI"
    assert str(fiscal_area) == "Fiscal"
    
    new_area = Area.objects.create(code="RH", active=False)
    assert new_area.id is not None
    assert new_area.code == "RH"
    assert str(new_area) == "RH"
    assert new_area.active is False

@pytest.mark.django_db
def test_respective_area_is_foreign_key():
    """
    Testa a obrigatoriedade da relação (não pode ser nulo).
    """
    ti_area = Area.objects.get(code="TI")
    
    # Sucesso
    ticket = SupportTicket.objects.create(
        ticketRequester="User 1",
        mail="user1@example.com",
        company="Company A",
        sector="RH",
        occurrence="Software",
        problemn="Erro ERP",
        start_date=timezone.now(),
        respective_area=ti_area,
        PID=1
    )
    assert ticket.respective_area == ti_area
    assert ticket.respective_area.code == "TI"
    
    # Falha: obrigatoriedade (null não permitido)
    with pytest.raises(IntegrityError):
        SupportTicket.objects.create(
            ticketRequester="User 2",
            mail="user2@example.com",
            company="Company A",
            sector="RH",
            occurrence="Software",
            problemn="Erro ERP",
            start_date=timezone.now(),
            respective_area=None,
            PID=2
        )

@pytest.mark.django_db
def test_protection_on_delete_area():
    """
    Testa a proteção contra exclusão de área vinculada.
    """
    ti_area = Area.objects.get(code="TI")
    
    SupportTicket.objects.create(
        ticketRequester="User 1",
        mail="user1@example.com",
        company="Company A",
        sector="RH",
        occurrence="Software",
        problemn="Erro ERP",
        start_date=timezone.now(),
        respective_area=ti_area,
        PID=1
    )
    
    with pytest.raises(ProtectedError):
        ti_area.delete()

@pytest.mark.django_db
def test_unexpected_area_fallback():
    """
    Como decidido no plano da Etapa 0, se uma área não catalogada for inserida antes
    da restrição, ela deve ser capturada no momento do dump e mapeada para TI como fallback seguro
    quando a restrição apertar, mas neste nível (após migração), deve ser um FK válido.
    Esse teste garante que a FK não aceita lixo textual.
    """
    with pytest.raises(ValueError):
        SupportTicket.objects.create(
            ticketRequester="User 1",
            mail="user1@example.com",
            company="Company A",
            sector="RH",
            occurrence="Software",
            problemn="Erro ERP",
            start_date=timezone.now(),
            respective_area="Marketing", # Inválido para FK
            PID=1
        )
