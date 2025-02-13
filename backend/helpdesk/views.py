# Importando os módulos necessários para o funcionamento do código.
import asyncio
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from threading import Thread
import threading
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token
from django.http import HttpRequest, JsonResponse
from django.contrib.auth.decorators import login_required
from os import getenv
from json import loads
from django.middleware.csrf import get_token
from datetime import datetime, date
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
import re
import logging
from django.db import transaction, connection
from django.views.decorators.cache import never_cache
from contextlib import contextmanager
import mysql.connector
from decouple import config
from django.views.decorators.http import require_POST, require_GET
from django.utils.timezone import make_aware
from asgiref.sync import sync_to_async

# Configuração básica de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def sendMail(mail, msgm1, msgm2):
    smtp_host = None
    smtp_port = None
    mail_address = None
    msg = None
    server_smtp = None
    text_mail = None
    try:
        # Configurações do servidor de e-mail SMTP
        smtp_host = getenv("SERVER_SMTP")
        smtp_port = getenv("SMPT_PORT")
        mail_address = getenv("MAIL_FIXDESK")

        # Criar objeto de mensagem
        msg = MIMEMultipart()
        msg["From"] = mail_address
        msg["To"] = mail
        msg["Subject"] = msgm2

        # Corpo da mensagem
        msg.attach(MIMEText(msgm1, "plain"))

        # Iniciar conexão SMTP
        server_smtp = smtplib.SMTP(smtp_host, smtp_port)
        server_smtp.starttls()

        # Enviar e-mail
        text_mail = msg.as_string()
        server_smtp.sendmail(mail_address, mail, text_mail)

        # Fechar conexão
        server_smtp.quit()

    except Exception as e:
        print(e)
        return JsonResponse({"Erro": f"Erro ao enviar email {e}"}, status=123)


# Create your views here.
@csrf_exempt
@never_cache
def firstView(request):
    if request.method == "POST":
        csrf = None
        equipament_list = []
        try:
            csrf = get_token(request)

            if Equipaments.objects.count() > 0:
                equipaments = Equipaments.objects.all()

                for equipament in equipaments:
                    image = equipament.equipament

                    with image.open() as img:
                        pil_image = Image.open(img)

                        img_bytes = BytesIO()

                        pil_image.save(img_bytes, format="PNG")

                        image_data = b64encode(img_bytes.getvalue()).decode("utf-8")

                    equipaments = {
                        "image": image_data,
                        "model": equipament.model,
                        "company": equipament.company,
                        "id": equipament.id,
                    }

                    equipament_list.append(equipaments)

            return JsonResponse(
                {"token": csrf, "equipaments": equipament_list},
                status=200,
                safe=True,
            )
        except Exception as e:
            print(e)
            return JsonResponse({"status": str(e)}, status=300, safe=True)

    if request.method == "GET":
        if request.user.is_authenticated:
            Back_User = None
            Back_Tech = None
            Back_Leader = None
            User = None
            try:
                Back_User = getenv("DJANGO_GROUP_USER")
                Back_Tech = getenv("DJANGO_GROUP_TECH")
                Back_Leader = getenv("DJANGO_GROUP_LEADER")
                User = request.user
                if (
                    User.groups.filter(name=Back_User)
                    or User.groups.filter(name=Back_Tech)
                    or User.groups.filter(name=Back_Leader)
                ):
                    return render(request, "index.html", {})
                else:
                    return redirect("/login")
            except Exception as e:
                json_error = str(e)
                logger.info(e)
                return JsonResponse({"status": json_error}, status=300, safe=True)
        else:
            return redirect("/login")


