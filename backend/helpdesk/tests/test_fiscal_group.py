"""
Comprehensive Automated Integration Tests for Fiscal Technician Group Integration.

Covers all acceptance criteria from PLANO_IMPLEMENTACAO_GRUPO_FISCAL.md:
1. LDAP authentication & provisioning (single role, dual role TI+Fiscal, group retention on subsequent login).
2. Authorization matrix (Fiscal tech accesses Fiscal tickets, TI tech accesses TI tickets, dual-role accesses both, Leader TI restricted to TI, unauthorized cross-area access blocked).
3. Dashboard endpoints & Technician assignment (pie chart sector filtering, ticket list filtering per user areas, technician list filtering per area, cross-area technician assignment rejection).
4. Database group creation idempotency (management command and migration functions).
"""

import importlib
import json
from io import StringIO
from typing import Any
from unittest.mock import patch, MagicMock

from django.test import TestCase
from django.contrib.auth.models import User, Group
from django.contrib.sessions.backends.db import SessionStore
from django.core.management import call_command
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from helpdesk.models import SupportTicket, Area
from fixdesk.views import (
    create_class_user,
    create_or_verify_user,
)
from fixdesk.permissions import (
    get_user_allowed_areas,
    is_technician_for_area,
    user_can_access_ticket,
    user_can_manage_ticket,
    DJANGO_GROUP_TECH,
    DJANGO_GROUP_TECH_FISCAL,
    DJANGO_GROUP_LEADER,
    DJANGO_GROUP_USER,
)
from dashboards.views import (
    get_dash_board_pie,
    get_ticket_ti,
    get_info,
)
from services.ticket_service import (
    change_responsible_technician,
    add_technical_detail_message,
)

migration_module = importlib.import_module(
    "helpdesk.migrations.0002_create_fiscal_technician_group"
)
create_fiscal_group_migration = migration_module.create_fiscal_group
remove_fiscal_group_migration = migration_module.remove_fiscal_group
GROUP_NAME: str = migration_module.GROUP_NAME


class MockApps:
    """Mock apps container for testing data migration functions."""

    def get_model(self, app_label: str, model_name: str) -> type[Group]:
        if app_label == "auth" and model_name == "Group":
            return Group
        raise ValueError(f"Unknown model {app_label}.{model_name}")


