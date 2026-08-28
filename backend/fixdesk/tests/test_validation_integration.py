from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from classes.exceptions.auth_exeption import AuthenticationError


class ValidationEndpointIntegrationTests(TestCase):
    """Cenários de autenticação integrados no endpoint ``/validation/``."""

    def setUp(self) -> None:
        self.client = APIClient()
        self.credentials = {"user": "local-admin", "password": "correct-password"}
        self.superuser = User.objects.create_superuser(
            username=self.credentials["user"],
            password=self.credentials["password"],
            first_name="Local",
            last_name="Admin",
            email="admin@example.com",
        )

    def _post_validation(self) -> object:
        return self.client.post("/validation/", self.credentials, format="json")

    @patch("fixdesk.views.authenticate_local_superuser", create=True)
    @patch("fixdesk.views.connect_ldap_with_failover")
    def test_ldap_success_does_not_call_local_fallback(
        self,
        connect_ldap_mock,
        local_auth_mock,
    ) -> None:
        connect_ldap_mock.return_value = (
            True,
            "Success",
            [
                {
                    "attributes": {
                        "givenName": "Carlos",
                        "sn": "Oliveira",
                        "displayName": "Carlos Oliveira",
                        "department": "TI",
                        "title": "Analista",
                        "mail": "carlos@example.com",
                        "company": "Empresa",
                        "memberOf": ["CN=CH - User"],
                    }
                }
            ],
        )

        with override_settings(
            AUTHENTICATION_MODE="ldap_or_local_superuser",
            ALLOW_LOCAL_SUPERUSER_LOGIN=True,
        ):
            response = self._post_validation()

        self.assertEqual(response.status_code, 200)
        local_auth_mock.assert_not_called()

    @patch("fixdesk.views.authenticate_local_superuser", create=True)
    @patch("fixdesk.views.connect_ldap_with_failover")
    def test_ldap_failure_with_fallback_disabled_returns_401_without_django_auth(
        self,
        connect_ldap_mock,
        local_auth_mock,
    ) -> None:
        connect_ldap_mock.side_effect = AuthenticationError("LDAP indisponível")

        with override_settings(
            AUTHENTICATION_MODE="ldap_or_local_superuser",
            ALLOW_LOCAL_SUPERUSER_LOGIN=False,
        ):
            response = self._post_validation()

        self.assertEqual(response.status_code, 401)
        local_auth_mock.assert_not_called()

    @patch("fixdesk.views.connect_ldap_with_failover")
    def test_ldap_failure_with_enabled_fallback_authenticates_superuser(self, connect_ldap_mock) -> None:
        connect_ldap_mock.side_effect = AuthenticationError("LDAP indisponível")

        with override_settings(
            AUTHENTICATION_MODE="ldap_or_local_superuser",
            ALLOW_LOCAL_SUPERUSER_LOGIN=True,
        ):
            response = self._post_validation()

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.wsgi_request.user.is_authenticated)
        self.assertEqual(response.wsgi_request.user, self.superuser)
        self.assertEqual(response.json()["data"]["name"], "Local Admin")
        self.assertEqual(response.json()["data"]["mail"], "admin@example.com")
        self.assertIn("Local Superuser", response.json()["data"]["roles"])

    def test_local_rejection_scenarios_return_same_401_response(self) -> None:
        scenarios = (
            {"user": "regular-user", "password": "correct-password"},
            {"user": "local-admin", "password": "wrong-password"},
            {"user": "inactive-admin", "password": "correct-password"},
            {"user": "missing-user", "password": "correct-password"},
        )
        User.objects.create_user(username="regular-user", password="correct-password")
        User.objects.create_superuser(username="inactive-admin", password="correct-password")
        User.objects.filter(username="inactive-admin").update(is_active=False)

        responses: list[tuple[int, str]] = []
        with patch(
            "fixdesk.views.connect_ldap_with_failover",
            side_effect=AuthenticationError("LDAP indisponível"),
        ):
            with override_settings(
                AUTHENTICATION_MODE="ldap_or_local_superuser",
                ALLOW_LOCAL_SUPERUSER_LOGIN=True,
            ):
                for credentials in scenarios:
                    response = self.client.post("/validation/", credentials, format="json")
                    responses.append((response.status_code, response.content.decode()))

        self.assertTrue(all(status_code == 401 for status_code, _ in responses))
        self.assertEqual(len({body for _, body in responses}), 1)
        self.assertNotIn("regular-user", responses[0][1])
        self.assertNotIn("missing-user", responses[0][1])

    @patch("fixdesk.views.authenticate_local_superuser", create=True)
    @patch("fixdesk.views.connect_ldap_with_failover")
    def test_invalid_authentication_configuration_fails_closed(
        self,
        connect_ldap_mock,
        local_auth_mock,
    ) -> None:
        connect_ldap_mock.side_effect = AuthenticationError("LDAP indisponível")

        with override_settings(
            AUTHENTICATION_MODE="invalid-mode",
            ALLOW_LOCAL_SUPERUSER_LOGIN=True,
        ):
            response = self._post_validation()

        self.assertEqual(response.status_code, 401)
        local_auth_mock.assert_not_called()
