class AuthenticationError(Exception):
    """Exceção levantada quando as credenciais do LDAP são inválidas."""
    pass


class LDAPServerError(AuthenticationError):
    """Exceção levantada quando um servidor LDAP não pode concluir a operação."""

    pass