class LDAPProvisioningIntegrationTests(TestCase):
    """Integration tests for LDAP authentication and group provisioning."""

    def setUp(self) -> None:
        self.factory: APIRequestFactory = APIRequestFactory()
        self.user: User = User.objects.create_user(
            username="existing_tech_ti",
            password="password123",
            first_name="Existing",
            last_name="Tech",
        )
        ti_group, _ = Group.objects.get_or_create(name=DJANGO_GROUP_TECH)
        self.user.groups.add(ti_group)

    def test_ldap_single_role_fiscal_provisioning(self) -> None:
        """
        Input: LDAP memberOf with 'CN=CH - Technician_Fiscal'
        Expect: User mapped to 'Tecnico Fiscal' role and Django group 'Helpdesk_Technician_Fiscal'
        Result: verificado via assert
        """
        extractor: dict[str, Any] = {
            "attributes": {
                "givenName": "Joao",
                "sn": "Fiscal",
                "displayName": "Joao Fiscal",
                "department": "Fiscal",
                "title": "Analista Fiscal",
                "mail": "joao.fiscal@example.com",
                "company": "Lupatech",
                "memberOf": ["CN=CH - Technician_Fiscal,OU=Groups,DC=domain"],
            }
        }
        user_obj, full_name = create_class_user(extractor)
        
        assert full_name == "Joao Fiscal", (
            f"\n📥 Input:    extractor['attributes']['displayName']='Joao Fiscal'"
            f"\n✅ Expected: 'Joao Fiscal'"
            f"\n❌ Got:      {full_name!r}"
        )
        assert user_obj.helpdesk == "Tecnico Fiscal", (
            f"\n📥 Input:    memberOf=['CN=CH - Technician_Fiscal...']"
            f"\n✅ Expected: 'Tecnico Fiscal'"
            f"\n❌ Got:      {user_obj.helpdesk!r}"
        )
        assert "Tecnico Fiscal" in user_obj.roles, (
            f"\n📥 Input:    memberOf=['CN=CH - Technician_Fiscal...']"
            f"\n✅ Expected: 'Tecnico Fiscal' in user_obj.roles"
            f"\n❌ Got:      {user_obj.roles!r}"
        )

        request = self.factory.post("/validation/")
        success, msg = create_or_verify_user(
            user="joao_fiscal",
            password="pass",
            request=request,
            helpdesk=user_obj.helpdesk,
            name_create_user=full_name,
            roles=user_obj.roles,
        )
        assert success is True, f"\n📥 Input: user='joao_fiscal'\n✅ Expected: True\n❌ Got: {success!r} ({msg})"

        created_user: User = User.objects.get(username="joao_fiscal")
        assigned_groups: set[str] = set(created_user.groups.values_list("name", flat=True))
        assert DJANGO_GROUP_TECH_FISCAL in assigned_groups, (
            f"\n📥 Input: roles=['Tecnico Fiscal']"
            f"\n✅ Expected: '{DJANGO_GROUP_TECH_FISCAL}' in assigned_groups"
            f"\n❌ Got: {assigned_groups!r}"
        )

    def test_ldap_dual_role_ti_and_fiscal_provisioning(self) -> None:
        """
        Input: LDAP memberOf with both Technician_TI and Technician_Fiscal
        Expect: User receives both 'Tecnico TI' and 'Tecnico Fiscal' roles and both Django groups
        Result: verificado via assert
        """
        extractor: dict[str, Any] = {
            "attributes": {
                "givenName": "Ana",
                "sn": "Dual",
                "displayName": "Ana Dual",
                "department": "IT/Fiscal",
                "title": "Analista Multi",
                "mail": "ana.dual@example.com",
                "company": "Lupatech",
                "memberOf": [
                    "CN=CH - Technician_TI,OU=Groups,DC=domain",
                    "CN=CH - Technician_Fiscal,OU=Groups,DC=domain",
                    "CN=CH - User,OU=Groups,DC=domain",
                ],
            }
        }
        user_obj, full_name = create_class_user(extractor)
        assert "Tecnico TI" in user_obj.roles, (
            f"\n📥 Input: memberOf with TI and Fiscal\n✅ Expected: 'Tecnico TI' in roles\n❌ Got: {user_obj.roles!r}"
        )
        assert "Tecnico Fiscal" in user_obj.roles, (
            f"\n📥 Input: memberOf with TI and Fiscal\n✅ Expected: 'Tecnico Fiscal' in roles\n❌ Got: {user_obj.roles!r}"
        )

        request = self.factory.post("/validation/")
        success, msg = create_or_verify_user(
            user="ana_dual",
            password="pass",
            request=request,
            helpdesk=user_obj.helpdesk,
            name_create_user=full_name,
            roles=user_obj.roles,
        )
        assert success is True, f"\n📥 Input: user='ana_dual'\n✅ Expected: True\n❌ Got: {success!r} ({msg})"

        created_user: User = User.objects.get(username="ana_dual")
        assigned_groups: set[str] = set(created_user.groups.values_list("name", flat=True))
        assert DJANGO_GROUP_TECH in assigned_groups, (
            f"\n📥 Input: dual role\n✅ Expected: '{DJANGO_GROUP_TECH}' in assigned_groups\n❌ Got: {assigned_groups!r}"
        )
        assert DJANGO_GROUP_TECH_FISCAL in assigned_groups, (
            f"\n📥 Input: dual role\n✅ Expected: '{DJANGO_GROUP_TECH_FISCAL}' in assigned_groups\n❌ Got: {assigned_groups!r}"
        )

    def test_ldap_group_removal_on_subsequent_login(self) -> None:
        """
        Input: Existing user with TI Django group logs in with LDAP Fiscal role
        Expect: User loses existing TI group and acquires Fiscal group (AD is the only source of truth)
        Result: verificado via assert
        """
        request = self.factory.post("/validation/")
        success, msg = create_or_verify_user(
            user=self.user.username,
            password="password123",
            request=request,
            helpdesk="Tecnico Fiscal",
            name_create_user="Existing Tech",
            roles=["Tecnico Fiscal"],
        )
        assert success is True, f"\n📥 Input: user={self.user.username!r}\n✅ Expected: True\n❌ Got: {success!r} ({msg})"

        updated_user: User = User.objects.get(username=self.user.username)
        assigned_groups: set[str] = set(updated_user.groups.values_list("name", flat=True))
        assert DJANGO_GROUP_TECH not in assigned_groups, (
            f"\n📥 Input: existing TI tech logging in with Fiscal role"
            f"\n✅ Expected: '{DJANGO_GROUP_TECH}' removed"
            f"\n❌ Got: {assigned_groups!r}"
        )
        assert DJANGO_GROUP_TECH_FISCAL in assigned_groups, (
            f"\n📥 Input: existing TI tech logging in with Fiscal role"
            f"\n✅ Expected: '{DJANGO_GROUP_TECH_FISCAL}' added"
            f"\n❌ Got: {assigned_groups!r}"
        )


