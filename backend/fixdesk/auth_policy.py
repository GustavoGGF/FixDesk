from os import getenv
from typing import Final
from django.conf import settings
from django.contrib.auth.models import User

AUTH_MODE_LDAP: Final[str] = "ldap"
AUTH_MODE_LDAP_OR_LOCAL_SUPERUSER: Final[str] = "ldap_or_local_superuser"
AUTH_MODE_DJANGO_SUPERUSER: Final[str] = "django_superuser"

VALID_AUTH_MODES: Final[tuple[str, ...]] = (
    AUTH_MODE_LDAP,
    AUTH_MODE_LDAP_OR_LOCAL_SUPERUSER,
    AUTH_MODE_DJANGO_SUPERUSER,
)

DEFAULT_AUTH_MODE: Final[str] = AUTH_MODE_LDAP
DEFAULT_ALLOW_LOCAL_SUPERUSER_LOGIN: Final[bool] = False

_TRUTHY_VALUES: Final[set[str]] = {"true", "1", "t", "yes"}


def _parse_bool(value: object) -> bool:
    """
    Converte com segurança diferentes representações de booleanos.

    :param value: Objeto a ser convertido.
    :return: True para valores truthy aceitos, False caso contrário.
    """
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in _TRUTHY_VALUES
    if isinstance(value, (int, float)):
        return value == 1
    return False


def get_authentication_mode() -> str:
    """
    Obtém o modo de autenticação configurado na aplicação.
    Prioriza django.conf.settings e faz fallback para variáveis de ambiente (AUTHENTICATION_MODE).
    Se não configurado ou inválido, retorna com segurança o modo padrão ('ldap').

    :return: Modo de autenticação validado ('ldap', 'ldap_or_local_superuser' ou 'django_superuser').
    """
    raw_mode: object = getattr(settings, "AUTHENTICATION_MODE", None)
    if raw_mode is None:
        raw_mode = getenv("AUTHENTICATION_MODE")

    if isinstance(raw_mode, str):
        normalized = raw_mode.strip().lower()
        if normalized in VALID_AUTH_MODES:
            return normalized

    return DEFAULT_AUTH_MODE


def is_local_superuser_login_allowed() -> bool:
    """
    Verifica se a autenticação local para superusuários está explicitamente habilitada.
    Prioriza django.conf.settings e faz fallback para variáveis de ambiente (ALLOW_LOCAL_SUPERUSER_LOGIN).
    O valor padrão é False.

    :return: True se explicitamente permitido, False caso contrário.
    """
    raw_value: object = getattr(settings, "ALLOW_LOCAL_SUPERUSER_LOGIN", None)
    if raw_value is None:
        raw_value = getenv("ALLOW_LOCAL_SUPERUSER_LOGIN")

    if raw_value is None:
        return DEFAULT_ALLOW_LOCAL_SUPERUSER_LOGIN

    return _parse_bool(raw_value)


def should_try_ldap(mode: str | None = None) -> bool:
    """
    Determina se a tentativa de autenticação via LDAP deve ser executada.

    :param mode: Modo de autenticação opcional. Se não informado, consulta get_authentication_mode().
    :return: True para modos que utilizam LDAP ('ldap' e 'ldap_or_local_superuser'), False para 'django_superuser'.
    """
    effective_mode = mode if mode is not None else get_authentication_mode()
    if effective_mode == AUTH_MODE_DJANGO_SUPERUSER:
        return False
    return True


def should_try_local_fallback(
    mode: str | None = None,
    allow_local: bool | None = None,
) -> bool:
    """
    Determina se a autenticação local de superusuário deve ser tentada.
    Requer que a configuração ALLOW_LOCAL_SUPERUSER_LOGIN esteja explicitamente ativada
    e que o modo de autenticação seja compatível ('ldap_or_local_superuser' ou 'django_superuser').

    :param mode: Modo de autenticação opcional.
    :param allow_local: Flag de permissão opcional.
    :return: True se a autenticação local for permitida, False caso contrário.
    """
    effective_mode = mode if mode is not None else get_authentication_mode()
    effective_allow_local = (
        allow_local if allow_local is not None else is_local_superuser_login_allowed()
    )

    if not effective_allow_local:
        return False

    if effective_mode in (
        AUTH_MODE_LDAP_OR_LOCAL_SUPERUSER,
        AUTH_MODE_DJANGO_SUPERUSER,
    ):
        return True

    return False


def is_user_eligible_for_local_auth(user: object) -> bool:
    """
    Verifica se um usuário específico é elegível para autenticação local.
    Apenas instâncias de User ativas e com flag is_superuser=True são elegíveis.
    Usuários comuns (is_superuser=False), inativos ou anônimos são sempre rejeitados.

    :param user: Objeto do usuário a validar.
    :return: True se for superusuário ativo, False em qualquer outro caso.
    """
    if not isinstance(user, User):
        return False

    if not user.is_active:
        return False

    if not user.is_superuser:
        return False

    return True
