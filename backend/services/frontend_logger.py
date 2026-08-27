import logging

logger = logging.getLogger('frontend_erros')


def log_frontend_error(url: str, message: str, stack: str) -> None:
    """
    Registra no log do servidor um erro ocorrido no frontend da aplicação.

    Esta função centraliza os erros capturados no frontend e reportados via HTTP,
    enviando os detalhes estruturados ao sistema de logging do Django.

    Args:
        url (str): URL da página onde o erro ocorreu.
        message (str): A mensagem descritiva do erro.
        stack (str): O stack trace do erro para depuração.
    """
    logger.error(
        "Falha reportada pelo Frontend | URL: %s | Mensagem: %s | Stack: %s",
        url,
        message,
        stack
    )