# Decorator que exige um token CSRF para a proteção contra ataques CSRF
# Decorator que exige que o usuário esteja autenticado para acessar a função
# Se o usuário não estiver autenticado, será redirecionado para a página de login
@requires_csrf_token
@login_required(login_url="/login")
@require_POST
@transaction.atomic
# Função que trata o envio de chamados (tickets) para o banco de dados
def submitTicket(request):
    # Inicializando as variáveis com valor None
    # Estas variáveis serão utilizadas para armazenar os dados do chamado (ticket)
    company = None  # Empresa relacionada ao chamado
    department = None  # Departamento responsável pelo chamado
    mail = None  # E-mail do solicitante
    observation = None  # Observações adicionais sobre o chamado
    occurrence = None  # Ocorrência do problema
    pid = None  # Identificador do Usuario (ID)
    problemn = None  # Descrição do problema
    respective_area = None  # Área respectiva ao problema relatado
    sector = None  # Setor da empresa relacionado ao chamado
    start_date = None  # Data de início convertida para o formato de data
    start_date_str = None  # Data de início como string
    ticketRequester = None  # Solicitante do chamado
    naive_datetime = None
    error = None
    try:
        company = request.POST.get("company")
        department = request.POST.get("department")
        mail = request.POST.get("mail")
        observation = request.POST.get("observation")
        occurrence = request.POST.get("occurrence")
        pid = request.POST.get("PID")
        problemn = request.POST.get("problemn")
        respective_area = request.POST.get("respective_area")
        sector = request.POST.get("sector")
        start_date_str = request.POST.get("start_date")
        if start_date_str == None:
            new_date = datetime.now()
            start_date = new_date.strftime("%Y-%m-%d %H:%M")
        else:
            naive_datetime = datetime.strptime(start_date_str, "%Y-%m-%d %H:%M")
            start_date = make_aware(naive_datetime)
        ticketRequester = request.POST.get("ticketRequester")
        if pid:
            pass
        else:
            return JsonResponse({"error": "error"}, status=403, safe=True)

    except Exception as e:
        print(e)
        return JsonResponse(
            {"error": f" Erro na Obtenção dos dados: {error}"}, status=300, safe=True
        )

    # Inicializando variáveis adicionais com valor None
    # Estas variáveis serão utilizadas para armazenar dados adicionais do chamado e informações sobre arquivos de imagem

    Ticket = None  # Objeto que representa o chamado (ticket)
    file_type = None  # Tipo de arquivo da imagem
    image_bytes = None  # Bytes da imagem anexada ao chamado
    image_str = None  # Imagem em formato string codificada (base64, por exemplo)
    mime = None  # Tipo MIME da imagem
    other_image = None  # Outra imagem associada ao chamado
    ticket_file = None  # Arquivo relacionado ao chamado
    types = None  # Lista de tipos de arquivos permitidos
    types_str = None  # Tipos de arquivos permitidos como string
    valid = None  # Indicador de validade da imagem (True ou False)

    if "image" in request.FILES:
        Ticket = SupportTicket(
            ticketRequester=ticketRequester,
            department=department,
            mail=mail,
            company=company,
            sector=sector,
            respective_area=respective_area,
            occurrence=occurrence,
            problemn=problemn,
            observation=observation,
            start_date=start_date,
            PID=pid,
            open=True,
        )

        images = request.FILES.getlist("image")

        for file in images:
            try:
                image_bytes = file.read()

                mime = Magic()

                file_type = mime.from_buffer(image_bytes)

                types_str = getenv("VALID_TYPES")

                types_str = types_str.strip("[]")

                types = [type.strip() for type in types_str.split(",")]

                valid = False

                for typeUn in types:
                    if typeUn.replace('"', "").lower() in file_type.lower():
                        valid = True
                        break

                if not valid:
                    image_str = str(file)

                    other_image = mimetypes.guess_type(image_str)

                    for typeUn in types:
                        if (
                            typeUn.replace('"', "").lower()
                            in other_image[0].replace('"', "").lower()
                        ):
                            valid = True
                            break

                if valid:
                    Ticket.save()

                    ticket_file = TicketFile(ticket=Ticket)
                    ticket_file.file.save(str(file), ContentFile(image_bytes))

                    new_id = None

                else:
                    return JsonResponse({"error": "Invalid"}, status=300, safe=True)

                new_id = Ticket.id

            except Exception as e:
                print(e)
                return JsonResponse(
                    {"error": f"erro no processamento de imagem {e}"},
                    status=300,
                    safe=True,
                )

        return JsonResponse({"id": new_id}, status=200, safe=True)

    elif "id_equipament" in request.POST:
        equipament_id = None
        try:
            equipament_id = request.POST.get("id_equipament")

            days = request.POST.get("days_alocated")

            Ticket = SupportTicket(
                ticketRequester=ticketRequester,
                department=department,
                mail=mail,
                company=company,
                sector=sector,
                respective_area=respective_area,
                occurrence=occurrence,
                problemn=problemn,
                observation=observation,
                start_date=start_date,
                PID=pid,
                equipament=equipament_id,
                date_alocate=days,
                open=True,
            )

            Ticket.save()

            new_id = Ticket.id

            # * Monta o ticket e salva no banco

            return JsonResponse({"id": new_id}, status=200, safe=True)
        except Exception as e:
            print(e)
            return JsonResponse(
                {"error": f"erro no processamento de equipamento {e}"},
                status=300,
                safe=True,
            )

    elif "company_new_user" in request.POST:
        name_new_user = None
        sector_new_user = None
        where_from = None
        company_new_user = None
        machine_new_user = None
        software_new_user = None
        cost_center = None
        job_title_new_user = None
        start_work_new_user = None
        copy_profile_new_user = None
        try:
            name_new_user = request.POST.get("new_user")
            sector_new_user = request.POST.get("sector_new_user")
            where_from = request.POST.get("where_from")
            machine_new_user = request.POST.get("machine_new_user")
            company_new_user = request.POST.get("company_new_user")
            software_new_user = request.POST.get("software_new_user")
            cost_center = request.POST.get("cost_center")
            job_title_new_user = request.POST.get("job_title_new_user")
            start_work_new_user = request.POST.get("start_work_new_user")
            copy_profile_new_user = request.POST.get("copy_profile_new_user")

            if machine_new_user == "false":
                machine_new_user = False

            elif machine_new_user == "true":
                machine_new_user = True

            Ticket = SupportTicket(
                ticketRequester=ticketRequester,
                department=department,
                mail=mail,
                company=company,
                sector=sector,
                respective_area=respective_area,
                occurrence=occurrence,
                problemn=problemn,
                observation=observation,
                start_date=start_date,
                PID=pid,
                name_new_user=name_new_user,
                sector_new_user=sector_new_user,
                where_from=where_from,
                machine_new_user=machine_new_user,
                company_new_user=company_new_user,
                software_new_user=software_new_user,
                cost_center=cost_center,
                job_title_new_user=job_title_new_user,
                start_work_new_user=start_work_new_user,
                copy_profile_new_user=copy_profile_new_user,
                open=True,
            )

            Ticket.save()
            # * Monta o ticket e salva no banco

            new_id = Ticket.id

            return JsonResponse({"id": new_id}, status=200, safe=True)
        except Exception as e:
            print(e)
            return JsonResponse(
                {"error": f"erro no processamento de novo usuario {e}"},
                status=300,
                safe=True,
            )

    elif "mail_tranfer" in request.POST:
        name_new_user = None
        mail_tranfer = None
        old_files = None
        start_work_new_user = None
        try:
            name_new_user = request.POST.get("new_user")
            mail_tranfer = request.POST.get("mail_tranfer")
            old_files = request.POST.get("old_files")
            start_work_new_user = request.POST.get("start_work_new_user")

            Ticket = SupportTicket(
                ticketRequester=ticketRequester,
                department=department,
                mail=mail,
                company=company,
                sector=sector,
                respective_area=respective_area,
                occurrence=occurrence,
                problemn=problemn,
                observation=observation,
                start_date=start_date,
                PID=pid,
                name_new_user=name_new_user,
                mail_tranfer=mail_tranfer,
                old_files=old_files,
                start_work_new_user=start_work_new_user,
                open=True,
            )

            Ticket.save()
            # * Monta o ticket e salva no banco

            new_id = Ticket.id

            return JsonResponse({"id": new_id}, status=200, safe=True)
        except Exception as e:
            print(e)
            return JsonResponse(
                {"error": f"erro no processamento de transferencia de email {e}"},
                status=300,
                safe=True,
            )

    else:
        try:
            logger.info("ticketRequester: ", ticketRequester)
            logger.info("department: ", department)
            logger.info("mail: ", mail)
            logger.info("company: ", company)
            logger.info("sector: ", sector)
            logger.info("respective_area: ", respective_area)
            logger.info("occurrence: ", occurrence)
            logger.info("problemn: ", problemn)
            logger.info("observation: ", observation)
            logger.info("start_date: ", start_date)
            logger.info("pid: ", pid)

            Ticket = SupportTicket(
                ticketRequester=ticketRequester,
                department=department,
                mail=mail,
                company=company,
                sector=sector,
                respective_area=respective_area,
                occurrence=occurrence,
                problemn=problemn,
                observation=observation,
                start_date=start_date,
                PID=pid,
                open=True,
            )

            Ticket.save()
            # * Monta o ticket e salva no banco
            new_id = Ticket.id

            return JsonResponse({"id": new_id}, status=200, safe=True)
        except Exception as e:
            print(e)
            return JsonResponse(
                {"error": f"erro ao salvar o ticket {e}"}, status=300, safe=True
            )


@csrf_exempt
@login_required(login_url="/login")
@never_cache
def history(request):
    if request.method == "POST":
        csrf = None
        Back_User = None
        Back_Tech = None
        Back_Leader = None
        User = None
        try:
            csrf = get_token(request)

            Back_User = getenv("DJANGO_GROUP_USER")
            Back_Tech = getenv("DJANGO_GROUP_TECH")
            Back_Leader = getenv("DJANGO_GROUP_LEADER")
            User = request.user
            if User.groups.filter(name=Back_User):
                pass
            elif User.groups.filter(name=Back_Tech):
                pass
            elif User.groups.filter(name=Back_Leader):
                pass

        except Exception as e:
            print(e)
            return JsonResponse(
                {"status": "Invalid Credentials"}, status=402, safe=True
            )

        ticket_list = []
        ticket_data = None
        ticket_json = None
        UserTicket = None

        try:
            UserTicket = request.POST.get("name")
            ticket_data = SupportTicket.objects.filter(
                ticketRequester=UserTicket, open=True
            ).order_by("-id")[:10]

            for ticket in ticket_data:
                ticket_json = serialize("json", [ticket])
                ticket_list.append(ticket_json)

        except Exception as e:
            print(e)
            return JsonResponse({"Error": f"Erro inesperado {e}"}, status=301)

        ticket_objects = []
        try:
            for ticket in ticket_list:
                ticket_data = loads(ticket)[0]["fields"]
                ticket_data["id"] = loads(ticket)[0]["pk"]
                ticket_objects.append(ticket_data)

            return JsonResponse(
                {"token": csrf, "tickets": ticket_objects},
                status=200,
                safe=True,
            )

        except Exception as e:
            print(e)
            return JsonResponse({"Error": f"Erro inesperado {e}"}, status=301)

    if request.method == "GET":
        return render(request, "index.html", {})


@login_required(login_url="/login")
@requires_csrf_token
@require_GET
@never_cache
def toDashboard(request):
    UserFront = None
    user = None
    groups = None
    group1 = None
    group2 = None
    try:
        UserFront = request.user
        group1 = getenv("DJANGO_GROUP_USER")
        group2 = getenv("DJANGO_GROUP_TECH")

        user = User.objects.get(username=UserFront)

        groups = user.groups.all()

        for group in groups:
            if group.name == group1:
                return JsonResponse(
                    {"status": "Credentials Invalid"}, status=403, safe=True
                )
            elif group.name == group2:
                return JsonResponse(
                    {"status": "Credentials Invalid"}, status=203, safe=True
                )
    except Exception as e:
        print(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=302)


