from django.contrib.auth.models import Group, User
from django.test import TestCase


class FirstViewAuthenticationTests(TestCase):
    def test_anonymous_user_is_redirected_to_login(self) -> None:
        """
        Input: GET /helpdesk/ without a Django session.
        Expect: HTTP 302 redirect to /login.
        """
        response = self.client.get("/helpdesk/")

        self.assertEqual(response.status_code, 302)
        self.assertTrue(
            response["Location"].startswith("/login"),
            f"Redirecionamento inesperado: {response['Location']!r}",
        )

    def test_authorized_user_receives_helpdesk_application(self) -> None:
        """
        Input: authenticated user belonging to Helpdesk_User.
        Expect: HTTP 200 with the SPA entrypoint.
        """
        user = User.objects.create_user(username="helpdesk-user", password="secret")
        group, _ = Group.objects.get_or_create(name="Helpdesk_User")
        user.groups.add(group)
        self.client.force_login(user)

        response = self.client.get("/helpdesk/")

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "<div id=\"root\"></div>")

    def test_authenticated_user_without_helpdesk_group_is_redirected(self) -> None:
        """
        Input: authenticated user without an authorized Helpdesk group.
        Expect: HTTP 302 redirect to /login.
        """
        user = User.objects.create_user(username="unauthorized-user", password="secret")
        self.client.force_login(user)

        response = self.client.get("/helpdesk/")

        self.assertEqual(response.status_code, 302)
        self.assertTrue(
            response["Location"].startswith("/login"),
            f"Redirecionamento inesperado: {response['Location']!r}",
        )
