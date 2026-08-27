from django.urls import path

from fixdesk import settings
from . import views
from django.conf.urls.static import static

urlpatterns = [
    path("", views.first_view, name="central-de-chamados"),
    path("get-token/", views.get_new_token, name="central-get-token"),
    path("active-areas/", views.get_active_areas, name="central-active-areas"),
    path("submit-ticket/", views.submit_ticket, name="central-tickets"),
    path("history/", views.history, name="central-history"),
    path(
        "get-ticket/<int:quantity>/<str:usr>/<str:status>/<str:order>",
        views.history_get_ticket,
        name="central-history-get-ticket",
    ),
    path("exit/", views.exit, name="central-exit"),
    path("ticket/<int:id>", views.ticket, name="central-ticket"),
    path(
        "ticket/<int:id>/technical-details/message/",
        views.send_technical_detail_message,
        name="central-technical-detail-message",
    ),
    path(
        "ticket/<int:id>/technical-details/file/",
        views.upload_technical_detail_file,
        name="central-technical-detail-file",
    ),
    path(
        "ticket/<int:id>/technical-details/files/",
        views.list_technical_detail_files,
        name="central-technical-detail-files",
    ),
    path(
        "ticket/<int:id>/technical-details/files/<int:file_id>/",
        views.download_technical_detail_file,
        name="central-technical-detail-download-file",
    ),
    path("update-chat/<int:id>", views.update_chat, name="central-update-chat"),
    path(
        "get-ticket-filter/<str:url>/<str:sector>/<str:occurrence>/<str:order>/<str:user>/<int:quantity>/<str:status>/<str:search_query>",
        views.get_ticket_filter,
        name="central-get-ticket-filter",
    ),
    # Endpoint v2 com parâmetros nomeados — substitui gradualmente a rota legada acima.
    path("tickets/", views.get_ticket_filter_v2, name="central-tickets-filter-v2"),
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
    path("log-error-frontend/", views.log_error_frontend, name="central-log-error-frontend"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
