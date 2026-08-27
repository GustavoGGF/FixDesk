import pytest
from unittest.mock import patch, MagicMock, mock_open
from contextlib import contextmanager

pytestmark = pytest.mark.django_db

from django.test import TestCase
from services.machines_service import get_machine_model


class GetMachineModelTests(TestCase):

    @patch('services.machines_service.get_database_connection')
    def test_get_machine_model_success(self, mock_get_connection):
        """Test getting machine model successfully"""
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = ('HP EliteDesk 800 G6',)
        
        mock_connection = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        
        mock_get_connection.return_value.__enter__.return_value = mock_connection
        mock_get_connection.return_value.__exit__.return_value = None

        result = get_machine_model('00:11:22:33:44:55')

        self.assertEqual(result, 'HP EliteDesk 800 G6')
        mock_cursor.execute.assert_called_once_with(
            'SELECT model FROM machines WHERE mac_address = %s;',
            ('00:11:22:33:44:55',)
        )
        mock_cursor.close.assert_called_once()

    @patch('services.machines_service.get_database_connection')
    def test_get_machine_model_not_found(self, mock_get_connection):
        """Test when machine model is not found"""
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        
        mock_connection = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        
        mock_get_connection.return_value.__enter__.return_value = mock_connection
        mock_get_connection.return_value.__exit__.return_value = None

        result = get_machine_model('FF:FF:FF:FF:FF:FF')

        self.assertIsNone(result)

    @patch('services.machines_service.get_database_connection')
    def test_get_machine_model_database_error(self, mock_get_connection):
        """Test handling of database connection error"""
        mock_get_connection.return_value.__enter__.side_effect = Exception('Connection failed')

        with self.assertRaises(Exception):
            get_machine_model('00:11:22:33:44:55')

    @patch('services.machines_service.get_database_connection')
    def test_get_machine_model_with_empty_mac(self, mock_get_connection):
        """Test with empty MAC address"""
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        
        mock_connection = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        
        mock_get_connection.return_value.__enter__.return_value = mock_connection
        mock_get_connection.return_value.__exit__.return_value = None

        result = get_machine_model('')

        self.assertIsNone(result)
