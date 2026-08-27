from django.test import TestCase, SimpleTestCase
from unittest.mock import MagicMock
from django.core.files.uploadedfile import UploadedFile
from django.contrib.auth.models import User, Group
from django.contrib.sessions.backends.db import SessionStore
from rest_framework.test import APIRequestFactory, force_authenticate
import json
from django.utils import timezone

from dashboards.views import (
    verify_valid_or_not,
    dashboard_ti,
    get_info,
    get_dash_board_pie,
    get_ticket_ti,
    get_dash_board_bar,
    upload_new_files,
    details_chat,
    get_users_fixdesk,
    exclude_user,
)
from helpdesk.models import SupportTicket, Area
from fixdesk.permissions import (
    DJANGO_GROUP_TECH,
    DJANGO_GROUP_LEADER,
    DJANGO_GROUP_TECH_FISCAL,
    DJANGO_GROUP_USER,
)


class VerifyValidOrNotTests(SimpleTestCase):
    def setUp(self) -> None:
        # We simulate magic bytes for a PNG and a PDF
        self.png_magic_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        self.pdf_magic_bytes = b"%PDF-1.4\n%\\xe2\\xe3\\xcf\\xd3\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n"
        self.txt_magic_bytes = b"Hello world this is just a plain text file"

    def _create_mock_file(self, content: bytes, filename: str = "test_file.png") -> MagicMock:
        mock_file = MagicMock(spec=UploadedFile)
        mock_file.read.return_value = content
        mock_file.name = filename
        return mock_file

    def test_valid_file_type(self) -> None:
        mock_file = self._create_mock_file(self.png_magic_bytes, "test_file.png")
        allowed_types = ["png", "jpeg"]

        valid, image_bytes, file_type = verify_valid_or_not(mock_file, allowed_types)

        self.assertTrue(valid, f"\n📥 Input: {allowed_types!r}\n✅ Expected: True\n❌ Got: {valid!r}")
        self.assertEqual(image_bytes, self.png_magic_bytes)
        self.assertIn("png", file_type.lower())

    def test_invalid_file_type(self) -> None:
        mock_file = self._create_mock_file(self.pdf_magic_bytes, "test_file.pdf")
        allowed_types = ["png", "jpeg"]

        valid, image_bytes, file_type = verify_valid_or_not(mock_file, allowed_types)

        self.assertFalse(valid, f"\n📥 Input: {allowed_types!r}\n✅ Expected: False\n❌ Got: {valid!r}")
        self.assertEqual(image_bytes, self.pdf_magic_bytes)
        self.assertIn("pdf", file_type.lower())

    def test_no_allowed_types(self) -> None:
        mock_file = self._create_mock_file(self.png_magic_bytes, "test_file.png")

        valid, _, _ = verify_valid_or_not(mock_file, [])
        self.assertFalse(valid, f"\n📥 Input: []\n✅ Expected: False\n❌ Got: {valid!r}")

        valid, _, _ = verify_valid_or_not(mock_file, None)
        self.assertFalse(valid, f"\n📥 Input: None\n✅ Expected: False\n❌ Got: {valid!r}")

    def test_allowed_types_with_quotes(self) -> None:
        mock_file = self._create_mock_file(self.png_magic_bytes, "test_file.png")
        allowed_types = ['"png"']

        valid, _, _ = verify_valid_or_not(mock_file, allowed_types)

        self.assertTrue(valid, f"\n📥 Input: {allowed_types!r}\n✅ Expected: True\n❌ Got: {valid!r}")

    def test_file_type_evaluation(self) -> None:
        mock_file = self._create_mock_file(self.txt_magic_bytes, "test_file.txt")

        valid, _, file_type = verify_valid_or_not(mock_file, ["text", "txt"])

        self.assertIn("text", file_type.lower())
        self.assertTrue(valid, f"\n📥 Input: ['text', 'txt']\n✅ Expected: True\n❌ Got: {valid!r}")


