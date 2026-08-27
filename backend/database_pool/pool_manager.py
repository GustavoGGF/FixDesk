import logging
import threading
from typing import Optional, Dict, Any
from django.db import connections, DEFAULT_DB_ALIAS
from django.conf import settings

logger = logging.getLogger(__name__)


class PoolManager:
    _instance = None
    _lock = threading.Lock()
    _pools: Dict[str, Any] = {}

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    @classmethod
    def initialize(cls, db_alias: str = DEFAULT_DB_ALIAS) -> None:
        instance = cls()
        
        if instance._initialized:
            return

        try:
            from dbutils.pooled_db import PooledDB
            
            connection = connections[db_alias]
            conn_settings = connection.get_connection_params()
            
            pool_config = getattr(settings, 'DATABASE_POOL_CONFIG', {})
            max_connections = pool_config.get('MAX_POOL_SIZE', 5)
            min_connections = pool_config.get('MIN_POOL_SIZE', 2)
            max_idle_time = pool_config.get('MAX_IDLE_TIME', 3600)
            max_overflow = pool_config.get('MAX_OVERFLOW', 10)
            
            pool = PooledDB(
                creator=cls._get_mysql_connector(connection),
                mincached=min_connections,
                maxcached=max_connections,
                maxconnections=max_connections + max_overflow,
                blocking=True,
                ping=1,
                **conn_settings
            )
            
            cls._pools[db_alias] = pool
            instance._initialized = True
            
            logger.info(f"Pool Manager inicializado para {db_alias}")
            
        except ImportError:
            logger.error(
                "DBUtils não está instalado. Instale com: pip install DBUtils"
            )
            raise
        except Exception as e:
            logger.error(f"Erro ao inicializar Pool Manager: {str(e)}")
            raise

    @staticmethod
    def _get_mysql_connector(connection):
        if connection.vendor == 'mysql':
            return __import__('MySQLdb').connect
        raise ValueError(f"Database vendor {connection.vendor} não suportado")

    @classmethod
    def get_connection(cls, db_alias: str = DEFAULT_DB_ALIAS):
        if db_alias not in cls._pools:
            cls.initialize(db_alias)
        
        return cls._pools[db_alias].connection()

    @classmethod
    def close_connection(cls, db_alias: str = DEFAULT_DB_ALIAS) -> None:
        if db_alias in cls._pools:
            try:
                connection = connections[db_alias]
                connection.close()
            except Exception as e:
                logger.error(f"Erro ao fechar conexão {db_alias}: {str(e)}")

    @classmethod
    def get_pool_status(cls, db_alias: str = DEFAULT_DB_ALIAS) -> Dict[str, Any]:
        if db_alias not in cls._pools:
            return {'status': 'not_initialized'}
        
        pool = cls._pools[db_alias]
        
        return {
            'status': 'active',
            'db_alias': db_alias,
            'min_cached': getattr(pool, '_mincached', 'unknown'),
            'max_cached': getattr(pool, '_maxcached', 'unknown'),
            'pool_size': getattr(pool, '_pool', 'unknown'),
        }

    @classmethod
    def clear_pool(cls, db_alias: str = DEFAULT_DB_ALIAS) -> None:
        if db_alias in cls._pools:
            try:
                pool = cls._pools[db_alias]
                if hasattr(pool, 'closeall'):
                    pool.closeall()
                elif hasattr(pool, 'close'):
                    pool.close()
                cls._pools.pop(db_alias, None)
                if db_alias == DEFAULT_DB_ALIAS and cls._instance:
                    cls._instance._initialized = False
                logger.info(f"Pool {db_alias} foi limpo")
            except Exception as e:
                logger.error(f"Erro ao limpar pool {db_alias}: {str(e)}")

    @classmethod
    def reset(cls) -> None:
        for db_alias in list(cls._pools.keys()):
            cls.clear_pool(db_alias)
        cls._pools.clear()
        cls._instance._initialized = False
        logger.info("PoolManager foi resetado")
