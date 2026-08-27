"""
Tests for management command create_fiscal_group and group creation logic.
"""

import importlib
from io import StringIO
from django.test import TestCase
from django.core.management import call_command
from django.contrib.auth.models import Group

migration_module = importlib.import_module(
    "helpdesk.migrations.0002_create_fiscal_technician_group"
)
create_fiscal_group = migration_module.create_fiscal_group
remove_fiscal_group = migration_module.remove_fiscal_group
GROUP_NAME = migration_module.GROUP_NAME


class MockApps:
    """Mock apps container for testing data migration functions."""

    def get_model(self, app_label: str, model_name: str):
        if app_label == "auth" and model_name == "Group":
            return Group
        raise ValueError(f"Unknown model {app_label}.{model_name}")


class CreateFiscalGroupCommandTests(TestCase):
    def setUp(self) -> None:
        Group.objects.filter(name=GROUP_NAME).delete()

    def test_command_creates_group_when_not_exists(self) -> None:
        out = StringIO()
        call_command("create_fiscal_group", stdout=out)
        self.assertTrue(Group.objects.filter(name=GROUP_NAME).exists())
        self.assertIn("criado com sucesso", out.getvalue())

    def test_command_is_idempotent_when_group_already_exists(self) -> None:
        Group.objects.create(name=GROUP_NAME)
        out = StringIO()
        call_command("create_fiscal_group", stdout=out)
        self.assertEqual(Group.objects.filter(name=GROUP_NAME).count(), 1)
        self.assertIn("já existe", out.getvalue())

    def test_migration_functions_create_and_remove(self) -> None:
        mock_apps = MockApps()
        create_fiscal_group(mock_apps, None)
        self.assertTrue(Group.objects.filter(name=GROUP_NAME).exists())

        # Second run for idempotency check
        create_fiscal_group(mock_apps, None)
        self.assertEqual(Group.objects.filter(name=GROUP_NAME).count(), 1)

        # Rollback check
        remove_fiscal_group(mock_apps, None)
        self.assertFalse(Group.objects.filter(name=GROUP_NAME).exists())
