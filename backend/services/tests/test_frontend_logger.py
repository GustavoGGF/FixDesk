from unittest.mock import patch
from services.frontend_logger import log_frontend_error


@patch("services.frontend_logger.logger")
def test_log_frontend_error(mock_logger):
    """
    Input:  url="http://localhost/login", message="Click failed", stack="at login.jsx:10"
    Expect: logger.error called with the formatted message
    Result: verified via assert
    """
    # Arrange
    url = "http://localhost/login"
    message = "Click failed"
    stack = "at login.jsx:10"

    # Act
    log_frontend_error(url, message, stack)

    # Assert
    mock_logger.error.assert_called_once_with(
        "Falha reportada pelo Frontend | URL: %s | Mensagem: %s | Stack: %s",
        url,
        message,
        stack
    )