class DashboardAccessAndKPIsTestCase(TestCase):
    databases = "__all__"

    def setUp(self) -> None:
        self.factory = APIRequestFactory()

        self.group_ti, _ = Group.objects.get_or_create(name=DJANGO_GROUP_TECH)
        self.group_leader, _ = Group.objects.get_or_create(name=DJANGO_GROUP_LEADER)
        self.group_fiscal, _ = Group.objects.get_or_create(name=DJANGO_GROUP_TECH_FISCAL)
        self.group_user, _ = Group.objects.get_or_create(name=DJANGO_GROUP_USER)

        self.user_ti = User.objects.create_user(
            username="tech_ti", first_name="Tech", last_name="TI", email="ti@test.com"
        )
        self.user_ti.groups.add(self.group_ti)

        self.user_fiscal = User.objects.create_user(
            username="tech_fiscal", first_name="Tech", last_name="Fiscal", email="fiscal@test.com"
        )
        self.user_fiscal.groups.add(self.group_fiscal)

        self.user_dual = User.objects.create_user(
            username="tech_dual", first_name="Tech", last_name="Dual", email="dual@test.com"
        )
        self.user_dual.groups.add(self.group_ti, self.group_fiscal)

        self.user_common = User.objects.create_user(
            username="user_common", first_name="User", last_name="Common", email="common@test.com"
        )
        self.user_common.groups.add(self.group_user)

        self.superuser = User.objects.create_superuser(
            username="admin", first_name="Super", last_name="User", email="admin@test.com", password="pwd"
        )

        now = timezone.now()

        self.ticket_ti = SupportTicket.objects.create(
            ticketRequester="user_common",
            mail="common@test.com",
            company="Lupatech",
            sector="TI",
            occurrence="Issue TI",
            problemn="Detail TI",
            respective_area=Area.objects.get_or_create(code="TI")[0],
            open=True,
            start_date=now,
            PID=self.user_common.pk,
        )

        self.ticket_fiscal = SupportTicket.objects.create(
            ticketRequester="user_common",
            mail="common@test.com",
            company="Lupatech",
            sector="Fiscal",
            occurrence="Issue Fiscal",
            problemn="Detail Fiscal",
            respective_area=Area.objects.get_or_create(code="Fiscal")[0],
            open=True,
            start_date=now,
            PID=self.user_common.pk,
        )

    def _create_request(self, method: str, path: str, user: User, data: dict[str, str] | None = None):
        m = method.upper()
        if m == "GET":
            req = self.factory.get(path)
        elif m == "DELETE":
            req = self.factory.delete(path, data or {})
        else:
            req = self.factory.post(path, data or {})
        req.user = user
        force_authenticate(req, user=user)
        req.session = SessionStore()
        return req

    def test_dashboard_ti_access(self) -> None:
        req = self._create_request("GET", "/dashboard-ti/", self.user_ti)
        resp = dashboard_ti(req)
        self.assertEqual(resp.status_code, 200)

        req = self._create_request("GET", "/dashboard-ti/", self.user_fiscal)
        resp = dashboard_ti(req)
        self.assertEqual(resp.status_code, 200)

        req = self._create_request("GET", "/dashboard-ti/", self.user_dual)
        resp = dashboard_ti(req)
        self.assertEqual(resp.status_code, 200)

        req = self._create_request("GET", "/dashboard-ti/", self.superuser)
        resp = dashboard_ti(req)
        self.assertEqual(resp.status_code, 200)

        req = self._create_request("GET", "/dashboard-ti/", self.user_common)
        resp = dashboard_ti(req)
        self.assertEqual(resp.status_code, 302)
        self.assertEqual(getattr(resp, "url", ""), "/helpdesk")

    def test_get_info_technician_filtering(self) -> None:
        req = self._create_request("GET", "/dashboard-ti/get-info/", self.user_ti)
        resp = get_info(req)
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.content)
        self.assertIn("Tech TI", data["techs"].get("TI", []))
        self.assertNotIn("Tech Fiscal", data["techs"].get("TI", []))

        req = self._create_request("GET", "/dashboard-ti/get-info/", self.user_fiscal)
        resp = get_info(req)
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.content)
        self.assertIn("Tech Fiscal", data["techs"].get("Fiscal", []))
        self.assertNotIn("Tech TI", data["techs"].get("Fiscal", []))

        req = self._create_request("GET", "/dashboard-ti/get-info/", self.user_dual)
        resp = get_info(req)
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.content)
        self.assertIn("Tech TI", data["techs"].get("TI", []))
        self.assertIn("Tech Fiscal", data["techs"].get("Fiscal", []))

        req = self._create_request("GET", "/dashboard-ti/get-info/", self.user_common)
        resp = get_info(req)
        self.assertEqual(resp.status_code, 403)

    def test_get_dash_board_pie_sector_validation(self) -> None:
        req = self._create_request("GET", "/dashboard-ti/get-dash-board-pie/TI", self.user_ti)
        resp = get_dash_board_pie(req, sector="TI")
        self.assertEqual(resp.status_code, 200)

        req = self._create_request("GET", "/dashboard-ti/get-dash-board-pie/Fiscal", self.user_ti)
        resp = get_dash_board_pie(req, sector="Fiscal")
        self.assertEqual(resp.status_code, 403)

        req = self._create_request("GET", "/dashboard-ti/get-dash-board-pie/Fiscal", self.user_fiscal)
        resp = get_dash_board_pie(req, sector="Fiscal")
        self.assertEqual(resp.status_code, 200)

        req = self._create_request("GET", "/dashboard-ti/get-dash-board-pie/TI", self.user_fiscal)
        resp = get_dash_board_pie(req, sector="TI")
        self.assertEqual(resp.status_code, 403)

        req = self._create_request("GET", "/dashboard-ti/get-dash-board-pie/TI", self.user_dual)
        self.assertEqual(get_dash_board_pie(req, sector="TI").status_code, 200)
        req = self._create_request("GET", "/dashboard-ti/get-dash-board-pie/Fiscal", self.user_dual)
        self.assertEqual(get_dash_board_pie(req, sector="Fiscal").status_code, 200)

        req = self._create_request("GET", "/dashboard-ti/get-dash-board-pie/Other", self.user_ti)
        resp = get_dash_board_pie(req, sector="Other")
        self.assertEqual(resp.status_code, 400)

    def test_get_ticket_ti_area_filtering(self) -> None:
        req = self._create_request("GET", "/dashboard-ti/get-ticket-ti/10/open/-id", self.user_ti)
        resp = get_ticket_ti(req, quantity=10, status="open", order="-id")
        self.assertEqual(resp.status_code, 200)
        tickets = json.loads(resp.content)["tickets"]
        areas = {t.get("respective_area_code") for t in tickets}
        self.assertTrue(areas.issubset({"TI"}))

        req = self._create_request("GET", "/dashboard-ti/get-ticket-ti/10/open/-id", self.user_fiscal)
        resp = get_ticket_ti(req, quantity=10, status="open", order="-id")
        self.assertEqual(resp.status_code, 200)
        tickets = json.loads(resp.content)["tickets"]
        areas = {t.get("respective_area_code") for t in tickets}
        self.assertTrue(areas.issubset({"Fiscal"}))

        req = self._create_request("GET", "/dashboard-ti/get-ticket-ti/10/open/-id", self.user_dual)
        resp = get_ticket_ti(req, quantity=10, status="open", order="-id")
        self.assertEqual(resp.status_code, 200)
        tickets = json.loads(resp.content)["tickets"]
        areas = {t.get("respective_area_code") for t in tickets}
        self.assertEqual(areas, {"TI", "Fiscal"})

        req = self._create_request("GET", "/dashboard-ti/get-ticket-ti/10/open/-id", self.user_common)
        resp = get_ticket_ti(req, quantity=10, status="open", order="-id")
        self.assertEqual(resp.status_code, 403)

    def test_get_dash_board_bar_histogram(self) -> None:
        req = self._create_request("GET", "/dashboard-ti/get-dash-board-bar/TI/year", self.user_ti)
        resp = get_dash_board_bar(req, sector="TI", range_days="year")
        self.assertEqual(resp.status_code, 200)

        req = self._create_request("GET", "/dashboard-ti/get-dash-board-bar/Fiscal/year", self.user_ti)
        resp = get_dash_board_bar(req, sector="Fiscal", range_days="year")
        self.assertEqual(resp.status_code, 403)

        req = self._create_request("GET", "/dashboard-ti/get-dash-board-bar/Fiscal/year", self.user_fiscal)
        resp = get_dash_board_bar(req, sector="Fiscal", range_days="year")
        self.assertEqual(resp.status_code, 200)

        req = self._create_request("GET", "/dashboard-ti/get-dash-board-bar/TI/year", self.user_fiscal)
        resp = get_dash_board_bar(req, sector="TI", range_days="year")
        self.assertEqual(resp.status_code, 403)

        req = self._create_request("GET", "/dashboard-ti/get-dash-board-bar/TI/all", self.user_dual)
        self.assertEqual(get_dash_board_bar(req, sector="TI", range_days="all").status_code, 200)
        req = self._create_request("GET", "/dashboard-ti/get-dash-board-bar/Fiscal/all", self.user_dual)
        self.assertEqual(get_dash_board_bar(req, sector="Fiscal", range_days="all").status_code, 200)

        req = self._create_request("GET", "/dashboard-ti/get-dash-board-bar/TI/invalid", self.user_ti)
        resp = get_dash_board_bar(req, sector="TI", range_days="invalid")
        self.assertEqual(resp.status_code, 400)

        req = self._create_request("GET", "/dashboard-ti/get-dash-board-bar/TI/year", self.user_common)
        resp = get_dash_board_bar(req, sector="TI", range_days="year")
        self.assertEqual(resp.status_code, 403)

    def test_other_endpoints_authorization(self) -> None:
        ticket_id = self.ticket_ti.pk

        req = self._create_request("GET", f"/dashboard-ti/details/{ticket_id}", self.user_ti)
        resp = details_chat(req, id=ticket_id)
        self.assertEqual(resp.status_code, 200)

        req = self._create_request("GET", f"/dashboard-ti/details/{self.ticket_fiscal.pk}", self.user_ti)
        resp = details_chat(req, id=self.ticket_fiscal.pk)
        self.assertEqual(resp.status_code, 403)

        req = self._create_request("GET", f"/dashboard-ti/details/{ticket_id}", self.user_common)
        resp = details_chat(req, id=ticket_id)
        self.assertEqual(resp.status_code, 302)

        req = self._create_request("GET", "/dashboard-ti/get-users-fixdesk/?page=1&page_size=10", self.user_ti)
        resp = get_users_fixdesk(req)
        self.assertEqual(resp.status_code, 200)

        self.client.force_login(self.user_ti)
        client_resp = self.client.get("/dashboard-ti/get-users-fixdesk/?page=1&page_size=10")
        self.assertEqual(client_resp.status_code, 200)
        self.assertEqual(client_resp["Content-Type"], "application/json")
        data = client_resp.json()
        self.assertIn("users", data)
        self.assertIn("total_users", data)
        self.assertIn("total_pages", data)
        self.assertEqual(data["current_page"], 1)
        self.assertEqual(data["page_size"], 10)

        req = self._create_request("GET", "/dashboard-ti/get-users-fixdesk/", self.user_common)
        resp = get_users_fixdesk(req)
        self.assertEqual(resp.status_code, 403)

        req = self._create_request("DELETE", "/dashboard-ti/exclude-user/User Common", self.user_common)
        resp = exclude_user(req, user="User Common")
        self.assertEqual(resp.status_code, 403)

    def test_exclude_user_endpoint(self) -> None:
        to_delete = User.objects.create_user(
            username="to_delete", first_name="To", last_name="Delete", email="delete@test.com"
        )
        to_delete.groups.add(self.group_user)

        # Test POST method rejected (HTTP 405)
        req_post = self._create_request("POST", f"/dashboard-ti/exclude-user/{to_delete.first_name} {to_delete.last_name}", self.user_ti)
        resp_post = exclude_user(req_post, user=f"{to_delete.first_name} {to_delete.last_name}")
        self.assertEqual(resp_post.status_code, 405)

        # Test DELETE method success (HTTP 200)
        req_delete = self._create_request("DELETE", f"/dashboard-ti/exclude-user/{to_delete.first_name} {to_delete.last_name}", self.user_ti)
        resp_delete = exclude_user(req_delete, user=f"{to_delete.first_name} {to_delete.last_name}")
        self.assertEqual(resp_delete.status_code, 200)
        self.assertFalse(User.objects.filter(pk=to_delete.pk).exists())

    def test_get_users_fixdesk_search_and_pagination(self) -> None:
        self.client.force_login(self.user_ti)
        
        # Test pagination with page_size=2
        resp = self.client.get("/dashboard-ti/get-users-fixdesk/?page=1&page_size=2")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data["users"]), 2)
        self.assertEqual(data["page_size"], 2)
        self.assertGreaterEqual(data["total_pages"], 2)

        # Test page 2
        resp_page2 = self.client.get("/dashboard-ti/get-users-fixdesk/?page=2&page_size=2")
        self.assertEqual(resp_page2.status_code, 200)
        data_page2 = resp_page2.json()
        self.assertEqual(data_page2["current_page"], 2)

        # Test search filter
        resp_search = self.client.get("/dashboard-ti/get-users-fixdesk/?search=Fiscal")
        self.assertEqual(resp_search.status_code, 200)
        data_search = resp_search.json()
        self.assertGreaterEqual(data_search["total_users"], 1)
        for u in data_search["users"]:
            has_match = (
                "fiscal" in u["first_name"].lower()
                or "fiscal" in u["last_name"].lower()
                or any("fiscal" in g.lower() for g in u["groups"])
            )
            self.assertTrue(has_match)

