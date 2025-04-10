from django.urls import path

from fixdesk import settings
from . import views
from django.conf.urls.static import static

urlpatterns = [
    path("", views.first_view, name="central-de-chamados"),
    path("get-token/", views.get_new_token, name="central-get-token"),
    path("submit-ticket/", views.submit_ticket, name="central-tickets"),
    path("history/", views.history, name="central-history"),
    path(
        "get-ticket/<int:quantity>/<str:usr>/<str:status>/<str:order>",
        views.history_get_ticket,
        name="central-history-get-ticket",
    ),
    path("exit/", views.exit, name="central-exit"),
    path("ticket/<int:id>", views.ticket, name="central-ticket"),
    path("update-chat/<int:id>", views.update_chat, name="central-update-chat"),
    path(
        "get-ticket-filter/<str:url>/<str:sector>/<str:occurrence>/<str:order>/<str:user>/<int:quantity>/<str:status>/<str:search_query>",
        views.get_ticket_filter,
        name="central-get-ticket-filter",
    ),
    # URL para pegar os equipamentos para alocagem
    path(
        "equipaments-for-alocate/<str:location>",
        views.equipaments_for_alocate,
        name="central-equipaments-for-alocate",
    ),
    # URL que verifica se os equipamentos focam locados.
    path(
        "date-equipaments-alocate/<str:mac>",
        views.date_equipaments_alocate,
        name="central-date-equipaments-alocate",
    ),
    path(
        "change-last-viewer/<int:id>",
        views.change_last_viewer,
        name="central-change-last-viewer",
    ),
    path("get-image/<str:mac>", views.get_image, name="central-get-image"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
