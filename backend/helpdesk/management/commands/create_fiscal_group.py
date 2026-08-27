"""
Management command to create the Django group Helpdesk_Technician_Fiscal.
"""

from typing import Any
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group

GROUP_NAME: str = "Helpdesk_Technician_Fiscal"


class Command(BaseCommand):
    help: str = "Creates the Django group Helpdesk_Technician_Fiscal idempotently."

    def handle(self, *args: Any, **options: Any) -> None:
        """
        Executes the command to ensure the Helpdesk_Technician_Fiscal group exists.
        """
        group, created = Group.objects.get_or_create(name=GROUP_NAME)
        if created:
            self.stdout.write(
                self.style.SUCCESS(f"✓ Grupo '{GROUP_NAME}' criado com sucesso.")
            )
        else:
            self.stdout.write(
                self.style.WARNING(f"✓ Grupo '{GROUP_NAME}' já existe.")
            )
