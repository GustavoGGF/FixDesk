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
    # Define uma URL padrão para o endpoint "getTicketFilter".
    # Este endpoint é responsável por chamar a função 'getTicketFilter' na view 'views'.
    # A função 'getTicketFilter' tem a finalidade de processar os filtros selecionados pelo usuário
    # e retornar os chamados (tickets) que correspondem a esses filtros.
    # O nome desta URL é 'central-get-ticket-filter', e pode ser utilizado em templates e em redirecionamentos.
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
    path("details/<int:id>", views.detailsChat, name="central-details-chat"),
    path(
        "get-ticket-filter-tech/",
        views.getTicketFilterTech,
        name="central-get-ticket-filter-tech",
    ),
]
