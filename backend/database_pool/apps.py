from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class DatabasePoolConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'database_pool'
    verbose_name = 'Database Connection Pool Manager'

    def ready(self):
        from django.db import DEFAULT_DB_ALIAS, connections
        from django.conf import settings
        
        try:
            from database_pool.pool_manager import PoolManager
            
            pool_config = getattr(settings, 'DATABASE_POOL_CONFIG', {})
            if pool_config.get('ENABLED', True):
                PoolManager.initialize(DEFAULT_DB_ALIAS)
                logger.info(
                    f"✓ Database Connection Pool inicializado "
                    f"(Max: {pool_config.get('MAX_POOL_SIZE', 5)}, "
                    f"Min: {pool_config.get('MIN_POOL_SIZE', 2)})"
                )
        except Exception as e:
            logger.warning(f"Database Pool não configurado: {str(e)}")
