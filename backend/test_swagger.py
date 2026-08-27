from django.test import TestCase, Client
from django.urls import reverse

class TestSwaggerEndpoints(TestCase):
    def setUp(self):
        self.client = Client()

    def test_schema_endpoint(self):
        """Testa se o endpoint de schema base retorna 200"""
        url = reverse('schema')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        content = response.content.decode('utf-8')
        self.assertIn('openapi', content.lower())
        self.assertIn('info', content.lower())

    def test_swagger_ui_endpoint(self):
        """Testa se o endpoint do Swagger UI retorna 200"""
        url = reverse('swagger-ui')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        content = response.content.decode('utf-8')
        self.assertIn('swagger-ui', content.lower())

    def test_redoc_endpoint(self):
        """Testa se o endpoint do Redoc retorna 200"""
        url = reverse('redoc')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        content = response.content.decode('utf-8')
        self.assertIn('redoc', content.lower())
