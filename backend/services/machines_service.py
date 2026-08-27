from logging import getLogger
from services.database_utils import get_database_connection
from typing import Optional


logger = getLogger(__name__)


def get_machine_model(mac_address: str) -> Optional[str]:
    """
    Recupera o modelo de uma máquina a partir do seu endereço MAC.
    
    Esta função consulta o banco de dados para obter o modelo específico de um equipamento
    identificado pelo seu MAC address. É utilizada tanto para renderização de detalhes
    em PDFs quanto para respostas HTTP de consulta de máquinas.
    
    Args:
        mac_address (str): Endereço MAC da máquina no formato XX:XX:XX:XX:XX:XX
        
    Returns:
        Optional[str]: O modelo da máquina se encontrada, None caso contrário
        
    Raises:
        Exception: Se houver erro na conexão com o banco de dados
        
    Example:
        >>> model = get_machine_model('00:11:22:33:44:55')
        >>> print(model)
        'HP EliteDesk 800 G6'
    """
    try:
        with get_database_connection() as connection:
            cursor = connection.cursor()
            query = "SELECT model FROM machines WHERE mac_address = %s;"
            cursor.execute(query, (mac_address,))
            result = cursor.fetchone()
            cursor.close()

            if result is None:
                return None

            return result[0]

    except Exception as e:
        logger.error(f"Erro ao buscar modelo da máquina {mac_address}: {e}")
        raise
