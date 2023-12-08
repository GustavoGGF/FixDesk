from django.urls import path
from . import views

urlpatterns = [
    path("", views.dashboard_TI, name="central-dashboard-TI"),
    path("dashboard_TI/", views.dashboard_TI, name="central-dashboard-TI"),
    path(
        "getDashBoardPie/<str:sector>",
        views.getDashBoardPie,
        name="central-dashboard-pie",
    ),
    path("get_ticket_TI", views.get_ticket_TI, name="central-dashboard-ticket-TI"),
    path(
        "equipment_inventory/",
        views.equipment_inventory,
        name="central-equipment-inventory",
    ),
    path("getTicketFilter/", views.getTicketFilter, name="central-get-ticket-filter"),
    path(
        "getTicketFilterWords/",
        views.getTicketFilterWords,
        name="central-get-ticket-filter-words",
    ),
    path("getDashBoardBar/", views.getDashBoardBar, name="central-get-dashboard-bar"),
    path(
        "getDashBoardBar/updateMonth/",
        views.getDashBoardBarMonth,
        name="central-get-dashboard-bar",
    ),
    path(
        "getDashBoardBar/week/",
        views.getDashBoardBar,
        name="central-get-dashboard-bar",
    ),
    path(
        "getDashBoardBar/updateYear/",
        views.getDashBoardBarYear,
        name="central-get-dashboard-bar",
    ),
    path(
        "getDashBoardBar/updateAll/",
        views.getDashBoardBarAll,
        name="central-get-dashboard-bar",
    ),
    path(
        "getTicketFilterStatus/",
        views.getTicketFilterStatus,
        name="central-get-ticket-filter-status",
    ),
    path(
        "upload-new-files/<int:id>",
        views.upload_new_files,
        name="central-upload-new-files",
    ),
]