class AuthorizationMatrixIntegrationTests(TestCase):
    """Integration tests for authorization matrix across TI and Fiscal areas."""

    def setUp(self) -> None:
        self.group_user, _ = Group.objects.get_or_create(name=DJANGO_GROUP_USER)
        self.group_tech_ti, _ = Group.objects.get_or_create(name=DJANGO_GROUP_TECH)
        self.group_tech_fiscal, _ = Group.objects.get_or_create(name=DJANGO_GROUP_TECH_FISCAL)
        self.group_leader_ti, _ = Group.objects.get_or_create(name=DJANGO_GROUP_LEADER)

        self.std_user: User = User.objects.create_user(username="std_user", password="password")
        self.std_user.groups.add(self.group_user)

        self.tech_ti_user: User = User.objects.create_user(username="tech_ti", password="password")
        self.tech_ti_user.groups.add(self.group_tech_ti)

        self.tech_fiscal_user: User = User.objects.create_user(username="tech_fiscal", password="password")
        self.tech_fiscal_user.groups.add(self.group_tech_fiscal)

        self.tech_dual_user: User = User.objects.create_user(username="tech_dual", password="password")
        self.tech_dual_user.groups.add(self.group_tech_ti, self.group_tech_fiscal)

        self.leader_user: User = User.objects.create_user(username="leader_ti", password="password")
        self.leader_user.groups.add(self.group_leader_ti)

        self.ticket_ti: SupportTicket = SupportTicket.objects.create(
            ticketRequester="std_user",
            mail="std@test.com",
            company="LupaTech",
            sector="TI",
            occurrence="Hardware",
            problemn="Computador lento",
            start_date=timezone.now(),
            respective_area=Area.objects.get_or_create(code="TI")[0],
            PID=self.std_user.id,
            open=True,
        )

        self.ticket_fiscal: SupportTicket = SupportTicket.objects.create(
            ticketRequester="std_user",
            mail="std@test.com",
            company="LupaTech",
            sector="Fiscal",
            occurrence="Impostos",
            problemn="Erro emissão NF-e",
            start_date=timezone.now(),
            respective_area=Area.objects.get_or_create(code="Fiscal")[0],
            PID=self.std_user.id,
            open=True,
        )

    def test_fiscal_tech_authorization_access(self) -> None:
        """
        Input: Fiscal technician attempting access to Fiscal and TI tickets
        Expect: Access and management granted for Fiscal, denied for TI
        Result: verificado via assert
        """
        assert get_user_allowed_areas(self.tech_fiscal_user) == ["Fiscal"], (
            f"\n📥 Input: tech_fiscal_user\n✅ Expected: ['Fiscal']\n❌ Got: {get_user_allowed_areas(self.tech_fiscal_user)!r}"
        )
        assert is_technician_for_area(self.tech_fiscal_user, "Fiscal") is True
        assert is_technician_for_area(self.tech_fiscal_user, "TI") is False

        assert user_can_access_ticket(self.tech_fiscal_user, self.ticket_fiscal) is True
        assert user_can_access_ticket(self.tech_fiscal_user, self.ticket_ti) is False

        assert user_can_manage_ticket(self.tech_fiscal_user, self.ticket_fiscal) is True
        assert user_can_manage_ticket(self.tech_fiscal_user, self.ticket_ti) is False

    def test_ti_tech_authorization_access(self) -> None:
        """
        Input: TI technician attempting access to TI and Fiscal tickets
        Expect: Access and management granted for TI, denied for Fiscal
        Result: verificado via assert
        """
        assert get_user_allowed_areas(self.tech_ti_user) == ["TI"], (
            f"\n📥 Input: tech_ti_user\n✅ Expected: ['TI']\n❌ Got: {get_user_allowed_areas(self.tech_ti_user)!r}"
        )
        assert is_technician_for_area(self.tech_ti_user, "TI") is True
        assert is_technician_for_area(self.tech_ti_user, "Fiscal") is False

        assert user_can_access_ticket(self.tech_ti_user, self.ticket_ti) is True
        assert user_can_access_ticket(self.tech_ti_user, self.ticket_fiscal) is False

        assert user_can_manage_ticket(self.tech_ti_user, self.ticket_ti) is True
        assert user_can_manage_ticket(self.tech_ti_user, self.ticket_fiscal) is False

    def test_dual_role_tech_authorization_access(self) -> None:
        """
        Input: Dual-role technician (TI + Fiscal) attempting access to TI and Fiscal tickets
        Expect: Access and management granted for both TI and Fiscal tickets
        Result: verificado via assert
        """
        allowed: list[str] = get_user_allowed_areas(self.tech_dual_user)
        assert "TI" in allowed and "Fiscal" in allowed, (
            f"\n📥 Input: tech_dual_user\n✅ Expected: ['TI', 'Fiscal']\n❌ Got: {allowed!r}"
        )
        assert is_technician_for_area(self.tech_dual_user, "TI") is True
        assert is_technician_for_area(self.tech_dual_user, "Fiscal") is True

        assert user_can_access_ticket(self.tech_dual_user, self.ticket_ti) is True
        assert user_can_access_ticket(self.tech_dual_user, self.ticket_fiscal) is True

        assert user_can_manage_ticket(self.tech_dual_user, self.ticket_ti) is True
        assert user_can_manage_ticket(self.tech_dual_user, self.ticket_fiscal) is True

    def test_leader_ti_authorization_access(self) -> None:
        """
        Input: Leader TI attempting access to TI and Fiscal tickets
        Expect: Access and management granted for TI, strictly denied for Fiscal
        Result: verificado via assert
        """
        assert get_user_allowed_areas(self.leader_user) == ["TI"], (
            f"\n📥 Input: leader_user\n✅ Expected: ['TI']\n❌ Got: {get_user_allowed_areas(self.leader_user)!r}"
        )
        assert is_technician_for_area(self.leader_user, "TI") is True
        assert is_technician_for_area(self.leader_user, "Fiscal") is False

        assert user_can_access_ticket(self.leader_user, self.ticket_ti) is True
        assert user_can_access_ticket(self.leader_user, self.ticket_fiscal) is False

        assert user_can_manage_ticket(self.leader_user, self.ticket_ti) is True
        assert user_can_manage_ticket(self.leader_user, self.ticket_fiscal) is False

    def test_unauthorized_cross_area_actions_blocked(self) -> None:
        """
        Input: TI technician trying to add technical note to Fiscal ticket, and vice-versa
        Expect: ValueError raised blocking unauthorized cross-area modification
        Result: verificado via assert
        """
        with self.assertRaises(ValueError) as ctx1:
            add_technical_detail_message(
                id=self.ticket_fiscal.id,
                message="Tentativa TI em chamado Fiscal",
                date="05/08/2026",
                hours="14:00",
                user=self.tech_ti_user,
            )
        assert "permissão técnica para a área 'Fiscal'" in str(ctx1.exception), (
            f"\n📥 Input: tech_ti modifying Fiscal ticket\n✅ Expected ValueError\n❌ Got: {ctx1.exception!r}"
        )

        with self.assertRaises(ValueError) as ctx2:
            add_technical_detail_message(
                id=self.ticket_ti.id,
                message="Tentativa Fiscal em chamado TI",
                date="05/08/2026",
                hours="14:00",
                user=self.tech_fiscal_user,
            )
        assert "permissão técnica para a área 'TI'" in str(ctx2.exception), (
            f"\n📥 Input: tech_fiscal modifying TI ticket\n✅ Expected ValueError\n❌ Got: {ctx2.exception!r}"
        )


