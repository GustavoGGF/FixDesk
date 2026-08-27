import json
from unittest.mock import patch
from django.test import TestCase
from django.contrib.auth.models import User, Group
from rest_framework.test import APIRequestFactory
from fixdesk.views import (
    connect_ldap,
    connect_ldap_with_failover,
    create_class_user,
    create_or_verify_user,
    validation,
)
from classes.exceptions.auth_exeption import AuthenticationError, LDAPServerError


class LDAPProvisioningTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create_user(
            username="testuser", password="password123", first_name="Test", last_name="User"
        )

    def test_create_class_user_single_roles(self):
        """Valida a extração de cada função individual via memberOf do LDAP."""
        scenarios = [
            ("CN=CH - User,OU=Groups,DC=domain", "User"),
            ("CN=CH - Technician_TI,OU=Groups,DC=domain", "Tecnico TI"),
            ("CN=CH - Technician_Fiscal,OU=Groups,DC=domain", "Tecnico Fiscal"),
            ("CN=CH - Leader_TI,OU=Groups,DC=domain", "Gestor"),
        ]

        for member_of_str, expected_role in scenarios:
            extractor = {
                "attributes": {
                    "givenName": "John",
                    "sn": "Doe",
                    "displayName": "John Doe",
                    "department": "IT",
                    "title": "Analyst",
                    "mail": "john.doe@example.com",
                    "company": "Lupatech",
                    "memberOf": [member_of_str],
                }
            }
            user_obj, full_name = create_class_user(extractor)
            self.assertEqual(full_name, "John Doe")
            self.assertEqual(user_obj.helpdesk, expected_role)
            self.assertIn(expected_role, user_obj.roles)

    def test_create_class_user_multiple_roles(self):
        """Valida a extração de múltiplas funções via memberOf do LDAP (ex: TI + Fiscal)."""
        extractor = {
            "attributes": {
                "givenName": "Maria",
                "sn": "Silva",
                "displayName": "Maria Silva",
                "department": "Fiscal",
                "title": "Analista Fiscal",
                "mail": "maria.silva@example.com",
                "company": "Lupatech",
                "memberOf": [
                    "CN=CH - Technician_TI,OU=Groups,DC=domain",
                    "CN=CH - Technician_Fiscal,OU=Groups,DC=domain",
                    "CN=CH - User,OU=Groups,DC=domain",
                ],
            }
        }
        user_obj, full_name = create_class_user(extractor)
        self.assertEqual(full_name, "Maria Silva")
        self.assertIn("Tecnico TI", user_obj.roles)
        self.assertIn("Tecnico Fiscal", user_obj.roles)
        self.assertIn("User", user_obj.roles)
        self.assertIn(user_obj.helpdesk, ["Tecnico TI", "Tecnico Fiscal"])

    def test_create_or_verify_user_idempotent_multi_group(self):
        """Valida atribuição idempotente de múltiplos grupos Django (Helpdesk_Technician_TI e Helpdesk_Technician_Fiscal)."""
        request = self.factory.post("/validation/")
        success, msg = create_or_verify_user(
            user="multiuser",
            password="pass",
            request=request,
            helpdesk="Tecnico TI",
            name_create_user="Multi User",
            roles=["Tecnico TI", "Tecnico Fiscal"],
        )
        self.assertTrue(success)
        self.assertEqual(msg, "")

        created_user = User.objects.get(username="multiuser")
        group_names = set(created_user.groups.values_list("name", flat=True))
        self.assertIn("Helpdesk_Technician_TI", group_names)
        self.assertIn("Helpdesk_Technician_Fiscal", group_names)

    def test_create_or_verify_user_removes_unauthorized_technical_groups(self):
        """Garante que novo login remova grupos técnicos ausentes na resposta do AD."""
        ti_group, _ = Group.objects.get_or_create(name="Helpdesk_Technician_TI")
        self.user.groups.add(ti_group)

        request = self.factory.post("/validation/")
        success, msg = create_or_verify_user(
            user=self.user.username,
            password="password123",
            request=request,
            helpdesk="Tecnico Fiscal",
            name_create_user="Test User",
            roles=["Tecnico Fiscal"],
        )
        self.assertTrue(success)

        updated_user = User.objects.get(username=self.user.username)
        group_names = set(updated_user.groups.values_list("name", flat=True))
        self.assertNotIn("Helpdesk_Technician_TI", group_names)
        self.assertIn("Helpdesk_Technician_Fiscal", group_names)

    @patch("fixdesk.views.connect_ldap_with_failover")
    def test_validation_endpoint_returns_roles_and_groups(self, mock_connect_ldap):
        """Valida que a resposta JSON de /validation/ retorna roles e grupos atribuídos."""
        mock_connect_ldap.return_value = (
            True,
            "Success",
            [
                {
                    "attributes": {
                        "givenName": "Carlos",
                        "sn": "Oliveira",
                        "displayName": "Carlos Oliveira",
                        "department": "Fiscal",
                        "title": "Técnico Fiscal",
                        "mail": "carlos@example.com",
                        "company": "Lupatech",
                        "memberOf": ["CN=CH - Technician_Fiscal,OU=Groups,DC=domain"],
                    }
                }
            ],
        )

        request = self.factory.post(
            "/validation/",
            data={"user": "carlos", "password": "secretpassword"},
            format="json",
        )

        response = validation(request)
        self.assertEqual(response.status_code, 200)

        raw_content = getattr(response, "content", b"{}")
        if isinstance(raw_content, bytes):
            raw_content = raw_content.decode("utf-8")
        payload = json.loads(str(raw_content))
        data = payload.get("data", {})
        self.assertEqual(data.get("name"), "Carlos Oliveira")
        self.assertEqual(data.get("helpdesk"), "Tecnico Fiscal")
        self.assertIn("Tecnico Fiscal", data.get("roles", []))
        self.assertIn("Helpdesk_Technician_Fiscal", data.get("groups", []))

    @patch("fixdesk.views.connect_ldap")
    def test_failover_uses_primary_server_only_on_success(self, mock_connect_ldap):
        expected = (True, "Success", [])
        mock_connect_ldap.return_value = expected

        result = connect_ldap_with_failover("user", "secret", "server1", ["server2"])

        self.assertEqual(result, expected)
        mock_connect_ldap.assert_called_once_with("server1", "user", "secret")

    @patch("fixdesk.views.connect_ldap")
    def test_failover_uses_server_order_after_primary_failure(self, mock_connect_ldap):
        expected = (True, "Success", [])
        mock_connect_ldap.side_effect = [LDAPServerError("indisponível"), expected]

        result = connect_ldap_with_failover("user", "secret", "server1", ["server2"])

        self.assertEqual(result, expected)
        self.assertEqual(
            mock_connect_ldap.call_args_list,
            [
                (("server1", "user", "secret"),),
                (("server2", "user", "secret"),),
            ],
        )

    @patch("fixdesk.views.connect_ldap")
    def test_failover_raises_authentication_error_after_all_failures(self, mock_connect_ldap):
        mock_connect_ldap.side_effect = LDAPServerError("indisponível")

        with self.assertLogs("fixdesk.views", level="ERROR") as logs:
            with self.assertRaises(AuthenticationError):
                connect_ldap_with_failover("user", "secret", "server1", ["server2"])

        self.assertEqual(mock_connect_ldap.call_count, 2)
        log_output = " ".join(logs.output)
        self.assertNotIn("user", log_output)
        self.assertNotIn("secret", log_output)

    @patch("fixdesk.views.Connection")
    def test_connect_ldap_closes_connection_after_success(self, mock_connection):
        connection = mock_connection.return_value
        connection.bind.return_value = True
        connection.search.return_value = (True, "Success", [])
        connection.unbind.side_effect = RuntimeError("close failed")

        result = connect_ldap("server1", "user", "secret")

        self.assertEqual(result, (True, "Success", []))
        connection.unbind.assert_called_once_with()

    @patch("fixdesk.views.Connection")
    def test_connect_ldap_closes_connection_after_failure(self, mock_connection):
        connection = mock_connection.return_value
        connection.bind.side_effect = RuntimeError("connection failed")

        with self.assertRaises(LDAPServerError):
            connect_ldap("server1", "user", "secret")

        connection.unbind.assert_called_once_with()
