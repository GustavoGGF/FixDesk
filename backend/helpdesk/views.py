# Importando os módulos necessários para o funcionamento do código.
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from smtplib import SMTP
from threading import Thread, Timer
from django.shortcuts import get_object_or_404, render, redirect
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token
from django.http import JsonResponse, FileResponse
from django.contrib.auth.decorators import login_required
from os import getenv, path
from json import loads
from django.middleware.csrf import get_token
from datetime import datetime
from .models import SupportTicket, TicketFile
from django.core.serializers import serialize
from django.contrib.auth import logout
from dashboards.models import Equipaments
from base64 import b64encode
from PIL import Image, UnidentifiedImageError
from io import BytesIO
from magic import Magic
from os import getcwd
from os.path import exists, isdir
from django.db.models import Q
import mimetypes
from django.core.files.base import ContentFile
from fpdf import FPDF
from re import findall, split as plt
from logging import basicConfig, getLogger, WARNING
from django.db import transaction
from django.views.decorators.cache import never_cache
from contextlib import contextmanager
from mysql import connector
from decouple import config
from django.views.decorators.http import require_POST, require_GET
from django.utils.timezone import make_aware
from time import time
from threading import Lock
from dotenv import load_dotenv
from django.core.handlers.wsgi import WSGIRequest
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.views.decorators.cache import cache_page
from requests import get as getUrl
from django.test import RequestFactory
from tempfile import NamedTemporaryFile

# Configuração básica de logging
basicConfig(level=WARNING)
logger = getLogger(__name__)

load_dotenv()
smtp_host = getenv("SERVER_SMTP")
smtp_port = getenv("SMPT_PORT")
mail_address = getenv("MAIL_FIXDESK")
Back_User = getenv("DJANGO_GROUP_USER")
Back_Tech = getenv("DJANGO_GROUP_TECH")
Back_Leader = getenv("DJANGO_GROUP_LEADER")
types_str = getenv("VALID_TYPES")
mail_password = getenv("MAIL_PWD")

status_mapping = {"open": True, "close": False, "stop": None, "all": "All"}


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
        msg["From"] = mail_address  # Remetente do e-mail
        msg["To"] = mail  # Destinatário do e-mail
        msg["Subject"] = msgm2  # Assunto do e-mail

        # Corpo da mensagem
        msg.attach(MIMEText(msgm1, "plain"))

        # Iniciar conexão SMTP
        server_smtp = SMTP(smtp_host, smtp_port)
        server_smtp.starttls()  # Ativar criptografia TLS

        # Enviar e-mail
        text_mail = msg.as_string()
        server_smtp.sendmail(mail_address, mail, text_mail)

    except Exception as e:
        logger.error(e)  # Registrar erro no log
    finally:
        # Fechar conexão SMTP
        server_smtp.quit()

@csrf_exempt
@require_GET
def get_new_token(request):
    try:
        user = request.user
        if user.groups.filter(
            name__in=[Back_User, Back_Tech, Back_Leader]
        ).exists():
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

@csrf_exempt
@never_cache
@require_GET
def first_view(request: WSGIRequest):
    if request.user.is_authenticated:
        try:
            user = request.user
            if user.groups.filter(
                name__in=[Back_User, Back_Tech, Back_Leader]
            ).exists():
                return render(request, "index.html", {})
            else:
                return redirect("/login")
        except Exception as e:
            json_error = str(e)
            logger.error(e)
            return JsonResponse({"status": json_error}, status=300, safe=True)
    else:
        return redirect("/login")


@requires_csrf_token
@login_required(login_url="/login")
@require_POST
@transaction.atomic
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
            "company": request.POST.get(
                "company"
            ),  # Obtém o nome da empresa do formulário
            "department": request.POST.get(
                "department"
            ),  # Obtém o departamento associado
            "mail": request.POST.get("mail"),  # Obtém o e-mail do solicitante
            "observation": request.POST.get(
                "observation"
            ),  # Obtém observações adicionais
            "occurrence": request.POST.get("occurrence"),  # Obtém o tipo de ocorrência
            "problemn": request.POST.get("problemn"),  # Obtém a descrição do problema
            "respective_area": request.POST.get(
                "respective_area"
            ),  # Obtém a área responsável
            "sector": request.POST.get(
                "sector"
            ),  # Obtém o setor relacionado ao chamado
            "start_date": request.POST.get(
                "start_date"
            ),  # Obtém a data de início do chamado
            "ticket_requester": request.POST.get(
                "ticketRequester"
            ),  # Obtém o solicitante do chamado
        }

        # Processar e validar a data de início
        if not form_data["start_date"]:
            form_data["start_date"] = datetime.now().strftime(
                "%Y-%m-%d %H:%M"
            )  # Define data atual caso não fornecida
        else:
            form_data["start_date"] = make_aware(
                datetime.strptime(
                    form_data["start_date"], "%Y-%m-%d %H:%M"
                )  # Converte string para objeto datetime
            )

    except Exception as e:
        logger.error(
            "Erro na função submitTicket:", e
        )  # Loga erro na obtenção dos dados
        return JsonResponse(
            {"error": f" Erro na Obtenção dos dados: {e}"},
            status=300,
            safe=True,  # Retorna erro em formato JSON
        )

    valid = False  # Flag para verificar se houve processamento válido
    id = None  # Inicializa a variável de ID do chamado
    denied_files = []
    # Verifica se há imagens anexadas no formulário
    if "image" in request.FILES:
        id, status, denied_files = process_files(request, form_data)  # Processa imagens enviadas
        if status == 300:
            return JsonResponse(
                {"error": f"Erro no processamento da imagem: {id}"},
                status=300,
                safe=True,
            )
        valid = True  # Marca que houve um processamento válido

    pid = request.user.id

    # Caso não haja imagem nem equipamento, cria um chamado de suporte normal
    if not valid:
        ticket = SupportTicket(
            ticketRequester=form_data[
                "ticket_requester"
            ],  # Define o solicitante do chamado
            department=form_data["department"],  # Define o departamento associado
            mail=form_data["mail"],  # Define o e-mail do solicitante
            company=form_data["company"],  # Define a empresa do chamado
            sector=form_data["sector"],  # Define o setor envolvido
            respective_area=form_data["respective_area"],  # Define a área responsável
            occurrence=form_data["occurrence"],  # Define o tipo de ocorrência
            problemn=form_data["problemn"],  # Define a descrição do problema
            observation=form_data["observation"],  # Define observações adicionais
            start_date=form_data["start_date"],  # Define a data de início do chamado
            PID=pid,
            equipament=request.POST.get(
                "id_equipament"
            ),  # Associa equipamento, se houver
            date_alocate=request.POST.get(
                "days_alocated"
            ),  # Define período de alocação do equipamento
            open=True,  # Define o chamado como aberto
        )

        ticket.save()  # Salva o chamado no banco de dados

        id = ticket.id  # Obtém o ID do chamado salvo
    
    return JsonResponse(
        {"id": id, "denied_files": denied_files}, status=200, safe=True
    )  # Retorna o ID do chamado criado com sucesso

