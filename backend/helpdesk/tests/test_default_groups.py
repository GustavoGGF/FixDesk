from django.contrib.auth.models import Group
from django.test import TestCase

from helpdesk.apps import ensure_default_groups


class DefaultGroupsTests(TestCase):
    def test_creates_default_user_group_when_missing(self) -> None:
        Group.objects.filter(name="Helpdesk_User").delete()

        ensure_default_groups(sender=None)

        self.assertTrue(Group.objects.filter(name="Helpdesk_User").exists())

    def test_does_not_duplicate_default_user_group(self) -> None:
        Group.objects.get_or_create(name="Helpdesk_User")

        ensure_default_groups(sender=None)

        self.assertEqual(Group.objects.filter(name="Helpdesk_User").count(), 1)
