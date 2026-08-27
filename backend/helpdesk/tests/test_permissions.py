from django.test import TestCase
from django.contrib.auth.models import User, Group
from helpdesk.models import SupportTicket, Area
from fixdesk.permissions import (
    get_user_allowed_areas,
    is_technician,
    is_technician_for_area,
    user_can_access_ticket,
    user_can_manage_ticket,
)
from django.utils import timezone


class PermissionsTests(TestCase):
    def setUp(self):
        # Grupos Django
        self.group_user, _ = Group.objects.get_or_create(name="Helpdesk_User")
        self.group_tech_ti, _ = Group.objects.get_or_create(name="Helpdesk_Technician_TI")
        self.group_tech_fiscal, _ = Group.objects.get_or_create(name="Helpdesk_Technician_Fiscal")
        self.group_leader_ti, _ = Group.objects.get_or_create(name="Helpdesk_Leader_TI")

        # Usuários
        self.std_user = User.objects.create_user(username="std_user", password="password")
        self.std_user.groups.add(self.group_user)

        self.tech_ti_user = User.objects.create_user(username="tech_ti", password="password")
        self.tech_ti_user.groups.add(self.group_tech_ti)

        self.tech_fiscal_user = User.objects.create_user(username="tech_fiscal", password="password")
        self.tech_fiscal_user.groups.add(self.group_tech_fiscal)

        self.tech_dual_user = User.objects.create_user(username="tech_dual", password="password")
        self.tech_dual_user.groups.add(self.group_tech_ti, self.group_tech_fiscal)

        self.leader_user = User.objects.create_user(username="leader_ti", password="password")
        self.leader_user.groups.add(self.group_leader_ti)

        self.superuser = User.objects.create_superuser(username="admin", password="password")

        # Tickets
        self.ticket_ti = SupportTicket.objects.create(
            ticketRequester="std_user",
            mail="std@test.com",
            company="LupaTech",
            sector="TI",
            occurrence="Hardware",
            problemn="Lento",
            start_date=timezone.now(),
            respective_area=Area.objects.get_or_create(code="TI")[0],
            PID=self.std_user.id,
            open=True,
        )

        self.ticket_fiscal = SupportTicket.objects.create(
            ticketRequester="std_user",
            mail="std@test.com",
            company="LupaTech",
            sector="Fiscal",
            occurrence="Impostos",
            problemn="NF-e",
            start_date=timezone.now(),
            respective_area=Area.objects.get_or_create(code="Fiscal")[0],
            PID=self.std_user.id,
            open=True,
        )

    def test_get_user_allowed_areas(self):
        self.assertEqual(get_user_allowed_areas(self.std_user), [])
        self.assertEqual(get_user_allowed_areas(self.tech_ti_user), ["TI"])
        self.assertEqual(get_user_allowed_areas(self.tech_fiscal_user), ["Fiscal"])
        self.assertEqual(get_user_allowed_areas(self.leader_user), ["TI"])
        self.assertEqual(get_user_allowed_areas(self.tech_dual_user), ["TI", "Fiscal"])
        self.assertEqual(get_user_allowed_areas(self.superuser), ["TI", "Fiscal"])

    def test_is_technician(self):
        self.assertFalse(is_technician(self.std_user))
        self.assertTrue(is_technician(self.tech_ti_user))
        self.assertTrue(is_technician(self.tech_fiscal_user))
        self.assertTrue(is_technician(self.leader_user))
        self.assertTrue(is_technician(self.tech_dual_user))
        self.assertTrue(is_technician(self.superuser))

    def test_is_technician_for_area(self):
        self.assertTrue(is_technician_for_area(self.tech_ti_user, "TI"))
        self.assertFalse(is_technician_for_area(self.tech_ti_user, "Fiscal"))

        self.assertFalse(is_technician_for_area(self.tech_fiscal_user, "TI"))
        self.assertTrue(is_technician_for_area(self.tech_fiscal_user, "Fiscal"))

        self.assertTrue(is_technician_for_area(self.tech_dual_user, "TI"))
        self.assertTrue(is_technician_for_area(self.tech_dual_user, "Fiscal"))

    def test_user_can_access_ticket(self):
        # Requester pode acessar seus próprios tickets
        self.assertTrue(user_can_access_ticket(self.std_user, self.ticket_ti))
        self.assertTrue(user_can_access_ticket(self.std_user, self.ticket_fiscal))

        # Técnico TI pode acessar ticket TI, mas não Fiscal (salvo se for o solicitante)
        self.assertTrue(user_can_access_ticket(self.tech_ti_user, self.ticket_ti))
        self.assertFalse(user_can_access_ticket(self.tech_ti_user, self.ticket_fiscal))

        # Técnico Fiscal pode acessar ticket Fiscal, mas não TI
        self.assertFalse(user_can_access_ticket(self.tech_fiscal_user, self.ticket_ti))
        self.assertTrue(user_can_access_ticket(self.tech_fiscal_user, self.ticket_fiscal))

        # Dual tech acessa ambos
        self.assertTrue(user_can_access_ticket(self.tech_dual_user, self.ticket_ti))
        self.assertTrue(user_can_access_ticket(self.tech_dual_user, self.ticket_fiscal))

    def test_user_can_manage_ticket(self):
        # Requester comum não pode gerenciar tecnicamente
        self.assertFalse(user_can_manage_ticket(self.std_user, self.ticket_ti))
        self.assertFalse(user_can_manage_ticket(self.std_user, self.ticket_fiscal))

        # Técnico TI gerencia ticket TI, mas não Fiscal
        self.assertTrue(user_can_manage_ticket(self.tech_ti_user, self.ticket_ti))
        self.assertFalse(user_can_manage_ticket(self.tech_ti_user, self.ticket_fiscal))

        # Técnico Fiscal gerencia ticket Fiscal, mas não TI
        self.assertFalse(user_can_manage_ticket(self.tech_fiscal_user, self.ticket_ti))
        self.assertTrue(user_can_manage_ticket(self.tech_fiscal_user, self.ticket_fiscal))

        # Dual tech gerencia ambos
        self.assertTrue(user_can_manage_ticket(self.tech_dual_user, self.ticket_ti))
        self.assertTrue(user_can_manage_ticket(self.tech_dual_user, self.ticket_fiscal))