@transaction.atomic
def process_files(request: WSGIRequest, form_data: dict):
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
            ticketRequester=form_data[
                "ticket_requester"
            ],  # Define o solicitante do chamado
            department=form_data["department"],  # Define o departamento associado
            mail=form_data["mail"],  # Define o e-mail do solicitante
            company=form_data["company"],  # Define a empresa do chamado
            sector=form_data["sector"],  # Define o setor envolvido
            respective_area=form_data["respective_area"],  # Define a área responsável
            occurrence=form_data["occurrence"],  # Define o tipo de ocorrência
            problemn=form_data["problemn"],  # Define a descrição do problema
            observation=form_data["observation"],  # Define observações adicionais
            start_date=form_data["start_date"],  # Define a data de início do chamado
            PID=request.user.id,  # Define o identificador único do chamado
            open=True,  # Define o chamado como aberto
        )

        images = request.FILES.getlist("image")  # Obtém a lista de arquivos enviados
        mime = Magic()  # Inicializa a biblioteca para detecção de tipo MIME

        for file in images:
            image_bytes = file.read()  # Lê os bytes do arquivo
            file_type = mime.from_buffer(image_bytes)  # Determina o tipo de arquivo

            # Verifica se o arquivo enviado é válido
            verify_valid_files =  is_valid_file(file, file_type)
            if not verify_valid_files:
                denied_files.append(file_type)

            ticket.save()  # Salva o chamado no banco de dados

            ticket_file = TicketFile(
                ticket=ticket
            )  # Cria uma instância de arquivo associado ao chamado
            ticket_file.file.save(
                str(file), ContentFile(image_bytes)
            )  # Salva o arquivo no banco de dados

            id = ticket.id  # Obtém o ID do chamado salvo

        return id, 200, denied_files  # Retorna o ID do chamado e status de sucesso

    except Exception as e:
        logger.error(f"Erro no processamento de imagem: {e}")  # Registra erro no log
        return e, 300, denied_files  # Retorna erro interno no processamento


def is_valid_file(file: InMemoryUploadedFile, file_type: str) -> bool:
    """Valida se um arquivo enviado pertence a uma lista de tipos aceitos."""
    try:
        # Extrai apenas a parte relevante do tipo do arquivo
        file_type_clean = plt(r",|\(", file_type)[0].strip().lower()
        # Verifica se algum dos tipos permitidos está no tipo detectado
        # Remove colchetes e divide por vírgula
        items = types_str.strip("[]").split(',')

        # Remove espaços extras e adiciona em uma lista
        array_data = [item.strip() for item in items]
        if any(ext.lower() in file_type_clean for ext in array_data):
            return True

        # Comparar pelo mimetypes padrão do Python
        guessed_type = mimetypes.guess_type(str(file))[0]
        # Verifica se o tipo detectado pelo mimetypes está na lista de tipos permitidos
        return (
            guessed_type.lower() in (ext.lower() for ext in array_data)
            if guessed_type
            else False
        )
    except Exception as e:
        print(e)


@csrf_exempt
@login_required(login_url="/login")
@require_GET
@cache_page(60 * 1)
def history(request: WSGIRequest):
    """
    Processa e retorna o histórico de chamados do usuário.

    :param request: Objeto WSGIRequest contendo os dados da requisição.
    """
    user = request.user  # Obtém o usuário autenticado
    valid_groups = [
        Back_User,
        Back_Tech,
        Back_Leader,
    ]  # Define os grupos autorizados

    # Verifica se o usuário pertence a um dos grupos autorizados
    if not user.groups.filter(name__in=valid_groups).exists():
        return redirect("/login")
    return render(request, "index.html", {})  # Renderiza a página de histórico


@login_required(login_url="/login")
@never_cache
@csrf_exempt
@require_GET
def history_get_ticket(request, quantity: int, usr: str, status: str, order: str):
    try:
        status_opng = status_mapping.get(status, None)
        csrf = get_token(request)  # Obtém o token CSRF
        user = request.user  # Obtém o usuário autenticado
        valid_groups = [
            Back_User,
            Back_Tech,
            Back_Leader,
        ]  # Define os grupos autorizados

        # Verifica se o usuário pertence a um dos grupos autorizados
        if not user.groups.filter(name__in=valid_groups).exists():
            return JsonResponse(
                {"status": "Invalid Credentials"}, status=402, safe=True
            )

        filters = {"ticketRequester": usr, "PID": request.user.id}

        if status_opng not in {"All", "null", "all"}:
            filters["open"] = status_opng

        if order == "-id":
            tickets = SupportTicket.objects.filter(**filters).order_by("-id")[:quantity]
        else:
            tickets = SupportTicket.objects.filter(**filters)[:quantity]

        ticket_objects = [
            {**loads(serialize("json", [ticket]))[0]["fields"], "id": ticket.id}
            for ticket in tickets
        ]

        return JsonResponse(
            {"tickets": ticket_objects, "token": csrf}, status=200, safe=True
        )
    except Exception as e:
        logger.error(e)  # Exibe o erro no console (melhor utilizar logger)
        return JsonResponse({"status": "Invalid Credentials"}, status=402, safe=True)


@csrf_exempt
@require_GET
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
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=303)


