import json
from typing import Any
from django.contrib.auth.models import Group, User
from django.test import TestCase
from django.utils import timezone
from helpdesk.models import Area, SupportTicket


class HistoryAccessIsolationTests(TestCase):
    """
    Testes de isolamento e regras de negócio para a funcionalidade de Histórico ("Meus Chamados").
    Garante que qualquer usuário (comum, técnico TI, técnico Fiscal, líder ou superuser)
    visualize estritamente os chamados onde é o solicitante (PID == user.pk), e nunca
    chamados abertos por outros usuários, mesmo que pertençam à mesma área técnica.
    """

    def setUp(self) -> None:
        # Grupos
        self.group_user, _ = Group.objects.get_or_create(name="Helpdesk_User")
        self.group_tech_ti, _ = Group.objects.get_or_create(name="Helpdesk_Technician_TI")
        self.group_tech_fiscal, _ = Group.objects.get_or_create(name="Helpdesk_Technician_Fiscal")
        self.group_leader_ti, _ = Group.objects.get_or_create(name="Helpdesk_Leader_TI")

        # Usuários
        self.user_alice = User.objects.create_user(username="alice", password="123", email="alice@test.com")
        self.user_alice.groups.add(self.group_user)

        self.user_bob = User.objects.create_user(username="bob", password="123", email="bob@test.com")
        self.user_bob.groups.add(self.group_user)

        self.tech_ti = User.objects.create_user(username="tech_ti_user", password="123", email="tech_ti@test.com")
        self.tech_ti.groups.add(self.group_tech_ti)

        self.tech_fiscal = User.objects.create_user(
            username="tech_fiscal_user", password="123", email="tech_fiscal@test.com"
        )
        self.tech_fiscal.groups.add(self.group_tech_fiscal)

        # Áreas
        self.area_ti, _ = Area.objects.get_or_create(code="TI")
        self.area_fiscal, _ = Area.objects.get_or_create(code="Fiscal")

        now = timezone.now()

        # 1. Chamado aberto por Alice para a TI
        self.ticket_alice_ti = SupportTicket.objects.create(
            id=1001,
            ticketRequester=self.user_alice.username,
            department="Financeiro",
            mail=self.user_alice.email,
            company="Lupatech",
            sector="Financeiro",
            occurrence="Hardware",
            problemn="Monitor quebrado",
            start_date=now,
            respective_area=self.area_ti,
            PID=int(self.user_alice.pk),
            open=True,
        )

        # 2. Chamado aberto por Bob para a TI
        self.ticket_bob_ti = SupportTicket.objects.create(
            id=1002,
            ticketRequester=self.user_bob.username,
            department="RH",
            mail=self.user_bob.email,
            company="Lupatech",
            sector="RH",
            occurrence="Software",
            problemn="Acesso ao sistema",
            start_date=now,
            respective_area=self.area_ti,
            PID=int(self.user_bob.pk),
            open=True,
        )

        # 3. Chamado aberto pelo Técnico TI para a TI (ele é solicitante)
        self.ticket_tech_ti_own = SupportTicket.objects.create(
            id=1003,
            ticketRequester=self.tech_ti.username,
            department="TI",
            mail=self.tech_ti.email,
            company="Lupatech",
            sector="TI",
            occurrence="Hardware",
            problemn="Teclado reserva",
            start_date=now,
            respective_area=self.area_ti,
            PID=int(self.tech_ti.pk),
            open=True,
        )

        # 4. Chamado aberto pelo Técnico TI para o Fiscal (ele é solicitante de chamado fiscal)
        self.ticket_tech_ti_fiscal = SupportTicket.objects.create(
            id=1004,
            ticketRequester=self.tech_ti.username,
            department="TI",
            mail=self.tech_ti.email,
            company="Lupatech",
            sector="TI",
            occurrence="Nota Fiscal",
            problemn="Dúvida NF-e",
            start_date=now,
            respective_area=self.area_fiscal,
            PID=int(self.tech_ti.pk),
            open=False,
        )

        # 5. Chamado aberto por Alice para o Fiscal
        self.ticket_alice_fiscal = SupportTicket.objects.create(
            id=1005,
            ticketRequester=self.user_alice.username,
            department="Financeiro",
            mail=self.user_alice.email,
            company="Lupatech",
            sector="Financeiro",
            occurrence="Impostos",
            problemn="DARF",
            start_date=now,
            respective_area=self.area_fiscal,
            PID=int(self.user_alice.pk),
            open=None,
        )

    def test_standard_user_history_sees_only_own_tickets_legacy_endpoint(self) -> None:
        """
        Valida que o usuário comum Alice em /helpdesk/get-ticket/ vê apenas seus próprios chamados (1001 e 1005),
        não vendo chamados de Bob ou de técnicos.
        """
        self.client.force_login(self.user_alice)

        response = self.client.get(f"/helpdesk/get-ticket/10/{self.user_alice.username}/all/-id")
        self.assertEqual(response.status_code, 200)
        data: dict[str, Any] = json.loads(response.content.decode("utf-8"))
        tickets_list: list[dict[str, Any]] = data.get("tickets", [])
        returned_ids = {t["id"] for t in tickets_list}
        self.assertEqual(returned_ids, {1001, 1005})

    def test_standard_user_history_sees_only_own_tickets_v2_endpoint(self) -> None:
        """
        Valida que o usuário comum Alice em /helpdesk/tickets/?context=history vê apenas seus próprios chamados.
        """
        self.client.force_login(self.user_alice)

        response = self.client.get("/helpdesk/tickets/?context=history&status=all&limit=20")
        self.assertEqual(response.status_code, 200)
        data: dict[str, Any] = json.loads(response.content.decode("utf-8"))
        tickets_list: list[dict[str, Any]] = data.get("tickets", [])
        returned_ids = {t["id"] for t in tickets_list}
        self.assertEqual(returned_ids, {1001, 1005})

    def test_technician_history_sees_only_own_tickets_legacy_endpoint(self) -> None:
        """
        CRÍTICO: Valida que o Técnico TI em /helpdesk/get-ticket/ vê APENAS os chamados que ele próprio abriu
        (1003 e 1004), e NÃO vê chamados de Alice (1001) ou Bob (1002) que foram abertos para a área TI.
        """
        self.client.force_login(self.tech_ti)

        response = self.client.get(f"/helpdesk/get-ticket/10/{self.tech_ti.username}/all/-id")
        self.assertEqual(response.status_code, 200)
        data: dict[str, Any] = json.loads(response.content.decode("utf-8"))
        tickets_list: list[dict[str, Any]] = data.get("tickets", [])
        returned_ids = {t["id"] for t in tickets_list}
        self.assertEqual(returned_ids, {1003, 1004})

    def test_technician_history_sees_only_own_tickets_v2_endpoint(self) -> None:
        """
        CRÍTICO: Valida que o Técnico TI em /helpdesk/tickets/?context=history vê APENAS os chamados que ele abriu,
        e NÃO vê os chamados de terceiros abertos para sua área técnica.
        """
        self.client.force_login(self.tech_ti)

        response = self.client.get("/helpdesk/tickets/?context=history&status=all&limit=20")
        self.assertEqual(response.status_code, 200)
        data: dict[str, Any] = json.loads(response.content.decode("utf-8"))
        tickets_list: list[dict[str, Any]] = data.get("tickets", [])
        returned_ids = {t["id"] for t in tickets_list}
        self.assertEqual(returned_ids, {1003, 1004})

    def test_technician_history_filter_by_area_v2(self) -> None:
        """
        Valida que quando um técnico filtra por área no histórico (?context=history&area=TI),
        retorna apenas os chamados DELE abertos para a área TI (1003), excluindo o chamado dele para Fiscal (1004)
        e excluindo chamados de terceiros para a TI (1001, 1002).
        """
        self.client.force_login(self.tech_ti)

        response = self.client.get("/helpdesk/tickets/?context=history&area=TI&status=all&limit=20")
        self.assertEqual(response.status_code, 200)
        data: dict[str, Any] = json.loads(response.content.decode("utf-8"))
        tickets_list: list[dict[str, Any]] = data.get("tickets", [])
        returned_ids = {t["id"] for t in tickets_list}
        self.assertEqual(returned_ids, {1003})

    def test_technician_history_filter_by_status_stop_v2(self) -> None:
        """
        Valida que o filtro de status no histórico (?context=history&status=stop) filtra apenas
        os chamados do usuário logado que estão em aguardo (open=None).
        Alice tem o chamado 1005 com open=None.
        """
        self.client.force_login(self.user_alice)

        response = self.client.get("/helpdesk/tickets/?context=history&status=stop&limit=20")
        self.assertEqual(response.status_code, 200)
        data: dict[str, Any] = json.loads(response.content.decode("utf-8"))
        tickets_list: list[dict[str, Any]] = data.get("tickets", [])
        returned_ids = {t["id"] for t in tickets_list}
        self.assertEqual(returned_ids, {1005})

    def test_technician_dashboard_still_sees_all_area_tickets(self) -> None:
        """
        Valida que o isolamento do History NÃO afeta o Dashboard:
        No Dashboard (?context=dashboard&area=TI), o Técnico TI continua vendo TODOS os chamados da área TI
        (1001 de Alice, 1002 de Bob e 1003 do próprio tech).
        """
        self.client.force_login(self.tech_ti)

        response = self.client.get("/helpdesk/tickets/?context=dashboard&area=TI&status=all&limit=20")
        self.assertEqual(response.status_code, 200)
        data: dict[str, Any] = json.loads(response.content.decode("utf-8"))
        tickets_list: list[dict[str, Any]] = data.get("tickets", [])
        returned_ids = {t["id"] for t in tickets_list}
        self.assertEqual(returned_ids, {1001, 1002, 1003})

    def test_legacy_get_ticket_filter_history_sees_only_own_tickets(self) -> None:
        """
        Valida que a rota legada /helpdesk/get-ticket-filter/history/... isola os chamados por solicitante.
        """
        self.client.force_login(self.tech_ti)

        response = self.client.get(
            f"/helpdesk/get-ticket-filter/history/all/all/-id/{self.tech_ti.username}/10/all/null"
        )
        self.assertEqual(response.status_code, 200)
        data: dict[str, Any] = json.loads(response.content.decode("utf-8"))
        tickets_list: list[dict[str, Any]] = data.get("tickets", [])
        returned_ids = {t["id"] for t in tickets_list}
        self.assertEqual(returned_ids, {1003, 1004})
