from typing import Dict, Any

DEFAULT_POOL_CONFIG: Dict[str, Any] = {
    'ENABLED': True,
    'MIN_POOL_SIZE': 2,
    'MAX_POOL_SIZE': 5,
    'MAX_OVERFLOW': 10,
    'MAX_IDLE_TIME': 3600,
    'POOL_RECYCLE': 3600,
    'POOL_PRE_PING': True,
    'ECHO': False,
    'MONITORED_DATABASES': ['default'],
    'HEALTH_CHECK_INTERVAL': 300,
}

def get_pool_config(custom_config: Dict[str, Any] = None) -> Dict[str, Any]:
    config = DEFAULT_POOL_CONFIG.copy()
    
    if custom_config:
        config.update(custom_config)
    
    return config
