# Importando os módulos necessários para o funcionamento do código.
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from smtplib import SMTP
from threading import Thread, Timer
from django.shortcuts import get_object_or_404, render, redirect
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from os import getenv
from json import loads
from django.middleware.csrf import get_token
from datetime import datetime
from .models import SupportTicket, TicketFile
from django.contrib.auth.models import User
from .models import SupportTicket
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
from re import findall, search
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

status_mapping = {"open": True, "close": False, "stop": None, "all": "All"}


def sendMail(mail: str, msgm1: str, msgm2: str):
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
@never_cache
def firstView(request: WSGIRequest):
    if request.method == "POST":
        equipament_list = []
        try:
            csrf = get_token(request)

            if Equipaments.objects.exists():
                equipaments = Equipaments.objects.all().only(
                    "equipament", "model", "company", "id"
                )

                for equipament in equipaments:
                    try:
                        with equipament.equipament.open() as img:
                            pil_image = Image.open(img)

                            img_bytes = BytesIO()
                            pil_image.save(img_bytes, format="PNG")

                            image_data = b64encode(img_bytes.getvalue()).decode("utf-8")

                            equipament_list.append(
                                {
                                    "image": image_data,
                                    "model": equipament.model,
                                    "company": equipament.company,
                                    "id": equipament.id,
                                }
                            )
                    except Exception as img_error:
                        logger.error(
                            f"Erro ao processar imagem do equipamento {equipament.id}: {img_error}"
                        )
                        continue  # Se falhar ao processar a imagem, ignora esse item e continua

            return JsonResponse(
                {"token": csrf, "equipaments": equipament_list},
                status=200,
                safe=True,
            )
        except Exception as e:
            logger.error(e)
            return JsonResponse({"status": str(e)}, status=300, safe=True)

    if request.method == "GET":
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
def submitTicket(request):
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
            "pid": request.POST.get("PID"),  # Obtém o identificador único do chamado
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

        # Validar se o PID foi fornecido, pois é um campo obrigatório
        if not form_data["pid"]:
            return JsonResponse({"error": "PID is required"}, status=403)

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

    # Verifica se há imagens anexadas no formulário
    if "image" in request.FILES:
        id, status = process_files(request, form_data)  # Processa imagens enviadas
        if status == 300:
            return JsonResponse(
                {"error": f"Erro no processamento da imagem: {id}"},
                status=300,
                safe=True,
            )
        valid = True  # Marca que houve um processamento válido

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
            PID=form_data["pid"],  # Define o identificador único do chamado
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
        {"id": id}, status=200, safe=True
    )  # Retorna o ID do chamado criado com sucesso


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
            PID=form_data["pid"],  # Define o identificador único do chamado
            open=True,  # Define o chamado como aberto
        )

        images = request.FILES.getlist("image")  # Obtém a lista de arquivos enviados
        mime = Magic()  # Inicializa a biblioteca para detecção de tipo MIME

        for file in images:
            image_bytes = file.read()  # Lê os bytes do arquivo
            file_type = mime.from_buffer(image_bytes)  # Determina o tipo de arquivo

            # Verifica se o arquivo enviado é válido
            if not is_valid_file(file, file_type):
                return (
                    "Invalid image type",
                    400,
                )  # Retorna erro se o arquivo for inválido

            ticket.save()  # Salva o chamado no banco de dados

            ticket_file = TicketFile(
                ticket=ticket
            )  # Cria uma instância de arquivo associado ao chamado
            ticket_file.file.save(
                str(file), ContentFile(image_bytes)
            )  # Salva o arquivo no banco de dados

            id = ticket.id  # Obtém o ID do chamado salvo

        return id, 200  # Retorna o ID do chamado e status de sucesso

    except Exception as e:
        logger.error(f"Erro no processamento de imagem: {e}")  # Registra erro no log
        return e, 300  # Retorna erro interno no processamento


def is_valid_file(file: InMemoryUploadedFile, file_type: str):
    # Comparar com a biblioteca `Magic`
    if any(ext in file_type.lower() for ext in types_str):
        return True

    # Comparar pelo mimetypes padrão do Python
    guessed_type = mimetypes.guess_type(str(file))[0]
    return guessed_type in types_str if guessed_type else False


