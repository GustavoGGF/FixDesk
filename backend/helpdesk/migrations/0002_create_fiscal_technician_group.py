"""
Data migration to idempotently create the Django group Helpdesk_Technician_Fiscal.
"""

from typing import Any
from django.db import migrations

GROUP_NAME: str = "Helpdesk_Technician_Fiscal"


def create_fiscal_group(apps: Any, schema_editor: Any) -> None:
    """
    Creates the Helpdesk_Technician_Fiscal group if it does not exist.
    """
    Group = apps.get_model("auth", "Group")
    Group.objects.get_or_create(name=GROUP_NAME)


def remove_fiscal_group(apps: Any, schema_editor: Any) -> None:
    """
    Removes the Helpdesk_Technician_Fiscal group upon rollback.
    """
    Group = apps.get_model("auth", "Group")
    Group.objects.filter(name=GROUP_NAME).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("helpdesk", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_fiscal_group, remove_fiscal_group),
    ]
