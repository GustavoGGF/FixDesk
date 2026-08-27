
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from .serializers import (
    DashboardsErrorSerializer,
    GetInfoResponseSerializer,
    DashBoardPieResponseSerializer,
    GetTicketTiResponseSerializer,
    GetDashboardBarResponseSerializer,
    GetUsersFixdeskResponseSerializer,
    UploadFilesRequestSerializer,
    GenericResponseSerializer
)
from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.csrf import requires_csrf_token
from os import getenv
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from helpdesk.models import SupportTicket, TicketFile
from django.middleware.csrf import get_token
from datetime import datetime, time, timedelta
from django.db.models import Q
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from django.db import transaction
from django.utils import timezone
from logging import basicConfig, WARNING, getLogger
from calendar import monthrange
from django.core.handlers.wsgi import WSGIRequest
from collections import defaultdict
from django.db.models import Count
from django.core.files.uploadedfile import UploadedFile
from django.views.decorators.cache import cache_page
from helpdesk.views import process_ticket_files
from classes.mapping.status_mapping import StatusMap
from classes.mapping.histogram_data import HistogramData
from classes.mapping.chat_entry_file import ChatLogEntryFile
from classes.users.app_list import UserList
from django.core.paginator import Paginator
from django.db.models.functions import ExtractMonth, ExtractYear, ExtractWeek
from fixdesk.permissions import (
    get_user_allowed_areas,
    is_technician,
    is_technician_for_area,
    user_can_access_ticket,
    DJANGO_GROUP_TECH,
    DJANGO_GROUP_LEADER,
    DJANGO_GROUP_TECH_FISCAL,
)

# Configuração básica de logging
basicConfig(level=WARNING)
logger = getLogger(__name__)

tech_group = getenv("DJANGO_GROUP_TECH")
status_mapping: StatusMap = {"open": True, "close": False, "stop": None, "all": "All"}

types_str = getenv("VALID_TYPES")


