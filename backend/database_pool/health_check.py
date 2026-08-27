import logging
import time
from typing import Dict, Tuple
from django.db import connections, DEFAULT_DB_ALIAS
from django.conf import settings

logger = logging.getLogger(__name__)


class DatabaseHealthCheck:
    @staticmethod
    def check_connection(db_alias: str = DEFAULT_DB_ALIAS) -> Tuple[bool, str]:
        try:
            connection = connections[db_alias]
            
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            
            return True, "Conexão OK"
        except Exception as e:
            return False, str(e)

    @staticmethod
    def check_pool_status(db_alias: str = DEFAULT_DB_ALIAS) -> Dict[str, any]:
        from database_pool.pool_manager import PoolManager
        
        is_healthy, message = DatabaseHealthCheck.check_connection(db_alias)
        pool_status = PoolManager.get_pool_status(db_alias)
        
        return {
            'database': db_alias,
            'is_healthy': is_healthy,
            'message': message,
            'pool_status': pool_status,
            'timestamp': time.time(),
        }

    @staticmethod
    def check_all_databases() -> Dict[str, Dict]:
        pool_config = getattr(settings, 'DATABASE_POOL_CONFIG', {})
        monitored_dbs = pool_config.get('MONITORED_DATABASES', [DEFAULT_DB_ALIAS])
        
        results = {}
        for db_alias in monitored_dbs:
            results[db_alias] = DatabaseHealthCheck.check_pool_status(db_alias)
        
        return results

    @staticmethod
    def log_pool_metrics() -> None:
        try:
            all_status = DatabaseHealthCheck.check_all_databases()
            
            for db_alias, status in all_status.items():
                health_str = "✓ HEALTHY" if status['is_healthy'] else "✗ UNHEALTHY"
                logger.info(
                    f"Pool Metrics [{db_alias}] {health_str} - "
                    f"Status: {status['pool_status']}"
                )
        except Exception as e:
            logger.error(f"Erro ao registrar métricas do pool: {str(e)}")
