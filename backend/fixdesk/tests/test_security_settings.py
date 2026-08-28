from django.conf import settings
from django.http import HttpResponse
from django.middleware.security import SecurityMiddleware
from django.test import RequestFactory, SimpleTestCase, override_settings


class SecuritySettingsTests(SimpleTestCase):
    def test_authentication_cookies_are_secure(self) -> None:
        self.assertTrue(settings.SESSION_COOKIE_SECURE)
        self.assertTrue(settings.CSRF_COOKIE_SECURE)

    def test_https_proxy_header_is_configured(self) -> None:
        self.assertEqual(
            settings.SECURE_PROXY_SSL_HEADER,
            ("HTTP_X_FORWARDED_PROTO", "https"),
        )

    @override_settings(SECURE_SSL_REDIRECT=True)
    def test_http_requests_are_redirected_when_production_redirect_is_enabled(self) -> None:
        request = RequestFactory().get("/validation/")
        response = SecurityMiddleware(lambda request: HttpResponse("ok"))(request)

        self.assertEqual(response.status_code, 301)
        self.assertEqual(response["Location"], "https://testserver/validation/")

    @override_settings(
        SECURE_SSL_REDIRECT=True,
        SECURE_PROXY_SSL_HEADER=("HTTP_X_FORWARDED_PROTO", "https"),
    )
    def test_https_forwarded_by_trusted_proxy_is_not_redirected(self) -> None:
        request = RequestFactory().get(
            "/validation/",
            HTTP_X_FORWARDED_PROTO="https",
        )
        response = SecurityMiddleware(lambda request: HttpResponse("ok"))(request)

        self.assertEqual(response.status_code, 200)

