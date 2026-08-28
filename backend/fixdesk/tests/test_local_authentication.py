from unittest.mock import Mock, patch

from django.contrib.auth.models import User
from django.test import TestCase

from fixdesk.auth_policy import authenticate_local_superuser


class LocalSuperuserAuthenticationTests(TestCase):
    def setUp(self) -> None:
        self.request = Mock()
        self.superuser = User.objects.create_superuser(
            username="local-admin",
            password="correct-password",
            email="admin@example.com",
        )

    def test_returns_superuser_for_valid_credentials(self) -> None:
        authenticated_user = authenticate_local_superuser(
            self.request,
            "local-admin",
            "correct-password",
        )

        self.assertEqual(authenticated_user, self.superuser)

    def test_rejects_invalid_password(self) -> None:
        authenticated_user = authenticate_local_superuser(
            self.request,
            "local-admin",
            "wrong-password",
        )

        self.assertIsNone(authenticated_user)

    def test_rejects_nonexistent_user(self) -> None:
        authenticated_user = authenticate_local_superuser(
            self.request,
            "does-not-exist",
            "correct-password",
        )

        self.assertIsNone(authenticated_user)

    def test_rejects_existing_user_who_is_not_superuser(self) -> None:
        User.objects.create_user(
            username="regular-user",
            password="correct-password",
        )

        authenticated_user = authenticate_local_superuser(
            self.request,
            "regular-user",
            "correct-password",
        )

        self.assertIsNone(authenticated_user)

    def test_rejects_inactive_superuser(self) -> None:
        self.superuser.is_active = False
        self.superuser.save(update_fields=["is_active"])

        authenticated_user = authenticate_local_superuser(
            self.request,
            "local-admin",
            "correct-password",
        )

        self.assertIsNone(authenticated_user)

    @patch("fixdesk.auth_policy.authenticate")
    def test_uses_django_authentication_backend(self, authenticate_mock: Mock) -> None:
        authenticate_mock.return_value = self.superuser

        authenticated_user = authenticate_local_superuser(
            self.request,
            "local-admin",
            "correct-password",
        )

        authenticate_mock.assert_called_once_with(
            self.request,
            username="local-admin",
            password="correct-password",
        )
        self.assertEqual(authenticated_user, self.superuser)

    @patch("fixdesk.auth_policy.authenticate")
    def test_does_not_log_credentials_or_user_details(
        self,
        authenticate_mock: Mock,
    ) -> None:
        authenticate_mock.return_value = None

        with self.assertNoLogs("fixdesk.auth_policy", level="DEBUG"):
            authenticated_user = authenticate_local_superuser(
                self.request,
                "local-admin",
                "correct-password",
            )

        self.assertIsNone(authenticated_user)
