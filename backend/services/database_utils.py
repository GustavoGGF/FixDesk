from contextlib import contextmanager
from typing import Any, Generator
from logging import getLogger
from decouple import config
import mysql.connector


logger = getLogger(__name__)


@contextmanager
def get_database_connection() -> Generator[Any, None, None]:
    """
    Context manager para estabelecer e gerenciar conexões com o banco de dados MySQL.
    Garante que a conexão seja fechada mesmo em caso de exceção.
    
    Yields:
        mysql.connector.connection.MySQLConnection: Conexão ativa com o banco de dados
        
    Raises:
        Exception: Se houver erro ao conectar ao banco de dados
    """
    conn: Any = None

    try:
        conn = mysql.connector.connect(
            host=str(config("DB_HOST")),
            database=str(config("DB_NAME")),
            user=str(config("DB_USER")),
            password=str(config("DB_PASSWORD")),
        )
        yield conn

    except Exception as err:
        logger.error(f"Erro na conexão com o banco de dados: {err}")
        raise

    finally:
        if conn is not None and getattr(conn, "is_connected", lambda: False)():
            conn.close()