@login_required(
    login_url="/login"
)  # Decorador que exige que o usuário esteja autenticado. Redireciona para a página de login se não estiver.
@requires_csrf_token  # Decorador que assegura que o token CSRF seja verificado para evitar ataques CSRF.
@never_cache
@transaction.atomic
def ticket(
    request: WSGIRequest, id: int
):  # Função para obter ou enviar dados para os chamados, recebendo a requisição e o ID do ticket.
    if request.method == "POST":
        try:
            body = loads(request.body.decode("utf-8"))
            responsible_technician = body.get("responsible_technician")
            technician = body.get(
                "technician"
            )  # Técnico atual que está transferindo o chamado
            date = body.get("date")  # Data da alteração do responsável
            hours = body.get("hours")  # Horário da alteração do responsável
            techMail = body.get("techMail")  # E-mail do novo técnico responsável
            mail = body.get("mail")  # E-mail do usuário associado ao chamado
            chat = body.get("chat")  # Chat com menssagem
            user = body.get("User")  # usuario
            helpdesk = body.get("helpdesk")
            if "responsible_technician" in body:
                # Esta condição verifica se a requisição contém a chave 'responsible_technician'.
                # Se existir, significa que há uma tentativa de mudança de técnico responsável pelo ticket.
                # A função `change_responsible_technician` é chamada para processar a mudança.
                # Caso o status retornado seja 400, um erro é enviado na resposta.
                # Se for bem-sucedido, a resposta retorna o chat atualizado, o novo técnico responsável e o ID do ticket.
                status, chat, technician = change_responsible_technician(
                    id,
                    responsible_technician,
                    technician,
                    date,
                    hours,
                    techMail,
                    mail,
                )

                if status == 400:
                    return JsonResponse({"error": f"{chat}"}, status=400, safe=True)

                tickets_data = SupportTicket.objects.filter(
                    respective_area="TI"
                )
                total_tickets = tickets_data.count()
                return JsonResponse(
                    {
                        "total": total_tickets
                    },
                    status=200,
                    safe=True,
                )

            # Verifica se a solicitação contém um cabeçalho específico indicando a presença de detalhes técnicos
            if "HTTP_TECH_DETAILS" in request.META:
                """
                Processa os detalhes técnicos e atualiza o histórico de chat com essas informações.

                :param request: A requisição que contém os dados necessários para a atualização.
                :param chat: O histórico de chat atual a ser atualizado com os detalhes técnicos.
                :param id: O ID do chamado.
                :param date: A data associada à atualização.
                :param hours: As horas associadas à atualização.

                :return: Retorna um JsonResponse com erro ou os detalhes atualizados do chat.
                """

                # Atualiza os detalhes técnicos e o histórico de chat
                status, details = update_tech_details(chat, id, date, hours, request)

                # Se a atualização falhar (status 300), retorna um erro
                if status == 300:
                    return JsonResponse({"Error": f"{details}"}, status=300, safe=True)

                # Caso contrário, retorna os detalhes atualizados do chat
                return JsonResponse({"chat": details}, status=200, safe=True)

            if "chat" in body:
                # Verifica se a requisição contém a chave 'chat'.
                # Se existir, significa que há uma mensagem sendo enviada no chamado.
                # A função `updating_chat_change_sender` é chamada para atualizar o chat
                # e possivelmente mudar o remetente da última mensagem.
                # Se o status retornado for 400, um erro é enviado na resposta.
                # Caso contrário, a resposta retorna o chat atualizado.
                status, chat = updating_chat_change_sender(
                    body, id, chat, date, hours, user, helpdesk
                )

                if status == 400:
                    return JsonResponse({"error": chat}, status=400, safe=True)

                return JsonResponse({"chat": chat}, status=200, safe=True)

            # Verifica se o status foi enviado no corpo da requisição
            if "status" in body:
                status = body.get("status")

                # Caso o status seja 'close', fecha o ticket
                if status == "close":
                    status_def, msg = ticket_close(id, technician, date, hours, mail)

                    # Se o fechamento do ticket falhar (status 304), retorna erro
                    if status_def == 304:
                        return JsonResponse({"Error": f"{msg}"}, status=304, safe=True)
                    elif status_def == 205:
                        return JsonResponse(
                            {"Error": "Chamado já esta finalizado"},
                            status=205,
                            safe=True,
                        )

                # Caso o status seja 'open', abre o ticket
                elif status == "open":
                    status_def = ticket_open(
                        id, date, technician, hours, techMail, mail
                    )

                    if status_def == 206:
                        return JsonResponse(
                            {"Error": "Chamado já está aberto."},
                            status=206,
                            safe=True,
                        )

                # Caso o status seja 'stop', interrompe o ticket
                elif status == "stop":
                    status_def, msg = ticket_stop(id, technician, date, hours, mail)

                    # Se o ticket não estiver atribuído a um técnico (status 304), retorna erro
                    if status_def == 304:
                        return JsonResponse(
                            {"Error": "Chamado Não está atrelado a nenhum tecnico."},
                            status=304,
                            safe=True,
                        )

                    elif status_def == 204:
                        return JsonResponse(
                            {"Error": "Chamado Já está em aguardo."},
                            status=204,
                            safe=True,
                        )

                    # Se o status for 303, retorna a mensagem de erro associada
                    elif status_def == 303:
                        return JsonResponse({"Error": f"{msg}"}, status=303, safe=True)
                    
                tickets_data = SupportTicket.objects.filter(
                    respective_area="TI"
                )
                total_tickets = tickets_data.count()
                # Retorna uma resposta de sucesso (status 200) caso o status tenha sido atualizado corretamente
                return JsonResponse({"total": total_tickets}, status=200, safe=True)

            # Verifica se a opção de download do ticket foi solicitada
            if "HTTP_DOWNLOAD_TICKET" in request.META:
                # Cria o PDF do ticket, retornando o status e o conteúdo base64 do PDF
                status, pdf_base64 = create_pdf(id)

                # Se ocorrer um erro ao criar o PDF (status 300), retorna o erro como resposta
                if status == 300:
                    return JsonResponse(
                        {"Error": f"{pdf_base64}"}, status=300, safe=True
                    )

                # Caso o PDF seja gerado com sucesso, retorna o conteúdo do PDF em base64
                return JsonResponse({"pdf": pdf_base64}, status=200, safe=True)

        except Exception as e:
            logger.error(e)
            return JsonResponse({"Error": f"Erro inesperado {e}"}, status=304)

    if request.method == "GET":
        """
        Verifica se a requisição é do tipo GET, processa os dados do ticket e retorna as informações em formato JSON.

        Se o ticket não for encontrado ou se o usuário não tiver permissão para visualizar o ticket, será redirecionado para a página /helpdesk.

        :return: Retorna um JSON com os dados do ticket, incluindo informações como o responsável, setor, equipamento, arquivos relacionados, e status.
        """
        try:
            # Recupera o ticket correspondente ao ID fornecido ou retorna erro 404
            ticket = get_object_or_404(SupportTicket, id=id)

            user = request.user
            # Verifica se o usuário pertence ao grupo "Back_User"
            if not user.groups.filter(name=Back_User).exists():
                if not user.groups.filter(name=Back_Tech).exists():
                    return redirect("/helpdesk")
            else:
                if ticket.PID != request.user.id:
                    return JsonResponse(
                        {"Error": "Chamado não pertence a você"}, status=403, safe=True
                    )

            # Processamento de arquivos do ticket (imagens ou outros arquivos)
            image_data, content_file, name_file = process_ticket_files(id)

            # Serializa as informações do ticket
            serialized_ticket = {
                "ticketRequester": ticket.ticketRequester,
                "department": ticket.department,
                "mail": ticket.mail,
                "company": ticket.company,
                "sector": ticket.sector,
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
            }

            # Retorna os dados do ticket como resposta JSON com código de status 200
            return JsonResponse({"data": serialized_ticket}, status=200)

        except Exception as e:
            # Registra erro e retorna uma resposta de erro com status 304
            logger.error(e)
            return JsonResponse({"Error": f"Erro inesperado {e}"}, status=304)

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

        # Verifica se o ticket já possui detalhes técnicos
        if ticket.details == None:
            # Se não houver detalhes, cria os detalhes com a nova entrada
            ticket.details = f",[[Date:{date}],[{request.user.first_name} {request.user.last_name}: {chat}],[Hours:{hours}]]"
        else:
            # Caso contrário, adiciona os novos detalhes ao histórico existente
            ticket.details += f",[[Date:{date}],[{request.user.first_name} {request.user.last_name}: {chat}],[Hours:{hours}]]"

        # Salva as alterações no ticket
        ticket.save()

        return 200, ticket.details
    except Exception as e:
        # Registra o erro e retorna um código de erro com a mensagem
        logger.error(e)
        return 300, e

