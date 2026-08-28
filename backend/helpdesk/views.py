# Importando os módulos necessários para o funcionamento do código.

from typing import Any
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import ParseError, UnsupportedMediaType
from rest_framework.request import Request
from drf_spectacular.utils import extend_schema, OpenApiParameter
# pyrefly: ignore [missing-import]
from drf_spectacular.types import OpenApiTypes
from .serializers import (
    HelpdeskErrorResponseSerializer,
    GetTokenResponseSerializer,
    GetImageResponseSerializer,
    FirstViewResponseSerializer,
    HistoryGetTicketResponseSerializer,
    EquipamentsForAlocateResponseSerializer,
    DateEquipamentsAlocateResponseSerializer,
    ChangeLastViewerResponseSerializer,
    LogErrorFrontendRequestSerializer,
    LogErrorFrontendResponseSerializer,
    GetTicketFilterResponseSerializer,
    UpdateChatResponseSerializer
)

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from smtplib import SMTP
from threading import Thread, local
from django.shortcuts import get_object_or_404, render, redirect
from django.views.decorators.csrf import requires_csrf_token
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from os import getenv, path
from re import findall
from django.middleware.csrf import get_token
from datetime import datetime
from django.utils import timezone
from .models import SupportTicket, TicketFile, Area
from services.ticket_files_processor import process_ticket_files
from services.ticket_service import (
    TECHNICAL_FILE_TYPE_PREFIX,
    add_technical_detail_message,
    add_technical_detail_file,
    verify_notification_call,
)
from services.machines_service import get_machine_model
from services.database_utils import get_database_connection
from services.frontend_logger import log_frontend_error
from django.core.serializers import serialize
from json import loads
from django.contrib.auth import logout
from base64 import b64encode
from magic import Magic
from os import getcwd
from django.db.models import Q
import mimetypes
from fpdf import FPDF
from re import findall, split as plt
from logging import basicConfig, getLogger, WARNING
from django.db import transaction
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_POST, require_GET
from django.utils.timezone import make_aware
from dotenv import load_dotenv
from django.core.handlers.wsgi import WSGIRequest
from django.views.decorators.cache import cache_page
from requests import get as getUrl
from tempfile import NamedTemporaryFile
from django.contrib.auth.models import User
from classes.mapping.chat_entry_conversation import ChatLogEntryConversation
from classes.exceptions.auth_exeption import AuthenticationError
from django.core.files.uploadedfile import UploadedFile
from fixdesk.permissions import (
    get_user_allowed_areas,
    is_technician,
    is_technician_for_area,
    user_can_access_ticket,
    user_can_manage_ticket,
)

# Configuração básica de logging
basicConfig(level=WARNING)
logger = getLogger(__name__)

load_dotenv()
smtp_host = str(getenv("SERVER_SMTP"))
smtp_port = int(getenv("SMPT_PORT", "587"))
mail_address = str(getenv("MAIL_FIXDESK"))
user_group = getenv("DJANGO_GROUP_USER", "Helpdesk_User") or "Helpdesk_User"
group_tech = getenv("DJANGO_GROUP_TECH")
types_str = getenv("VALID_TYPES")
mail_password = getenv("MAIL_PWD")

status_mapping = {"open": True, "close": False, "stop": None, "all": "All"}

_magic_local = local()

def get_magic_instance():
    if not hasattr(_magic_local, "instance"):
        _magic_local.instance = Magic()
    return _magic_local.instance


def send_mail(mail: str, msgm1: str, msgm2: str):
    """
    Envia um e-mail para o destinatário especificado.

    :param mail: Endereço de e-mail do destinatário.
    :param msgm1: Corpo da mensagem do e-mail.
    :param msgm2: Assunto do e-mail.
    """
    try:
        # Configurações do servidor de e-mail SMTP

        # Criar objeto de mensagem
        msg = MIMEMultipart()
        msg["From"] = mail_address
        msg["To"] = mail
        msg["Subject"] = msgm2

        # Corpo da mensagem
        msg.attach(MIMEText(msgm1, "plain"))

        server_smtp = SMTP(smtp_host, smtp_port)
        server_smtp.starttls()  # Ativar criptografia TLS

        # Enviar e-mail
        text_mail = msg.as_string()
        server_smtp.sendmail(mail_address, mail, text_mail)
        return server_smtp.quit()

    except Exception as e:
        logger.error(e)
        return None