@csrf_exempt
@never_cache
@require_GET
def exit(request):
    try:
        logout(request)
        return redirect("/")
    except Exception as e:
        print(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=303)


@login_required(
    login_url="/login"
)  # Decorador que exige que o usuário esteja autenticado. Redireciona para a página de login se não estiver.
@requires_csrf_token  # Decorador que assegura que o token CSRF seja verificado para evitar ataques CSRF.
@never_cache
@transaction.atomic
def ticket(
    request, id
):  # Função para obter ou enviar dados para os chamados, recebendo a requisição e o ID do ticket.
    if request.method == "POST":
        body = None
        technician = None
        ticket = None
        current_responsible_technician = None
        responsible_technician = None
        status = None
        date = None
        hours = None
        try:
            body = loads(request.body)

            if "responsible_technician" in body:
                try:
                    responsible_technician = body["responsible_technician"]
                    technician = body["technician"]
                    date = body["date"]
                    hours = body["hour"]
                    ticket = SupportTicket.objects.get(id=id)

                    current_responsible_technician = ticket.responsible_technician

                    if current_responsible_technician == responsible_technician:
                        return JsonResponse(
                            {"status": "invalid modify"}, status=304, safe=True
                        )

                    if ticket.chat == None:
                        ticket.chat = f"[[Date:{date}],[System:{responsible_technician} atendeu ao Chamado],[Hours:{hours}]]"

                        mail = body["mail"]
                        msg = f"{technician} atendeu ao Chamado"
                        msg2 = f"Atendimento do Chamado {ticket.id}"

                        task = Thread(
                            target=sendMail,
                            args=(mail, msg, msg2),
                        )

                        task.start()

                    else:
                        ticket.chat += f",[[Date:{date}], [System:{technician} Transfereu o Chamado para {technician}], [Hours:{hours}]]"

                    ticket.responsible_technician = responsible_technician

                    ticket.save()

                    return JsonResponse(
                        {
                            "chat": ticket.chat,
                            "technician": ticket.responsible_technician,
                            "id": id,
                        },
                        status=200,
                        safe=True,
                    )

                except Exception as e:
                    print(e)
                    str_err = str(e)
                    return JsonResponse({"error": str_err}, status=410, safe=True)
            # Verifica se o corpo da requisição contém um campo 'chat'
            # Verifica se o corpo da requisição contém um campo 'chat'
            if "chat" in body:
                # Verifica se o corpo da requisição contém o campo 'technician', indicando que a mensagem é do técnico
                if "technician" in body:
                    try:
                        # Extrai os dados do corpo da requisição
                        chat = body["chat"]  # Mensagem do chat
                        date = body["date"]  # Data da mensagem
                        hours = body["hours"]  # Hora da mensagem
                        technician = body["technician"]  # Técnico que enviou a mensagem
                        ticket = SupportTicket.objects.get(
                            id=id
                        )  # Obtém o ticket com o id especificado

                        # Adiciona a nova entrada de chat ao histórico do ticket
                        ticket.chat += (
                            f",[[Date:{date}],[Technician: {chat}],[Hours:{hours}]]"
                        )

                        # Armazena o remetente anterior da mensagem
                        old_last_sender = ticket.last_sender

                        # Separa os valores da última mensagem pelo separador vírgula
                        _, old_date_str = old_last_sender.split(", ")

                        # Converte a string da data da última mensagem para objeto datetime
                        old_date = datetime.strptime(old_date_str, "%d/%m/%Y %H:%M")

                        # Converte a nova data e hora para o formato datetime
                        new_date = datetime.strptime(
                            f"{date} {hours}", "%d/%m/%Y %H:%M"
                        )

                        # Compara as datas para verificar se a nova data é mais recente que a anterior
                        if old_date > new_date:
                            pass  # Se a data anterior for mais recente, não faz alterações
                        else:
                            # Caso contrário, atualiza o remetente da última mensagem
                            ticket.last_sender = f"{technician} , {date} {hours}"

                        # Salva as mudanças feitas no ticket
                        ticket.save()

                        # Retorna a resposta com o chat atualizado
                        return JsonResponse(
                            {"chat": ticket.chat}, status=200, safe=True
                        )
                    except Exception as e:
                        # Caso ocorra algum erro, captura a exceção e retorna um erro
                        print(e)
                        return JsonResponse(
                            {"Error": f"Erro inesperado {e}"}, status=304
                        )

                # Verifica se o corpo da requisição contém o campo 'User', indicando que a mensagem é do usuário
                if "User" in body:
                    # Extrai os dados do corpo da requisição
                    chat = body["chat"]  # Mensagem do chat
                    date = body["date"]  # Data da mensagem
                    hours = body["hours"]  # Hora da mensagem
                    ticket = SupportTicket.objects.get(
                        id=id
                    )  # Obtém o ticket com o id especificado
                    user = body["User"]  # Nome do usuário que enviou a mensagem

                    # Adiciona a nova entrada de chat ao histórico do ticket
                    ticket.chat += f",[[Date:{date}],[User: {chat}],[Hours:{hours}]]"

                    # Armazena o remetente anterior da mensagem
                    old_last_sender = ticket.last_sender

                    # Separa os valores da última mensagem pelo separador vírgula
                    _, old_date_str = old_last_sender.split(", ")

                    # Converte a string da data da última mensagem para objeto datetime
                    old_date = datetime.strptime(old_date_str, "%d/%m/%Y %H:%M")

                    # Converte a nova data e hora para o formato datetime
                    new_date = datetime.strptime(f"{date} {hours}", "%d/%m/%Y %H:%M")

                    # Compara as datas para verificar se a nova data é mais recente que a anterior
                    if old_date > new_date:
                        pass  # Se a data anterior for mais recente, não faz alterações
                    else:
                        # Caso contrário, atualiza o remetente da última mensagem
                        ticket.last_sender = f"{user} , {date} {hours}"

                    # Salva as mudanças feitas no ticket
                    ticket.save()

                    # Retorna a resposta com o chat atualizado
                    return JsonResponse({"chat": ticket.chat}, status=200, safe=True)

            if "status" in body:
                status = body["status"]
                technician = body["technician"]
                date = body["date"]
                hours = body["hours"]
                ticket = SupportTicket.objects.get(id=id)
                current_responsible_technician = ticket.responsible_technician
                msg = ""

                if status == "close":
                    if current_responsible_technician == None:
                        return JsonResponse({}, safe=True, status=304)

                    partes_nome_pesquisa = current_responsible_technician.split()
                    presente = all(
                        parte in technician for parte in partes_nome_pesquisa
                    )

                    if presente:
                        ticket.open = False
                        ticket.chat += f",[[Date:{date}],[System: {technician} Finalizou o Chamado],[Hours:{hours}]]"

                        ticket.save()

                        mail = body["mail"]
                        msg = f"{technician} Finalizou o Chamado"
                        msg2 = f"Chamado {ticket.id} finalizado com sucesso!!"

                        task = Thread(
                            target=sendMail,
                            args=(mail, msg, msg2),
                        )

                        task.start()

                    else:
                        return JsonResponse({}, status=304, safe=True)

                elif status == "open":

                    ticket.open = True
                    ticket.chat += f",[[Date:{date}],[System: {technician} Reabriu e atendeu o Chamado],[Hours:{hours}]]"

                    ticket.save()

                    mail = body["mail"]
                    msg = f"{technician} Reabriu o Chamado"
                    msg2 = f"Reabertura do chamado {ticket.id}"

                    task = Thread(
                        target=sendMail,
                        args=(mail, msg, msg2),
                    )

                    task.start()

                elif status == "stop":
                    if current_responsible_technician == None:
                        return JsonResponse({}, safe=True, status=304)
                    partes_nome_pesquisa = current_responsible_technician.split()
                    presente = all(
                        parte in technician for parte in partes_nome_pesquisa
                    )

                    if presente:
                        ticket.open = None
                        ticket.chat += f",[[Date:{date}],[System: {technician} Deixou esse chamado em aguardo],[Hours:{hours}]]"

                        ticket.save()

                        mail = body["mail"]
                        msg = f"{technician} Deixou esse chamado em aguardo"
                        msg2 = f"Chamado {ticket.id} em aguardo"

                        task = Thread(
                            target=sendMail,
                            args=(mail, msg, msg2),
                        )

                        task.start()

                    else:
                        return JsonResponse(
                            {"status": "invalid modify"}, status=303, safe=True
                        )

                return JsonResponse({"status": "ok"}, status=200, safe=True)

            # Verifica se a chave 'HTTP_DOWNLOAD_TICKET' está presente nos metadados da requisição.
            if "HTTP_DOWNLOAD_TICKET" in request.META:
                # Inicializa as variáveis para o ticket, o PDF, o objeto de dados, o formato de dados, o diretório e a empresa como nulos.
                # Declaração das variáveis a serem utilizadas no código.
                ticket = None  # Variável para armazenar informações do ticket.
                pdf = None  # Variável para armazenar o documento PDF.
                data_object = None  # Variável para armazenar um objeto de dados.
                data_format = None  # Variável para armazenar o formato dos dados.
                directory = None  # Variável para armazenar o diretório.
                company = None  # Variável para armazenar informações da empresa.
                pdf_base64 = None  # Variável para armazenar o PDF codificado em base64.

                try:
                    ticket = SupportTicket.objects.get(
                        id=id
                    )  # Recuperando informações do ticket com base no ID fornecido.
                    pdf = FPDF()  # Inicializando o objeto PDF.
                    pdf.add_page()  # Adicionando uma nova página ao PDF.
                    directory = getcwd()  # Obtendo o diretório atual.
                    pdf.add_font(
                        "Arial", "", f"{directory}/arial.ttf"
                    )  # Adicionando a fonte Arial ao PDF.
                    pdf.set_font(
                        "Arial", size=12
                    )  # Definindo a fonte e o tamanho do texto.
                    pdf.cell(
                        180, 5, txt=f"CHAMADO {ticket.id}", ln=False, align="C"
                    )  # Adicionando título ao PDF.
                    x_position = pdf.get_x()  # Obtendo a posição atual no eixo x.
                    y_position = pdf.get_y()  # Obtendo a posição atual no eixo y.
                    pdf.set_xy(x_position, y_position)  # Definindo a posição atual.

                    data_object = ticket.start_date.date()
                    data_format = data_object.strftime("%d/%m/%Y")
                    pdf.cell(
                        20,
                        5,
                        txt=f"Data de Abertura: {data_format}",
                        ln=False,
                        align="R",
                    )
                    pdf.cell(
                        200,
                        10,
                        txt=f"Usuário {ticket.ticketRequester}",
                        ln=True,
                        align="L",
                    )
                    pdf.cell(
                        200,
                        10,
                        txt=f"Departamento: {ticket.department}",
                        ln=True,
                        align="L",
                    )
                    pdf.cell(
                        200, 10, txt=f"Unidade: {ticket.company}", ln=True, align="L"
                    )
                    pdf.cell(200, 10, txt=f"Setor: {ticket.sector}", ln=True, align="L")
                    pdf.cell(
                        200,
                        10,
                        txt=f"Ocorrência: {ticket.occurrence}",
                        ln=True,
                        align="L",
                    )
                    pdf.cell(
                        200, 10, txt=f"Problema: {ticket.problemn}", ln=True, align="L"
                    )
                    pdf.cell(
                        200,
                        10,
                        txt=f"Setor Responsável pelo Chamado: {ticket.respective_area}",
                        ln=True,
                        align="L",
                    )
                    if ticket.responsible_technician != None:
                        pdf.cell(
                            200,
                            10,
                            txt=f"Tecnico Resposável pelo Chamado: {ticket.responsible_technician}",
                            ln=True,
                            align="L",
                        )
                    else:
                        pdf.cell(
                            200,
                            10,
                            txt="Tecnico Resposável pelo Chamado: Tecnico não Atribuido",
                            ln=True,
                            align="L",
                        )
                    if ticket.observation != "":
                        pdf.multi_cell(
                            200,
                            10,
                            txt=f"Observação: {ticket.observation}",
                            ln=True,
                            align="L",
                        )
                    else:
                        pdf.cell(
                            200,
                            10,
                            txt="Observação: Informação não fornecida",
                            ln=True,
                            align="L",
                        )
                    if ticket.open == True:
                        pdf.cell(
                            200,
                            10,
                            txt="Status: Em Aberto",
                            ln=True,
                            align="L",
                        )
                    else:
                        pdf.cell(
                            200,
                            10,
                            txt="Status: Finalizado",
                            ln=True,
                            align="L",
                        )
                    if ticket.problemn == "Alocação de Máquina":
                        pdf.cell(200, 10, txt="Maquina Alocada:", ln=True, align="L")
                        pdf.image(
                            f"{ticket.equipament.equipament}", w=100, h=100, x=10, y=120
                        )
                        pdf.set_xy(10, 220)
                        pdf.cell(
                            200,
                            10,
                            txt=f"Modelo: {ticket.equipament.model}",
                            ln=True,
                            align="L",
                        )
                        pdf.cell(
                            200,
                            10,
                            txt=f"Unidade da Maquina: {ticket.equipament.company}",
                            ln=True,
                            align="L",
                        )
                        pdf.cell(
                            200,
                            10,
                            txt=f"Data de alocação: {ticket.date_alocate}",
                            ln=True,
                            align="L",
                        )
                    if ticket.problemn == "Criacao de usuario de rede":
                        pdf.cell(
                            200,
                            10,
                            txt=f"Nome do Novo(a) Colaborador(a): {ticket.name_new_user}",
                            ln=True,
                            align="L",
                        )
                        pdf.cell(
                            200,
                            10,
                            txt=f"Setor do Novo(a) Colaborador(a): {ticket.sector_new_user}",
                            ln=True,
                            align="L",
                        )
                        if ticket.where_from == "new":
                            pdf.cell(
                                200,
                                10,
                                txt="Tipo de Remanejamento: Nova Contratação",
                                ln=True,
                                align="L",
                            )
                        if ticket.machine_new_user == True:
                            pdf.cell(
                                200,
                                10,
                                txt="Necessidade de nova máquina: Sim",
                                ln=True,
                                align="L",
                            )
                        else:
                            pdf.cell(
                                200,
                                10,
                                txt="Necessidade de nova máquina: Não",
                                ln=True,
                                align="L",
                            )
                        company = ticket.company_new_user.replace("-", "\u2013")
                        pdf.cell(
                            200,
                            10,
                            txt=f"Unidade: {company}",
                            ln=True,
                            align="L",
                        )
                        if len(ticket.software_new_user) > 1:
                            pdf.cell(
                                200,
                                10,
                                txt=f"Softwares Necessários: {ticket.software_new_user}",
                                ln=True,
                                align="L",
                            )
                        pdf.cell(
                            200,
                            10,
                            txt=f"Centro de Custo: {ticket.cost_center}",
                            ln=True,
                            align="L",
                        )
                        pdf.cell(
                            200,
                            10,
                            txt=f"Cargo: {ticket.job_title_new_user}",
                            ln=True,
                            align="L",
                        )

                        mounths = []
                        date = None
                        number_into_mouth = None
                        result = None
                        year = None
                        new_date = None

                        try:
                            mounths = [
                                "Jan",
                                "Feb",
                                "Mar",
                                "Apr",
                                "May",
                                "Jun",
                                "Jul",
                                "Aug",
                                "Sep",
                                "Oct",
                                "Nov",
                                "Dec",
                            ]

                            date = ticket.start_work_new_user

                            number_into_mouth = None

                            for i, sig in enumerate(mounths, start=1):
                                if sig in date:
                                    number_into_mouth = i
                                    recort = date.find(sig)

                                    result = date[
                                        recort : recort + date[recort:].find(":") + 3
                                    ]

                                    result = result[:-6]

                                    date = result[4:6]

                                    year = result[-4:]

                                    new_date = f"{date}/{number_into_mouth}/{year}"

                        except Exception as e:
                            print(e)
                            return JsonResponse(
                                {"Error": f"Erro inesperado {e}"}, status=304
                            )

                        pdf.cell(
                            200,
                            10,
                            txt=f"Data de Início das Atividade: {new_date}",
                            ln=True,
                            align="L",
                        )

                        if len(ticket.copy_profile_new_user) > 1:
                            pdf.cell(
                                200,
                                10,
                                txt=f"Copiar perfil de: {ticket.copy_profile_new_user}",
                                ln=True,
                                align="L",
                            )

                    if ticket.problemn == "Exclusao de usuario de rede":
                        if len(ticket.mail_tranfer) > 1:
                            pdf.cell(
                                200,
                                10,
                                txt=f"Redirecionar e-mails para: {ticket.mail_tranfer}",
                                ln=True,
                                align="L",
                            )
                        if len(ticket.old_files) > 1:
                            pdf.cell(
                                200,
                                10,
                                txt=f"Enviar arquivos para: {ticket.old_files}",
                                ln=True,
                                align="L",
                            )

                        mounths = []
                        date = None
                        number_into_mouth = None
                        result = None
                        year = None
                        new_date = None

                        try:
                            mounths = [
                                "Jan",
                                "Feb",
                                "Mar",
                                "Apr",
                                "May",
                                "Jun",
                                "Jul",
                                "Aug",
                                "Sep",
                                "Oct",
                                "Nov",
                                "Dec",
                            ]

                            date = ticket.start_work_new_user

                            number_into_mouth = None

                            for i, sig in enumerate(mounths, start=1):
                                if sig in date:
                                    number_into_mouth = i
                                    recort = date.find(sig)

                                    result = date[
                                        recort : recort + date[recort:].find(":") + 3
                                    ]

                                    result = result[:-6]

                                    date = result[4:6]

                                    year = result[-4:]

                                    new_date = f"{date}/{number_into_mouth}/{year}"

                        except Exception as e:
                            print(e)
                            return JsonResponse(
                                {"Error": f"Erro inesperado {e}"}, status=304
                            )

                        pdf.cell(
                            200,
                            10,
                            txt=f"Data de Início das Atividade: {new_date}",
                            ln=True,
                            align="L",
                        )

                    chat = None
                    current_date = None
                    chat_dicts = None
                    if ticket.chat != None:
                        try:
                            chat = ticket.chat

                            chat_dicts = convert_to_dict(chat)

                            pdf.add_page()

                            pdf.cell(
                                200,
                                10,
                                txt=f"CHAT",
                                ln=True,
                                align="C",
                            )

                            for i in range(0, len(chat_dicts), 3):
                                group = chat_dicts[i : i + 3]
                                try:
                                    entry_date = None
                                    system_msg = ""
                                    technician_msg = ""
                                    user_msg = ""
                                    entry_hour = ""
                                    for entry in group:
                                        if "Date" in entry:
                                            entry_date = entry["Date"]
                                        if "System" in entry:
                                            system_msg = entry["System"]
                                        if "Technician" in entry:
                                            technician_msg = entry["Technician"]
                                        if "User" in entry:
                                            user_msg = entry["User"]
                                        if "Hours" in entry:
                                            entry_hour = entry["Hours"]

                                        # Verifica se a data é diferente da atual
                                    if entry_date != current_date:
                                        current_date = entry_date
                                        # Adiciona a data como uma célula centralizada
                                        pdf.cell(
                                            200,
                                            10,
                                            txt=current_date,
                                            ln=True,
                                            align="C",
                                        )

                                        # Adiciona os registros de sistema, técnico e usuário com seus respectivos horários
                                    if system_msg:
                                        pdf.cell(
                                            200,
                                            10,
                                            txt=f"{system_msg} - {entry_hour}",
                                            ln=True,
                                            align="C",
                                        )
                                    if technician_msg:
                                        pdf.cell(
                                            200,
                                            10,
                                            txt=f"{technician_msg} - {entry_hour}",
                                            ln=True,
                                            align="L",
                                        )
                                    if user_msg:
                                        pdf.cell(
                                            200,
                                            10,
                                            txt=f"{user_msg} - {entry_hour}",
                                            ln=True,
                                            align="R",
                                        )

                                except Exception as e:
                                    print(e)
                                    return JsonResponse(
                                        {"Error": f"Erro inesperado {e}"}, status=304
                                    )

                        except Exception as e:
                            print(e)
                            return JsonResponse(
                                {"Error": f"Erro inesperado {e}"}, status=304
                            )

                    pdf_output = pdf.output(dest="S")
                    pdf_base64 = b64encode(pdf_output).decode("utf-8")
                    return JsonResponse(
                        {"status": "ok", "pdf": pdf_base64}, status=200, safe=True
                    )
                except Exception as e:
                    print(e)
                    return JsonResponse({"Error": f"Erro inesperado {e}"}, status=304)

            if "HTTP_MODIFY_TICKET" in request.META:
                tech = None
                newSector = None
                oldSector = None
                newOccurrence = None
                oldOccurrence = None
                newProblemn = None
                oldProblemn = None
                try:
                    tech = body["tech"]
                    newSector = body["sector"]
                    oldSector = body["OldSector"]
                    date = body["date"]
                    hours = body["hours"]
                    ticket = SupportTicket.objects.get(id=id)

                    if newSector == oldSector:
                        pass
                    if ticket.chat == None:
                        return JsonResponse({}, status=304, safe=True)
                    else:
                        ticket.chat += f",[[Date:{date}],[System: {tech} Mudou o Setor responsavel para {newSector}],[Hours:{hours}]]"
                        ticket.sector = newSector

                    newOccurrence = body["occurrence"]
                    oldOccurrence = body["OldOccurrence"]

                    if newOccurrence == oldOccurrence:
                        pass
                    else:
                        ticket.chat += f",[[Date:{date}],[System: {tech} Mudou a Ocorrência para {newOccurrence}],[Hours:{hours}]]"
                        ticket.occurrence = newOccurrence

                    newProblemn = body["problemn"]
                    oldProblemn = body["OldProblemn"]

                    if newProblemn == oldProblemn:
                        return JsonResponse(
                            {"status": "invalid modify"}, status=402, safe=True
                        )
                    else:
                        ticket.chat += f",[[Date:{date}],[System: {tech} Mudou o Problema para {newProblemn}],[Hours:{hours}]]"
                        ticket.problemn = newProblemn

                        ticket.save()

                    return JsonResponse({"status": "ok"}, status=200, safe=True)
                except Exception as e:
                    print(e)
                    return JsonResponse({"Error": f"Erro inesperado {e}"}, status=304)

            if "HTTP_TECH_DETAILS" in request.META:
                detailsChat = None
                ticket = None
                chat = None
                date = None
                hours = None
                try:
                    detailsChat = body["chat"]
                    ticket = SupportTicket.objects.get(id=id)
                    date = body["date"]
                    hours = body["hours"]

                    if ticket.details == None:
                        ticket.details = f",[[Date:{date}],[{request.user.first_name} {request.user.last_name}: {detailsChat}],[Hours:{hours}]]"
                    else:
                        ticket.details += f",[[Date:{date}],[{request.user.first_name} {request.user.last_name}: {detailsChat}],[Hours:{hours}]]"

                    ticket.save()

                    chat = ticket.details

                    return JsonResponse({"chat": chat}, status=200, safe=True)
                except Exception as e:
                    print(e)
                    return JsonResponse({"Error": f"Erro inesperado {e}"}, status=304)

        except Exception as e:
            print(e)
            return JsonResponse({"Error": f"Erro inesperado {e}"}, status=304)

    if request.method == "GET":
        ticket = None
        pid = None
        validation = None
        try:
            ticket = SupportTicket.objects.filter(id=id)

            for t in ticket:
                pid = t.PID

        except Exception as e:
            print(e)
            return JsonResponse({"Error": f"Erro inesperado {e}"}, status=304)

        try:
            validation = str(pid)
            if len(validation) < 1:
                redirect("/login")

        except Exception as e:
            print(e)
            return JsonResponse({"Error": f"Erro inesperado {e}"}, status=304)

        UserFront = None
        group1 = None
        user = None
        groups = None
        pidViwer = None
        try:
            UserFront = request.user

            group1 = getenv("DJANGO_GROUP_USER")

            user = User.objects.get(username=UserFront)

            groups = user.groups.all()

            for group in groups:
                if group.name == group1:
                    try:
                        pidViwer = int(request.META.get("HTTP_PID"))

                    except TypeError as e:
                        if "NoneType" in str(e):
                            return redirect("/helpdesk")

                        if pid == pidViwer:
                            pass
                        else:
                            return redirect("/helpdesk")

                    except Exception as e:
                        print(e)
                        return JsonResponse(
                            {"Error": f"Erro inesperado {e}"}, status=304
                        )
        except Exception as e:
            print(e)
            return JsonResponse({"Error": f"Erro inesperado {e}"}, status=304)

        serialized_ticket = []
        image = ""
        pil_image = None
        img_bytes = None
        image_data = []
        act_dir = None
        name_file = []
        file_type = None
        content_file = []
        nw_id = None
        try:
            act_dir = getcwd()

            act_dir += f"/uploads/{id}"

            if exists(act_dir) and isdir(act_dir):
                ticket = SupportTicket.objects.filter(id=id)
                for t in ticket:
                    nw_id = t.id
                image = TicketFile.objects.filter(ticket_id=nw_id)

                for file in image:
                    try:
                        with file.file.open() as img:
                            pil_image = Image.open(img)

                            img_bytes = BytesIO()
                            pil_image.save(img_bytes, format="PNG")

                            image_data.append(
                                {
                                    "image": b64encode(img_bytes.getvalue()).decode(
                                        "utf-8"
                                    )
                                }
                            )
                            content_file.append("img")
                            name_file.append("/".join(str(file.file).split("/")[2:]))
                        file.file.close()

                    except UnidentifiedImageError:
                        try:
                            file.file.open()
                            image_bytes = file.file.read()

                            mime = Magic()

                            file_type = mime.from_buffer(image_bytes)

                            if "mail" in file_type.lower():
                                image_data.append("mail")
                                with open(str(file.file), "rb") as eml_file:
                                    content_file.append(
                                        b64encode(eml_file.read()).decode("utf-8")
                                    )
                                    name_file.append(
                                        "/".join(str(file.file).split("/")[2:])
                                    )
                                file.file.close()

                            elif "excel" in file_type.lower():
                                image_data.append("excel")
                                with open(str(file.file), "rb") as exc_file:
                                    content_file.append(
                                        b64encode(exc_file.read()).decode("utf-8")
                                    )
                                    name_file.append(
                                        "/".join(str(file.file).split("/")[2:])
                                    )
                                file.file.close()

                            elif "zip" in file_type.lower():
                                image_data.append("zip")
                                with open(str(file.file), "rb") as zip_file:
                                    content_file.append(
                                        b64encode(zip_file.read()).decode("utf-8")
                                    )
                                    name_file.append(
                                        "/".join(str(file.file).split("/")[2:])
                                    )
                                file.file.close()

                            elif (
                                "utf-8" in file_type.lower()
                                and "text" in file_type.lower()
                                or "ascii" in file_type.lower()
                                and "text" in file_type.lower()
                            ):
                                image_data.append("txt")
                                with open(str(file.file), "rb") as txt_file:
                                    content_file.append(
                                        b64encode(txt_file.read()).decode("utf-8")
                                    )
                                    name_file.append(
                                        "/".join(str(file.file).split("/")[2:])
                                    )
                                file.file.close()

                            elif (
                                "microsoft" in file_type.lower()
                                and "word" in file_type.lower()
                            ):
                                image_data.append("word")
                                with open(str(file.file), "rb") as word_file:
                                    content_file.append(
                                        b64encode(word_file.read()).decode("utf-8")
                                    )
                                    name_file.append(
                                        "/".join(str(file.file).split("/")[2:])
                                    )
                                file.file.close()

                            elif (
                                "pdf" in file_type.lower()
                                and "document" in file_type.lower()
                            ):
                                image_data.append("pdf")
                                with open(str(file.file), "rb") as pdf_file:
                                    content_file.append(
                                        b64encode(pdf_file.read()).decode("utf-8")
                                    )
                                    name_file.append(
                                        "/".join(str(file.file).split("/")[2:])
                                    )
                                file.file.close()

                        except Exception as e:
                            print(e)
                            return JsonResponse(
                                {"Error": f"Erro inesperado {e}"}, status=304
                            )

                    except Exception as e:
                        print(e)
                        return JsonResponse(
                            {"Error": f"Erro inesperado {e}"}, status=304
                        )

            serialized_ticket.append(
                {
                    "ticketRequester": t.ticketRequester,
                    "department": t.department,
                    "mail": t.mail,
                    "company": t.company,
                    "sector": t.sector,
                    "occurrence": t.occurrence,
                    "problemn": t.problemn,
                    "observation": t.observation,
                    "start_date": t.start_date,
                    "PID": pid,
                    "responsible_technician": t.responsible_technician,
                    "id": t.id,
                    "chat": t.chat,
                    "file": image_data,
                    "open": t.open,
                    "name_file": name_file,
                    "content_file": content_file,
                    "equipament": t.equipament,
                }
            )

            return JsonResponse({"data": serialized_ticket}, status=200, safe=True)

        except Exception as e:
            print(e)
            return JsonResponse({"Error": f"Erro inesperado {e}"}, status=304)