class CustomPDF(FPDF):
    def __init__(self, footer_path: str, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.footer_path = footer_path

    def footer(self):
        # Posição a 25 unidades da parte inferior
        self.set_y(-25)
        self.image(self.footer_path, x=0, y=self.get_y(), w=self.w)

def create_pdf(id: int):
    """
    Gera um PDF com informações detalhadas sobre o chamado, incluindo dados gerais, informações sobre a máquina,
    e o histórico de chat do ticket.

    :param id: Identificador único do ticket de suporte.
    :return: Código de status HTTP e o PDF gerado em base64, ou código de erro e a mensagem de exceção.
    """

    try:
        getLogger("fontTools.subset").setLevel(WARNING)
        # Obtém o ticket de suporte com base no ID fornecido
        ticket = SupportTicket.objects.get(id=id)

        # Obtém o caminho do diretório da pasta helpdesk
        helpdesk_dir = path.dirname(path.abspath(__file__))

        # Obtém o diretório pai (onde helpdesk e files estão localizados)
        project_root = path.dirname(helpdesk_dir)

        # Caminho para a imagem dentro da pasta "files"
        lupatech_logo = path.join(project_root, "files", "lupalogo.png")
        fixdesk_logo = path.join(project_root, "files", "fixdesk.png")
        lupatech_footer = path.join(project_root, "files", "footer.png")
        # Cria uma nova instância do FPDF para gerar o PDF
        pdf = CustomPDF(lupatech_footer)
        pdf.add_page()

        # Obtém o diretório de trabalho atual e define a fonte Arial para o PDF
        directory = getcwd()
        pdf.add_font("Arial", "", f"{directory}/arial.ttf")
        pdf.set_font("Arial", size=12)

        # Adiciona o título do chamado ao PDF
        pdf.image(lupatech_logo, x=10, y=0 + 5, w=10)
        pdf.image(fixdesk_logo, x=200, y=0 + 5, w=10)
        pdf.cell(180, 5, txt=f"CHAMADO {ticket.id}", ln=False, align="C")
        
        
        # Adiciona informações do ticket ao PDF
        add_ticket_info_to_pdf(ticket, pdf)

        # Se o problema for "Alocação de Máquina", adiciona informações sobre a máquina ao PDF
        if ticket.problemn == "Alocação de Máquina":
            add_machine_info_to_pdf(ticket, pdf)

        # Se o ticket tiver chat, adiciona o histórico do chat ao PDF
        if ticket.chat:
            add_chat_to_pdf(ticket.chat, pdf)

        # Converte o conteúdo do PDF para base64
        pdf_base64 = b64encode(pdf.output(dest="S")).decode("utf-8")

        # Retorna o PDF gerado em base64 com status de sucesso
        return 200, pdf_base64

    # Captura e loga exceções caso ocorram durante o processo de geração do PDF
    except Exception as e:
        logger.error(e)
        return 300, e


def add_ticket_info_to_pdf(ticket: SupportTicket, pdf: FPDF):
    """
    Adiciona informações detalhadas do ticket de suporte ao PDF, incluindo dados como data de abertura,
    usuário, departamento, unidade, setor, ocorrência, problema, setor responsável, técnico responsável,
    observações e status do ticket.

    :param ticket: O ticket de suporte cujas informações serão adicionadas ao PDF.
    :param pdf: A instância do FPDF onde as informações do ticket serão adicionadas.
    """

    # Adiciona a data de abertura do ticket ao PDF, formatada como dd/mm/yyyy
    pdf.cell(
        200,
        10,
        txt=f"Data de Abertura: {ticket.start_date.strftime('%d/%m/%Y')}",
        ln=True,
        align="R",
    )

    # Adiciona o nome do usuário que solicitou o ticket
    pdf.cell(200, 10, txt=f"Usuário: {ticket.ticketRequester}", ln=True, align="L")

    # Adiciona o departamento relacionado ao ticket
    pdf.cell(200, 10, txt=f"Departamento: {ticket.department}", ln=True, align="L")

    # Adiciona a unidade onde o ticket foi gerado
    pdf.cell(200, 10, txt=f"Unidade: {ticket.company}", ln=True, align="L")

    # Adiciona o setor relacionado ao ticket
    pdf.cell(200, 10, txt=f"Setor: {ticket.sector}", ln=True, align="L")

    # Adiciona a ocorrência registrada no ticket
    pdf.cell(200, 10, txt=f"Ocorrência: {ticket.occurrence}", ln=True, align="L")

    # Adiciona o problema descrito no ticket
    pdf.cell(200, 10, txt=f"Problema: {ticket.problemn}", ln=True, align="L")

    # Adiciona o setor responsável pelo ticket
    pdf.cell(
        200, 10, txt=f"Setor Responsável: {ticket.respective_area}", ln=True, align="L"
    )

    # Adiciona o nome do técnico responsável, ou 'Técnico não Atribuído' se não houver técnico
    pdf.cell(
        200,
        10,
        txt=f"Técnico Responsável: {ticket.responsible_technician or 'Técnico não Atribuído'}",
        ln=True,
        align="L",
    )

    # Adiciona a observação relacionada ao ticket, ou 'Informação não fornecida' caso não haja
    pdf.multi_cell(
        200,
        10,
        txt=f"Observação: {ticket.observation or 'Informação não fornecida'}",
        ln=True,
        align="L",
    )

    # Adiciona o status do ticket (Em Aberto ou Finalizado)
    pdf.cell(
        200,
        10,
        txt=f"Status: {'Em Aberto' if ticket.open else 'Finalizado'}",
        ln=True,
        align="L",
    )

    return


def add_machine_info_to_pdf(ticket: SupportTicket, pdf: FPDF):
    try:
        """
        Adiciona informações sobre a máquina alocada no ticket de suporte ao PDF, incluindo o nome da máquina
        e a data de alocação.

        :param ticket: O ticket de suporte que contém informações sobre a máquina alocada.
        :param pdf: A instância do FPDF onde as informações sobre a máquina serão adicionadas.
        """
        factory = RequestFactory()

        request = factory.get(
            f"/get_image/{ticket.equipament}"
        )  # Substitua pelo MAC desejado
        response = get_image(request, ticket.equipament)
        response_data = loads(response.content.decode("utf-8"))

        # Obter o valor de "model"
        model = response_data.get("model")
        model_adjust = model.strip()
        model_adjust2 = model.replace(" ", "").lower()
        # Adiciona o nome da máquina alocada ao PDF
        pdf.cell(
            200, 10, txt=f"Máquina Alocada: {ticket.equipament}", ln=True, align="L"
        )
        pdf.cell(200, 10, txt=f"Modelo: {model_adjust}", ln=True, align="L")
        y_atual = pdf.get_y()
        url = f"http://sappp01:3000/home/computers/get-image/{model_adjust2}"
        print(url)

        # Faz a requisição GET para obter a imagem
        response = getUrl(url)

        if response.status_code == 200:
            # Criar um arquivo temporário
            with NamedTemporaryFile(delete=True, suffix=".png") as temp_image:
                temp_image.write(response.content)
                temp_image.flush()  # Garante que os dados sejam escritos

                # Adicionar a imagem logo abaixo do texto "Modelo"
                pdf.image(
                    temp_image.name, x=10, y=y_atual + 5, w=50
                )  # Ajuste 'x', 'y' e 'w' conforme necessário
    except Exception as e:
        logger.error(e)


def add_chat_to_pdf(chat: str, pdf: FPDF):
    """
    Adiciona o histórico de chat ao PDF, incluindo as mensagens do sistema, técnico e usuário,
    agrupadas por data e hora.

    :param chat: O histórico de chat, geralmente em formato de string a ser convertido para um dicionário.
    :param pdf: A instância do FPDF onde o histórico de chat será adicionado.
    """

    # Converte o histórico de chat em uma lista de dicionários
    chat_dicts = convert_to_dict(chat)

    # Adiciona uma nova página no PDF para o chat
    pdf.add_page()
    
    # Adiciona um título "CHAT" centralizado
    pdf.cell(200, 10, txt="CHAT", ln=True, align="C")

    current_date = None
    print(chat_dicts)
    # Itera sobre cada entrada no histórico de chat
    for entry in chat_dicts:
        # Extrai as informações de data, sistema, técnico, usuário e hora da entrada
        entry_date = entry.get("Date")
        system_msg = entry.get("System")
        technician_msg = entry.get("Technician")
        user_msg = entry.get("User")
        entry_hour = entry.get("Hours")

        # Verifica se a data da entrada é diferente da data atual
        if entry_date != current_date:
            current_date = entry_date
            # Adiciona a data ao PDF, centralizada
            pdf.cell(200, 10, txt=current_date, ln=True, align="C")

        # Adiciona mensagens do sistema ao PDF, centralizadas
        if system_msg:
            pdf.cell(200, 10, txt=f"{system_msg} - {entry_hour}", ln=True, align="C")

        # Adiciona mensagens do técnico ao PDF, alinhadas à esquerda
        if technician_msg:
            pdf.cell(
                200, 10, txt=f"{technician_msg} - {entry_hour}", ln=True, align="L"
            )

        # Adiciona mensagens do usuário ao PDF, alinhadas à esquerda
        if user_msg:
            pdf.cell(200, 10, txt=f"{user_msg} - {entry_hour}", ln=True, align="L")
    return

@transaction.atomic
def ticket_stop(id: int, technician: str, date: str, hours: str, mail: str):
    """
    Altera o status do ticket para 'em aguardo', registrando a ação do técnico e enviando uma notificação.

    :param id: Identificador único do ticket de suporte.
    :param technician: Nome do técnico que está colocando o ticket em aguardo.
    :param date: Data em que o ticket foi colocado em aguardo.
    :param hours: Hora em que o ticket foi colocado em aguardo.
    :param mail: Endereço de e-mail para onde será enviado a notificação.
    :return: Código de status HTTP e a mensagem de status do ticket.
    """

    try:
        # Obtém o ticket de suporte pelo ID fornecido, retornando 404 caso não exista
        ticket = get_object_or_404(SupportTicket, id=id)

        # Verifica se há um técnico responsável pelo ticket
        current_responsible_technician = ticket.responsible_technician
        if current_responsible_technician == None:
            return 304, "error"

        if ticket.open == None:
            return 204, "error"

        # Divide o nome do técnico responsável para realizar a verificação
        partes_nome_pesquisa = current_responsible_technician.split()
        presente = all(parte in technician for parte in partes_nome_pesquisa)

        # Se o técnico informado for o responsável pelo chamado, coloca o ticket em aguardo
        if presente:
            # Atualiza o status do ticket para 'em aguardo' e adiciona a mensagem ao chat
            ticket.open = None
            ticket.chat += f",[[Date:{date}],[System: {technician} Deixou esse chamado em aguardo],[Hours:{hours}]]"

            # Salva as alterações no ticket
            ticket.save()

            # Mensagem a ser enviada na notificação
            msg = f"{technician} Deixou esse chamado em aguardo"
            msg2 = f"Chamado {ticket.id} em aguardo"

            # Inicia uma thread para enviar o e-mail de notificação
            task = Thread(
                target=send_mail,
                args=(mail, msg, msg2),
            )

            task.start()

            # Retorna código de sucesso e mensagem
            return 200, "success"
        else:
            # Retorna erro caso o técnico não seja o responsável
            return 303, "invalid modify"

    # Captura e loga exceções, retornando erro genérico
    except Exception as e:
        logger.error(e)

@transaction.atomic
def ticket_close(id: int, technician: str, date: str, hours: str, mail: str):
    """
    Altera o status do chamado para finalizado e envia uma notificação por e-mail.

    :param id: Identificador único do ticket de suporte.
    :param technician: Nome do técnico responsável pela finalização do chamado.
    :param date: Data em que o chamado foi finalizado.
    :param hours: Hora em que o chamado foi finalizado.
    :param mail: Endereço de e-mail para o envio da notificação.
    :return: Código de status e mensagem de sucesso ou erro.
    """

    # Obtém o ticket de suporte com base no ID fornecido
    ticket = get_object_or_404(SupportTicket, id=id)

    # Obtém o técnico responsável pelo ticket
    current_responsible_technician = ticket.responsible_technician

    # Verifica se um técnico responsável está definido
    if current_responsible_technician == None:
        return 304, "Tecnico não Definido"

    if ticket.open == False:
        return 205, ""

    # Divide o nome do técnico responsável para realizar a verificação
    partes_nome_pesquisa = current_responsible_technician.split()
    presente = all(parte in technician for parte in partes_nome_pesquisa)

    # Se o técnico que está tentando finalizar o chamado é o técnico responsável
    if presente:
        # Marca o ticket como fechado
        ticket.open = False
        # Adiciona a mensagem de finalização no histórico do chat
        ticket.chat += f",[[Date:{date}],[System: {technician} Finalizou o Chamado],[Hours:{hours}]]"
        # Limpa o e-mail do técnico
        ticket.technician_mail = None

        # Obtém a data e hora atual
        current_date = datetime.now()

        # Formata no estilo desejado
        formated_date = current_date.strftime("%Y-%m-%d %H:%M:%S")

        ticket.end_date = formated_date

        # Salva as alterações no ticket
        ticket.save()

        # Mensagem a ser enviada por e-mail
        msg = f"{technician} Finalizou o Chamado"
        msg2 = f"Chamado {ticket.id} finalizado com sucesso!!"

        # Inicia uma thread para enviar o e-mail de notificação
        task = Thread(
            target=send_mail,
            args=(mail, msg, msg2),
        )
        task.start()
            
        return 200, "success"

    # Retorna erro caso o técnico não seja o responsável pelo ticket
    else:
        return 304, "Identificado que o Tecnico não é o atribuido ao Chamado"

@transaction.atomic
def ticket_open(
    id: int, date: str, technician: str, hours: str, techMail: str, mail: str
):
    """
    Altera o status do ticket para 'aberto', registrando a ação do técnico e enviando uma notificação.

    :param id: Identificador único do ticket de suporte.
    :param date: Data em que o chamado foi reaberto.
    :param technician: Nome do técnico que reabriu o ticket.
    :param hours: Hora em que o chamado foi reaberto.
    :param techMail: E-mail do técnico responsável pela reabertura do ticket.
    :param mail: E-mail para onde será enviado a notificação sobre a reabertura.
    :return: Nenhum valor de retorno, mas o ticket é atualizado e uma notificação é enviada.
    """

    # Obtém o ticket de suporte com base no ID fornecido
    ticket = get_object_or_404(SupportTicket, id=id)

    try:
        if ticket.open == True:
            return 206
        # Altera o status do ticket para 'aberto'
        ticket.open = True

        # Adiciona uma mensagem ao histórico do chat informando que o técnico reabriu o ticket
        ticket.chat += f",[[Date:{date}],[System: {technician} Reabriu e atendeu o Chamado],[Hours:{hours}]]"

        # Atualiza o e-mail do técnico responsável
        ticket.technician_mail = techMail

        # Salva as alterações no ticket
        ticket.save()

        # Mensagem de notificação a ser enviada
        msg = f"{technician} Reabriu o Chamado"
        msg2 = f"Reabertura do chamado {ticket.id}"

        # Inicia uma thread para enviar o e-mail de notificação
        task = Thread(
            target=send_mail,
            args=(mail, msg, msg2),
        )

        task.start()

        return 200

    # Captura e loga exceções caso ocorram durante o processo
    except Exception as e:
        logger.error(e)

@transaction.atomic
def change_responsible_technician(
    id: int,
    responsible_technician: str,
    technician: str,
    date: str,
    hours: str,
    techMail: str,
    mail: str,
):
    """
    Atualiza o técnico responsável por um chamado de suporte e registra a mudança no chat do chamado.

    :param body: Dicionário contendo os dados da requisição, incluindo o novo técnico responsável, o técnico atual,
                 a data da mudança, o horário e os e-mails envolvidos.
    :param id: Identificador único do chamado de suporte a ser atualizado.
    :return: Uma tupla contendo o código de status HTTP, a mensagem do chat atualizada e o novo técnico responsável.
    """
    # Verifica se todos os campos obrigatórios estão preenchidos
    if not all([responsible_technician, technician, date, hours, techMail, mail]):
        return 400, "Campos obrigatórios ausentes", ""
    try:
        # Busca o chamado de suporte pelo ID fornecido
        ticket = SupportTicket.objects.get(id=id)
        # Verifica se o chat do chamado já possui mensagens registradas
        if not ticket.chat:
            # Caso não haja mensagens no chat, cria o primeiro registro de atendimento
            ticket.chat = f"[[Date:{date}],[System: {responsible_technician} atendeu ao Chamado],[Hours:{hours}]]"

            # Se um e-mail de usuário estiver disponível, envia uma notificação por e-mail
            if mail:
                msg = f"{technician} atendeu ao Chamado"  # Mensagem do e-mail
                msg2 = f"Atendimento do Chamado {ticket.id}"  # Assunto do e-mail

                # Envia o e-mail em uma thread separada para evitar bloqueio da execução
                Thread(target=send_mail, args=(mail, msg, msg2)).start()
        else:
            # Se já houver mensagens no chat, adiciona um registro informando a transferência do chamado
            ticket.chat += f"[[Date:{date}],[System: {technician} transferiu o Chamado para {responsible_technician}],[Hours:{hours}]],"

        # Atualiza o técnico responsável e o e-mail associado ao chamado
        ticket.responsible_technician = responsible_technician
        ticket.technician_mail = techMail
        ticket.save()  # Salva as alterações no banco de dados

        # Retorna sucesso com o chat atualizado e o novo responsável pelo chamado
        return 200, ticket.chat, ticket.responsible_technician
    except Exception as e:
        # Em caso de erro, registra a exceção nos logs
        logger.error(e)

@transaction.atomic
def updating_chat_change_sender(
    body: dict,
    id: int,
    chat: str,
    date: str,
    hours: str,
    user: str,
    helpdesk: str,
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
    # Obtém o ticket de suporte pelo ID fornecido
    ticket = SupportTicket.objects.get(id=id)
    if helpdesk == "helpdesk":
        chat_message = f",[[Date:{date}],[User: {chat}],[Hours:{hours}]]"
        update_last_sender(ticket, user, date, hours)
    elif helpdesk == "dashboard":
        chat_message = f",[[Date:{date}],[Technician: {chat}],[Hours:{hours}]]"
        update_last_sender(ticket, user, date, hours)
    # Atualiza o histórico do chat do ticket
    ticket.chat += chat_message

    # Salva as alterações no banco de dados
    ticket.save()
    
    print(ticket.chat)

    # Inicia uma nova thread para verificar notificações de chamada
    Thread(target=verify_notificationcall, args=(id,)).start()

    return 200, ticket.chat


@transaction.atomic
def update_last_sender(ticket: SupportTicket, user: str, date: str, hours: str):
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
            new_date = datetime.strptime(f"{date} {hours}", "%d/%m/%Y %H:%M")

            # Se a nova data e hora forem posteriores à anterior, atualiza 'last_sender'
            if new_date > old_date:
                ticket.last_sender = f"{user}, {date} {hours}"
        except ValueError:
            # Exibe erro caso a conversão da data falhe, mantendo 'last_sender' inalterado
            print("Erro ao converter a data, mantendo last_sender inalterado.")
    else:
        # Se 'last_sender' não estiver definido, atribui o valor inicial
        ticket.last_sender = f"{user}, {date} {hours}"

    ticket.save()


def process_ticket_files(ticket_id):
    """Processa arquivos anexados ao chamado e retorna listas organizadas"""
    image_data = []
    content_file = []
    name_file = []

    act_dir = f"{getcwd()}/uploads/{ticket_id}"
    if not (exists(act_dir) and isdir(act_dir)):
        return image_data, content_file, name_file

    ticket_files = TicketFile.objects.filter(ticket_id=ticket_id)
    mime = Magic()

    for file in ticket_files:
        file_path = str(file.file)
        file_name = "/".join(file_path.split("/")[2:])
        file_abs_path = path.join(getcwd(), file_path)

        if not path.exists(file_abs_path):
            print(f"Arquivo não encontrado: {file_abs_path}")
            continue

        try:
            with file.file.open() as img:
                pil_image = Image.open(img)
                img_bytes = BytesIO()
                pil_image.save(img_bytes, format="PNG")
                image_data.append(
                    {"image": b64encode(img_bytes.getvalue()).decode("utf-8")}
                )
                content_file.append("img")
                name_file.append(file_name)

        except UnidentifiedImageError:
            with file.file.open("rb") as f:
                file_content = f.read()
                file_type = mime.from_buffer(file_content).lower()
                file_type_clean = plt(r",|\(", file_type)[0].strip()

                type_mapping = {
                    "mail": "mail",
                    "rfc 822 mail": "mail",
                    "cdfv2 microsoft outlook message": "mail",
                    "excel": "excel",
                    "composite document file v2 document": "excel",
                    "zip": "zip",
                    "utf-8 text": "txt",
                    "ascii text": "txt",
                    "microsoft word": "word",
                    "pdf document": "pdf",
                }

                for key, value in type_mapping.items():
                    if file_type_clean.startswith(key):
                        image_data.append(value)
                        content_file.append(b64encode(file_content).decode("utf-8"))
                        name_file.append(file_name)
                        break

    return image_data, content_file, name_file


@never_cache
@require_GET
@login_required(login_url="/login")
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

        # Recupera o chat do ticket
        chat = ticket.chat

        # Retorna o chat do ticket em formato JSON com código de status 200
        return JsonResponse({"chat": chat}, status=200, safe=True)
    except Exception as e:
        # Registra erro e retorna uma resposta de erro com status 305
        logger.error(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=305)


@require_GET
@login_required(login_url="/login")
@never_cache
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
):
    try:
        # Mapeia o status recebido para o formato esperado no banco de dados
        status_opng = status_mapping.get(status, None)

        # Se o search_query for "null" ou "None", redefine o valor para uma string vazia
        if search_query in {"null", "None"}:
            search_query = ""

        if url == "dashboards":
            # Inicializa o filtro principal vazio caso seja algum tecnico
            if request.user.groups.filter(name__in=[Back_Tech, Back_Leader]).exists():
                filters = Q()
        elif url == "history":
            # Inicializa o filtro principal obrigando a busca pelo "ticketRequester"
            filters = Q(ticketRequester=user)
        else:
            return JsonResponse(
                {"Error": "Solciitação Invalida"}, safe=True, status=500
            )

        # Se o setor não for "all" ou "null", adiciona ao filtro
        if sector.lower() not in {"all", "null"}:
            filters &= Q(sector=sector)
            filter_sector = True
        else:
            filter_sector = False

        # Se o status não for "All" ou "null", adiciona ao filtro
        if status_opng not in {"All", "null"}:
            filters &= Q(open=status_opng)

        # Se a ocorrência não for "all" ou "null", adiciona ao filtro
        if occurrence.lower() not in {"all", "null"}:
            filters &= Q(occurrence=occurrence)
            filter_occurrence = True
        else:
            filter_occurrence = False

        # Inicializa os filtros para busca de texto
        search_filters = Q()

        # Verifica se o search_query contém apenas números
        if search_query.isdigit():
            # Se contiver apenas números, realiza busca por ID ou data
            search_filters |= Q(id__icontains=search_query)
            search_filters |= Q(start_date__icontains=search_query)
        else:
            # Se for texto, realiza busca por setor, ocorrência ou problema
            if not filter_sector:
                search_filters |= Q(sector__icontains=search_query)
                search_filters |= Q(occurrence__icontains=search_query)
                search_filters |= Q(problemn__icontains=search_query)
                search_filters |= Q(ticketRequester__icontains=search_query)

            # Se a ocorrência não for filtrada, adiciona também a busca por ocorrência ou problema
            if not filter_occurrence:
                search_filters |= Q(occurrence__icontains=search_query)
                search_filters |= Q(problemn__icontains=search_query)
                search_filters |= Q(ticketRequester__icontains=search_query)

            # Se ambos setor e ocorrência forem filtrados, busca apenas pelo problema
            if filter_sector and filter_occurrence:
                search_filters |= Q(problemn__icontains=search_query)
                search_filters |= Q(ticketRequester__icontains=search_query)

        # Aplica o filtro de pesquisa caso haja search_query
        if search_query:
            filters &= search_filters

        # Filtra os chamados com base nos critérios definidos e aplica a ordenação
        tickets = SupportTicket.objects.filter(filters).order_by(order or "-id")[
            :quantity
        ]

        # Serializa os objetos para JSON e inclui o ID do chamado
        ticket_objects = [
            {**loads(serialize("json", [ticket]))[0]["fields"], "id": ticket.id}
            for ticket in tickets
        ]

        # Retorna os chamados em formato JSON
        return JsonResponse({"tickets": ticket_objects}, status=200, safe=True)

    except Exception as e:
        # Registra qualquer erro e retorna uma resposta com o erro
        logger.error(f"Erro ao buscar chamados: {e}")
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=308)


