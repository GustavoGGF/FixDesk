from django.urls import path
from . import views

urlpatterns = [
    path("", views.firstView, name="central-de-chamados"),
    path("submitTicket/", views.submitTicket, name="central-tickets"),
    path("history/", views.history, name="central-history"),
    path("toDashboard/", views.toDashboard, name="central-to-dashboard"),
    path("FAQ/", views.faq, name="central-faq"),
    path("exit/", views.exit, name="central-exit"),
    path("ticket/<int:id>", views.ticket, name="central-ticket"),
]