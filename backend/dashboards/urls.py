from django.urls import path
from . import views

urlpatterns = [
    path("", views.dashboard_ti, name="central-dashboard-TI"),
    path("get-info/", views.get_info, name="central-dashboard-TI"),
    path("dashboard_TI/", views.dashboard_ti, name="central-dashboard-TI"),
    path(
        "get-dash-board-pie/<str:sector>",
        views.get_dash_board_pie,
        name="central-dashboard-pie",
    ),
    path(
        "get-ticket-ti/<int:quantity>/<str:status>/<str:order>",
        views.get_ticket_ti,
        name="central-dashboard-ticket-ti",
    ),
    path(
        "get-dash-board-bar/<str:range_days>",
        views.get_dash_board_bar,
        name="central-get-dashboard-bar",
    ),
    path(
        "upload-new-files/<int:id>",
        views.upload_new_files,
        name="central-upload-new-files",
    ),
    path("details/<int:id>", views.details_chat, name="central-details-chat"),
]