@contextmanager
def get_database_connection():
    """
    Context manager for gerenciar conexões com o banco de dados MySQL.

    Este contexto gerencia a criação, uso e fechamento da conexão com o banco de dados,
    garantindo que a conexão seja encerrada corretamente mesmo em caso de erro.

    :yield: Conexão ativa com o banco de dados.
    :raises connector.Error: Levanta um erro se a conexão com o banco de dados falhar.
    """
    connection = None
    try:
        connection = connector.connect(
            host=config("DB_HOST"),
            database=config("DB_NAME"),
            user=config("DB_USER"),
            password=config("DB_PASSWORD"),
        )
        yield connection
    except connector.Error as err:
        logger.error(f"Erro na conexão com o banco de dados: {err}")
        raise
    finally:
        if connection and connection.is_connected():
            connection.close()


@login_required(login_url="/login")
@require_GET
@cache_page(60 * 5)
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
                cursor.execute(query, (location, ))
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
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

    return JsonResponse({"machines": results_list}, status=200, safe=True)


def convert_to_dict(chat_data):
    """
    Converte os dados do chat em um dicionário a partir de uma string formatada.

    A função utiliza uma expressão regular para extrair pares de chave-valor da string `chat_data`
    e os retorna como uma lista de dicionários.

    :param chat_data: Dados do chat em formato de string.
    :return: Lista de dicionários contendo os pares chave-valor extraídos da string.
    :raises Exception: Levanta erro se ocorrer uma falha inesperada durante a execução.
    """
    # Verifica se chat_data está vazio, se estiver, retorna uma lista vazia
    if not chat_data:
        return []

    try:
        # Define o padrão (regex) para capturar chave-valor no formato [chave:valor]
        pattern = r"\[([^:\[\]]+):([^,\]]+)"

        # Usa o findall para encontrar todas as ocorrências do padrão na string chat_data
        matches = findall(pattern, chat_data)

        # Para cada ocorrência encontrada, cria um dicionário com chave e valor extraídos
        return [{match[0]: match[1]} for match in matches]

    except Exception as e:
        # Em caso de erro, imprime o erro e retorna um JsonResponse com status de erro
        logger.error(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=311)


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
        ticket_data = SupportTicket.objects.get(respective_area="TI", id=id)
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

        # Inicia uma thread para verificar a notificação do chamado
        Thread(
            target=verify_notificationcall,
            args=(id,),
        ).start()

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
    if name_verify:
        # Se name_verify não for vazio, divide o nome em palavras
        name_ver = name_verify.split(" ")

    if responsible_technician:
        # Se responsible_technician não for vazio, divide o nome do técnico em palavras
        tech_ver = responsible_technician.split(" ")

        # Verifica se todas as palavras do nome do técnico estão presentes no nome a ser verificado
        all_find = all(word in name_ver for word in tech_ver)
        return all_find

    # Retorna False caso não haja nome a ser verificado ou nome do técnico responsável
    return False


