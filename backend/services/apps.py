from django.apps import AppConfig
import sys

class ServicesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'services'

    def ready(self):
        # Do not start the background thread during test runs
        if 'test' in sys.argv or 'pytest' in sys.modules:
            return

        from services.thread_manager import ThreadManager
        from services.email_sender import send_pending_emails

        if not hasattr(self, 'thread_started'):
            self.thread_started = True
            email_thread = ThreadManager(target=send_pending_emails, interval_seconds=10800)
            email_thread.start()