@never_cache
@require_GET
@login_required(login_url="/login")
def update_chat(request, id):
    ticket = None
    chat = None
    try:
        ticket = SupportTicket.objects.get(id=id)

        chat = ticket.chat

        return JsonResponse({"chat": chat}, status=200, safe=True)
    except Exception as e:
        print(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=305)


@require_GET
@login_required(login_url="/login")
@never_cache
def moreTicket(request):
    username = None
    newCount = None
    count = 10
    ticket_list = []
    ticket_data = None
    ticket_json = None
    try:
        newCount = int(request.META.get("HTTP_TICKET_CURRENT"))
        count = count + newCount

        if "HTTP_ORDER_BY" in request.META:
            order = request.META.get("HTTP_ORDER_BY")
            if "HTTP_TECH_DASH" in request.META:
                if order == "-id":
                    ticket_data = SupportTicket.objects.order_by("-id")[:count]

                else:
                    ticket_data = SupportTicket.objects[:count]
            else:
                username = request.META.get("HTTP_USER_DATA")
                if order == "-id":
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username
                    ).order_by("-id")[:count]

                else:
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username
                    )[:count]

        else:
            ticket_data = SupportTicket.objects.filter(ticketRequester=username)[:count]

        for ticket in ticket_data:
            ticket_json = serialize("json", [ticket])
            ticket_list.append(ticket_json)

    except Exception as e:
        print(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=306)

    ticket_objects = []
    try:
        for ticket in ticket_list:
            ticket_data = loads(ticket)[0]["fields"]
            ticket_data["id"] = loads(ticket)[0]["pk"]
            ticket_objects.append(ticket_data)

        return JsonResponse(
            {"tickets": ticket_objects, "count": count}, status=200, safe=True
        )

    except Exception as e:
        print(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=306)


