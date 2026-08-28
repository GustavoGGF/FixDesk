from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.contrib.sessions.middleware import SessionMiddleware
from django.http import HttpResponse
from django.test import Client, RequestFactory, TestCase
from django.utils import timezone

from fixdesk.auth_policy import authenticate_local_superuser
from helpdesk.models import Area, SupportTicket


class LocalSuperuserSessionTests(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.factory = RequestFactory()
        area_ti, _ = Area.objects.get_or_create(code="TI")
        area_fiscal, _ = Area.objects.get_or_create(code="Fiscal")
        self.superuser = User.objects.create_superuser(
            username="local-admin",
            password="correct-password",
            first_name="Local",
            last_name="Admin",
            email="admin@example.com",
        )
        self.ticket_ti = SupportTicket.objects.create(
            ticketRequester="requester-ti",
            mail="requester@example.com",
            company="Example",
            sector="TI",
            occurrence="Hardware",
            problemn="Computador lento",
            start_date=timezone.now(),
            respective_area=area_ti,
            PID=self.superuser.pk,
            open=True,
        )
        self.ticket_fiscal = SupportTicket.objects.create(
            ticketRequester="requester-fiscal",
            mail="requester@example.com",
            company="Example",
            sector="Fiscal",
            occurrence="Impostos",
            problemn="NF-e",
            start_date=timezone.now(),
            respective_area=area_fiscal,
            PID=self.superuser.pk,
            open=True,
        )

    def _login_local_superuser(self) -> None:
        request = self.factory.get("/helpdesk/")
        SessionMiddleware(lambda _: HttpResponse()).process_request(request)
        authenticated_user = authenticate_local_superuser(
            request,
            "local-admin",
            "correct-password",
        )

        self.assertEqual(authenticated_user, self.superuser)
        login(request, authenticated_user)
        request.session.save()
        self.client.cookies[settings.SESSION_COOKIE_NAME] = request.session.session_key

    def test_local_superuser_receives_valid_django_session(self) -> None:
        self._login_local_superuser()

        session = self.client.session

        self.assertTrue(session.session_key)
        self.assertEqual(
            session["_auth_user_id"],
            str(self.superuser.pk),
        )
        self.assertEqual(
            session["_auth_user_backend"],
            "django.contrib.auth.backends.ModelBackend",
        )

    def test_local_superuser_is_authenticated_on_protected_request(self) -> None:
        self._login_local_superuser()

        response = self.client.get("/helpdesk/get-token/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.wsgi_request.user, self.superuser)
        self.assertTrue(response.wsgi_request.user.is_authenticated)

    def test_local_superuser_can_access_helpdesk(self) -> None:
        self._login_local_superuser()

        response = self.client.get("/helpdesk/")

        self.assertEqual(response.status_code, 200)

    def test_local_superuser_can_access_history(self) -> None:
        self._login_local_superuser()

        response = self.client.get("/helpdesk/history/")

        self.assertEqual(response.status_code, 200)

    def test_local_superuser_can_consult_tickets_from_both_areas(self) -> None:
        self._login_local_superuser()

        ti_response = self.client.get(
            "/helpdesk/tickets/?context=dashboard&area=TI&status=all"
        )
        fiscal_response = self.client.get(
            "/helpdesk/tickets/?context=dashboard&area=Fiscal&status=all"
        )

        self.assertEqual(ti_response.status_code, 200)
        self.assertEqual(fiscal_response.status_code, 200)
        self.assertEqual(ti_response.json()["tickets"][0]["id"], self.ticket_ti.pk)
        self.assertEqual(
            fiscal_response.json()["tickets"][0]["id"], self.ticket_fiscal.pk
        )

    def test_local_superuser_can_open_tickets_from_both_areas_for_management(self) -> None:
        self._login_local_superuser()

        ti_response = self.client.get(f"/helpdesk/ticket/{self.ticket_ti.pk}")
        fiscal_response = self.client.get(f"/helpdesk/ticket/{self.ticket_fiscal.pk}")

        self.assertEqual(ti_response.status_code, 200)
        self.assertEqual(fiscal_response.status_code, 200)

    def test_local_superuser_can_access_django_admin(self) -> None:
        self._login_local_superuser()

        response = self.client.get("/admin/")

        self.assertEqual(response.status_code, 200)

    def test_local_superuser_keeps_access_to_ti_and_fiscal_dashboards(self) -> None:
        self._login_local_superuser()

        ti_response = self.client.get("/dashboard-ti/get-dash-board-pie/TI")
        fiscal_response = self.client.get("/dashboard-ti/get-dash-board-pie/Fiscal")

        self.assertEqual(ti_response.status_code, 200)
        self.assertEqual(fiscal_response.status_code, 200)