@login_required(login_url="/login")
@require_GET
@never_cache
@extend_schema(
    summary="Carregar dashboard de TI",
    description="Retorna dados iniciais para o dashboard de TI.",
    responses={200: GenericResponseSerializer},
    tags=['Dashboards']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_ti(request: WSGIRequest, sector: str | None = None) -> HttpResponse:
    """
    Função que valida se o usuário possui permissão para acessar o dashboard.
    Se o usuário não for técnico em nenhuma área, será redirecionado para a página de helpdesk.
    """
    try:
        if isinstance(user := request.user, User):
            if not is_technician(user):
                logger.warning(
                    f"Usuário {user.get_username()} não tem permissão para acessar o dashboard."
                )
                return redirect("/helpdesk")

            return render(request, "index.html")

        return redirect("/helpdesk")

    except Exception as e:
        logger.error(
            f"Erro ao acessar o dashboard para o usuário {request.user}: {e}"
        )
        return JsonResponse({"Error": f"Erro inesperado: {e}"}, status=500)


@login_required(login_url="/login")
@require_GET
@never_cache
@extend_schema(
    summary="Obter informações de usuário",
    description="Retorna nome e papel (helpdesk) do usuário autenticado.",
    responses={200: GetInfoResponseSerializer, 401: DashboardsErrorSerializer},
    tags=['Dashboards']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_info(request: WSGIRequest) -> JsonResponse:
    try:
        if not isinstance(request.user, User) or not is_technician(request.user):
            return JsonResponse({"Error": "Acesso não autorizado"}, status=403)

        csrf_token = get_token(request)

        allowed_areas = get_user_allowed_areas(request.user)
        techs = {}
        if "TI" in allowed_areas:
            ti_users = (
                User.objects.filter(groups__name__in=[DJANGO_GROUP_TECH, DJANGO_GROUP_LEADER])
                .distinct()
                .values_list("first_name", "last_name")
            )
            techs["TI"] = [f"{fn} {ln}".strip() for fn, ln in ti_users]
            
        if "Fiscal" in allowed_areas:
            fiscal_users = (
                User.objects.filter(groups__name__in=[DJANGO_GROUP_TECH_FISCAL])
                .distinct()
                .values_list("first_name", "last_name")
            )
            techs["Fiscal"] = [f"{fn} {ln}".strip() for fn, ln in fiscal_users]

        return JsonResponse(
            {
                "token": csrf_token,
                "techs": techs,
            },
            status=200,
            safe=True,
        )

    except Exception as e:
        logger.error(f"Erro ao obter CSRF e lista de técnicos: {e}")
        return JsonResponse(
            {"Error": f"Erro ao obter CSRF e lista técnica: {e}"},
            status=500,
        )


@login_required(login_url="/login")
@require_GET
@extend_schema(
    summary="Obter dados do gráfico de pizza",
    description="Retorna estatísticas de tickets agrupadas por setor e analista.",
    responses={200: DashBoardPieResponseSerializer, 400: DashboardsErrorSerializer},
    tags=['Dashboards']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dash_board_pie(request: WSGIRequest, sector: str) -> JsonResponse:
    if sector not in {"TI", "Fiscal"}:
        return JsonResponse(
            {"Error": "Setor inválido para DashBoardPie"}, status=400, safe=True
        )

    if not isinstance(request.user, User) or not is_technician_for_area(request.user, sector):
        return JsonResponse(
            {"Error": "Acesso não autorizado para esta área"}, status=403, safe=True
        )

    try:
        seven_days_ago = timezone.now() - timedelta(days=7)

        stats = SupportTicket.objects.filter(respective_area__code=sector).aggregate(
            total=Count("id"),
            open_count=Count("id", filter=Q(open=True)),
            close_count=Count("id", filter=Q(open=False)),
            stop_count=Count("id", filter=Q(open__isnull=True)),
            urgent_count=Count(
                "id", filter=Q(open=True, start_date__lt=seven_days_ago)
            ),
        )

        boardpie = [
            stats["total"] or 0,
            stats["open_count"] or 0,
            stats["close_count"] or 0,
            stats["stop_count"] or 0,
            stats["urgent_count"] or 0,
        ]

        return JsonResponse({"data": boardpie}, status=200, safe=True)

    except Exception as e:
        logger.error(e)
        return JsonResponse(
            {"Error": f"Erro ao obter os chamados para DashBoardPie {e}"},
            status=331,
        )


@login_required(login_url="/login")
@require_GET
@never_cache
@extend_schema(
    summary="Obter tickets de TI",
    description="Lista tickets abertos da área de TI com filtros de quantidade, status e ordem.",
    responses={200: GetTicketTiResponseSerializer, 400: DashboardsErrorSerializer, 401: DashboardsErrorSerializer, 500: DashboardsErrorSerializer},
    tags=['Dashboards']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ticket_ti(request: WSGIRequest, quantity: int, status: str, order: str) -> JsonResponse:
    """
    Obtém os chamados das áreas permitidas ao usuário, com filtros de quantidade e status.
    """
    if not isinstance(request.user, User) or not is_technician(request.user):
        return JsonResponse({"Error": "Acesso não autorizado"}, status=403)

    status_opng = status_mapping.get(status, None)

    try:
        allowed_areas = get_user_allowed_areas(request.user)
        filters = Q(respective_area__code__in=allowed_areas)
        if status_opng not in {"All", "null"}:
            filters &= Q(open=status_opng)

        ticket_data = SupportTicket.objects.filter(filters).order_by(order or "-id")[
            :quantity
        ]

        ticket_objects = [ticket.to_dict() for ticket in ticket_data]

        return JsonResponse({"tickets": ticket_objects}, status=200, safe=True)

    except Exception as e:
        logger.error(f"Erro ao obter ou montar os chamados: {e}")
        return JsonResponse({"Error": f"Erro ao obter os chamados {e}"}, status=332)


def get_dashboard_bar_week(request: WSGIRequest, sector: str) -> JsonResponse:
    try:
        local_today = timezone.localtime(timezone.now()).date()
        start_of_week = local_today - timedelta(days=local_today.weekday())
        end_of_week = start_of_week + timedelta(days=6)

        start_dt = timezone.make_aware(datetime.combine(start_of_week, time.min))
        end_dt = timezone.make_aware(datetime.combine(end_of_week, time.max))

        if not isinstance(request.user, User):
            return JsonResponse({"Error": "Acesso não autorizado"}, status=403)

        tickets_data = SupportTicket.objects.filter(
            start_date__gte=start_dt,
            start_date__lte=end_dt,
            respective_area__code=sector,
        ).values("start_date")

        if not tickets_data.exists():
            return JsonResponse({"Error": "Falta de dados"}, status=204, safe=True)

        weekdays = [
            "Segunda-feira",
            "Terça-feira",
            "Quarta-feira",
            "Quinta-feira",
            "Sexta-feira",
            "Sábado",
            "Domingo",
        ]

        values = [0] * 7

        for ticket in tickets_data:
            dt = ticket["start_date"]
            if dt:
                local_dt = timezone.localtime(dt)
                values[local_dt.weekday()] += 1

        if all(num == 0 for num in values):
            return JsonResponse({"Error": "Falta de dados"}, status=204, safe=True)

        histogram_data: HistogramData = {"days": weekdays, "values": values}

        return JsonResponse(histogram_data, status=200, safe=True)

    except Exception as e:
        logger.error(f"Erro inesperado em DashBoardBar: {e}")
        return JsonResponse({"Error": f"Erro inesperado DashBoardBar {e}"}, status=210)


def get_dashboard_bar_month(request: WSGIRequest, sector: str) -> JsonResponse:
    try:
        local_today = timezone.localtime(timezone.now()).date()
        start_of_month = local_today.replace(day=1)
        days_in_month = monthrange(local_today.year, local_today.month)[1]
        end_of_month = local_today.replace(day=days_in_month)

        start_dt = timezone.make_aware(datetime.combine(start_of_month, time.min))
        end_dt = timezone.make_aware(datetime.combine(end_of_month, time.max))

        values = [0] * days_in_month

        if not isinstance(request.user, User):
            return JsonResponse({"Error": "Acesso não autorizado"}, status=403)

        tickets_data = SupportTicket.objects.filter(
            start_date__gte=start_dt,
            start_date__lte=end_dt,
            respective_area__code=sector,
        ).values("start_date")

        if not tickets_data.exists():
            return JsonResponse(
                {"Error": "Nenhum ticket encontrado para este mês"}, status=204
            )

        for ticket in tickets_data:
            dt = ticket["start_date"]
            if dt:
                local_dt = timezone.localtime(dt)
                values[local_dt.day - 1] += 1

        histogram_data: HistogramData = {
            "days": list(range(1, days_in_month + 1)),
            "values": values,
        }

        return JsonResponse(histogram_data, status=200, safe=True)

    except Exception as e:
        logger.error(f"Erro inesperado em DashBoardBarMonth: {e}")
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=210)


def get_dashboard_bar_year(request: WSGIRequest, sector: str) -> JsonResponse:
    try:
        local_today = timezone.localtime(timezone.now()).date()
        start_of_year = local_today.replace(month=1, day=1)
        end_of_year = local_today.replace(month=12, day=31)

        start_dt = timezone.make_aware(datetime.combine(start_of_year, time.min))
        end_dt = timezone.make_aware(datetime.combine(end_of_year, time.max))

        months = [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro",
        ]

        if not isinstance(request.user, User):
            return JsonResponse({"Error": "Acesso não autorizado"}, status=403)

        tickets_data = SupportTicket.objects.filter(
            start_date__gte=start_dt,
            start_date__lte=end_dt,
            respective_area__code=sector,
        ).values("start_date")

        values = [0] * 12

        for ticket in tickets_data:
            dt = ticket["start_date"]
            if dt:
                local_dt = timezone.localtime(dt)
                values[local_dt.month - 1] += 1

        histogram_data: HistogramData = {
            "days": months,
            "values": values,
        }

        return JsonResponse(histogram_data, status=200, safe=True)

    except Exception as e:
        logger.error(f"Erro inesperado em get_dashboard_bar: {e}")
        return JsonResponse(
            {"Error": f"Erro inesperado em DashBoardBarYear: {e}"}, status=210
        )


def get_dashboard_bar_all(request: WSGIRequest, sector: str) -> JsonResponse:
    try:
        if not isinstance(request.user, User):
            return JsonResponse({"Error": "Acesso não autorizado"}, status=403)

        tickets_data = SupportTicket.objects.filter(
            respective_area__code=sector
        ).values("start_date")

        year_counts: dict[int, int] = defaultdict(int)

        for ticket in tickets_data:
            dt = ticket["start_date"]
            if dt:
                local_dt = timezone.localtime(dt)
                year_counts[local_dt.year] += 1

        years = sorted(year_counts.keys())
        values = [year_counts[y] for y in years]

        histogram_data: HistogramData = {
            "days": years,
            "values": values,
        }

        return JsonResponse(histogram_data, status=200, safe=True)

    except Exception as e:
        logger.error(f"Erro inesperado em get_dashboard_bar: {e}")
        return JsonResponse(
            {"Error": f"Erro inesperado em DashBoardBarYear: {e}"}, status=210
        )


@require_GET
@never_cache
@login_required(login_url="/login")
@extend_schema(
    summary="Obter dados do gráfico de barras",
    description="Retorna dados agregados baseados no intervalo de tempo selecionado.",
    responses={200: GetDashboardBarResponseSerializer, 400: DashboardsErrorSerializer},
    tags=['Dashboards']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dash_board_bar(request: WSGIRequest, sector: str, range_days: str) -> JsonResponse:
    """
    Retorna os dados do dashboard Bar conforme o limite de datas estipulado.
    """
    if not isinstance(request.user, User) or not is_technician_for_area(request.user, sector):
        return JsonResponse({"Error": "Acesso não autorizado"}, status=403)

    match range_days:
        case "week":
            return get_dashboard_bar_week(request, sector)
        case "month":
            return get_dashboard_bar_month(request, sector)
        case "year":
            return get_dashboard_bar_year(request, sector)
        case "all":
            return get_dashboard_bar_all(request, sector)
        case _:
            return JsonResponse(
                {"Error": "Intervalo de tempo inválido para DashBoardBar"}, status=400
            )

def verify_valid_or_not(
    file: UploadedFile, types: str | list[str] | None
) -> tuple[bool, bytes, str]:
    """
    Verifica se o arquivo enviado é de um tipo válido.
    """
    image_bytes = file.read()
    file.seek(0)

    allowed_list: list[str] = []
    if types:
        if isinstance(types, str):
            clean_str = types.strip("[]")
            allowed_list = [
                t.strip().strip("'\"").lower()
                for t in clean_str.split(",")
                if t.strip()
            ]
        else:
            allowed_list = [
                t.replace('"', "").lower()
                for t in types
                if t
            ]

    from services.ticket_files_processor import verify_valid_or_not as service_verify
    file_name_str: str = str(getattr(file, "name", "") or "")
    valid, file_type = service_verify(image_bytes, file_name_str, allowed_list)
    return valid, image_bytes, file_type


@require_POST
@transaction.atomic
@requires_csrf_token
@extend_schema(
    summary="Fazer upload de novos arquivos",
    description="Anexa novos arquivos a um chamado (ticket) existente.",
    request=UploadFilesRequestSerializer,
    responses={200: GenericResponseSerializer, 400: DashboardsErrorSerializer, 500: DashboardsErrorSerializer},
    tags=['Dashboards']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_new_files(request: WSGIRequest, id: int) -> JsonResponse:
    if not isinstance(request.user, User) or not is_technician(request.user):
        return JsonResponse({"Error": "Acesso não autorizado"}, status=403)

    try:
        ticket: SupportTicket = get_object_or_404(SupportTicket, id=id)

        if not user_can_access_ticket(request.user, ticket):
            return JsonResponse({"Error": "Acesso não autorizado ao chamado"}, status=403)

        other_files = request.FILES.getlist("files")
        date_get = request.POST.get("date")
        hours = request.POST.get("hours")

        allowed_types: list[str] = []
        if types_str:
            clean_str = types_str.strip("[]")
            allowed_types = [
                t.strip().strip("'\"").lower()
                for t in clean_str.split(",")
                if t.strip()
            ]

        current_chat = str(getattr(ticket, "chat", "") or "")

        ticket_files_to_create: list[TicketFile] = []
        new_chat_entries = ""

        if other_files:
            from services.ticket_files_processor import verify_valid_or_not as service_verify
            for unit_file in other_files:
                image_bytes = unit_file.read()
                unit_file.seek(0)

                file_name_str: str = str(getattr(unit_file, "name", "") or "")
                valid, file_type = service_verify(image_bytes, file_name_str, allowed_types)

                if valid:
                    str_date = str(date_get)
                    str_hours = str(hours)

                    full_name = request.user.get_full_name().strip() or "Usuário"

                    entry = ChatLogEntryFile(
                        date=str_date,
                        hours=str_hours,
                        user=full_name,
                        action=f"adicionou o arquivo {file_name_str}",
                    )

                    new_chat_entries += str(entry)

                    ticket_file = TicketFile(
                        ticket=ticket,
                        file_name=file_name_str,
                        file_type=file_type,
                        data=image_bytes,
                    )

                    ticket_files_to_create.append(ticket_file)

        if ticket_files_to_create:
            TicketFile.objects.bulk_create(ticket_files_to_create)

        if new_chat_entries:
            SupportTicket.objects.filter(id=id).update(
                chat=current_chat + new_chat_entries
            )

        ticket_files_qs = TicketFile.objects.filter(ticket=ticket)
        image_data, content_file, name_file = process_ticket_files(ticket_files_qs)

        ticket.refresh_from_db()

        chat_content: str = str(getattr(ticket, "chat", "") or "")

        return JsonResponse(
            {
                "chat": chat_content,
                "image_data": image_data,
                "content_file": content_file,
                "name_file": name_file,
            },
            status=200,
            safe=True,
        )
    except Exception as e:
        logger.error(e)
        return JsonResponse(
            {"Error": f"Erro inesperado Upload New FIle {e}"}, status=340
        )


@login_required(login_url="/login")
@never_cache
@require_GET
@extend_schema(
    summary="Detalhes do chat de um chamado",
    description="Retorna os detalhes completos do chat/chamado.",
    responses={200: GenericResponseSerializer, 400: DashboardsErrorSerializer},
    tags=['Dashboards']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def details_chat(request: WSGIRequest, id: int) -> HttpResponse:
    try:
        user = request.user

        if not isinstance(user, User) or not is_technician(user):
            return redirect("/helpdesk")

        ticket = get_object_or_404(SupportTicket, id=id)

        if not user_can_access_ticket(user, ticket):
            return JsonResponse({"Error": "Acesso não autorizado ao chamado"}, status=403)

        details_str: str = getattr(ticket, "details", "") or ""

        return JsonResponse({"details": details_str}, status=200, safe=True)

    except Exception as e:
        logger.error(f"Erro inesperado em detailsChat: {e}")
        return JsonResponse(
            {"Error": f"Erro inesperado ao obter detalhes técnicos: {e}"}, status=500
        )


@never_cache
@extend_schema(
    summary="Listar usuários da plataforma",
    description="Retorna lista paginada de usuários registrados no sistema, com suporte a busca e contagem.",
    responses={200: GetUsersFixdeskResponseSerializer, 400: DashboardsErrorSerializer},
    tags=['Dashboards']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users_fixdesk(request: WSGIRequest) -> JsonResponse:
    if not isinstance(request.user, User) or not is_technician(request.user):
        return JsonResponse({"Error": "Acesso não autorizado"}, status=403)

    raw_page: str = request.GET.get("page", "1") or "1"
    raw_page_size: str = request.GET.get("page_size", "10") or "10"
    search: str = (request.GET.get("search", "") or "").strip()

    try:
        page_number: int = max(1, int(raw_page))
    except ValueError:
        page_number = 1

    try:
        page_size: int = max(1, min(100, int(raw_page_size)))
    except ValueError:
        page_size = 10

    queryset = User.objects.prefetch_related("groups").all()

    if search:
        queryset = queryset.filter(
            Q(first_name__icontains=search)
            | Q(last_name__icontains=search)
            | Q(groups__name__icontains=search)
            | Q(username__icontains=search)
        ).distinct()

    queryset = queryset.order_by("first_name", "last_name", "id")

    paginator = Paginator(queryset, page_size)
    page_obj = paginator.get_page(page_number)

    final_users_list: list[UserList] = []
    for user in page_obj.object_list:
        group_manager = getattr(user, "groups")
        groups: list[str] = [group.name for group in group_manager.all()]

        list_users: UserList = {
            "id": int(getattr(user, "pk", 0) or 0),
            "first_name": str(getattr(user, "first_name", "") or ""),
            "last_name": str(getattr(user, "last_name", "") or ""),
            "groups": groups,
        }
        final_users_list.append(list_users)

    payload: dict[str, object] = {
        "users": final_users_list,
        "total_users": paginator.count,
        "total_pages": paginator.num_pages,
        "current_page": page_obj.number,
        "page_size": page_size,
    }

    return JsonResponse(payload, safe=False, status=200)


@extend_schema(
    summary="Excluir usuário",
    description="Remove um usuário do FixDesk via método HTTP DELETE.",
    responses={200: GenericResponseSerializer, 400: DashboardsErrorSerializer, 500: DashboardsErrorSerializer},
    tags=['Dashboards']
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def exclude_user(request: WSGIRequest, user: str) -> JsonResponse:
    if not isinstance(request.user, User) or not is_technician(request.user):
        return JsonResponse({"Error": "Acesso não autorizado"}, status=403)

    try:
        username = user.split()
        if len(username) < 2:
            return JsonResponse({"error": "Nome completo inválido"}, status=400)

        first_name = username[0]
        last_name = username[1]

        user_to_exclude = User.objects.filter(
            first_name=first_name, last_name=last_name
        ).first()

        if not user_to_exclude:
            return JsonResponse({"success": "false"}, safe=True, status=402)

        actual_id = int(getattr(user_to_exclude, "pk", 0))
        if actual_id:
            SupportTicket.objects.filter(PID=actual_id).update(PID=0)
        else:
            logger.warning(
                f"Usuário para exclusão encontrado, mas sem ID: {first_name} {last_name}"
            )
            return JsonResponse({"update": "false"}, safe=True, status=402)

        user_to_exclude.delete()

        return JsonResponse({"success": "ok"}, safe=True, status=200)

    except Exception as e:
        logger.error(f"Erro ao excluir usuario: {e}")
        return JsonResponse({"error": f"{e}"}, safe=True, status=400)
