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
]