@require_GET
@login_required(login_url="/login")
@never_cache
def getTicketFilter(request):
    username = None
    Quantity_tickets = None
    ticket_data = None
    ticket_list = []
    ticket_json = None
    order = None
    problemnFront = None
    sectorFront = None
    status = ""
    try:
        username = request.META.get("HTTP_DATA_USER")
        Quantity_tickets = int(request.META.get("HTTP_QUANTITY_TICKETS"))
        order = request.META.get("HTTP_ORDER_BY")
        sectorFront = request.META.get("HTTP_SECTOR_TICKET")
        problemnFront = request.META.get("HTTP_PROBLEMN_TICKET")
        status = request.META.get("HTTP_STATUS_TICKET")

        if status == "open":
            status = True
        elif status == "close":
            status = False
        elif status == "all":
            status = ""

        if (
            "HTTP_ORDER_BY" in request.META
            and sectorFront == "null"
            and problemnFront == "null"
        ):
            order = request.META.get("HTTP_ORDER_BY")
            if order == "-id":
                if status != "":
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username, open=status
                    ).order_by("-id")[:Quantity_tickets]
                else:
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username
                    ).order_by("-id")[:Quantity_tickets]

            else:
                ticket_data = SupportTicket.objects.filter(
                    ticketRequester=username, open=status
                )[:Quantity_tickets]

        elif "HTTP_SECTOR_TICKET" in request.META and sectorFront == "all":
            if order == "-id":
                if status != "":
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username, open=status
                    ).order_by("-id")[:Quantity_tickets]
                else:
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username
                    ).order_by("-id")[:Quantity_tickets]

            else:
                if status != "":
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username, open=status
                    )[:Quantity_tickets]
                else:
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username
                    )[:Quantity_tickets]

        elif (
            "HTTP_SECTOR_TICKET" in request.META
            and sectorFront != "null"
            and problemnFront == "all"
        ):
            if order == "-id":
                if status != "":
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username, sector=sectorFront, open=status
                    ).order_by("-id")[:Quantity_tickets]
                else:
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username, sector=sectorFront
                    ).order_by("-id")[:Quantity_tickets]

            else:
                if status != "":
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username, sector=sectorFront, open=status
                    )[:Quantity_tickets]
                else:
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username, sector=sectorFront
                    )[:Quantity_tickets]

        elif (
            "HTTP_SECTOR_TICKET" in request.META
            and sectorFront != "null"
            and problemnFront == "null"
        ):
            order = request.META.get("HTTP_ORDER_BY")

            if order == "-id":
                if status != "":
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username, sector=sectorFront, open=status
                    ).order_by("-id")[:Quantity_tickets]
                else:
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username, sector=sectorFront
                    ).order_by("-id")[:Quantity_tickets]

            else:
                if status != "":
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username, sector=sectorFront, open=status
                    )[:Quantity_tickets]
                else:
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username, sector=sectorFront
                    )[:Quantity_tickets]

        elif (
            "HTTP_SECTOR_TICKET" in request.META
            and sectorFront != "null"
            and problemnFront != "null"
        ):
            if order == "-id":
                if status != "":
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username,
                        sector=sectorFront,
                        occurrence=problemnFront,
                        open=status,
                    ).order_by("-id")[:Quantity_tickets]
                else:
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username,
                        sector=sectorFront,
                        occurrence=problemnFront,
                    ).order_by("-id")[:Quantity_tickets]

            else:
                if status != "":
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username,
                        sector=sectorFront,
                        occurrence=problemnFront,
                        open=status,
                    )[:Quantity_tickets]
                else:
                    ticket_data = SupportTicket.objects.filter(
                        ticketRequester=username,
                        sector=sectorFront,
                        occurrence=problemnFront,
                    )[:Quantity_tickets]

        for ticket in ticket_data:
            ticket_json = serialize("json", [ticket])
            ticket_list.append(ticket_json)

    except Exception as e:
        print(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=308)

    ticket_objects = []
    try:
        for ticket in ticket_list:
            ticket_data = loads(ticket)[0]["fields"]
            ticket_data["id"] = loads(ticket)[0]["pk"]
            ticket_objects.append(ticket_data)

        return JsonResponse({"tickets": ticket_objects}, status=200, safe=True)

    except Exception as e:
        print(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=308)


