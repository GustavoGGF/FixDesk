from os import getenv

from django.apps import AppConfig
from django.db import OperationalError, ProgrammingError
from django.db.models.signals import post_migrate
from django.dispatch import receiver


DEFAULT_USER_GROUP = "Helpdesk_User"


def ensure_default_groups(sender: object, **kwargs: object) -> None:
    from django.contrib.auth.models import Group

    configured_group = getenv("DJANGO_GROUP_USER", DEFAULT_USER_GROUP).strip()
    group_name = configured_group or DEFAULT_USER_GROUP
    Group.objects.get_or_create(name=group_name)


@receiver(post_migrate, dispatch_uid="helpdesk.ensure_default_groups")
def ensure_default_groups_after_migrate(sender: object, **kwargs: object) -> None:
    ensure_default_groups(sender, **kwargs)


class HelpdeskConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "helpdesk"

    def ready(self) -> None:
        try:
            ensure_default_groups(self)
        except (OperationalError, ProgrammingError):
            pass
