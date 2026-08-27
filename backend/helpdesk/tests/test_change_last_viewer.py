import json
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from helpdesk.models import SupportTicket, Area

class ChangeLastViewerViewTests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="123")
        self.client.force_login(self.user)
        self.client.force_authenticate(user=self.user)
        
        # Cria um ticket básico
        self.ticket = SupportTicket.objects.create(
            id=1,
            ticketRequester="Test User",
            department="TI",
            mail="testuser@mail.com",
            company="Lupatech",
            sector="TI",
            occurrence="Hardware",
            problemn="Computador",
            start_date=timezone.now(),
            respective_area=Area.objects.get_or_create(code="TI")[0],
            responsible_technician="Tech Novo",
            PID=self.user.id,
            open=True,
            chat="1,sys,msg],[2,sys,msg],[3,sys,msg],[4,sys,msg" # Simula chat para len(result) > 1
        )
        self.url = f"/helpdesk/change-last-viewer/{self.ticket.id}"

    def test_change_last_viewer_post_success_user(self):
        """Valida a alteração do último visualizador por um usuário (requester='user')"""
        payload = {
            "viewer": "Test User",
            "technician": "Tech Novo",
            "requester": "user"
        }
        response = self.client.post(self.url, data=payload, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "Last Viewer Alterado"})
        
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.last_viewer, "Test User")

    def test_change_last_viewer_post_success_tech(self):
        """Valida a alteração do último visualizador por um técnico (requester='tech')"""
        payload = {
            "viewer": "Tech Novo",
            "technician": "Tech Novo",
            "requester": "tech"
        }
        response = self.client.post(self.url, data=payload, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "Last Viewer Alterado"})
        
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.last_viewer, "Tech Novo")

    def test_change_last_viewer_method_not_allowed(self):
        """Valida que o endpoint não aceita requisições GET (HTTP 405)"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 405)

    def test_change_last_viewer_no_chat(self):
        """Valida retorno quando o chamado ainda não foi atendido (chat vazio)"""
        self.ticket.chat = ""
        self.ticket.save()
        payload = {
            "viewer": "Test User",
            "technician": "Tech Novo",
            "requester": "user"
        }
        response = self.client.post(self.url, data=payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), {"status": "Chamado ainda não foi atendido"})

    def test_change_last_viewer_wrong_user(self):
        """Valida que usuário não pode alterar se o viewer não for o requester do ticket"""
        payload = {
            "viewer": "Outro User",
            "technician": "Tech Novo",
            "requester": "user"
        }
        response = self.client.post(self.url, data=payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), {"status": "O Chamado não é desse usuário"})

    def test_change_last_viewer_wrong_tech(self):
        """Valida que técnico não pode alterar se o viewer não for o technician"""
        payload = {
            "viewer": "Tech Invalido",
            "technician": "Tech Novo",
            "requester": "tech"
        }
        response = self.client.post(self.url, data=payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), {"status": "O Chamado é de outro Técnico"})