@csrf_exempt
@login_required(login_url="/login")
@never_cache
@require_GET
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

        filters = {"ticketRequester": usr}

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
        print(e)  # Exibe o erro no console (melhor utilizar logger)
        return JsonResponse({"status": "Invalid Credentials"}, status=402, safe=True)


@csrf_exempt
@never_cache
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

                return JsonResponse(
                    {
                        "chat": chat,
                        "technician": technician,
                        "id": id,
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
                    body, id, chat, date, hours, technician, user
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

                # Caso o status seja 'open', abre o ticket
                elif status == "open":
                    ticket_open(id, date, technician, hours, techMail, mail)

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

                    # Se o status for 303, retorna a mensagem de erro associada
                    elif status_def == 303:
                        return JsonResponse({"Error": f"{msg}"}, status=303, safe=True)

                # Retorna uma resposta de sucesso (status 200) caso o status tenha sido atualizado corretamente
                return JsonResponse({"status": "ok"}, status=200, safe=True)

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

            pid = ticket.PID
            # Verifica se o PID do ticket está presente
            if not pid:
                return redirect("/helpdesk")

            user = request.user
            # Verifica se o usuário pertence ao grupo "Back_User"
            if user.groups.filter(name="Back_User").exists():
                pid_viewer = request.META.get("HTTP_PID")
                # Verifica se o PID fornecido no cabeçalho corresponde ao PID do ticket
                if not pid_viewer or int(pid_viewer) != pid:
                    return redirect("/helpdesk")

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
                "PID": pid,
                "responsible_technician": ticket.responsible_technician,
                "id": ticket.id,
                "chat": ticket.chat,
                "file": image_data,
                "open": ticket.open,
                "name_file": name_file,
                "content_file": content_file,
                "equipament": ticket.equipament,
            }

            # Retorna os dados do ticket como resposta JSON com código de status 200
            return JsonResponse({"data": serialized_ticket}, status=200)

        except Exception as e:
            # Registra erro e retorna uma resposta de erro com status 304
            logger.error(e)
            return JsonResponse({"Error": f"Erro inesperado {e}"}, status=304)


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

        # Cria uma nova instância do FPDF para gerar o PDF
        pdf = FPDF()
        pdf.add_page()

        # Obtém o diretório de trabalho atual e define a fonte Arial para o PDF
        directory = getcwd()
        pdf.add_font("Arial", "", f"{directory}/arial.ttf")
        pdf.set_font("Arial", size=12)

        # Adiciona o título do chamado ao PDF
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


def add_machine_info_to_pdf(ticket: SupportTicket, pdf: FPDF):
    """
    Adiciona informações sobre a máquina alocada no ticket de suporte ao PDF, incluindo o nome da máquina
    e a data de alocação.

    :param ticket: O ticket de suporte que contém informações sobre a máquina alocada.
    :param pdf: A instância do FPDF onde as informações sobre a máquina serão adicionadas.
    """

    # Adiciona o nome da máquina alocada ao PDF
    pdf.cell(200, 10, txt=f"Máquina Alocada: {ticket.equipament}", ln=True, align="L")

    # Adiciona a data de alocação da máquina ao PDF
    pdf.cell(
        200, 10, txt=f"Data de alocação: {ticket.date_alocate}", ln=True, align="L"
    )


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
                target=sendMail,
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

        # Salva as alterações no ticket
        ticket.save()

        # Mensagem a ser enviada por e-mail
        msg = f"{technician} Finalizou o Chamado"
        msg2 = f"Chamado {ticket.id} finalizado com sucesso!!"

        # Inicia uma thread para enviar o e-mail de notificação
        task = Thread(
            target=sendMail,
            args=(mail, msg, msg2),
        )
        task.start()

        return 200, "success"

    # Retorna erro caso o técnico não seja o responsável pelo ticket
    else:
        return 304, "Identificado que o Tecnico não é o atribuido ao Chamado"


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
            target=sendMail,
            args=(mail, msg, msg2),
        )

        task.start()

    # Captura e loga exceções caso ocorram durante o processo
    except Exception as e:
        logger.error(e)


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
                Thread(target=sendMail, args=(mail, msg, msg2)).start()
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


