from django.urls import path
from . import views

urlpatterns = [
    path("", views.dashboard_TI, name="central-dashboard-TI"),
    path("get-info/", views.get_info, name="central-dashboard-TI"),
    path("dashboard_TI/", views.dashboard_TI, name="central-dashboard-TI"),
    path(
        "getDashBoardPie/<str:sector>",
        views.getDashBoardPie,
        name="central-dashboard-pie",
    ),
    path(
        "get-ticket-TI/<int:quantity>/<str:status>/<str:order>",
        views.get_ticket_TI,
        name="central-dashboard-ticket-TI",
    ),
    path(
        "get-dash-board-bar/<str:range_days>",
        views.getDashBoardBar,
        name="central-get-dashboard-bar",
    ),
    path(
        "upload-new-files/<int:id>",
        views.upload_new_files,
        name="central-upload-new-files",
    ),
    path("details/<int:id>", views.detailsChat, name="central-details-chat"),
]
