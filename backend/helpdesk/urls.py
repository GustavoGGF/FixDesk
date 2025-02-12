from django.urls import path, include

from fixdesk import settings
from . import views
from django.conf.urls.static import static

urlpatterns = [
    path("", views.firstView, name="central-de-chamados"),
    path("submitTicket/", views.submitTicket, name="central-tickets"),
    path("history/", views.history, name="central-history"),
    path("exit/", views.exit, name="central-exit"),
    path("ticket/<int:id>", views.ticket, name="central-ticket"),
    path("update_chat/<int:id>", views.update_chat, name="central-update-chat"),
    path("moreTicket/", views.moreTicket, name="central-more-ticket"),
    path("getTicketFilter/", views.getTicketFilter, name="central-get-ticket-filter"),
    path(
        "getTicketFilterWords/",
        views.getTicketFilterWords,
        name="central-get-ticket-filter-words",
    ),
    path(
        "getTicketFilterStatus/",
        views.getTicketFilterStatus,
        name="central-get-ticket-filter-words",
    ),
    # URL para pegar os equipamentos para alocagem
    path(
        "equipaments-for-alocate/",
        views.equipamentsForAlocate,
        name="central-equipaments-for-alocate",
    ),
    # URL que verifica se os equipamentos focam locados.
    path(
        "date-equipaments-alocate/<str:mac>",
        views.dateEquipamentsAlocate,
        name="central-date-equipaments-alocate",
    ),
    path(
        "change-last-viewer/<int:id>",
        views.changeLastViewer,
        name="central-change-last-viewer",
    ),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