active_timers = {}
timers_lock = Lock()


class CountdownTimer:
    """
    Classe que representa um temporizador regressivo associado a um ID e uma função de callback.

    Essa classe permite iniciar e parar um temporizador que executará a função de callback após um período determinado.

    :param duration: Duração do temporizador em segundos.
    :param callback: Função a ser chamada ao término do temporizador.
    :param id: Identificador único para o temporizador.
    """

    def __init__(self, duration, callback, id):
        self.duration = duration  # Define a duração do temporizador em segundos
        self.callback = (
            callback  # Define a função de callback a ser executada ao final do tempo
        )
        self.id = id  # Atribui um identificador único ao temporizador
        self.timer = None  # Inicializa o temporizador como None
        self.start_time = (
            None  # Inicializa a variável que armazenará o momento de início
        )

    def start(self):
        """
        Inicia o temporizador, registrando o momento de início e agendando a execução da callback.
        """
        self.start_time = (
            time()
        )  # Registra o momento em que o temporizador foi iniciado
        self.timer = Timer(
            self.duration, self.callback
        )  # Cria um temporizador com a duração especificada
        self.timer.start()  # Inicia o temporizador

    def stop(self):
        """
        Cancela o temporizador caso ele esteja em execução.
        """
        if self.timer:  # Verifica se há um temporizador ativo
            self.timer.cancel()  # Cancela a execução do temporizador