class DashboardAndAssignmentIntegrationTests(TestCase):
    """Integration tests for Dashboard sector filtering and Technician assignments."""

    databases = "__all__"

    def setUp(self) -> None:
        self.factory: APIRequestFactory = APIRequestFactory()

        self.group_user, _ = Group.objects.get_or_create(name=DJANGO_GROUP_USER)
        self.group_tech_ti, _ = Group.objects.get_or_create(name=DJANGO_GROUP_TECH)
        self.group_tech_fiscal, _ = Group.objects.get_or_create(name=DJANGO_GROUP_TECH_FISCAL)
        self.group_leader_ti, _ = Group.objects.get_or_create(name=DJANGO_GROUP_LEADER)

        self.tech_ti_user: User = User.objects.create_user(
            username="dash_tech_ti", password="password", first_name="Tech", last_name="TI", email="ti@test.com"
        )
        self.tech_ti_user.groups.add(self.group_tech_ti)

        self.tech_fiscal_user: User = User.objects.create_user(
            username="dash_tech_fiscal", password="password", first_name="Tech", last_name="Fiscal", email="fiscal@test.com"
        )
        self.tech_fiscal_user.groups.add(self.group_tech_fiscal)

        self.tech_dual_user: User = User.objects.create_user(
            username="dash_tech_dual", password="password", first_name="Tech", last_name="Dual", email="dual@test.com"
        )
        self.tech_dual_user.groups.add(self.group_tech_ti, self.group_tech_fiscal)

        self.ticket_ti: SupportTicket = SupportTicket.objects.create(
            ticketRequester="requester_user",
            mail="req@test.com",
            company="LupaTech",
            sector="TI",
            occurrence="Hardware",
            problemn="Problema em TI",
            start_date=timezone.now(),
            respective_area=Area.objects.get_or_create(code="TI")[0],
            PID=100,
            open=True,
        )

        self.ticket_fiscal: SupportTicket = SupportTicket.objects.create(
            ticketRequester="requester_user",
            mail="req@test.com",
            company="LupaTech",
            sector="Fiscal",
            occurrence="Fiscal",
            problemn="Problema Fiscal",
            start_date=timezone.now(),
            respective_area=Area.objects.get_or_create(code="Fiscal")[0],
            PID=101,
            open=True,
        )

    def test_dashboard_pie_sector_filtering(self) -> None:
        """
        Input: get_dash_board_pie called with sector="Fiscal" or "TI" by authorized/unauthorized techs
        Expect: 200 OK for authorized sector, 403 Forbidden for unauthorized sector
        Result: verificado via assert
        """
        # 1. Fiscal tech requesting sector="Fiscal" -> 200 OK
        req_fiscal_ok = self.factory.get("/get_dash_board_pie/Fiscal")
        req_fiscal_ok.user = self.tech_fiscal_user
        req_fiscal_ok.session = SessionStore()
        force_authenticate(req_fiscal_ok, user=self.tech_fiscal_user)
        res1 = get_dash_board_pie(req_fiscal_ok, sector="Fiscal")
        assert res1.status_code == 200, f"\n📥 Input: sector=Fiscal by Fiscal tech\n✅ Expected: 200\n❌ Got: {res1.status_code}"

        # 2. Fiscal tech requesting sector="TI" -> 403 Forbidden
        req_fiscal_forbidden = self.factory.get("/get_dash_board_pie/TI")
        req_fiscal_forbidden.user = self.tech_fiscal_user
        req_fiscal_forbidden.session = SessionStore()
        force_authenticate(req_fiscal_forbidden, user=self.tech_fiscal_user)
        res2 = get_dash_board_pie(req_fiscal_forbidden, sector="TI")
        assert res2.status_code == 403, f"\n📥 Input: sector=TI by Fiscal tech\n✅ Expected: 403\n❌ Got: {res2.status_code}"

        # 3. TI tech requesting sector="Fiscal" -> 403 Forbidden
        req_ti_forbidden = self.factory.get("/get_dash_board_pie/Fiscal")
        req_ti_forbidden.user = self.tech_ti_user
        req_ti_forbidden.session = SessionStore()
        force_authenticate(req_ti_forbidden, user=self.tech_ti_user)
        res3 = get_dash_board_pie(req_ti_forbidden, sector="Fiscal")
        assert res3.status_code == 403, f"\n📥 Input: sector=Fiscal by TI tech\n✅ Expected: 403\n❌ Got: {res3.status_code}"

        # 4. Dual tech requesting sector="Fiscal" and sector="TI" -> 200 OK for both
        req_dual_fiscal = self.factory.get("/get_dash_board_pie/Fiscal")
        req_dual_fiscal.user = self.tech_dual_user
        req_dual_fiscal.session = SessionStore()
        force_authenticate(req_dual_fiscal, user=self.tech_dual_user)
        res4 = get_dash_board_pie(req_dual_fiscal, sector="Fiscal")
        assert res4.status_code == 200, f"\n📥 Input: sector=Fiscal by Dual tech\n✅ Expected: 200\n❌ Got: {res4.status_code}"

        req_dual_ti = self.factory.get("/get_dash_board_pie/TI")
        req_dual_ti.user = self.tech_dual_user
        req_dual_ti.session = SessionStore()
        force_authenticate(req_dual_ti, user=self.tech_dual_user)
        res5 = get_dash_board_pie(req_dual_ti, sector="TI")
        assert res5.status_code == 200, f"\n📥 Input: sector=TI by Dual tech\n✅ Expected: 200\n❌ Got: {res5.status_code}"

    def test_ticket_list_filtering_per_user_areas(self) -> None:
        """
        Input: get_ticket_ti endpoint called by Fiscal tech, TI tech, and Dual tech
        Expect: Filtered list of tickets matching only authorized areas for each technician
        Result: verificado via assert
        """
        # Fiscal tech
        req_fiscal = self.factory.get("/get_ticket_ti/10/open/-id")
        req_fiscal.user = self.tech_fiscal_user
        req_fiscal.session = SessionStore()
        force_authenticate(req_fiscal, user=self.tech_fiscal_user)
        res_fiscal = get_ticket_ti(req_fiscal, quantity=10, status="open", order="-id")
        assert res_fiscal.status_code == 200
        payload_fiscal: dict[str, Any] = json.loads(res_fiscal.content.decode("utf-8"))
        ticket_ids_fiscal: list[int] = [t["id"] for t in payload_fiscal.get("tickets", [])]
        assert self.ticket_fiscal.id in ticket_ids_fiscal, "Fiscal ticket should be present for Fiscal tech"
        assert self.ticket_ti.id not in ticket_ids_fiscal, "TI ticket should NOT be present for Fiscal tech"

        # TI tech
        req_ti = self.factory.get("/get_ticket_ti/10/open/-id")
        req_ti.user = self.tech_ti_user
        req_ti.session = SessionStore()
        force_authenticate(req_ti, user=self.tech_ti_user)
        res_ti = get_ticket_ti(req_ti, quantity=10, status="open", order="-id")
        assert res_ti.status_code == 200
        payload_ti: dict[str, Any] = json.loads(res_ti.content.decode("utf-8"))
        ticket_ids_ti: list[int] = [t["id"] for t in payload_ti.get("tickets", [])]
        assert self.ticket_ti.id in ticket_ids_ti, "TI ticket should be present for TI tech"
        assert self.ticket_fiscal.id not in ticket_ids_ti, "Fiscal ticket should NOT be present for TI tech"

        # Dual tech
        req_dual = self.factory.get("/get_ticket_ti/10/open/-id")
        req_dual.user = self.tech_dual_user
        req_dual.session = SessionStore()
        force_authenticate(req_dual, user=self.tech_dual_user)
        res_dual = get_ticket_ti(req_dual, quantity=10, status="open", order="-id")
        assert res_dual.status_code == 200
        payload_dual: dict[str, Any] = json.loads(res_dual.content.decode("utf-8"))
        ticket_ids_dual: list[int] = [t["id"] for t in payload_dual.get("tickets", [])]
        assert self.ticket_ti.id in ticket_ids_dual, "TI ticket should be present for Dual tech"
        assert self.ticket_fiscal.id in ticket_ids_dual, "Fiscal ticket should be present for Dual tech"

    def test_technician_list_filtering_per_area(self) -> None:
        """
        Input: get_info requested by Fiscal tech, TI tech, and Dual tech
        Expect: Return list of technicians filtered strictly by user allowed areas
        Result: verificado via assert
        """
        # Fiscal tech -> technicians must include Fiscal tech and Dual tech, exclude pure TI tech
        req_fiscal = self.factory.get("/get_info/")
        req_fiscal.user = self.tech_fiscal_user
        req_fiscal.session = SessionStore()
        force_authenticate(req_fiscal, user=self.tech_fiscal_user)
        res_fiscal = get_info(req_fiscal)
        assert res_fiscal.status_code == 200
        payload_fiscal: dict[str, Any] = json.loads(res_fiscal.content.decode("utf-8"))
        techs_dict_fiscal: dict[str, list[str]] = payload_fiscal.get("techs", {})
        tech_names_fiscal: list[str] = techs_dict_fiscal.get("Fiscal", [])
        assert self.tech_fiscal_user.get_full_name() in tech_names_fiscal
        assert self.tech_dual_user.get_full_name() in tech_names_fiscal
        assert self.tech_ti_user.get_full_name() not in tech_names_fiscal

        # TI tech -> technicians must include TI tech and Dual tech, exclude pure Fiscal tech
        req_ti = self.factory.get("/get_info/")
        req_ti.user = self.tech_ti_user
        req_ti.session = SessionStore()
        force_authenticate(req_ti, user=self.tech_ti_user)
        res_ti = get_info(req_ti)
        assert res_ti.status_code == 200
        payload_ti: dict[str, Any] = json.loads(res_ti.content.decode("utf-8"))
        techs_dict_ti: dict[str, list[str]] = payload_ti.get("techs", {})
        tech_names_ti: list[str] = techs_dict_ti.get("TI", [])
        assert self.tech_ti_user.get_full_name() in tech_names_ti
        assert self.tech_dual_user.get_full_name() in tech_names_ti
        assert self.tech_fiscal_user.get_full_name() not in tech_names_ti


    @patch("services.ticket_service.send_mail")
    def test_cross_area_technician_assignment_rejection(self, mock_send_mail: MagicMock) -> None:
        """
        Input: Attempting to assign a pure TI tech to a Fiscal ticket, or pure Fiscal tech to a TI ticket
        Expect: Rejection with ValueError for cross-area assignment, success for compatible/dual tech
        Result: verificado via assert
        """
        # Assigning pure TI tech to Fiscal ticket -> ValueError
        with self.assertRaises(ValueError) as ctx1:
            change_responsible_technician(
                id=self.ticket_fiscal.id,
                responsible_technician=self.tech_ti_user.get_full_name(),
                technician=self.tech_fiscal_user.get_full_name(),
                date="05/08/2026",
                hours="14:00",
                techMail=self.tech_ti_user.email,
                mail="req@test.com",
                username=self.tech_fiscal_user.username,
            )
        assert "não possui permissão para a área 'Fiscal'" in str(ctx1.exception)

        # Assigning pure Fiscal tech to TI ticket -> ValueError
        with self.assertRaises(ValueError) as ctx2:
            change_responsible_technician(
                id=self.ticket_ti.id,
                responsible_technician=self.tech_fiscal_user.get_full_name(),
                technician=self.tech_ti_user.get_full_name(),
                date="05/08/2026",
                hours="14:00",
                techMail=self.tech_fiscal_user.email,
                mail="req@test.com",
                username=self.tech_ti_user.username,
            )
        assert "não possui permissão para a área 'TI'" in str(ctx2.exception)

        # Assigning Dual tech to Fiscal ticket -> Allowed
        chat_res, new_resp = change_responsible_technician(
            id=self.ticket_fiscal.id,
            responsible_technician=self.tech_dual_user.get_full_name(),
            technician=self.tech_fiscal_user.get_full_name(),
            date="05/08/2026",
            hours="14:00",
            techMail=self.tech_dual_user.email,
            mail="req@test.com",
            username=self.tech_fiscal_user.username,
        )
        assert new_resp == self.tech_dual_user.get_full_name()