@require_GET
@extend_schema(
    summary="Obter Token CSRF",
    description="Retorna um novo token CSRF e os dados do usuário logado.",
    responses={200: GetTokenResponseSerializer, 401: HelpdeskErrorResponseSerializer, 500: HelpdeskErrorResponseSerializer},
    tags=['Helpdesk']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_new_token(request):
    try:
        user = request.user
        # Verifica se o objeto 'user' é uma instância do modelo 'User' do Django.
        # Isso é crucial porque 'request.user' pode ser um 'AnonymousUser' (usuário não autenticado)
        # ou um objeto de usuário personalizado que não possui o atributo 'groups'.
        # A validação garante que operações com 'user.groups' sejam realizadas apenas em objetos 'User' válidos,
        # prevenindo 'AttributeError' e garantindo a segurança do acesso.
        if not isinstance(user, User):
            logger.error(f"User object {user} (type: {type(user)}) does not have a 'groups' attribute in get_new_token.")
            return redirect("/login")
        if is_technician(user) or user.groups.filter(name=user_group).exists() or user.is_superuser:
            csrf = get_token(request)
        else:
            return redirect("/login")

        return JsonResponse(
            {"token": csrf},
            status=200,
            safe=True,
        )
    except Exception as e:
        logger.error(e)
        return JsonResponse({"status": str(e)}, status=300, safe=True)


@require_GET
@extend_schema(
    summary="Obter áreas ativas",
    description="Retorna a lista de áreas ativas para abertura de chamados.",
    responses={200: OpenApiTypes.OBJECT},
    tags=['Helpdesk']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_active_areas(request):
    try:
        areas = Area.objects.filter(active=True).values("id", "code")
        formatted_areas = [
            {"respective_area": area["id"], "respective_area_code": area["code"]}
            for area in areas
        ]
        return JsonResponse({"areas": formatted_areas}, status=200, safe=True)
    except Exception as e:
        logger.error(e)
        return JsonResponse({"error": str(e)}, status=500, safe=True)


@never_cache
@require_GET
@extend_schema(
    summary="Carregar dados iniciais da central",
    description="Retorna os dados do usuário, máquinas e tickets associados.",
    responses={200: FirstViewResponseSerializer, 400: HelpdeskErrorResponseSerializer, 401: HelpdeskErrorResponseSerializer, 500: HelpdeskErrorResponseSerializer},
    tags=['Helpdesk']
)
@login_required(login_url="/login")
def first_view(request: WSGIRequest): # Define a view para a página inicial, acessível via GET e sem cache.
    """
    Renderiza a página inicial do sistema ('index.html') se o usuário estiver autenticado
    e pertencer a um dos grupos autorizados (usuário comum ou técnico).
    Redireciona para a página de login caso o usuário não esteja autenticado ou não tenha permissão.
    """
    if request.user.is_authenticated:
        try:
            user = request.user
            # Garante que o objeto 'user' é uma instância do modelo 'User' do Django.
            # Isso é essencial para acessar atributos como 'groups', pois 'request.user'
            # pode ser um 'AnonymousUser' para usuários não autenticados, que não possui 'groups'.
            if not isinstance(user, User):
                logger.error(f"User object {user} (type: {type(user)}) does not have a 'groups' attribute in first_view.")
                return redirect("/login")

            # Verifica se o usuário pertence ao grupo de usuários comuns ou é técnico.
            # Acesso é concedido se pertencer a qualquer um dos grupos autorizados.
            if is_technician(user) or user.groups.filter(name=user_group).exists() or user.is_superuser:
                return render(request, "index.html", {})
            else:
                return redirect("/login")
        except Exception as e:
            logger.error(e)
            return JsonResponse(
                {"error": f"Erro ao carregar a página inicial: {e}"}, status=300
            )
    else:
        return redirect("/login")


@requires_csrf_token
@login_required(login_url="/login")
@require_POST
@transaction.atomic
@extend_schema(
    summary="Submeter novo ticket",
    description="Endpoint para submissão de novos chamados de suporte.",
    responses={200: HelpdeskErrorResponseSerializer, 400: HelpdeskErrorResponseSerializer, 401: HelpdeskErrorResponseSerializer, 500: HelpdeskErrorResponseSerializer},
    tags=['Helpdesk']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_ticket(request):
    """
    Cria um novo chamado de suporte conforme os dados enviados pelo frontend.

    A função processa as informações do formulário, verifica se há imagens ou equipamentos
    associados ao chamado, e armazena os dados no banco de dados. Se uma imagem ou equipamento
    for enviado, o processamento correspondente é realizado antes da criação do chamado.

    :param request: Objeto HttpRequest contendo os dados do formulário.
    :return: JsonResponse com o ID do chamado criado ou mensagem de erro.
    """

    # Inicializando as variáveis com valor None
    try:
        form_data = {
            "company": request.POST.get("company"),
            "department": request.POST.get("department"),
            "mail": request.POST.get("mail"),
            "observation": request.POST.get("observation"),
            "occurrence": request.POST.get("occurrence"),
            "problemn": request.POST.get("problemn"),
            "respective_area": request.POST.get("respective_area"),
            "sector": request.POST.get("sector"),
            "start_date": request.POST.get("start_date"),
            "ticket_requester": request.POST.get("ticketRequester"),
        }

        # Processar e validar a data de início
        if not form_data["start_date"]:
            form_data["start_date"] = datetime.now().strftime("%Y-%m-%d %H:%M")
        else:
            form_data["start_date"] = make_aware(
                datetime.strptime(form_data["start_date"], "%Y-%m-%d %H:%M")
            )

        area_val = form_data.get("respective_area")
        area_obj = None
        if area_val:
            if str(area_val).isdigit():
                area_obj = Area.objects.filter(id=int(area_val), active=True).first()
            if not area_obj:
                area_obj = Area.objects.filter(code=str(area_val), active=True).first()
        
        if not area_obj:
            return JsonResponse({"error": "Área inválida ou inativa."}, status=400, safe=True)
        
        form_data["respective_area"] = area_obj

    except Exception as e:
        logger.error("Erro na função submitTicket:", e)
        return JsonResponse(
            {"error": f" Erro na Obtenção dos dados: {e}"},
            status=300,
            safe=True,
        )

    valid = False
    id = None
    denied_files = []
    # Verifica se há imagens anexadas no formulário
    if "image" in request.FILES:
        try:
            id, denied_files = process_files(request, form_data)
        except ValueError as e:
            logger.error(f"{e}")
            return JsonResponse(
                {"error": str(e)},
                status=300,
                safe=True,
            )

        valid = True

    pid = request.user.id

    if not valid:
        ticket = SupportTicket(
            ticketRequester=form_data["ticket_requester"],
            department=form_data["department"],
            mail=form_data["mail"],
            company=form_data["company"],
            sector=form_data["sector"],
            respective_area=form_data["respective_area"],
            occurrence=form_data["occurrence"],
            problemn=form_data["problemn"],
            observation=form_data["observation"],
            start_date=form_data["start_date"],
            PID=pid,
            equipament=request.POST.get("id_equipament"),
            date_alocate=request.POST.get("days_alocated"),
            open=True,
        )

        ticket.save()

        id = ticket.id

    return JsonResponse({"id": id, "denied_files": denied_files}, status=200, safe=True)


@transaction.atomic
def process_files(request: WSGIRequest, form_data: dict) -> tuple[int, list[str]]:
    """
    Processa e armazena arquivos enviados no chamado de suporte.

    A função recebe arquivos de imagem enviados no formulário, verifica sua validade
    e os associa a um chamado de suporte. Caso algum arquivo não seja válido,
    a função retorna um erro.

    :param request: Objeto WSGIRequest contendo os arquivos enviados.
    :param form_data: Dicionário com os dados do chamado.
    :return: ID do chamado e status HTTP (200 para sucesso, 400 para erro de arquivo, 300 para erro interno).
    """
    denied_files = []
    try:
        # Cria um novo chamado de suporte com os dados fornecidos
        ticket = SupportTicket(
            ticketRequester=form_data["ticket_requester"],
            department=form_data["department"],
            mail=form_data["mail"],
            company=form_data["company"],
            sector=form_data["sector"],
            respective_area=form_data["respective_area"],
            occurrence=form_data["occurrence"],
            problemn=form_data["problemn"],
            observation=form_data["observation"],
            start_date=form_data["start_date"],
            PID=request.user.pk,
            open=True,
        )
        ticket.save()
        images = request.FILES.getlist("image")
        mime = get_magic_instance()

        ticket_files_to_create = []
        for file in images:
            image_bytes = file.read()
            file.seek(0)
            file_type = mime.from_buffer(image_bytes)  # Determina o tipo de arquivo

            # Verifica se o arquivo enviado é válido
            verify_valid_files = is_valid_file(file, file_type)
            if not verify_valid_files:
                denied_files.append(file_type)
                continue

            ticket_files_to_create.append(
                TicketFile(
                    ticket=ticket,
                    file_name=file.name,
                    file_type=file_type,
                    data=image_bytes,
                )
            )

        if ticket_files_to_create:
            TicketFile.objects.bulk_create(ticket_files_to_create, batch_size=100)

        return (
            ticket.id,
            denied_files,
        )

    except Exception as e:
        logger.error(f"Erro no processamento de imagem: {e}")
        raise ValueError(f"Erro no processamento de imagem: {denied_files}")


def is_valid_file(file: UploadedFile, file_type: str) -> bool:
    """
    Valida se o arquivo enviado possui um tipo ou extensão permitido.

    Compara o tipo do arquivo e a extensão identificada com a lista de tipos
    válidos configurada na variável de ambiente `VALID_TYPES`.

    Args:
        file: Objeto do arquivo enviado para validação.
        file_type: Descrição ou metadado do tipo de arquivo.

    Returns:
        True se o arquivo for de um tipo permitido, False caso contrário ou em caso de erro.
    """
    try:
        file_type_clean = plt(r",|\(", file_type)[0].strip().lower()
        if not types_str:
            logger.error(
                "A variável de ambiente VALID_TYPES não está definida ou está vazia."
            )
            return False
        items = types_str.strip("[]").split(",")

        array_data = [item.strip().strip("'\"") for item in items]
        if any(ext.lower() in file_type_clean for ext in array_data):
            return True

        guessed_type = mimetypes.guess_type(str(file))[0]
        return (
            guessed_type.lower() in (ext.lower() for ext in array_data)
            if guessed_type
            else False
        )
    except Exception as e:
        logger.error(e)
        return False


@login_required(login_url="/login")
@require_GET
@cache_page(60 * 1)
@extend_schema(
    summary="Histórico de chamados",
    description="Retorna o histórico inicial de tickets baseando-se no setor/cargo do usuário.",
    responses={200: HelpdeskErrorResponseSerializer, 400: HelpdeskErrorResponseSerializer, 401: HelpdeskErrorResponseSerializer, 500: HelpdeskErrorResponseSerializer},
    tags=['Helpdesk']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def history(request: WSGIRequest):
    """
    Renderiza a página de histórico de chamados ('index.html') para usuários autenticados.

    Esta view verifica se o usuário está autenticado e se pertence a um dos grupos autorizados
    (usuário comum ou técnico) antes de permitir o acesso à página de histórico.
    Redireciona para a página de login se o usuário não atender aos requisitos de autenticação/autorização.
    """
    user = request.user
    if not isinstance(user, User) or not (
        is_technician(user) or user.groups.filter(name=user_group).exists() or user.is_superuser
    ):
        return redirect("/login")
    return render(request, "index.html", {}) 


@login_required(login_url="/login")
@never_cache
@require_GET
@extend_schema(
    summary="Obter tickets filtrados para histórico",
    description="Obtém um número X de tickets com base no status e ordenação solicitados.",
    responses={200: HistoryGetTicketResponseSerializer, 400: HelpdeskErrorResponseSerializer, 401: HelpdeskErrorResponseSerializer, 500: HelpdeskErrorResponseSerializer},
    tags=['Helpdesk']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def history_get_ticket(request, quantity: int, usr: str, status: str, order: str):
    """
    Recupera uma lista de chamados formatada em JSON para o histórico.

    O parâmetro `usr` da URL é ignorado para fins de autorização — o escopo
    dos chamados é determinado exclusivamente por `request.user`. No histórico
    ("Meus Chamados"), qualquer usuário autenticado (seja técnico ou comum)
    visualiza exclusivamente os chamados onde é o solicitante (por PID ou username).
    """
    _ALLOWED_HISTORY_ORDERS: frozenset[str] = frozenset({"id", "-id", "start_date", "-start_date"})
    _MAX_QUANTITY: int = 200

    try:
        authenticated_user = request.user
        if not isinstance(authenticated_user, User):
            return JsonResponse({"status": "Invalid Credentials"}, status=402, safe=True)

        if not (
            is_technician(authenticated_user)
            or authenticated_user.groups.filter(name=user_group).exists()
            or authenticated_user.is_superuser
        ):
            return JsonResponse({"status": "Invalid Credentials"}, status=402, safe=True)

        csrf = get_token(request)

        safe_quantity: int = min(quantity, _MAX_QUANTITY)
        safe_order: str = order if order in _ALLOWED_HISTORY_ORDERS else "-id"

        base_filters: Q = Q(PID=authenticated_user.pk) | Q(ticketRequester=authenticated_user.username)

        if status.lower() not in {"all", "null"} and status in status_mapping:
            base_filters &= Q(open=status_mapping[status])

        tickets = SupportTicket.objects.filter(base_filters).order_by(safe_order)[:safe_quantity]

        ticket_objects = [
            {**loads(serialize("json", [ticket]))[0]["fields"], "id": ticket.id}
            for ticket in tickets
        ]

        return JsonResponse({"tickets": ticket_objects, "token": csrf}, status=200, safe=True)
    except Exception as e:
        logger.error(f"Erro ao tentar obter o historico: {e}")
        return JsonResponse({"status": "Invalid Credentials"}, status=402, safe=True)


@require_POST
@extend_schema(
    summary="Logout do usuário",
    description="Realiza logout do usuário autenticado atual.",
    responses={302: None, 500: HelpdeskErrorResponseSerializer},
    tags=['Helpdesk']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def exit(request: WSGIRequest):
    """
    Realiza o logout do usuário e redireciona para a página inicial.

    :param request: Objeto WSGIRequest contendo os dados da requisição.
    :return: Redirecionamento para a página inicial ou resposta de erro em caso de falha.
    """
    try:
        logout(request)
        return redirect("/")
    except Exception as e:
        logger.exception(
            "Erro inesperado ao fazer logout"
        )  # `logger.exception` já inclui traceback
        return JsonResponse(
            {"error": "Não foi possível encerrar a sessão."},
            status=500,
        )


@login_required(login_url="/login")
@requires_csrf_token
@never_cache
@require_POST
def send_technical_detail_message(request: WSGIRequest, id: int):
    """
    Endpoint para inclusão de notas/mensagens técnicas (restrito a técnicos autorizados).
    POST /helpdesk/ticket/<int:id>/technical-details/message/
    """
    user = request.user
    if not isinstance(user, User) or not is_technician(user):
        logger.warning(
            f"Acesso negado para notas técnicas no ticket {id} pelo usuário {user}."
        )
        return JsonResponse({"error": "Acesso não autorizado"}, status=403, safe=True)

    try:
        ticket = SupportTicket.objects.get(id=id)
        if not user_can_manage_ticket(user, ticket):
            logger.warning(
                f"Acesso negado para notas técnicas no ticket {id} pelo usuário {user}."
            )
            return JsonResponse({"error": "Acesso não autorizado"}, status=403, safe=True)

        body = loads(request.body.decode("utf-8"))
        message = body.get("message") or body.get("chat") or ""
        date = body.get("date") or datetime.now().strftime("%d/%m/%Y")
        hours = body.get("hours") or datetime.now().strftime("%H:%M")

        details, record = add_technical_detail_message(
            id=id, message=message, date=date, hours=hours, user=user
        )
        return JsonResponse(
            {
                "detail": "Mensagem técnica adicionada com sucesso",
                "details": details,
                "record": record,
            },
            status=200,
            safe=True,
        )
    except SupportTicket.DoesNotExist:
        return JsonResponse({"error": "Chamado não encontrado"}, status=404, safe=True)
    except ValueError as e:
        logger.error(f"Erro de validação ao adicionar nota técnica no ticket {id}: {e}")
        return JsonResponse({"error": str(e)}, status=400, safe=True)
    except Exception as e:
        logger.error(f"Erro ao adicionar nota técnica no ticket {id}: {e}")
        return JsonResponse(
            {"error": f"Erro interno ao salvar nota técnica: {e}"},
            status=500,
            safe=True,
        )


@login_required(login_url="/login")
@requires_csrf_token
@never_cache
@require_POST
def upload_technical_detail_file(request: WSGIRequest, id: int):
    """
    Endpoint para envio de arquivos anexos técnicos (restrito a técnicos autorizados).
    POST /helpdesk/ticket/<int:id>/technical-details/file/
    """
    user = request.user
    if not isinstance(user, User) or not is_technician(user):
        logger.warning(
            f"Acesso negado para arquivos técnicos no ticket {id} pelo usuário {user}."
        )
        return JsonResponse({"error": "Acesso não autorizado"}, status=403, safe=True)

    try:
        ticket = SupportTicket.objects.get(id=id)
        if not user_can_manage_ticket(user, ticket):
            logger.warning(
                f"Acesso negado para arquivos técnicos no ticket {id} pelo usuário {user}."
            )
            return JsonResponse({"error": "Acesso não autorizado"}, status=403, safe=True)

        files = request.FILES.getlist("files") or request.FILES.getlist("file")
        date = request.POST.get("date") or datetime.now().strftime("%d/%m/%Y")
        hours = request.POST.get("hours") or datetime.now().strftime("%H:%M")

        details, saved_files = add_technical_detail_file(
            id=id, files=files, date=date, hours=hours, user=user
        )
        return JsonResponse(
            {
                "detail": "Arquivo técnico adicionado com sucesso",
                "details": details,
                "files": saved_files,
            },
            status=200,
            safe=True,
        )
    except SupportTicket.DoesNotExist:
        return JsonResponse({"error": "Chamado não encontrado"}, status=404, safe=True)
    except ValueError as e:
        logger.error(f"Erro de validação ao enviar arquivo técnico no ticket {id}: {e}")
        return JsonResponse({"error": str(e)}, status=400, safe=True)
    except Exception as e:
        logger.error(f"Erro ao enviar arquivo técnico no ticket {id}: {e}")
        return JsonResponse(
            {"error": f"Erro interno ao salvar arquivo técnico: {e}"},
            status=500,
            safe=True,
        )


def _technical_file_names(details: str | None) -> list[str]:
    return findall(
        r"adicionou o arquivo (.*?)(?=\],\[Hours:)",
        details or "",
    )


def _technical_files_for_ticket(ticket: SupportTicket):
    technical_names = _technical_file_names(ticket.details)
    return ticket.files.filter(
        Q(file_type__startswith=TECHNICAL_FILE_TYPE_PREFIX)
        | Q(file_name__in=technical_names)
    )


def _is_technical_user(user: User) -> bool:
    return isinstance(user, User) and is_technician(user)


@login_required(login_url="/login")
@never_cache
@require_GET
def list_technical_detail_files(request: WSGIRequest, id: int):
    """Lista os anexos técnicos de um ticket para usuários técnicos autorizados."""
    ticket = get_object_or_404(SupportTicket, id=id)
    user = request.user
    if not isinstance(user, User) or not user_can_manage_ticket(user, ticket):
        return JsonResponse({"error": "Acesso não autorizado"}, status=403)

    files = [
        {
            "id": file.id,
            "name": file.file_name or "Arquivo sem nome",
            "type": str(file.file_type or "").removeprefix(
                TECHNICAL_FILE_TYPE_PREFIX
            ),
            "size": len(file.data or b""),
            "url": f"/helpdesk/ticket/{id}/technical-details/files/{file.id}/",
        }
        for file in _technical_files_for_ticket(ticket)
    ]
    return JsonResponse({"files": files}, status=200)


@login_required(login_url="/login")
@never_cache
@require_GET
def download_technical_detail_file(
    request: WSGIRequest, id: int, file_id: int
):
    """Entrega o conteúdo de um anexo técnico somente para a equipe técnica autorizada."""
    ticket = get_object_or_404(SupportTicket, id=id)
    user = request.user
    if not isinstance(user, User) or not user_can_manage_ticket(user, ticket):
        return JsonResponse({"error": "Acesso não autorizado"}, status=403)

    file = get_object_or_404(_technical_files_for_ticket(ticket), id=file_id)
    file_name = (file.file_name or "arquivo").replace("\r", "").replace("\n", "")
    safe_file_name = file_name.replace(chr(34), "")
    content_type = mimetypes.guess_type(file_name)[0] or "application/octet-stream"
    response = HttpResponse(file.data, content_type=content_type)
    response["Content-Disposition"] = f'inline; filename="{safe_file_name}"'
    return response


@login_required(login_url="/login")
@requires_csrf_token
@never_cache
@transaction.atomic
@extend_schema(
    summary="Detalhes e manipulação de um ticket",
    description="Permite visualizar detalhes, fechar, abrir e alterar tickets específicos.",
    responses={200: HelpdeskErrorResponseSerializer, 400: HelpdeskErrorResponseSerializer, 500: HelpdeskErrorResponseSerializer},
    tags=['Helpdesk']
)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def ticket(request: WSGIRequest, id: int):
    """
    View central para manipulação de um ticket individual.
    POST: Atualiza o técnico responsável, chat ou status do ticket.
    GET: Recupera os dados completos do ticket para visualização, validando permissões.
    """
    if request.method == "POST":
        try:
            req_data = getattr(request, "data", None)
            body_data = (
                req_data
                if hasattr(request, "data") and isinstance(req_data, dict)
                else loads(request.body.decode("utf-8"))
            )
            resp_tech_val = body_data.get("responsible_technician")
            responsible_technician: str | None = (
                str(resp_tech_val) if resp_tech_val is not None else None
            )
            tech_val = body_data.get("technician")
            technician: str | None = str(tech_val) if tech_val is not None else None
            date_val = body_data.get("date")
            date: str | None = str(date_val) if date_val is not None else None
            hours_val = body_data.get("hours")
            hours: str | None = str(hours_val) if hours_val is not None else None
            tech_mail_val = body_data.get("techMail")
            techMail: str | None = str(tech_mail_val) if tech_mail_val is not None else None
            mail_val = body_data.get("mail")
            mail: str | None = str(mail_val) if mail_val is not None else None
            chat_val = body_data.get("chat")
            chat: str | None = str(chat_val) if chat_val is not None else None
            user_val = body_data.get("user")
            user: str | None = str(user_val) if user_val is not None else None
            helpdesk_val = body_data.get("helpdesk")
            helpdesk: str | None = str(helpdesk_val) if helpdesk_val is not None else None

            # Lógica para alteração de técnico responsável
            if "responsible_technician" in body_data:
                if not isinstance(request.user, User):
                    logger.error(f"Falha na alteração de técnico: Objeto request.user inválido para o ticket {id}.")
                    return JsonResponse(
                        {"error": "Usuário inválido"}, status=400, safe=True
                    )

                username = request.user.username

                try:
                    chat, technician = change_responsible_technician(
                        id,
                        responsible_technician,
                        technician,
                        date,
                        hours,
                        techMail,
                        mail,
                        username,
                    )
                except ValueError as e:
                    logger.error(f"Erro de validação ao transferir o ticket {id}: {e}")
                    return JsonResponse({"error": str(e)}, status=400, safe=True)
                except Exception as e:
                    logger.error(f"Erro sistêmico ao transferir o ticket {id}: {e}")
                    return JsonResponse(
                        {"error": f"Erro ao transferir o chamado: {e}"},
                        status=300,
                        safe=True,
                    )

                ticket_obj = SupportTicket.objects.get(id=id)
                tickets_data = SupportTicket.objects.filter(respective_area=ticket_obj.respective_area)
                total_tickets = tickets_data.count()
                return JsonResponse(
                    {"total": total_tickets},
                    status=200,
                    safe=True,
                )

            # Atualização de mensagens do chat (conversa entre usuário e técnico)
            if "chat" in body_data:
                try:
                    chat = updating_chat_change_sender(
                        id, chat, date, hours, user, helpdesk
                    )
                except Exception as e:
                    logger.error(f"Erro ao atualizar o chat do ticket {id}: {e}")
                    return JsonResponse(
                        {"error": f"Erro ao atualizar o chat: {e}"},
                        status=400,
                        safe=True,
                    )
                return JsonResponse({"chat": chat}, status=200, safe=True)

            # Fluxo de alteração de status (Abrir, Fechar, Aguardar)
            if "status" in body_data:
                status = body_data.get("status")
                if status == "close":
                    return ticket_close(id, technician, date, hours, mail)

                elif status == "open":
                    return ticket_open(id, date, technician, hours, techMail, mail)

                elif status == "stop":
                    return ticket_stop(id, technician, date, hours, mail)

            # Verifica se a opção de download do ticket foi solicitada
            if "HTTP_DOWNLOAD_TICKET" in request.META:
                return create_pdf(id)

        except UnsupportedMediaType as e:
            return JsonResponse({"error": str(e)}, status=415)
        except Exception as e:
            logger.error(f"Erro inesperado no processamento POST do ticket {id}: {e}")
            return JsonResponse({"Error": f"Erro inesperado {e}"}, status=304)

    if request.method == "GET":
        """
        Recupera os dados para exibição do chamado.
        """
        try:
            ticket = get_object_or_404(SupportTicket, id=id)
            req_user = request.user

            if isinstance(req_user, User):
                if not user_can_access_ticket(req_user, ticket):
                    logger.warning(f"Acesso negado: Usuário {req_user.username} tentou acessar o ticket {id} sem permissão.")
                    return redirect("/helpdesk")

            # Processamento de arquivos do ticket (imagens ou outros arquivos)
            public_files = ticket.files.exclude(
                file_type__startswith=TECHNICAL_FILE_TYPE_PREFIX
            ).exclude(file_name__in=_technical_file_names(ticket.details))
            image_data, content_file, name_file = process_ticket_files(public_files)

            # Serializa as informações do ticket
            serialized_ticket = {
                "ticketRequester": ticket.ticketRequester,
                "department": ticket.department,
                "mail": ticket.mail,
                "company": ticket.company,
                "sector": ticket.sector,
                "respective_area": ticket.respective_area.id if ticket.respective_area else None,
                "respective_area_code": ticket.respective_area.code if ticket.respective_area else None,
                "occurrence": ticket.occurrence,
                "problemn": ticket.problemn,
                "observation": ticket.observation,
                "start_date": ticket.start_date,
                "PID": ticket.PID,
                "responsible_technician": ticket.responsible_technician,
                "id": ticket.id,
                "chat": ticket.chat,
                "file": image_data,
                "open": ticket.open,
                "name_file": name_file,
                "content_file": content_file,
                "equipament": ticket.equipament,
                "date_alocate": ticket.date_alocate,
                "details": ticket.details,
            }

            return JsonResponse({"data": serialized_ticket}, status=200)

        except Exception as e:
            logger.error(f"Erro ao recuperar dados do chamado {id}: {e}")
            return JsonResponse(
                {"Error": f"Erro inesperado ao obter o chamado: {e}"}, status=304
            )
    else:
        return JsonResponse({"Error": "Método não permitido"}, status=405, safe=True)


@transaction.atomic
def update_tech_details(
    chat: str, id: int, date: str, hours: str, request: WSGIRequest
):
    """
    Atualiza os detalhes técnicos do ticket com as informações fornecidas.

    :param chat: O histórico de chat que será adicionado aos detalhes técnicos.
    :param id: O ID do ticket que será atualizado.
    :param date: A data associada à atualização.
    :param hours: As horas associadas à atualização.
    :param request: A requisição que contém informações do usuário (nome) que está fazendo a atualização.

    :return: Retorna um código de status (200) e os detalhes atualizados ou um código de erro (300) em caso de falha.
    """
    try:
        # Recupera o ticket correspondente ao ID fornecido
        ticket = SupportTicket.objects.get(id=id)

        if not isinstance(request.user, User):
            logger.error("Usuário não autenticado ou inválido")
            raise AuthenticationError("Usuário não autenticado ou inválido")

        full_name = request.user.get_full_name().strip() or "Usuário"

        entry = ChatLogEntryConversation(
            date=str(date),
            user=full_name,
            message=chat,
            hours=str(hours),
        )

        current_details = str(getattr(ticket, "details", "") or "")
        SupportTicket.objects.filter(id=id).update(details=current_details + str(entry))

        ticket.refresh_from_db()

        chat_content: str = str(getattr(ticket, "details", "") or "")

        return chat_content
    except Exception as e:
        # Registra o erro e retorna um código de erro com a mensagem
        logger.error(e)
        raise e


class CustomPDF(FPDF):
    def __init__(self, footer_path: str, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.footer_path = footer_path

    def footer(self):
        # Posição a 25 unidades da parte inferior
        self.set_y(-25)
        self.image(self.footer_path, x=0, y=self.get_y(), w=self.w)


def create_pdf(id: int, user: User | None = None):
    """
    Gera um PDF com informações detalhadas sobre o chamado, incluindo dados gerais, informações sobre a máquina,
    e o histórico de chat do ticket.

    :param id: Identificador único do ticket de suporte.
    :param user: Instância opcional do usuário para validação de acesso.
    :return: Código de status HTTP e o PDF gerado em base64, ou código de erro e a mensagem de exceção.
    """

    try:
        ticket = SupportTicket.objects.get(id=id)
        if user and isinstance(user, User) and not user_can_access_ticket(user, ticket):
            return JsonResponse({"error": "Acesso não autorizado"}, status=403, safe=True)

        helpdesk_dir = path.dirname(path.abspath(__file__))

        # Obtém o diretório pai (onde helpdesk e files estão localizados)
        project_root = path.dirname(helpdesk_dir)

        fixdesk_logo = path.join(project_root, "files", "fixdesk.png")

        pdf.add_page()

        directory = getcwd()
        pdf.add_font("Arial", "", f"{directory}/arial.ttf")

        # Adiciona o título do chamado ao PDF
        pdf.image(lupatech_logo, x=10, y=0 + 5, w=10)
        pdf.image(fixdesk_logo, x=200, y=0 + 5, w=10)
        pdf.set_text_color(255, 0, 0)  # Vermelho
        pdf.set_font("Arial", style="B", size=20)  # Arial em negrito, tamanho 20
        pdf.cell(190, 5, text=f"CHAMADO {ticket.id}", ln=False, align="C")
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Arial", style="", size=12)

        # Adiciona informações do ticket ao PDF
        add_ticket_info_to_pdf(ticket, pdf)

        # Se o problema for "Alocação de Máquina", adiciona informações sobre a máquina ao PDF
        if ticket.problemn == "Alocação de Máquina":
            add_machine_info_to_pdf(ticket, pdf)

        # Se o ticket tiver chat, adiciona o histórico do chat ao PDF
        if ticket.chat:
            add_chat_to_pdf(ticket.chat, pdf)

        pdf_base64 = b64encode(pdf.output(dest="S")).decode("utf-8")

        return JsonResponse({"pdf": pdf_base64}, status=200, safe=True)

    except Exception as e:
        logger.error(f"Erro ao gerar PDF: {e}")
        return JsonResponse(
            {"Error": f"Erro ao gerar PDF: {str(e)}"}, status=300, safe=True
        )


def add_ticket_info_to_pdf(ticket: SupportTicket, pdf: FPDF):
    """
    Adiciona informações detalhadas do ticket de suporte ao PDF, incluindo dados como data de abertura,
    usuário, departamento, unidade, setor, ocorrência, problema, setor responsável, técnico responsável,
    observações e status do ticket.

    :param ticket: O ticket de suporte cujas informações serão adicionadas ao PDF.
    :param pdf: A instância do FPDF onde as informações do ticket serão adicionadas.
    """

    # Adiciona a data de abertura do ticket ao PDF, formatada como dd/mm/yyyy
    pdf.set_x(10)
    pdf.set_y(30)

    def add_linha(label, value, align="L"):
        pdf.cell(50, 10, text=label, border=1, align="L")
        pdf.cell(140, 10, text=value, border=1, ln=True, align=align)

    add_linha("Data de Abertura:", ticket.start_date.strftime("%d/%m/%Y"))
    add_linha("Usuário:", ticket.ticketRequester)
    add_linha("Departamento:", ticket.department)
    add_linha("Unidade:", ticket.company)
    add_linha("Setor:", ticket.sector)
    add_linha("Ocorrência:", ticket.occurrence)
    add_linha("Problema:", ticket.problemn)
    add_linha("Setor Responsável:", ticket.respective_area)
    add_linha(
        "Técnico Responsável:", ticket.responsible_technician or "Técnico não Atribuído"
    )

    # Para observação que pode ser longa, usamos multi_cell com borda
    pdf.cell(50, 10, text="Observação:", border=1, align="L")
    x, y = pdf.get_x(), pdf.get_y()
    pdf.multi_cell(
        140, 10, text=ticket.observation or "Informação não fornecida", border=1
    )
    pdf.set_xy(
        x + 140, y + 10 * (pdf.get_y() - y) / 10
    )  # Ajusta a posição para continuar

    pdf.set_x(10)
    add_linha("Status:", "Em Aberto" if ticket.open else "Finalizado")


def add_machine_info_to_pdf(ticket: SupportTicket, pdf: FPDF):
    """
    Adiciona informações sobre a máquina alocada no ticket de suporte ao PDF, incluindo o nome da máquina,
    o modelo e uma imagem representativa do equipamento.
    
    Utiliza o serviço get_machine_model para recuperar os dados da máquina de forma eficiente,
    evitando overhead de requisições HTTP internas.
    
    Args:
        ticket (SupportTicket): O ticket de suporte que contém informações sobre a máquina alocada
        pdf (FPDF): A instância do FPDF onde as informações sobre a máquina serão adicionadas
    """
    if not ticket.equipament:
        logger.warning(f"Equipamento (MAC) não informado para o ticket {ticket.id}")
        return

    try:
        model = get_machine_model(ticket.equipament)
        
        if model is None:
            logger.warning(f"Modelo não encontrado para o MAC {ticket.equipament}")
            return
        
        model_adjust = model.strip()
        model_adjust2 = model.replace(" ", "").lower()
        
        pdf.cell(
            190, 10, text=f"Máquina Alocada: {ticket.equipament}", ln=True, align="L"
        )
        pdf.cell(190, 10, text=f"Modelo: {model_adjust}", ln=True, align="L")
        y_atual = pdf.get_y()
        url = f"https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Mycomputer.jpg/1280px-Mycomputer.jpg?utm_source=en.wikibooks.org&utm_campaign=index&utm_content=thumbnail"
        
        response = getUrl(url)
        
        if response.status_code == 200:
            with NamedTemporaryFile(delete=True, suffix=".png") as temp_image:
                temp_image.write(response.content)
                temp_image.flush()
                
                pdf.image(
                    temp_image.name, x=10, y=y_atual + 5, w=50
                )
    except Exception as e:
        logger.error(f"Erro ao adicionar Maquina ao PDF: {e}")


def agrupar_chat_entries(entries: list[dict]) -> list[dict]:
    grouped = []
    current = {}

    for entry in entries:
        key = list(entry.keys())[0]
        value = entry[key]

        current[key] = value

        # Quando tivermos "Hours", consideramos o registro completo
        if key == "Hours":
            grouped.append(current)
            current = {}

    return grouped


def add_chat_to_pdf(chat: str, pdf: FPDF):
    """
    Adiciona o histórico de chat ao PDF, incluindo as mensagens do sistema, técnico e usuário,
    agrupadas por data e hora.

    :param chat: O histórico de chat, geralmente em formato de string a ser convertido para um dicionário.
    :param pdf: A instância do FPDF onde o histórico de chat será adicionado.
    """

    # Converte o histórico de chat em uma lista de dicionários
    chat_dicts_raw = convert_to_dict(chat)
    chat_dicts = agrupar_chat_entries(chat_dicts_raw)

    pdf.add_page()

    pdf.set_text_color(255, 0, 0)
    pdf.set_font("Arial", style="B", size=20)
    pdf.cell(190, 10, text="CHAT", ln=True, align="C")

    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", style="", size=12)
    current_date = None

    for entry in chat_dicts:
        entry_date = entry.get("Date")
        system_msg = entry.get("System")
        technician_msg = entry.get("Technician")
        user_msg = entry.get("User")
        entry_hour = entry.get("Hours")

        if entry_date != current_date:
            current_date = entry_date
            pdf.set_fill_color(240, 240, 255)
            pdf.cell(190, 10, text=str(current_date), ln=True, align="C", fill=True)

        if system_msg:
            pdf.set_fill_color(240, 240, 255)
            pdf.cell(
                190,
                10,
                text=f"{system_msg} - {entry_hour}",
                ln=True,
                align="C",
                fill=True,
            )

        if technician_msg:
            pdf.set_fill_color(240, 240, 255)
            pdf.cell(
                190,
                10,
                text=f"{technician_msg} - {entry_hour}",
                ln=True,
                align="L",
                fill=True,
            )

        if user_msg:
            pdf.set_fill_color(240, 240, 255)
            pdf.cell(
                190,
                10,
                text=f"{user_msg} - {entry_hour}",
                ln=True,
                align="L",
                fill=True,
            )


@transaction.atomic
def ticket_stop(id: int, technician: str | None, date: str | None, hours: str | None, mail: str | None, user: User | None = None):
    """
    Altera o status do ticket para 'em aguardo', registrando a ação do técnico e enviando uma notificação.

    :param id: Identificador único do ticket de suporte.
    :param technician: Nome do técnico que está colocando o ticket em aguardo.
    :param date: Data em que o ticket foi colocado em aguardo.
    :param hours: Hora em que o ticket foi colocado em aguardo.
    :param mail: Endereço de e-mail para onde será enviado a notificação.
    :param user: Instância opcional do usuário para validação de acesso.
    :return: Código de status HTTP e a mensagem de status do ticket.
    """

    try:
        ticket = get_object_or_404(SupportTicket, id=id)
        if user and isinstance(user, User) and not user_can_manage_ticket(user, ticket):
            return JsonResponse({"Error": "Acesso não autorizado"}, status=403, safe=True)

        current_responsible_technician = ticket.responsible_technician
        if current_responsible_technician == None:
            return JsonResponse(
                {"Error": "Tecnico não Definido"}, status=304, safe=True
            )

        if ticket.open == None:
            return JsonResponse(
                {"Error": "Chamado já esta em aguardo"}, status=204, safe=True
            )

        # Divide o nome do técnico responsável para realizar a verificação
        partes_nome_pesquisa = current_responsible_technician.split()
        present = all(parte in (technician or "") for parte in partes_nome_pesquisa)

        if present:
            ticket.open = None
            ticket.chat = (ticket.chat or "") + f",[[Date:{date}],[System: {technician} Deixou esse chamado em aguardo],[Hours:{hours}]]"
            ticket.save()

            msg = f"{technician} Deixou esse chamado em aguardo"
            msg2 = f"Chamado {ticket.id} em aguardo"

            task = Thread(
                target=send_mail,
                args=(mail, msg, msg2),
            )
            task.start()

            return JsonResponse({"Sucess":"Chamado em aguardo"},status=200, safe=True)
        else:
            return JsonResponse(
                {"Error": "Tecnico não é o responsável pelo chamado"},
                status=304,
                safe=True,
            )

    # Captura e loga exceções, retornando erro genérico
    except Exception as e:
        logger.error(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=304, safe=True)


@transaction.atomic
def ticket_close(id: int, technician: str | None, date: str | None, hours: str | None, mail: str | None, user: User | None = None):
    """
    Altera o status do chamado para finalizado e envia uma notificação por e-mail.

    :param id: Identificador único do ticket de suporte.
    :param technician: Nome do técnico responsável pela finalização do chamado.
    :param date: Data em que o chamado foi finalizado.
    :param hours: Hora em que o chamado foi finalizado.
    :param mail: Endereço de e-mail para o envio da notificação.
    :param user: Instância opcional do usuário para validação de acesso.
    :return: Código de status e mensagem de sucesso ou erro.
    """
    ticket = get_object_or_404(SupportTicket, id=id)
    if user and isinstance(user, User) and not user_can_manage_ticket(user, ticket):
        return JsonResponse({"Error": "Acesso não autorizado"}, status=403, safe=True)

    current_responsible_technician = ticket.responsible_technician

    if current_responsible_technician == None:
        return JsonResponse({"Error": "Tecnico não Definido"}, status=304)

    if ticket.open == False:
        return JsonResponse({"Error": "Chamado já esta finalizado"}, status=205)

    # Divide o nome do técnico responsável para realizar a verificação
    partes_nome_pesquisa = current_responsible_technician.split()
    present = all(parte in (technician or "") for parte in partes_nome_pesquisa)

    # Se o técnico que está tentando finalizar o chamado é o técnico responsável
    if present:
        ticket.open = False
        ticket.chat = (ticket.chat or "") + f",[[Date:{date}],[System: {technician} Finalizou o Chamado],[Hours:{hours}]]"

        ticket.technician_mail = None

        current_date = timezone.now()

        ticket.end_date = current_date

        ticket.save()

        msg = f"{technician} Finalizou o Chamado"
        msg2 = f"Chamado {ticket.id} finalizado com sucesso!!"

        task = Thread(
            target=send_mail,
            args=(mail, msg, msg2),
        )
        task.start()

        return JsonResponse({"Success":"Chamado Finalizado"}, status=200, safe=True)
    else:
        return JsonResponse(
            {"Error": "Identificado que o Tecnico não é o atribuido ao Chamado"},
            status=304,
        )


@transaction.atomic
def ticket_open(
    id: int, date: str | None, technician: str | None, hours: str | None, techMail: str | None, mail: str | None, user: User | None = None
):
    """
    Altera o status do ticket para 'aberto', registrando a ação do técnico e enviando uma notificação.

    :param id: Identificador único do ticket de suporte.
    :param date: Data em que o chamado foi reaberto.
    :param technician: Nome do técnico que reabriu o ticket.
    :param hours: Hora em que o chamado foi reaberto.
    :param techMail: E-mail do técnico responsável pela reabertura do ticket.
    :param mail: E-mail para onde será enviado a notificação sobre a reabertura.
    :param user: Instância opcional do usuário para validação de acesso.
    :return: Nenhum valor de retorno, mas o ticket é atualizado e uma notificação é enviada.
    """

    ticket = get_object_or_404(SupportTicket, id=id)
    if user and isinstance(user, User) and not user_can_manage_ticket(user, ticket):
        return JsonResponse({"Error": "Acesso não autorizado"}, status=403, safe=True)

    try:
        if ticket.open == True:
            return JsonResponse({"Error": "Chamado já está aberto."}, status=206)

        ticket.open = True
        ticket.chat = (ticket.chat or "") + f",[[Date:{date}],[System: {technician} Reabriu e atendeu o Chamado],[Hours:{hours}]]"
        ticket.technician_mail = techMail
        ticket.save()

        msg = f"{technician} Reabriu o Chamado"
        msg2 = f"Reabertura do chamado {ticket.id}"

        task = Thread(
            target=send_mail,
            args=(mail, msg, msg2),
        )

        task.start()

        tickets_data = SupportTicket.objects.filter(respective_area=ticket.respective_area)
        total_tickets = tickets_data.count()

        return JsonResponse({"total": total_tickets}, status=200, safe=True)

    # Captura e loga exceções caso ocorram durante o processo
    except Exception as e:
        logger.error(e)


def get_user_by_full_name(full_name):
    parts = full_name.split()
    first_name = parts[0]
    last_name = parts[1] if len(parts) > 1 else ""
    return User.objects.filter(first_name=first_name, last_name=last_name).first()


@transaction.atomic
def change_responsible_technician(
    id: int,
    responsible_technician: str | None,
    technician: str | None,
    date: str | None,
    hours: str | None,
    techMail: str | None,
    mail: str | None,
    username: str,
):
    """
    Atualiza o técnico responsável por um chamado de suporte e registra a mudança no chat do chamado.

    :param body: Dicionário contendo os dados da requisição, incluindo o novo técnico responsável, o técnico atual,
                 a data da mudança, o horário e os e-mails envolvidos.
    :param id: Identificador único do chamado de suporte a ser atualizado.
    :return: Uma tupla contendo o código de status HTTP, a mensagem do chat atualizada e o novo técnico responsável.
    """

    if not all([responsible_technician, technician, date, hours, techMail, mail]):
        raise ValueError("Campos obrigatórios ausentes")
    try:
        ticket = SupportTicket.objects.get(id=id)

        if not ticket.chat:
            # Caso não haja mensagens no chat, cria o primeiro registro de atendimento
            ticket.chat = f"[[Date:{date}],[System: {responsible_technician} atendeu ao Chamado],[Hours:{hours}]],"

            # Se um e-mail de usuário estiver disponível, envia uma notificação por e-mail
            if mail:
                msg = f"{technician} atendeu ao Chamado"  # Mensagem do e-mail
                msg2 = f"Atendimento do Chamado {ticket.id}"  # Assunto do e-mail

                Thread(target=send_mail, args=(mail, msg, msg2)).start()
        else:
            user_current = get_user_by_full_name(ticket.responsible_technician)

            user_new = get_user_by_full_name(responsible_technician)

            if user_new and user_current and user_new.username == user_current.username:
                raise ValueError(
                    "Metodologia desconhecida para transferir o chamado a alguém que já é responsável por ele."
                )

            if user_new and username == user_new.username:
                ticket.chat = (ticket.chat or "") + f"[[Date:{date}],[System: {responsible_technician} atendeu ao Chamado],[Hours:{hours}]],"
            else:
                ticket.chat = (ticket.chat or "") + f"[[Date:{date}],[System: {technician} transferiu o Chamado para {responsible_technician}],[Hours:{hours}]],"

        ticket.responsible_technician = responsible_technician
        ticket.technician_mail = techMail
        ticket.save()

        return ticket.chat, ticket.responsible_technician
    except Exception as e:
        logger.error(e)
        raise Exception(e)


@transaction.atomic
def updating_chat_change_sender(
    id: int,
    chat: str | None,
    date: str | None,
    hours: str | None,
    user: str | None,
    helpdesk: str | None,
):
    """
    Atualiza o histórico do chat e modifica o remetente da última mensagem.

    :param body: Dicionário contendo as informações da requisição.
    :param id: Identificador único do ticket de suporte.
    :param chat: Mensagem do chat enviada.
    :param date: Data em que a mensagem foi enviada.
    :param hours: Hora em que a mensagem foi enviada.
    :param technician: Nome do técnico envolvido na conversa.
    :param user: Nome do usuário envolvido na conversa.
    :return: Código de status HTTP e o histórico atualizado do chat.
    """
    ticket = SupportTicket.objects.get(id=id)
    chat_message = ""
    if helpdesk == "helpdesk":
        chat_message = f",[[Date:{date}],[User: {chat}],[Hours:{hours}]]"
        update_last_sender(ticket, user, date, hours)
    elif helpdesk == "dashboard":
        chat_message = f",[[Date:{date}],[Technician: {chat}],[Hours:{hours}]]"
        update_last_sender(ticket, user, date, hours)

    ticket.chat = (ticket.chat or "") + chat_message

    ticket.save()

    Thread(target=verify_notification_call, args=(ticket,)).start()

    return ticket.chat


@transaction.atomic
def update_last_sender(
    ticket: SupportTicket, user: str | None, date: str | None, hours: str | None
):
    """
    Atualiza o remetente da última mensagem do ticket se a nova data e hora forem posteriores à anterior.

    :param ticket: O objeto ticket de suporte a ser atualizado.
    :param user: Nome do usuário ou técnico que enviou a última mensagem.
    :param date: Data da última mensagem.
    :param hours: Hora da última mensagem.
    """

    # Verifica se o ticket já possui um 'last_sender' registrado
    if ticket.last_sender:
        try:
            # Extrai a data e hora do 'last_sender' e converte para o formato datetime
            _, old_date_str = ticket.last_sender.split(", ")
            old_date = datetime.strptime(old_date_str, "%d/%m/%Y %H:%M")
            new_date = datetime.strptime(
                f"{date or ''} {hours or ''}", "%d/%m/%Y %H:%M"
            )

            # Se a nova data e hora forem posteriores à anterior, atualiza 'last_sender'
            if new_date > old_date:
                ticket.last_sender = f"{user or ''}, {date or ''} {hours or ''}"
        except ValueError:
            # Exibe erro caso a conversão da data falhe, mantendo 'last_sender' inalterado
            logger.error("Erro ao converter a data, mantendo last_sender inalterado.")
    else:
        # Se 'last_sender' não estiver definido, atribui o valor inicial
        ticket.last_sender = f"{user or ''}, {date or ''} {hours or ''}"

    ticket.save()

@never_cache
@require_GET
@login_required(login_url="/login")
@extend_schema(
    summary="Atualizar chat de um ticket",
    description="Obtém os últimos registros de chat de um ticket específico.",
    responses={200: UpdateChatResponseSerializer, 400: HelpdeskErrorResponseSerializer, 500: HelpdeskErrorResponseSerializer},
    tags=['Helpdesk']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def update_chat(request, id):
    """
    Atualiza e retorna o chat de um ticket específico.

    A função tenta buscar o ticket pelo ID fornecido e retorna o histórico do chat em formato JSON.
    Se ocorrer algum erro durante a recuperação do ticket, a função retorna uma mensagem de erro.

    Requer que o usuário esteja autenticado (login obrigatório).

    :param request: Objeto da requisição, contendo o ID do ticket e outras informações da requisição.
    :param id: ID do ticket cujo chat será recuperado.

    :return: Retorna um JSON com o histórico de chat do ticket ou um erro caso haja uma falha.
    """
    try:
        # Recupera o ticket correspondente ao ID fornecido
        ticket = SupportTicket.objects.get(id=id)
        user = request.user
        if isinstance(user, User) and not user_can_access_ticket(user, ticket):
            return JsonResponse({"error": "Acesso não autorizado"}, status=403, safe=True)

        # Recupera o chat do ticket
        chat = ticket.chat

        # Retorna o chat do ticket em formato JSON com código de status 200
        return JsonResponse({"chat": chat}, status=200, safe=True)
    except Exception as e:
        # Registra erro e retorna uma resposta de erro com status 305
        logger.error(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=305)


_ALLOWED_FILTER_ORDERS: frozenset[str] = frozenset({"id", "-id", "start_date", "-start_date"})
_MAX_FILTER_LIMIT: int = 200
_DEFAULT_FILTER_LIMIT: int = 10


# Rota legada — mantida por compatibilidade. Substituída por get_ticket_filter_v2.
@require_GET
@login_required(login_url="/login")
@never_cache
@extend_schema(
    summary="Filtrar tickets (legado)",
    description="Endpoint legado de busca e filtro de tickets. Prefira /helpdesk/tickets/ (v2).",
    responses={200: GetTicketFilterResponseSerializer, 400: HelpdeskErrorResponseSerializer, 500: HelpdeskErrorResponseSerializer},
    tags=['Helpdesk']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ticket_filter(
    request: WSGIRequest,
    url: str,
    sector: str,
    occurrence: str,
    order: str,
    user: str,
    quantity: int,
    status: str,
    search_query: str = "",
) -> JsonResponse:
    filters: Q | None = None
    try:
        if search_query in {"null", "None"}:
            search_query = ""

        if url == "dashboards":
            authenticated_user = request.user
            if isinstance(authenticated_user, User):
                allowed_areas = get_user_allowed_areas(authenticated_user)
                if allowed_areas:
                    filters = Q(respective_area__code__in=allowed_areas)
                else:
                    return JsonResponse(
                        {"Error": "Acesso não autorizado para dashboards"}, safe=True, status=403
                    )
            else:
                return JsonResponse(
                    {"Error": "Acesso não autorizado"}, safe=True, status=403
                )
        elif url == "history":
            authenticated_user = request.user
            if isinstance(authenticated_user, User):
                filters = Q(PID=authenticated_user.pk) | Q(ticketRequester=authenticated_user.username)
            else:
                return JsonResponse({"Error": "Acesso não autorizado"}, safe=True, status=403)
        else:
            return JsonResponse(
                {"Error": "Solicitação Inválida"}, safe=True, status=400
            )

        if filters is None:
            return JsonResponse(
                {"Error": "Erro ao processar filtros"}, safe=True, status=500
            )

        if sector.lower() not in {"all", "null"}:
            filters &= Q(sector=sector)
            filter_sector = True
        else:
            filter_sector = False

        if status.lower() not in {"all", "null"} and status in status_mapping:
            filters &= Q(open=status_mapping[status])

        if occurrence.lower() not in {"all", "null"}:
            filters &= Q(occurrence=occurrence)
            filter_occurrence = True
        else:
            filter_occurrence = False

        search_filters: Q = Q()

        if search_query.isdigit():
            search_filters |= Q(id__icontains=search_query)
            search_filters |= Q(start_date__icontains=search_query)
        else:
            if not filter_sector:
                search_filters |= Q(sector__icontains=search_query)
                search_filters |= Q(occurrence__icontains=search_query)
                search_filters |= Q(problemn__icontains=search_query)
                search_filters |= Q(ticketRequester__icontains=search_query)

            if not filter_occurrence:
                search_filters |= Q(occurrence__icontains=search_query)
                search_filters |= Q(problemn__icontains=search_query)
                search_filters |= Q(ticketRequester__icontains=search_query)

            if filter_sector and filter_occurrence:
                search_filters |= Q(problemn__icontains=search_query)
                search_filters |= Q(ticketRequester__icontains=search_query)

        if search_query:
            filters &= search_filters

        safe_order: str = order if order in _ALLOWED_FILTER_ORDERS else "-id"
        safe_quantity: int = min(int(quantity), _MAX_FILTER_LIMIT)

        tickets = SupportTicket.objects.filter(filters).order_by(safe_order)[:safe_quantity]

        ticket_objects = [
            {**loads(serialize("json", [ticket]))[0]["fields"], "id": ticket.id}
            for ticket in tickets
        ]

        return JsonResponse({"tickets": ticket_objects}, status=200, safe=True)

    except Exception as e:
        logger.error(f"Erro ao buscar chamados: {e}")
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=308)


@require_GET
@never_cache
@extend_schema(
    summary="Filtrar tickets (v2)",
    description=(
        "Endpoint seguro de filtragem de chamados com parâmetros nomeados. "
        "Parâmetros: context (dashboard|history), area, occurrence, problem, "
        "status (open|close|stop|all), order, limit (máx 200), search."
    ),
    parameters=[
        OpenApiParameter("context", OpenApiTypes.STR, description="dashboard ou history"),
        OpenApiParameter("area", OpenApiTypes.STR, description="TI ou Fiscal"),
        OpenApiParameter("occurrence", OpenApiTypes.STR, description="Tipo de ocorrência"),
        OpenApiParameter("problem", OpenApiTypes.STR, description="Problema específico"),
        OpenApiParameter("status", OpenApiTypes.STR, description="open, close, stop ou all"),
        OpenApiParameter("order", OpenApiTypes.STR, description="id, -id, start_date, -start_date"),
        OpenApiParameter("limit", OpenApiTypes.INT, description="Máximo de registros (padrão 10, máx 200)"),
        OpenApiParameter("search", OpenApiTypes.STR, description="Busca textual"),
    ],
    responses={200: GetTicketFilterResponseSerializer, 400: HelpdeskErrorResponseSerializer, 403: HelpdeskErrorResponseSerializer, 500: HelpdeskErrorResponseSerializer},
    tags=['Helpdesk']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ticket_filter_v2(request: WSGIRequest) -> JsonResponse:
    """
    Endpoint v2 de filtragem de chamados com parâmetros nomeados via query string.

    No contexto dashboard, a área autorizada é sempre determinada pelo servidor.
    Um parâmetro `area` enviado pelo frontend só é aceito quando o técnico é dual —
    e mesmo assim é validado contra as áreas autorizadas. Técnicos exclusivos têm
    a área fixada pelo servidor, ignorando qualquer valor enviado pelo cliente.
    No contexto history ("Meus Chamados"), qualquer usuário (comum ou técnico)
    visualiza exclusivamente seus próprios chamados (por PID ou username), podendo
    opcionalmente filtrar pela área para a qual o chamado foi aberto.
    """
    try:
        authenticated_user = request.user
        if not isinstance(authenticated_user, User):
            return JsonResponse({"Error": "Acesso não autorizado"}, safe=True, status=403)

        context: str = request.GET.get("context", "dashboard")
        if context not in {"dashboard", "history"}:
            return JsonResponse({"Error": "Parâmetro 'context' inválido"}, safe=True, status=400)

        raw_limit: str = request.GET.get("limit", str(_DEFAULT_FILTER_LIMIT))
        try:
            safe_limit: int = min(int(raw_limit), _MAX_FILTER_LIMIT)
        except ValueError:
            return JsonResponse({"Error": "Parâmetro 'limit' inválido"}, safe=True, status=400)

        raw_order: str = request.GET.get("order", "-id")
        safe_order: str = raw_order if raw_order in _ALLOWED_FILTER_ORDERS else "-id"

        raw_status: str = request.GET.get("status", "all")
        if raw_status.lower() not in {"all", "null"} and raw_status not in status_mapping:
            return JsonResponse({"Error": "Parâmetro 'status' inválido"}, safe=True, status=400)

        occurrence: str = request.GET.get("occurrence", "")
        problem: str = request.GET.get("problem", "")
        search: str = request.GET.get("search", "").strip()

        allowed_areas: list[str] = get_user_allowed_areas(authenticated_user)

        base_filters: Q

        if context == "dashboard":
            if not allowed_areas:
                return JsonResponse({"Error": "Acesso não autorizado para dashboards"}, safe=True, status=403)

            requested_area: str = request.GET.get("area", "")

            if len(allowed_areas) == 1:
                effective_area: str = allowed_areas[0]
            elif requested_area in allowed_areas:
                effective_area = requested_area
            elif requested_area:
                return JsonResponse({"Error": "Área solicitada não autorizada"}, safe=True, status=403)
            else:
                effective_area = allowed_areas[0]

            base_filters = Q(respective_area__code=effective_area)

        else:
            base_filters = Q(PID=authenticated_user.pk) | Q(ticketRequester=authenticated_user.username)
            requested_area: str = request.GET.get("area", "").strip()
            if requested_area and requested_area.lower() not in {"all", "null"}:
                base_filters &= Q(respective_area__code=requested_area)

        if raw_status.lower() not in {"all", "null"} and raw_status in status_mapping:
            base_filters &= Q(open=status_mapping[raw_status])

        if occurrence and occurrence.lower() not in {"all", "null"}:
            base_filters &= Q(occurrence=occurrence)

        if problem and problem.lower() not in {"all", "null"}:
            base_filters &= Q(problemn=problem)

        if search:
            if search.isdigit():
                search_q: Q = Q(id__icontains=search) | Q(start_date__icontains=search)
            else:
                search_q = (
                    Q(occurrence__icontains=search)
                    | Q(problemn__icontains=search)
                    | Q(ticketRequester__icontains=search)
                    | Q(sector__icontains=search)
                )
            base_filters &= search_q

        tickets = SupportTicket.objects.filter(base_filters).order_by(safe_order)[:safe_limit]

        ticket_objects = [
            {**loads(serialize("json", [t]))[0]["fields"], "id": t.id}
            for t in tickets
        ]

        return JsonResponse({"tickets": ticket_objects}, status=200, safe=True)

    except Exception as e:
        logger.error(f"Erro ao buscar chamados (v2): {e}")
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=500)


@login_required(login_url="/login")
@require_GET
@cache_page(60 * 5)
@extend_schema(
    summary="Equipamentos para alocação",
    description="Busca equipamentos disponíveis para alocação numa dada localidade.",
    responses={200: EquipamentsForAlocateResponseSerializer, 400: HelpdeskErrorResponseSerializer, 500: HelpdeskErrorResponseSerializer},
    tags=['Helpdesk']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def equipaments_for_alocate(request, location):
    """
    Conecta-se ao banco de dados MySQL e busca uma lista de computadores disponíveis
    para alocação (com o campo 'alocate' igual a 0).

    Esta função realiza uma consulta ao banco de dados, recupera os registros de computadores
    que ainda não foram alocados e os retorna em formato JSON.

    :param request: Objeto de requisição HTTP.
    :return: JSON contendo uma lista de máquinas com os detalhes de mac_address, distribuição,
             fabricante e modelo.
    :raises Exception: Levanta erro se ocorrer uma falha inesperada durante a execução.
    """
    results_list = []
    try:
        with get_database_connection() as connection:
            with connection.cursor() as cursor:
                query = "SELECT * FROM machines WHERE alocate = 0 AND location = %s"
                cursor.execute(query, (location,))
                result = cursor.fetchall()
                results_list = [
                    {
                        "mac_address": row[0],
                        "name": row[1],
                        "distribution": row[3],
                        "manufacturer": row[9],
                        "model": row[10],
                    }
                    for row in result
                ]
    except Exception as e:
        logger.error(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=310)

    return JsonResponse({"machines": results_list}, status=200, safe=True)


def convert_to_dict(chat_data: str) -> list[dict]:
    """
    Converte os dados do chat em um dicionário a partir de uma string formatada.

    A função utiliza uma expressão regular para extrair pares de chave-valor da string `chat_data`
    e os retorna como uma lista de dicionários.

    :param chat_data: Dados do chat em formato de string.
    :return: Lista de dicionários contendo os pares chave-valor extraídos da string.
    :raises Exception: Levanta erro se ocorrer uma falha inesperada durante a execução.
    """
    if not chat_data:
        return []

    try:
        # Define o padrão (regex) para capturar chave-valor no formato [chave:valor]
        pattern = r"\[([^:\[\]]+):([^,\]]+)"

        matches = findall(pattern, chat_data)

        return [{match[0]: match[1]} for match in matches]

    except Exception as e:
        logger.error(f"Erro ao converter dados do chat para dicionário: {e}")
        return []


@extend_schema(
    summary="Data de alocação de equipamento",
    description="Verifica quando um equipamento específico (MAC) foi alocado ou ficou pendente.",
    responses={200: DateEquipamentsAlocateResponseSerializer, 400: HelpdeskErrorResponseSerializer, 500: HelpdeskErrorResponseSerializer},
    tags=['Helpdesk']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def date_equipaments_alocate(request, mac: str):
    """
    Verifica as datas disponíveis para locação de um equipamento com base no seu MAC address.

    A função consulta os tickets de suporte para um equipamento específico (identificado pelo
    MAC address) e retorna as datas de alocação associadas ao equipamento.

    :param request: Objeto de requisição HTTP.
    :param mac: Endereço MAC do equipamento a ser verificado.
    :return: JSON contendo uma lista de datas de alocação para o equipamento.
    :raises Exception: Levanta erro se ocorrer uma falha inesperada durante a execução.
    """
    tickets = None
    alocate_dates = None
    try:
        # Filtra os tickets de suporte para o equipamento específico (baseado no MAC address)
        tickets = SupportTicket.objects.filter(equipament=mac)

        # Extrai a lista de datas de alocação dos tickets encontrados
        alocate_dates = tickets.values_list("date_alocate", flat=True)

        # Converte o queryset para uma lista simples
        alocate_dates_list = list(alocate_dates)

        # Retorna as datas de alocação em formato JSON
        return JsonResponse({"dates": alocate_dates_list}, status=200, safe=True)
    except Exception as e:
        # Em caso de erro, registra o erro no log e retorna uma resposta JSON com status de erro
        logger.error(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=312)


@require_POST
@login_required(login_url="/login")
@requires_csrf_token
@transaction.atomic
@extend_schema(
    summary="Alterar último visualizador",
    description="Atualiza a informação de quem visualizou o ticket por último para zerar notificações pendentes.",
    responses={200: ChangeLastViewerResponseSerializer, 400: HelpdeskErrorResponseSerializer, 500: HelpdeskErrorResponseSerializer},
    tags=['Helpdesk']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_last_viewer(request: WSGIRequest, id: int):
    """
    Altera o último visualizador de um chamado e aciona uma função para verificar a situação do chamado.

    A função atualiza o campo `last_viewer` do chamado no banco de dados e verifica se a alteração
    é válida com base no tipo de usuário (técnico ou solicitante). Após a alteração, uma função
    de verificação de notificação é acionada em uma thread separada.

    :param request: Objeto de requisição HTTP contendo dados para atualização.
    :param id: ID do chamado a ser alterado.
    :return: JSON indicando o status da alteração ou erro.
    :raises Exception: Levanta erro se ocorrer uma falha inesperada durante a execução.
    """
    try:
        # Obtém o ticket de suporte com base no ID e área respectiva
        ticket_data = SupportTicket.objects.get(id=id)
        user = request.user
        if isinstance(user, User) and not user_can_access_ticket(user, ticket_data):
            return JsonResponse({"error": "Acesso não autorizado"}, status=403, safe=True)
        chat = ticket_data.chat

        # Verifica se o chat existe para o ticket
        if not chat:
            return JsonResponse(
                {"status": "Chamado ainda não foi atendido"}, safe=True, status=201
            )

        # Divide o chat em seções para processamento posterior
        sections = chat.split("],[")

        # Ajusta o primeiro e último item para garantir a formatação correta
        sections[0] = "[" + sections[0]
        sections[-1] = sections[-1] + "]"

        # Agrupa as seções em listas de 3 elementos
        grouped = [section.split(",") for section in sections]
        result = [grouped[i : i + 3] for i in range(0, len(grouped), 3)]

        # Verifica se houve mensagens além do sistema, se não, retorna uma mensagem de erro
        if len(result) == 1:
            return JsonResponse(
                {"status": "Não houve mensagem enviada além do sistema"},
                safe=True,
                status=201,
            )

        # Obtém os dados enviados no corpo da requisição
        body = loads(request.body)
        last_vw = body.get("viewer")
        tech = body.get("technician")
        requester = body.get("requester")

        # Verifica se o técnico correto está visualizando o chamado
        if requester == "tech":
            verify = verify_names(last_vw, tech)
            if not verify:
                return JsonResponse(
                    {"status": "O Chamado é de outro Técnico"},
                    safe=True,
                    status=201,
                )

        # Verifica se o usuário correto está visualizando o chamado
        elif requester == "user" and last_vw != ticket_data.ticketRequester:
            return JsonResponse(
                {"status": "O Chamado não é desse usuário"},
                safe=True,
                status=201,
            )

        # Atualiza o último visualizador e salva o ticket
        ticket_data.last_viewer = last_vw
        ticket_data.save()

        # Retorna um status indicando que o último visualizador foi alterado com sucesso
        return JsonResponse({"status": "Last Viewer Alterado"}, safe=True, status=200)

    except Exception as e:
        # Registra o erro no log e retorna um erro genérico
        logger.error(e)
        return JsonResponse({"status": "fail"}, safe=True, status=311)


def verify_names(name_verify, responsible_technician):
    """
    Verifica se dois nomes são da mesma pessoa, considerando possíveis variações de sobrenome (como 'da', 'de').

    A função compara duas strings de nomes, verificando se todos os componentes do nome do técnico (responsible_technician)
    estão presentes no nome a ser verificado (name_verify). Isso permite que nomes com sobrenomes faltando (como "da" ou "de")
    sejam considerados iguais.

    :param name_verify: Nome a ser verificado.
    :param responsible_technician: Nome do técnico responsável.
    :return: Retorna True se os nomes corresponderem, considerando as variações, ou False caso contrário.
    """
    if not name_verify or not responsible_technician:
        return False

    # Se name_verify não for vazio, divide o nome em palavras
    name_ver = name_verify.split(" ")

    # Se responsible_technician não for vazio, divide o nome do técnico em palavras
    tech_ver = responsible_technician.split(" ")

    # Verifica se todas as palavras do nome do técnico estão presentes no nome a ser verificado
    all_find = all(word in name_ver for word in tech_ver)
    return all_find


@require_GET
@extend_schema(
    summary="Obter imagem do equipamento",
    description="Consulta banco de dados por imagem do equipamento através do endereço MAC.",
    responses={200: GetImageResponseSerializer, 400: HelpdeskErrorResponseSerializer, 404: HelpdeskErrorResponseSerializer, 500: HelpdeskErrorResponseSerializer},
    tags=['Helpdesk']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_image(request, mac):
    """
    View que retorna o modelo de uma máquina através de uma requisição HTTP GET.
    
    Delega a lógica de busca ao serviço get_machine_model para manter a separação
    de responsabilidades entre view e service layer.
    
    Args:
        request: Objeto WSGIRequest da requisição HTTP
        mac (str): Endereço MAC da máquina
        
    Returns:
        JsonResponse com o modelo da máquina ou erro 404/500
    """
    try:
        model = get_machine_model(mac)
        
        if model is None:
            return JsonResponse({"error": "Modelo não encontrado"}, status=404)
        
        return JsonResponse({"model": model})
    
    except Exception as e:
        logger.error(f"Erro ao recuperar modelo da máquina {mac}: {e}")
        return JsonResponse({"error": "Erro na consulta ao banco de dados"}, status=500)

@require_POST
@extend_schema(
    summary="Logar erro de frontend",
    description="Recebe erros lançados pelo frontend e registra via logger.",
    request=LogErrorFrontendRequestSerializer,
    responses={200: LogErrorFrontendResponseSerializer, 400: HelpdeskErrorResponseSerializer},
    tags=['Helpdesk']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def log_error_frontend(request: Request) -> JsonResponse:
    """
    Recebe um relatório de erro do frontend, repassa ao serviço de log e retorna 204.

    Esta view trata requisições POST vindas do cliente React contendo detalhes
    de erros que ocorreram na interface da aplicação.

    Args:
        request (Request): Requisição HTTP contendo o payload em JSON.

    Returns:
        JsonResponse: Retorna 204 No Content se logado com sucesso, ou 400 em caso de JSON inválido.
    """
    try:
        payload = request.data
    except ParseError:
        return JsonResponse({'erro': 'Payload inválido'}, status=400)

    serializer = LogErrorFrontendRequestSerializer(data=payload)
    if not serializer.is_valid():
        return JsonResponse({'erro': 'Payload inválido'}, status=400)

    error_data = serializer.validated_data
    if not isinstance(error_data, dict):
        return JsonResponse({'erro': 'Payload inválido'}, status=400)

    mensagem = str(error_data.get('message', ''))
    stack = str(error_data.get('stack', ''))
    url = str(payload.get('url', 'URL não informada')) if isinstance(payload, dict) else 'URL não informada'

    log_frontend_error(url, mensagem, stack)

    return JsonResponse({}, status=204)
