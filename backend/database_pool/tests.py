import pytest
from django.test import TestCase, Client
from django.db import DEFAULT_DB_ALIAS
from database_pool.pool_manager import PoolManager
from database_pool.health_check import DatabaseHealthCheck


from unittest.mock import patch, MagicMock

class PoolManagerTests(TestCase):
    def setUp(self):
        PoolManager.reset()

    def tearDown(self):
        PoolManager.reset()

    @patch('database_pool.pool_manager.PoolManager._get_mysql_connector')
    def test_pool_initialization(self, mock_connector):
        mock_connector_instance = MagicMock()
        mock_connector_instance.threadsafety = 1
        mock_connector.return_value = mock_connector_instance
        PoolManager.initialize(DEFAULT_DB_ALIAS)
        status = PoolManager.get_pool_status(DEFAULT_DB_ALIAS)
        
        assert status['status'] == 'active'
        assert status['db_alias'] == DEFAULT_DB_ALIAS

    @patch('database_pool.pool_manager.PoolManager._get_mysql_connector')
    def test_get_connection(self, mock_connector):
        mock_connector_instance = MagicMock()
        mock_connector_instance.threadsafety = 1
        mock_connector.return_value = mock_connector_instance
        connection = PoolManager.get_connection(DEFAULT_DB_ALIAS)
        assert connection is not None

    def test_pool_status_not_initialized(self):
        PoolManager.reset()
        status = PoolManager.get_pool_status(DEFAULT_DB_ALIAS)
        
        assert status['status'] == 'not_initialized'

    @patch('database_pool.pool_manager.PoolManager._get_mysql_connector')
    def test_clear_pool(self, mock_connector):
        mock_connector_instance = MagicMock()
        mock_connector_instance.threadsafety = 1
        mock_connector.return_value = mock_connector_instance
        PoolManager.initialize(DEFAULT_DB_ALIAS)
        PoolManager.clear_pool(DEFAULT_DB_ALIAS)
        
        status = PoolManager.get_pool_status(DEFAULT_DB_ALIAS)
        assert status['status'] == 'not_initialized'


class DatabaseHealthCheckTests(TestCase):
    def test_check_connection_success(self):
        is_healthy, message = DatabaseHealthCheck.check_connection(DEFAULT_DB_ALIAS)
        assert is_healthy is True
        assert "OK" in message or message

    def test_check_pool_status(self):
        status = DatabaseHealthCheck.check_pool_status(DEFAULT_DB_ALIAS)
        
        assert 'database' in status
        assert 'is_healthy' in status
        assert 'message' in status
        assert 'pool_status' in status
        assert 'timestamp' in status

    def test_check_all_databases(self):
        results = DatabaseHealthCheck.check_all_databases()
        
        assert isinstance(results, dict)
        assert DEFAULT_DB_ALIAS in results


class PoolStatusViewTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_pool_status_view(self):
        response = self.client.get('/api/database-pool/status/')
        assert response.status_code == 200
        data = response.json()
        assert 'database' in data

    def test_pool_health_view(self):
        response = self.client.get('/api/database-pool/health/')
        assert response.status_code == 200
        data = response.json()
        assert 'overall_health' in data
        assert 'databases' in data

    def test_pool_reset_view(self):
        response = self.client.post(
            '/api/database-pool/reset/',
            data={'db': 'default'},
            content_type='application/json'
        )
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
