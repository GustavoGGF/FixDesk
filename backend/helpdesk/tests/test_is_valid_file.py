import pytest
from django.test import SimpleTestCase
from unittest.mock import patch
from django.core.files.uploadedfile import SimpleUploadedFile

from helpdesk.views import is_valid_file

class IsValidFileTests(SimpleTestCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Mock EmailSender or ThreadManager here does not stop the thread because it's started in apps.py
        # But we can patch thread manager from where it runs.

    @patch('helpdesk.views.types_str', '[image/jpeg, image/png, application/pdf]')
    def test_valid_file_type_string_match(self):
        """Test exact string match of file_type to VALID_TYPES."""
        file = SimpleUploadedFile("test.jpg", b"file_content")
        self.assertTrue(is_valid_file(file, "image/jpeg"))

    @patch('helpdesk.views.types_str', '[image/jpeg, image/png, application/pdf]')
    def test_valid_file_type_string_mismatch_but_mimetype_match(self):
        """Test exact string mismatch, but mimetypes.guess_type matches allowed."""
        file = SimpleUploadedFile("test.pdf", b"file_content")
        self.assertTrue(is_valid_file(file, "application/octet-stream"))

    @patch('helpdesk.views.types_str', '[image/jpeg, image/png, application/pdf]')
    def test_invalid_file(self):
        """Test invalid files where neither file_type nor mimetype match."""
        file = SimpleUploadedFile("test.txt", b"file_content")
        self.assertFalse(is_valid_file(file, "text/plain"))

    @patch('helpdesk.views.types_str', None)
    def test_no_valid_types_defined(self):
        """Test scenario where VALID_TYPES environment variable is not defined."""
        file = SimpleUploadedFile("test.jpg", b"file_content")
        self.assertFalse(is_valid_file(file, "image/jpeg"))

    @patch('helpdesk.views.types_str', '[image/jpeg, image/png, application/pdf]')
    def test_exception_handling(self):
        """Test scenario where an exception is raised inside the function."""
        # Passing None as file_type will raise a TypeError in re.split
        file = SimpleUploadedFile("test.jpg", b"file_content")
        self.assertFalse(is_valid_file(file, None))