def notify(id):
    """
    Envia uma notificação por e-mail quando uma mensagem em um chamado não é visualizada.

    A função realiza uma série de verificações, como:
    - Se o técnico possui um e-mail registrado.
    - Se o chamado está aberto.
    - Identifica o último remetente da mensagem.
    - Envia um e-mail para o destinatário adequado (técnico ou usuário) com as últimas mensagens não visualizadas.

    :param id: ID do chamado no sistema.
    """
    mail_tech = None
    try:
        # Obtém o ticket correspondente ao ID fornecido.
        ticket = SupportTicket.objects.get(id=id)

        # Mensagem que será enviada informando que a mensagem não foi visualizada.
        msg2 = f"Chamado {id}: Menssagem não Visualizada!"

        # Extrai o último remetente e as informações do chat.
        last_sender, _ = ticket.last_sender.split(", ")
        chat = ticket.chat
        status = ticket.open
        mail_tech = ticket.technician_mail
        mail_user = ticket.mail

        # Verifica se o e-mail do técnico está presente.
        if not mail_tech or mail_tech == None:
            logger.error("email do tecnico não existe")
            return stop_timer(id)

        # Verifica se o e-mail do técnico está presente.
        if not mail_user or mail_user == None:
            logger.error("email do tecnico não existe")
            return stop_timer(id)

        # Verifica se o status do chamado está aberto.
        if not status or status == None or status == False:
            return stop_timer(id)

        # Divide o chat em seções para processar as mensagens.
        sections = chat.split("],[")

        # Ajusta a formatação da primeira e última seção do chat.
        sections[0] = "[" + sections[0]
        sections[-1] = sections[-1] + "]"

        # Agrupa as seções em pacotes de três elementos.
        result = [sections[i : i + 3] for i in range(0, len(sections), 3)]
        message_ux = result[-1][1]  # Pega a última mensagem.

        # Separa a mensagem para identificar quem foi o remetente.
        split_item = message_ux.split(":")

        # Define o destinatário com base no remetente da mensagem.
        if split_item[0] == "Technician":
            primary = "Technician"
            mailTo = mail_user  # Envia para o usuário.
        elif split_item[0] == "User":
            primary = "User"
            mailTo = mail_tech  # Envia para o técnico.
        else:
            logger.error("Erro ao detectar quem enviou a menssagem")
            # Para o temporizador ativo e remove da lista de timers.
            active_timers[id].stop()
            del active_timers[id]
            return

        # Pega as últimas cinco mensagens do chat.
        last_three = result[-5:]

        # Armazena as mensagens a serem enviadas no e-mail.
        messages = []
        for item in last_three:
            second_value = item[1]
            split_value = second_value.split(":")

            # Verifica se a mensagem pertence ao remetente identificado (técnico ou usuário).
            if split_value[0].strip() == primary:
                messages.append(split_value[1].strip())

        # Formata o corpo do e-mail com as mensagens.
        msg = f"{last_sender} enviou uma mensagem.\n{chr(10).join(messages)}"

        # Verifica se o temporizador ainda está ativo.
        if id not in active_timers:
            return

        # Inicia a thread para enviar o e-mail.
        task = Thread(
            target=send_mail,
            args=(mailTo, msg, msg2),
        )

        task.start()

        # Retorna finalizando o time do ID especificado
        return stop_timer(id)
    except Exception as e:
        logger.error(e)
        # Retorna finalizando o time do ID especificado
        return stop_timer(id)
    finally:
        # Retorna finalizando o time do ID especificado
        return stop_timer(id)


