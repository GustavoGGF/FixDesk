from django.contrib.auth.models import Group, User
from django.test import TestCase

from fixdesk.views import build_local_superuser_data


class LocalSuperuserDataTests(TestCase):
    def test_builds_frontend_data_from_django_user(self) -> None:
        """
        Input: superusuário com nome, e-mail e dois grupos Django.
        Expect: contrato de dados compatível com o login LDAP.
        Result: verificado via assert.
        """
        user = User.objects.create_superuser(
            username="local-admin",
            password="correct-password",
            first_name="Local",
            last_name="Admin",
            email="admin@example.com",
        )
        user.groups.add(Group.objects.get_or_create(name="Helpdesk_User")[0])
        user.groups.add(Group.objects.get_or_create(name="Custom_Admin")[0])

        result = build_local_superuser_data(user)
        expected = {
            "name": "Local Admin",
            "departament": "",
            "job_title": "",
            "mail": "admin@example.com",
            "company": "",
            "helpdesk": "",
            "roles": ["Local Superuser"],
            "groups": ["Custom_Admin", "Helpdesk_User"],
        }

        self.assertEqual(result, expected, f"Input={user!r}; Expected={expected!r}; Got={result!r}")

    def test_returns_empty_strings_when_optional_user_data_is_missing(self) -> None:
        """
        Input: superusuário sem nome e sem e-mail.
        Expect: campos ausentes como string vazia, sem exceção.
        Result: verificado via assert.
        """
        user = User.objects.create_superuser(
            username="local-admin",
            password="correct-password",
        )

        result = build_local_superuser_data(user)

        self.assertEqual(result["name"], "", f"Input={user!r}; Got={result!r}")
        self.assertEqual(result["mail"], "", f"Input={user!r}; Got={result!r}")
        self.assertEqual(result["departament"], "", f"Input={user!r}; Got={result!r}")
        self.assertEqual(result["job_title"], "", f"Input={user!r}; Got={result!r}")
        self.assertEqual(result["company"], "", f"Input={user!r}; Got={result!r}")
        self.assertEqual(result["helpdesk"], "", f"Input={user!r}; Got={result!r}")
        self.assertEqual(result["roles"], ["Local Superuser"], f"Input={user!r}; Got={result!r}")
        self.assertEqual(result["groups"], [], f"Input={user!r}; Got={result!r}")