@login_required(login_url="/login")
@require_GET
@never_cache
def getTicketFilterWords(request):
    username = None
    magic_word = None
    ticket_data = None
    ticket_list = []
    ticket_json = None
    magic_word_int = None
    order = None
    Quantity_tickets = None
    try:
        magic_word = request.META.get("HTTP_WORD_FILTER")
        order = request.META.get("HTTP_ORDER_BY")
        Quantity_tickets = int(request.META.get("HTTP_QUANTITY_TICKETS"))
        username = request.META.get("HTTP_DATA_USER")
        magic_word_int = int(magic_word)
        sector_ticket = request.META.get("HTTP_SECTOR_FILTER")
        occurrence_ticket = request.META.get("HTTP_PROBLEM_FILTER")
        if sector_ticket != None:
            if occurrence_ticket != None:
                try:
                    magic_word_int = int(magic_word)
                    if order == "-id":
                        ticket_data = SupportTicket.objects.filter(
                            respective_area="TI",
                            id=magic_word_int,
                            sector=sector_ticket,
                            occurrence=occurrence_ticket,
                            ticketRequester=username,
                        ).order_by("-id")[:Quantity_tickets]

                    else:
                        ticket_data = SupportTicket.objects.filter(
                            respective_area="TI",
                            id=magic_word_int,
                            sector=sector_ticket,
                            occurrence=occurrence_ticket,
                            ticketRequester=username,
                        )[:Quantity_tickets]

                    for ticket in ticket_data:
                        ticket_json = serialize("json", [ticket])
                        ticket_list.append(ticket_json)

                    for ticket in ticket_list:
                        ticket_data = loads(ticket)[0]["fields"]
                        ticket_data["id"] = loads(ticket)[0]["pk"]
                        ticket_objects.append(ticket_data)

                    return JsonResponse(
                        {"tickets": ticket_objects}, status=200, safe=True
                    )
                except ValueError:
                    if order == "-id":
                        ticket_data = SupportTicket.objects.filter(
                            Q(ticketRequester__icontains=username)
                            | Q(occurrence__icontains=occurrence_ticket)
                            | Q(ticketRequester=magic_word)
                            | Q(problemn__icontains=magic_word)
                            | Q(observation__icontains=magic_word)
                            | Q(respective_area__icontains=magic_word)
                            | Q(responsible_technician__icontains=magic_word),
                        ).order_by("-id")[:Quantity_tickets]

                    else:
                        ticket_data = SupportTicket.objects.filter(
                            Q(ticketRequester__icontains=username)
                            | Q(ticketRequester=magic_word)
                            | Q(problemn__icontains=magic_word)
                            | Q(observation__icontains=magic_word)
                            | Q(respective_area__icontains=magic_word)
                            | Q(responsible_technician__icontains=magic_word),
                        )[:Quantity_tickets]

                    for ticket in ticket_data:
                        ticket_json = serialize("json", [ticket])
                        ticket_list.append(ticket_json)

                    ticket_objects = []

                    for ticket in ticket_list:
                        ticket_data = loads(ticket)[0]["fields"]
                        ticket_data["id"] = loads(ticket)[0]["pk"]
                        ticket_objects.append(ticket_data)

                    return JsonResponse(
                        {"tickets": ticket_objects}, status=200, safe=True
                    )

                except Exception as e:
                    print(e)
                    return JsonResponse(
                        {"tickets": ticket_objects}, status=200, safe=True
                    )
            else:
                try:
                    magic_word_int = int(magic_word)
                    if order == "-id":
                        ticket_data = SupportTicket.objects.filter(
                            respective_area="TI",
                            id=magic_word_int,
                            sector=sector_ticket,
                            ticketRequester=username,
                        ).order_by("-id")[:Quantity_tickets]

                    else:
                        ticket_data = SupportTicket.objects.filter(
                            respective_area="TI",
                            id=magic_word_int,
                            sector=sector_ticket,
                            ticketRequester=username,
                        )[:Quantity_tickets]

                    for ticket in ticket_data:
                        ticket_json = serialize("json", [ticket])
                        ticket_list.append(ticket_json)

                    for ticket in ticket_list:
                        ticket_data = loads(ticket)[0]["fields"]
                        ticket_data["id"] = loads(ticket)[0]["pk"]
                        ticket_objects.append(ticket_data)

                    return JsonResponse(
                        {"tickets": ticket_objects}, status=200, safe=True
                    )
                except ValueError:
                    if order == "-id":
                        ticket_data = SupportTicket.objects.filter(
                            Q(ticketRequester__icontains=username)
                            | Q(occurrence__icontains=magic_word)
                            | Q(ticketRequester=magic_word)
                            | Q(problemn__icontains=magic_word)
                            | Q(observation__icontains=magic_word)
                            | Q(respective_area__icontains=magic_word)
                            | Q(responsible_technician__icontains=magic_word),
                        ).order_by("-id")[:Quantity_tickets]

                    else:
                        ticket_data = SupportTicket.objects.filter(
                            Q(ticketRequester__icontains=username)
                            | Q(ticketRequester=magic_word)
                            | Q(problemn__icontains=magic_word)
                            | Q(observation__icontains=magic_word)
                            | Q(respective_area__icontains=magic_word)
                            | Q(responsible_technician__icontains=magic_word),
                        )[:Quantity_tickets]

                    for ticket in ticket_data:
                        ticket_json = serialize("json", [ticket])
                        ticket_list.append(ticket_json)

                    ticket_objects = []

                    for ticket in ticket_list:
                        ticket_data = loads(ticket)[0]["fields"]
                        ticket_data["id"] = loads(ticket)[0]["pk"]
                        ticket_objects.append(ticket_data)

                    return JsonResponse(
                        {"tickets": ticket_objects}, status=200, safe=True
                    )

                except Exception as e:
                    print(e)
                    return JsonResponse(
                        {"tickets": ticket_objects}, status=200, safe=True
                    )
        else:
            try:
                magic_word_int = int(magic_word)
                if order == "-id":
                    ticket_data = SupportTicket.objects.filter(
                        respective_area="TI",
                        id=magic_word_int,
                        sector=sector_ticket,
                        ticketRequester=username,
                    ).order_by("-id")[:Quantity_tickets]

                else:
                    ticket_data = SupportTicket.objects.filter(
                        respective_area="TI",
                        id=magic_word_int,
                        sector=sector_ticket,
                        ticketRequester=username,
                    )[:Quantity_tickets]

                    for ticket in ticket_data:
                        ticket_json = serialize("json", [ticket])
                        ticket_list.append(ticket_json)

                    for ticket in ticket_list:
                        ticket_data = loads(ticket)[0]["fields"]
                        ticket_data["id"] = loads(ticket)[0]["pk"]
                        ticket_objects.append(ticket_data)

                    return JsonResponse(
                        {"tickets": ticket_objects}, status=200, safe=True
                    )
            except ValueError:
                if order == "-id":
                    ticket_data = SupportTicket.objects.filter(
                        Q(ticketRequester__icontains=username)
                        | Q(occurrence__icontains=magic_word)
                        | Q(ticketRequester=magic_word)
                        | Q(problemn__icontains=magic_word)
                        | Q(observation__icontains=magic_word)
                        | Q(respective_area__icontains=magic_word)
                        | Q(responsible_technician__icontains=magic_word),
                    ).order_by("-id")[:Quantity_tickets]

                else:
                    ticket_data = SupportTicket.objects.filter(
                        Q(ticketRequester__icontains=username)
                        | Q(ticketRequester=magic_word)
                        | Q(problemn__icontains=magic_word)
                        | Q(observation__icontains=magic_word)
                        | Q(respective_area__icontains=magic_word)
                        | Q(responsible_technician__icontains=magic_word),
                    )[:Quantity_tickets]

                for ticket in ticket_data:
                    ticket_json = serialize("json", [ticket])
                    ticket_list.append(ticket_json)

                ticket_objects = []

                for ticket in ticket_list:
                    ticket_data = loads(ticket)[0]["fields"]
                    ticket_data["id"] = loads(ticket)[0]["pk"]
                    ticket_objects.append(ticket_data)

                return JsonResponse({"tickets": ticket_objects}, status=200, safe=True)

    except Exception as e:
        print(e)
        return JsonResponse({"tickets": ticket_objects}, status=200, safe=True)