def stop_timer(id):
    """
    Remove o temporizador associado a um ID do dicionário `active_timers`.

    A função verifica se o ID está presente no dicionário `active_timers`,
    para então parar o temporizador e removê-lo da lista.

    :param id: ID do temporizador a ser removido.
    """
    # Verifica se o ID existe no dicionário de temporizadores ativos.
    if id in active_timers:
        # Para o temporizador associado ao ID.
        active_timers[id].stop()
        # Remove o temporizador do dicionário.
        del active_timers[id]


def call_timer(id, status):
    """
    Inicia ou para a chamada de e-mail de um chamado específico baseado no status fornecido.

    A função verifica o status ("start" ou "stop") e realiza a ação apropriada para iniciar
    ou parar o temporizador associado ao chamado identificado pelo ID.

    :param id: ID do chamado para o qual o temporizador será iniciado ou parado.
    :param status: O status que determina se o temporizador deve ser iniciado ("start") ou parado ("stop").
    """
    global active_timers  # Define que a variável global active_timers será usada.

    with (
        timers_lock
    ):  # Utiliza um lock para garantir que o código seja executado de maneira thread-safe.
        try:
            if status == "start":  # Se o status for "start", iniciar o temporizador.
                if (
                    id not in active_timers
                ):  # Verifica se já existe um temporizador para o ID.
                    # Cria um novo temporizador com 10800 segundos (3 horas) e uma callback para a função 'notify'.
                    timer = CountdownTimer(10800, lambda: notify(id), id)
                    timer.start()  # Inicia o temporizador.
                    active_timers[id] = (
                        timer  # Armazena o temporizador no dicionário `active_timers`.
                    )
                    return
            elif status == "stop":  # Se o status for "stop", parar o temporizador.
                if id in active_timers:  # Verifica se o ID tem um temporizador ativo.
                    # Chama a função `stop_timer` para interromper o temporizador.
                    return stop_timer(id)
        except Exception as e:
            # Caso ocorra algum erro, registra o erro no log.
            logger.error(f"Erro ao tentar {status} o timer para o chamado {id}: {e}")


def verify_notificationcall(id):
    """
    Verifica se é válido iniciar o temporizador para enviar a notificação por e-mail, com base
    nos dados do chamado. A função compara os campos 'last_sender' e 'last_viewer' e decide
    se o temporizador deve ser iniciado ou parado.

    :param id: ID do chamado que será verificado.
    """
    try:
        # Obtém o ticket do banco de dados utilizando o ID fornecido.
        ticket = SupportTicket.objects.get(id=id)

        # Recupera os valores de 'last_sender' e 'last_viewer' do ticket.
        last_sender = ticket.last_sender
        last_viewer = ticket.last_viewer

        # Verifica se ambos os campos possuem valores válidos.
        if not last_sender or not last_viewer:
            return  # Se faltar dados, a função retorna sem fazer mais verificações.

        # Ajusta o formato do nome do último remetente e do último visualizador para comparações.
        last_sender_adjusted = last_sender.split(", ")[0].replace(" ", "")
        last_viewer_adjusted = last_viewer.replace(" ", "")

        # Se o último remetente e o último visualizador forem iguais, inicia o temporizador.
        if last_sender_adjusted == last_viewer_adjusted:
            return call_timer(id, "start")
        else:
            # Caso contrário, para o temporizador.
            return call_timer(id, "stop")

    except Exception as e:
        # Caso ocorra algum erro, loga a exceção.
        return logger.error(f"Erro ao verificar o chamado {id}: {e}")


@require_GET
def get_image(request, mac):
    try:
        with get_database_connection() as connection:  # 🔹 Agora usa 'with'
            cursor = connection.cursor()
            query = "SELECT model FROM machines WHERE mac_address = %s;"
            cursor.execute(query, (mac,))
            result = cursor.fetchone()
            cursor.close()

            if result is None:
                return JsonResponse({"error": "Modelo não encontrado"}, status=404)

            return JsonResponse({"model": result[0]})

    except connector.Error as e:
        logger.error(f"Erro na consulta ao banco de dados: {e}")
        return JsonResponse({"error": "Erro na consulta ao banco de dados"}, status=500)