class DatabaseGroupCreationIdempotencyTests(TestCase):
    """Tests for database group creation idempotency via command and migration."""

    def setUp(self) -> None:
        Group.objects.filter(name=GROUP_NAME).delete()

    def test_command_creates_fiscal_group_when_not_exists(self) -> None:
        """
        Input: 'create_fiscal_group' command executed when group is absent
        Expect: Group 'Helpdesk_Technician_Fiscal' created in database
        Result: verificado via assert
        """
        out: StringIO = StringIO()
        call_command("create_fiscal_group", stdout=out)
        assert Group.objects.filter(name=GROUP_NAME).exists() is True
        assert "criado com sucesso" in out.getvalue()

    def test_command_is_idempotent_when_group_already_exists(self) -> None:
        """
        Input: 'create_fiscal_group' command executed when group already exists
        Expect: Command completes idempotently without duplication or error
        Result: verificado via assert
        """
        Group.objects.create(name=GROUP_NAME)
        out: StringIO = StringIO()
        call_command("create_fiscal_group", stdout=out)
        assert Group.objects.filter(name=GROUP_NAME).count() == 1
        assert "já existe" in out.getvalue()

    def test_migration_functions_create_and_remove(self) -> None:
        """
        Input: Data migration functions create_fiscal_group and remove_fiscal_group
        Expect: Group created, idempotent on second execution, cleanly deleted on rollback
        Result: verificado via assert
        """
        mock_apps: MockApps = MockApps()
        create_fiscal_group_migration(mock_apps, None)
        assert Group.objects.filter(name=GROUP_NAME).exists() is True

        # Second execution for idempotency check
        create_fiscal_group_migration(mock_apps, None)
        assert Group.objects.filter(name=GROUP_NAME).count() == 1

        # Rollback check
        remove_fiscal_group_migration(mock_apps, None)
        assert Group.objects.filter(name=GROUP_NAME).exists() is False