def updating_chat_change_sender(
    body: dict, id: int, chat: str, date: str, hours: str, technician: str, user: str
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

    # Verifica se a mensagem foi enviada pelo técnico e formata a entrada do chat
    if "technician" in body:
        chat_message = f",[[Date:{date}],[Technician: {chat}],[Hours:{hours}]]"
        update_last_sender(ticket, technician, date, hours)

    # Verifica se a mensagem foi enviada pelo usuário e formata a entrada do chat
    elif "User" in body:
        chat_message = f",[[Date:{date}],[User: {chat}],[Hours:{hours}]]"
        update_last_sender(ticket, user, date, hours)

    # Retorna erro caso nem "technician" nem "User" estejam no corpo da requisição
    else:
        return 400, "Nem 'technician' nem 'User' foram informados"

    # Atualiza o histórico do chat do ticket
    ticket.chat += chat_message

    # Salva as alterações no banco de dados
    ticket.save()

    # Inicia uma nova thread para verificar notificações de chamada
    Thread(target=verifyNotificationCall, args=(id,)).start()

    return 200, ticket.chat


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

                type_mapping = {
                    "mail": "mail",
                    "excel": "excel",
                    "zip": "zip",
                    "utf-8 text": "txt",
                    "ascii text": "txt",
                    "microsoft word": "word",
                    "pdf document": "pdf",
                }

                for key, value in type_mapping.items():
                    if key in file_type:
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
def moreTicket(request, quantity, order, usr, sector):
    """
    Gera mais chamados de acordo com os filtros fornecidos (quantidade, ordem, usuário e setor).

    A função retorna uma lista de tickets filtrados e ordenados com base nos parâmetros fornecidos,
    como quantidade de tickets, setor e ordem de exibição.

    :param request: Objeto da requisição.
    :param quantity: Quantidade de tickets a serem retornados.
    :param order: Ordem de exibição dos tickets (ex: "-id" ou outro critério).
    :param usr: Usuário responsável pelos tickets.
    :param sector: Setor de onde os tickets serão filtrados.

    :return: Retorna um JSON com os tickets filtrados e ordenados ou um erro caso ocorra uma falha.
    """
    count = quantity + 10  # Ajusta a quantidade de tickets a serem retornados
    try:
        # Se o setor for "TI", aplica a lógica de ordenação de acordo com o parâmetro "order"
        if sector == "TI":
            tickets = (
                SupportTicket.objects.order_by("-id")[:count]
                if order == "-id"
                else SupportTicket.objects.all()[:count]
            )
        else:
            # Se o setor não for "TI", filtra pelos tickets do usuário fornecido e aplica a ordenação
            tickets = (
                SupportTicket.objects.filter(ticketRequester=usr).order_by("-id")[
                    :count
                ]
                if order == "-id"
                else SupportTicket.objects.filter(ticketRequester=usr)[:count]
            )

        # Serializa os tickets para retornar os campos desejados
        ticket_objects = [
            {**loads(serialize("json", [ticket]))[0]["fields"], "id": ticket.id}
            for ticket in tickets
        ]

        # Retorna os tickets com o status 200
        return JsonResponse(
            {"tickets": ticket_objects, "count": count}, status=200, safe=True
        )

    except Exception as e:
        # Registra o erro e retorna uma resposta com erro 306
        logger.error(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=306)


@require_GET
@login_required(login_url="/login")
@never_cache
def get_ticket_filter(
    request,
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

        if search_query in {"null", "None"}:
            search_query = ""

        filters = Q(ticketRequester=user)

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

        search_filters = Q()

        # Verifica se o search_query contém apenas números
        if search_query.isdigit():
            # Caso contenha apenas números, busca por ID
            search_filters |= Q(id__icontains=search_query)

            # Busca por datas que contenham o número (ano, mês, dia, hora, etc.)
            search_filters |= Q(start_date__icontains=search_query)
        else:
            # Caso contrário, realiza busca pelos outros campos
            if not filter_sector:
                search_filters |= Q(sector__icontains=search_query)
                search_filters |= Q(occurrence__icontains=search_query)
                search_filters |= Q(problemn__icontains=search_query)

            if not filter_occurrence:
                search_filters |= Q(occurrence__icontains=search_query)
                search_filters |= Q(problemn__icontains=search_query)

            if filter_sector and filter_occurrence:
                search_filters |= Q(problemn__icontains=search_query)

        # Aplica o filtro de pesquisa
        if search_query:
            filters &= search_filters
        # Filtra os chamados com base nos critérios e aplica a ordenação, caso fornecida
        tickets = SupportTicket.objects.filter(filters).order_by(order or "-id")[
            :quantity
        ]

        # Serializa os objetos para JSON, incluindo o ID do chamado
        ticket_objects = [
            {**loads(serialize("json", [ticket]))[0]["fields"], "id": ticket.id}
            for ticket in tickets
        ]

        # Retorna a lista de chamados em formato JSON
        return JsonResponse({"tickets": ticket_objects}, status=200, safe=True)

    except Exception as e:
        # Registra o erro no log e retorna uma resposta de erro
        logger.error(f"Erro ao buscar chamados: {e}")
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=308)


@contextmanager
def get_database_connection():
    """Context manager for managing database connections."""
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
        logger.error(f"Database connection error: {err}")
        raise
    finally:
        if connection and connection.is_connected():
            connection.close()


@login_required(login_url="/login")
@require_GET
@never_cache
def equipamentsForAlocate(request):
    connection = None
    cursor = None
    query = None
    result = None
    results_list = None
    try:
        with get_database_connection() as connection:
            cursor = connection.cursor()
            query = "SELECT * from machines WHERE alocate = 0"
            cursor.execute(query)
            result = cursor.fetchall()

            # Converta os resultados para uma lista de dicionários
            results_list = [
                {
                    "mac_address": row[0],
                    "distribution": row[3],
                    "manufacturer": row[9],
                    "model": row[10],
                }
                for row in result
            ]
    except Exception as e:
        print(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=310)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

    return JsonResponse({"machines": results_list}, status=200, safe=True)


# Função para converter a lista de strings em uma lista de dicionários
def convert_to_dict(chat_data):
    if not chat_data:
        return []

    try:
        pattern = r"\[([^:\[\]]+):([^,\]]+)"

        # Encontrar todas as correspondências na string
        matches = findall(pattern, chat_data)

        # Inicializar o dicionário
        dictionary = {}
        dictionaries = []

        # Adicionar as correspondências ao dicionário
        for match in matches:
            key = match[0]
            value = match[1]
            dictionary = {key: value}
            dictionaries.append(dictionary)

    except Exception as e:
        print(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=311)

    return dictionaries


def dateEquipamentsAlocate(request, mac):
    tickets = None
    alocate_dates = None
    try:
        tickets = SupportTicket.objects.filter(equipament=mac)

        # Em seguida, extraia os valores do campo 'alocate_date' em um array
        alocate_dates = tickets.values_list("date_alocate", flat=True)

        # O resultado será um queryset contendo apenas os valores de 'alocate_date'
        # Você pode converter para uma lista, se necessário
        alocate_dates_list = list(alocate_dates)

        return JsonResponse({"dates": alocate_dates_list}, status=200, safe=True)
    except Exception as e:
        print(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=312)


@require_POST  # Garante que a função só será chamada com um POST
@login_required(
    login_url="/login"
)  # Garante que o usuário está autenticado, redirecionando para login se necessário
@requires_csrf_token  # Exige um token CSRF para proteger contra ataques CSRF
@transaction.atomic
def changeLastViewer(request, id):
    # Inicializa variáveis para armazenar dados do chamado, chat, seções, e resultados de verificações
    ticket_data = None
    chat = None
    sections = None
    result = None
    last_vw = None
    body = None
    grouped = None
    try:
        # Obtém os dados do chamado, filtrando pela área TI e pelo id fornecido
        ticket_data = SupportTicket.objects.get(respective_area="TI", id=id)

        # Verifica se o chamado tem chat associado
        chat = ticket_data.chat
        if chat == None or len(chat) <= 0:
            # Se não houver chat, retorna um status indicando que o chamado não foi atendido
            return JsonResponse(
                {"status": "Chamado ainda não foi atendido"}, safe=True, status=201
            )

        # Divide o chat em seções, separando os dados entre as entradas com base nas vírgulas externas aos colchetes
        sections = chat.split("],[")

        # Adiciona os colchetes de volta para corrigir o primeiro e último item da lista
        sections[0] = "[" + sections[0]
        sections[-1] = sections[-1] + "]"

        # Transforma as seções em arrays, separando os valores por vírgula
        grouped = [section.split(",") for section in sections]

        # Agrupa as seções em blocos de 3 elementos
        result = [grouped[i : i + 3] for i in range(0, len(grouped), 3)]

        if len(result) == 1:
            # Se a lista de mensagens for composta por apenas uma entrada (do sistema), retorna que nenhuma mensagem foi enviada
            return JsonResponse(
                {"status": "Não houve mensagem enviada além do sistema"},
                safe=True,
                status=201,
            )

        # Carrega o corpo da requisição para obter dados adicionais
        body = loads(request.body)
        last_vw = body.get("viewer")  # Último visualizador
        tech = body.get("technician")  # Nome do técnico
        requester = body.get(
            "requester"
        )  # Quem está fazendo a requisição (técnico ou usuário)

        # Verifica se o solicitante é o técnico
        if requester == "tech":
            # Chama a função de verificação de nomes para garantir que o chamado está sendo visualizado pelo técnico correto
            verify = verify_names(last_vw, tech)
            if not verify:
                # Se o técnico não for o correto, retorna uma mensagem de erro
                return JsonResponse(
                    {"status": "O Chamado é de outro Técnico"},
                    safe=True,
                    status=201,
                )

        # Verifica se o solicitante é o usuário
        elif requester == "user":
            # Se o solicitante for o usuário, garante que o último visualizador seja o mesmo que o solicitante do chamado
            if last_vw != ticket_data.ticketRequester:
                return JsonResponse(
                    {"status": "O Chamado não é desse usuário"},
                    safe=True,
                    status=201,
                )

        # Se todas as verificações passarem, atualiza o último visualizador do chamado
        ticket_data.last_viewer = last_vw
        ticket_data.save()

        Thread(
            target=verifyNotificationCall,
            args=(id,),
        ).start()
        # Retorna sucesso
        return JsonResponse({"status": "Last Viewer Alterado"}, safe=True, status=200)

    except Exception as e:
        # Em caso de erro, imprime a exceção e retorna um status de falha
        print(e)
        return JsonResponse({"status": "fail"}, safe=True, status=311)


def verify_names(name_verify, responsible_technician):
    if name_verify:
        # Divide o nome completo que será verificado em uma lista de palavras (nome e sobrenome)
        name_ver = name_verify.split(" ")

    # Verifica se existe um responsável técnico fornecido
    if responsible_technician:
        # Divide o nome completo do responsável técnico em uma lista de palavras (nome e sobrenome)
        tech_ver = responsible_technician.split(" ")

        # Verifica se todas as palavras do nome do responsável técnico estão presentes no nome a ser verificado
        # 'all' retorna True se todos os elementos da expressão forem True
        all_find = all(word in name_ver for word in tech_ver)

        # Retorna True se todas as palavras do nome do responsável técnico estiverem no nome a ser verificado
        return all_find

    # Se não houver responsável técnico, retorna False indicando que a verificação falhou
    return False


active_timers = {}
timers_lock = Lock()


class CountdownTimer:
    def __init__(self, duration, callback, id):
        """
        duration: tempo em segundos (ex: 5 minutos = 300 segundos)
        callback: função que será chamada quando o tempo terminar
        """
        self.duration = duration
        self.callback = callback
        self.id = id
        self.timer = None
        self.start_time = None  # Armazena o tempo de início

    def start(self):
        """Inicia o contador."""
        self.start_time = time()
        self.timer = Timer(self.duration, self.callback)
        self.timer.start()

    def stop(self):
        """Para o contador antes de completar."""
        if self.timer:
            self.timer.cancel()


# Função que será chamada após 5 minutos
def notify(id):
    mail_tech = None
    try:
        ticket = SupportTicket.objects.filter(id=id)

        msg2 = f"Chamado {id}: Menssagem não Visualizada!"

        for field in ticket:
            last_sender, _ = field.last_sender.split(", ")
            chat = field.chat
            status = field.open
            mail_tech = field.technician_mail
            mail_user = field.mail

        if not mail_tech or mail_tech == None:
            print("email do tecnico não existe")
            active_timers[id].stop()
            del active_timers[id]
            return

        if not status or status == None:
            print("Chamado não esta aberto")
            active_timers[id].stop()
            del active_timers[id]
            return

        # Divide o chat em seções, separando os dados entre as entradas com base nas vírgulas externas aos colchetes
        sections = chat.split("],[")

        # Adiciona os colchetes de volta para corrigir o primeiro e último item da lista
        sections[0] = "[" + sections[0]
        sections[-1] = sections[-1] + "]"

        # # Transforma as seções em arrays, separando os valores por vírgula
        # grouped = [section.split(",") for section in sections]

        # Agrupa as seções em blocos de 3 elementos
        result = [sections[i : i + 3] for i in range(0, len(sections), 3)]
        message_ux = result[-1][1]

        split_item = message_ux.split(":")  # Fazendo o split da string

        if split_item[0] == "Technician":
            primary = "Technician"
            mailTo = mail_user
        elif split_item[0] == "User":
            primary = "User"
            mailTo = mail_tech
        else:
            print("Erro ao detectar quem enviou a menssagem")
            active_timers[id].stop()
            del active_timers[id]
            return

        # Acessando os últimos 3 arrays de result
        last_three = result[-5:]

        messages = []  # Cria uma lista para armazenar as mensagens
        # Iterando sobre os últimos 3 arrays
        for item in last_three:
            # Acessando o segundo valor do array interno (índice 1)
            second_value = item[
                1
            ]  # item[0][1] porque cada item é uma lista de 3 sub-arrays

            # Fazendo o split para separar a chave do valor
            split_value = second_value.split(":")

            if split_value[0].strip() == primary:
                messages.append(split_value[1].strip())

        # Criando a string msg2 com as mensagens separadas por novas linhas
        msg = f"{last_sender} enviou uma mensagem.\n{chr(10).join(messages)}"

        if id in active_timers:
            pass
        else:
            return

        task = Thread(
            target=sendMail,
            args=(mailTo, msg, msg2),
        )

        task.start()

        active_timers[id].stop()
        del active_timers[id]
        return
    except Exception as e:
        print(e)

    finally:
        if id in active_timers:
            active_timers[id].stop()
            del active_timers[id]


def callTimer(id, status):
    global active_timers, timers_lock
    with timers_lock:  # Bloqueia o acesso a active_timers
        if status == "start":
            if id in active_timers:
                return
            else:
                timer = CountdownTimer(10800, lambda: notify(id), id)
                timer.start()
                active_timers[id] = timer
                return
        elif status == "stop":
            if id in active_timers:
                active_timers[id].stop()
                del active_timers[id]
                return


def verifyNotificationCall(
    id,
):
    try:
        ticket = SupportTicket.objects.filter(id=id)
        last_sender_adjust_string = None
        last_viewer_adjust_string = None
        for field in ticket:
            # Separa os valores da última mensagem pelo separador vírgula
            if field.last_sender:
                last_sender, _ = field.last_sender.split(", ")
                last_sender_adjust_string = last_sender.replace(" ", "")
            if field.last_viewer:
                last_viewer = field.last_viewer
                last_viewer_adjust_string = last_viewer.replace(" ", "")

        if last_sender_adjust_string == last_viewer_adjust_string:
            return callTimer(id, "start")
        else:
            return callTimer(id, "stop")

    except Exception as e:
        return print(e)
