import pytest
from unittest.mock import patch
from django.contrib.auth.models import AnonymousUser, User
from django.test import SimpleTestCase, override_settings

from fixdesk.auth_policy import (
    AUTH_MODE_DJANGO_SUPERUSER,
    AUTH_MODE_LDAP,
    AUTH_MODE_LDAP_OR_LOCAL_SUPERUSER,
    VALID_AUTH_MODES,
    get_authentication_mode,
    is_local_superuser_login_allowed,
    is_user_eligible_for_local_auth,
    should_try_ldap,
    should_try_local_fallback,
)


class AuthenticationPolicyTests(SimpleTestCase):
    """
    Suíte de testes da política de autenticação (Etapa 1 do Plano de Autenticação de Superusuário).
    """

    def test_constants_definitions(self) -> None:
        """
        Input:  Constantes do módulo auth_policy
        Expect: Valores esperados conforme especificação do plano
        Result: Verificado via assert
        """
        self.assertEqual(AUTH_MODE_LDAP, "ldap")
        self.assertEqual(AUTH_MODE_LDAP_OR_LOCAL_SUPERUSER, "ldap_or_local_superuser")
        self.assertEqual(AUTH_MODE_DJANGO_SUPERUSER, "django_superuser")
        self.assertIn(AUTH_MODE_LDAP, VALID_AUTH_MODES)
        self.assertIn(AUTH_MODE_LDAP_OR_LOCAL_SUPERUSER, VALID_AUTH_MODES)
        self.assertIn(AUTH_MODE_DJANGO_SUPERUSER, VALID_AUTH_MODES)

    def test_default_authentication_mode_is_ldap_when_unconfigured(self) -> None:
        """
        Input:  Configurações sem AUTHENTICATION_MODE definido
        Expect: Modo padrão 'ldap'
        Result: Verificado via assert
        """
        with override_settings(AUTHENTICATION_MODE=None):
            with patch.dict("os.environ", {}, clear=True):
                mode = get_authentication_mode()
                self.assertEqual(
                    mode,
                    AUTH_MODE_LDAP,
                    f"\n📥 Input:    AUTHENTICATION_MODE=None"
                    f"\n✅ Expected: {AUTH_MODE_LDAP!r}"
                    f"\n❌ Got:      {mode!r}",
                )

    def test_authentication_mode_respects_valid_configurations(self) -> None:
        """
        Input:  Valores válidos em settings/env ('ldap', 'ldap_or_local_superuser', 'django_superuser')
        Expect: Retorno correspondente normalizado
        Result: Verificado via assert
        """
        test_cases: list[tuple[str, str]] = [
            ("ldap", AUTH_MODE_LDAP),
            ("LDAP", AUTH_MODE_LDAP),
            ("ldap_or_local_superuser", AUTH_MODE_LDAP_OR_LOCAL_SUPERUSER),
            ("  LDAP_OR_LOCAL_SUPERUSER  ", AUTH_MODE_LDAP_OR_LOCAL_SUPERUSER),
            ("django_superuser", AUTH_MODE_DJANGO_SUPERUSER),
            ("DJANGO_SUPERUSER", AUTH_MODE_DJANGO_SUPERUSER),
        ]

        for configured_value, expected_mode in test_cases:
            with self.subTest(configured_value=configured_value):
                with override_settings(AUTHENTICATION_MODE=configured_value):
                    mode = get_authentication_mode()
                    self.assertEqual(
                        mode,
                        expected_mode,
                        f"\n📥 Input:    AUTHENTICATION_MODE={configured_value!r}"
                        f"\n✅ Expected: {expected_mode!r}"
                        f"\n❌ Got:      {mode!r}",
                    )

    def test_invalid_authentication_mode_falls_back_to_ldap_safely(self) -> None:
        """
        Input:  Valores inválidos ou desconhecidos ('unknown', '', '123')
        Expect: Fallback seguro para 'ldap'
        Result: Verificado via assert
        """
        invalid_values: list[str | None] = [
            "unknown_mode",
            "insecure_mode",
            "",
            "   ",
            "none",
        ]

        for invalid_value in invalid_values:
            with self.subTest(invalid_value=invalid_value):
                with override_settings(AUTHENTICATION_MODE=invalid_value):
                    mode = get_authentication_mode()
                    self.assertEqual(
                        mode,
                        AUTH_MODE_LDAP,
                        f"\n📥 Input:    AUTHENTICATION_MODE={invalid_value!r}"
                        f"\n✅ Expected: {AUTH_MODE_LDAP!r}"
                        f"\n❌ Got:      {mode!r}",
                    )

    def test_allow_local_superuser_login_defaults_to_false(self) -> None:
        """
        Input:  Configurações sem ALLOW_LOCAL_SUPERUSER_LOGIN definido
        Expect: False (desabilitado por padrão)
        Result: Verificado via assert
        """
        with override_settings(ALLOW_LOCAL_SUPERUSER_LOGIN=None):
            with patch.dict("os.environ", {}, clear=True):
                allowed = is_local_superuser_login_allowed()
                self.assertFalse(
                    allowed,
                    f"\n📥 Input:    ALLOW_LOCAL_SUPERUSER_LOGIN=None"
                    f"\n✅ Expected: False"
                    f"\n❌ Got:      {allowed!r}",
                )

    def test_allow_local_superuser_login_respects_explicit_values(self) -> None:
        """
        Input:  Valores booleanos e strings variadas para ALLOW_LOCAL_SUPERUSER_LOGIN
        Expect: Booleano correspondente
        Result: Verificado via assert
        """
        truthy_cases: list[object] = [True, "true", "True", "TRUE", "1", "t", "yes"]
        falsy_cases: list[object] = [False, "false", "False", "FALSE", "0", "f", "no", "other", ""]

        for val in truthy_cases:
            with self.subTest(truthy_val=val):
                with override_settings(ALLOW_LOCAL_SUPERUSER_LOGIN=val):
                    self.assertTrue(
                        is_local_superuser_login_allowed(),
                        f"\n📥 Input:    ALLOW_LOCAL_SUPERUSER_LOGIN={val!r}"
                        f"\n✅ Expected: True"
                        f"\n❌ Got:      False",
                    )

        for val in falsy_cases:
            with self.subTest(falsy_val=val):
                with override_settings(ALLOW_LOCAL_SUPERUSER_LOGIN=val):
                    self.assertFalse(
                        is_local_superuser_login_allowed(),
                        f"\n📥 Input:    ALLOW_LOCAL_SUPERUSER_LOGIN={val!r}"
                        f"\n✅ Expected: False"
                        f"\n❌ Got:      True",
                    )

    def test_should_try_ldap_decision_matrix(self) -> None:
        """
        Input:  Diferentes modos de autenticação
        Expect: True para ldap e ldap_or_local_superuser, False para django_superuser
        Result: Verificado via assert
        """
        matrix: list[tuple[str, bool]] = [
            (AUTH_MODE_LDAP, True),
            (AUTH_MODE_LDAP_OR_LOCAL_SUPERUSER, True),
            (AUTH_MODE_DJANGO_SUPERUSER, False),
        ]

        for mode, expected in matrix:
            with self.subTest(mode=mode):
                with override_settings(AUTHENTICATION_MODE=mode):
                    result = should_try_ldap()
                    self.assertEqual(
                        result,
                        expected,
                        f"\n📥 Input:    mode={mode!r}"
                        f"\n✅ Expected: {expected!r}"
                        f"\n❌ Got:      {result!r}",
                    )

    def test_should_try_local_fallback_requires_explicit_setting(self) -> None:
        """
        Input:  Combinações de AUTHENTICATION_MODE e ALLOW_LOCAL_SUPERUSER_LOGIN
        Expect: Fallback permitido apenas quando explicitamente habilitado nos modos compatíveis
        Result: Verificado via assert
        """
        scenarios: list[tuple[str, bool, bool]] = [
            # (modo, allow_local_superuser, resultado_esperado)
            (AUTH_MODE_LDAP, False, False),
            (AUTH_MODE_LDAP, True, False),  # Modo LDAP puro nunca executa fallback local
            (AUTH_MODE_LDAP_OR_LOCAL_SUPERUSER, False, False),  # Desabilitado por padrão
            (AUTH_MODE_LDAP_OR_LOCAL_SUPERUSER, True, True),  # Habilitado explicitamente
            (AUTH_MODE_DJANGO_SUPERUSER, False, False),  # Trava de segurança ativa
            (AUTH_MODE_DJANGO_SUPERUSER, True, True),  # Habilitado
        ]

        for mode, allow_local, expected in scenarios:
            with self.subTest(mode=mode, allow_local=allow_local):
                with override_settings(
                    AUTHENTICATION_MODE=mode,
                    ALLOW_LOCAL_SUPERUSER_LOGIN=allow_local,
                ):
                    result = should_try_local_fallback()
                    self.assertEqual(
                        result,
                        expected,
                        f"\n📥 Input:    mode={mode!r}, allow_local={allow_local!r}"
                        f"\n✅ Expected: {expected!r}"
                        f"\n❌ Got:      {result!r}",
                    )

    def test_regular_users_are_never_eligible_for_local_auth(self) -> None:
        """
        Input:  Usuário comum do Django (is_superuser=False)
        Expect: False (usuários comuns nunca podem usar autenticação local)
        Result: Verificado via assert
        """
        regular_user = User(username="regular_john", is_superuser=False, is_active=True)
        result = is_user_eligible_for_local_auth(regular_user)
        self.assertFalse(
            result,
            f"\n📥 Input:    user=User(is_superuser=False, is_active=True)"
            f"\n✅ Expected: False"
            f"\n❌ Got:      {result!r}",
        )

    def test_active_superuser_is_eligible_for_local_auth(self) -> None:
        """
        Input:  Superusuário ativo do Django (is_superuser=True, is_active=True)
        Expect: True
        Result: Verificado via assert
        """
        superuser = User(username="admin_jane", is_superuser=True, is_active=True)
        result = is_user_eligible_for_local_auth(superuser)
        self.assertTrue(
            result,
            f"\n📥 Input:    user=User(is_superuser=True, is_active=True)"
            f"\n✅ Expected: True"
            f"\n❌ Got:      {result!r}",
        )

    def test_inactive_superuser_is_rejected(self) -> None:
        """
        Input:  Superusuário inativo do Django (is_superuser=True, is_active=False)
        Expect: False
        Result: Verificado via assert
        """
        inactive_superuser = User(username="admin_inactive", is_superuser=True, is_active=False)
        result = is_user_eligible_for_local_auth(inactive_superuser)
        self.assertFalse(
            result,
            f"\n📥 Input:    user=User(is_superuser=True, is_active=False)"
            f"\n✅ Expected: False"
            f"\n❌ Got:      {result!r}",
        )

    def test_non_user_or_none_is_rejected(self) -> None:
        """
        Input:  Objetos não-User (None, AnonymousUser, strings, ints)
        Expect: False
        Result: Verificado via assert
        """
        invalid_inputs: list[object] = [
            None,
            AnonymousUser(),
            "admin",
            {"username": "admin", "is_superuser": True},
            123,
        ]

        for invalid_input in invalid_inputs:
            with self.subTest(invalid_input=invalid_input):
                # pyright: ignore[reportArgumentType]
                result = is_user_eligible_for_local_auth(invalid_input)  # type: ignore[arg-type]
                self.assertFalse(
                    result,
                    f"\n📥 Input:    user={invalid_input!r}"
                    f"\n✅ Expected: False"
                    f"\n❌ Got:      {result!r}",
                )
