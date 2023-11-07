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
]