@login_required(login_url="/login")
@require_GET
@never_cache
def getTicketFilterStatus(request):
    username = None
    order = None
    Quantity_tickets = None
    Status = None
    ticket_data = None
    try:
        username = request.META.get("HTTP_DATA_USER")
        order = request.META.get("HTTP_ORDER_BY")
        Quantity_tickets = int(request.META.get("HTTP_QUANTITY_TICKETS"))
        Status = request.META.get("HTTP_STATUS_REQUEST")

        if order == "-id":
            if Status == "open":
                ticket_data = SupportTicket.objects.filter(
                    ticketRequester=username, open=True
                ).order_by("-id")[:Quantity_tickets]
            elif Status == "close":
                ticket_data = SupportTicket.objects.filter(
                    ticketRequester=username, open=None
                ).order_by("-id")[:Quantity_tickets]
            elif Status == "stop":
                ticket_data = SupportTicket.objects.filter(
                    ticketRequester=username, open=False
                ).order_by("-id")[:Quantity_tickets]
            elif Status == "all":
                ticket_data = SupportTicket.objects.filter(
                    ticketRequester=username
                ).order_by("-id")[:Quantity_tickets]
        else:
            if Status == "open":
                ticket_data = SupportTicket.objects.filter(
                    ticketRequester=username, open=True
                )[:Quantity_tickets]
            elif Status == "stop":
                ticket_data = SupportTicket.objects.filter(
                    ticketRequester=username, open=None
                )[:Quantity_tickets]
            elif Status == "close":
                ticket_data = SupportTicket.objects.filter(
                    ticketRequester=username, open=False
                )[:Quantity_tickets]
            elif Status == "all":
                ticket_data = SupportTicket.objects.filter(ticketRequester=username)[
                    :Quantity_tickets
                ]

    except Exception as e:
        print(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=309)

    ticket_list = []
    ticket_json = None
    try:
        for ticket in ticket_data:
            ticket_json = serialize("json", [ticket])
            ticket_list.append(ticket_json)

        ticket_objects = []
        for ticket in ticket_list:
            ticket_data = loads(ticket)[0]["fields"]
            ticket_data["id"] = loads(ticket)[0]["pk"]
            ticket_objects.append(ticket_data)

        return JsonResponse({"tickets": ticket_objects}, status=200, safe=True)

    except Exception as e:
        print(e)
        return JsonResponse({"Error": f"Erro inesperado {e}"}, status=309)


@contextmanager
def get_database_connection():
    """Context manager for managing database connections."""
    connection = None
    try:
        connection = mysql.connector.connect(
            host=config("DB_HOST"),
            database=config("DB_NAME"),
            user=config("DB_USER"),
            password=config("DB_PASSWORD"),
        )
        yield connection
    except mysql.connector.Error as err:
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
        matches = re.findall(pattern, chat_data)

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
        if chat == None:
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

        # Retorna sucesso
        return JsonResponse({"status": "Last Viewer Alterado"}, safe=True, status=200)

    except Exception as e:
        # Em caso de erro, imprime a exceção e retorna um status de falha
        print(e)
        return JsonResponse({"status": "fail"}, safe=True, status=311)


def verifyNotificationCall():
    return print("CHAMOU")


def verify_names(name_verify, responsible_technician):
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


# verifyNotificationCall_sync = sync_to_async(verifyNotificationCall)
