from django.urls import path

from fixdesk import settings
from . import views
from django.conf.urls.static import static

urlpatterns = [
    path("", views.firstView, name="central-de-chamados"),
    path("get-token/", views.get_new_token, name="central-get-token"),
    path("submit-ticket/", views.submitTicket, name="central-tickets"),
    path("history/", views.history, name="central-history"),
    path(
        "get-ticket/<int:quantity>/<str:usr>/<str:status>/<str:order>",
        views.history_get_ticket,
        name="central-history-get-ticket",
    ),
    path("exit/", views.exit, name="central-exit"),
    path("ticket/<int:id>", views.ticket, name="central-ticket"),
    path("update_chat/<int:id>", views.update_chat, name="central-update-chat"),
    path(
        "get-ticket-filter/<str:url>/<str:sector>/<str:occurrence>/<str:order>/<str:user>/<int:quantity>/<str:status>/<str:search_query>",
        views.get_ticket_filter,
        name="central-get-ticket-filter",
    ),
    # URL para pegar os equipamentos para alocagem
    path(
        "equipaments-for-alocate/<str:location>",
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
        views.change_last_viewer,
        name="central-change-last-viewer",
    ),
    path("get-image/<str:mac>", views.get_image, name="central-get-image"),
    path(
        "download-word/<str:method>",
        views.download_word,
        name="central-download-word",
    ),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
