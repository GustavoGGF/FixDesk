from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token
from os import getcwd, getenv, path
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from helpdesk.models import SupportTicket, TicketFile
from json import loads
from django.core.serializers import serialize
from django.middleware.csrf import get_token
from django.contrib.auth.models import Group, User
from datetime import date, datetime, timedelta
from django.db.models import Q
from magic import Magic
from mimetypes import guess_type
from django.core.files.base import ContentFile
from PIL import Image, UnidentifiedImageError
from io import BytesIO
from base64 import b64encode
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_POST, require_GET
from django.db import transaction
from logging import basicConfig, WARNING, getLogger
from calendar import monthrange
from django.core.handlers.wsgi import WSGIRequest
from collections import defaultdict
from django.db.models import Count
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db.models import F, Func, IntegerField
from django.views.decorators.cache import cache_page

# Configuração básica de logging
basicConfig(level=WARNING)
logger = getLogger(__name__)

tech_group = getenv("DJANGO_GROUP_TECH")
leader_group = getenv("DJANGO_GROUP_LEADER")
status_mapping = {"open": True, "close": False, "stop": None, "all": "All"}
types_str = getenv("VALID_TYPES")


@csrf_exempt  # Permite o acesso sem verificação de CSRF para essa view.
@login_required(login_url="/login")  # Exige que o usuário esteja autenticado.
@require_GET  # Exige que a requisição seja do tipo GET.
@cache_page(60 * 5)
def dashboard_ti(request: WSGIRequest):
    """
    Função que valida se o usuário possui permissão para acessar o dashboard da área de TI.
    Se o usuário não pertence aos grupos de técnico ou líder, será redirecionado para a página de helpdesk.
    """
    try:
        # Obtém o usuário autenticado da requisição.
        user = request.user

        # Verifica se o usuário pertence aos grupos de 'tech_group' ou 'leader_group'.
        # Caso contrário, ele não terá permissão para acessar o dashboard.
        if not user.groups.filter(name__in=[tech_group, leader_group]).exists():
            # Registra um alerta no log informando que o usuário não tem permissão para acessar.
            logger.warning(
                f"Usuário {user.username} não tem permissão para acessar o dashboard TI."
            )
            # Redireciona o usuário para a página de helpdesk caso não tenha permissão.
            return redirect("/helpdesk")

        # Se o usuário tiver permissão, renderiza o template 'index.html' do dashboard TI.
        return render(request, "index.html")

    except Exception as e:
        # Caso ocorra algum erro durante o processo, loga o erro.
        logger.error(
            f"Erro ao acessar o dashboard TI para o usuário {request.user.username}: {e}"
        )
        # Retorna uma resposta JSON com o erro para o cliente.
        return JsonResponse({"Error": f"Erro inesperado: {e}"}, status=500)


@csrf_exempt  # Permite que a view seja acessada sem a verificação de CSRF.
@login_required(login_url="/login")  # Exige que o usuário esteja autenticado.
@require_GET  # Especifica que apenas requisições GET são permitidas para essa view.
@never_cache
def get_info(request: WSGIRequest):
    try:
        csrf_token = get_token(request)  # Obtém o token CSRF.

        try:
            group = Group.objects.get(
                name=tech_group
            )  # Tenta obter o grupo de técnicos.
        except Group.DoesNotExist:
            logger.error(
                f"Grupo '{tech_group}' não encontrado."
            )  # Registra erro caso o grupo não exista.
            return JsonResponse(
                {"Error": f"Grupo técnico '{tech_group}' não encontrado."},
                status=404,  # Retorna erro 404 se o grupo não for encontrado.
            )

        users_in_group = User.objects.filter(
            groups=group
        )  # Obtém os usuários no grupo de técnicos.

        techs = [
            f"{user.first_name} {user.last_name}" for user in users_in_group
        ]  # Cria lista de nomes completos.

        return JsonResponse(
            {
                "token": csrf_token,
                "techs": techs,
            },  # Retorna o token e a lista de técnicos.
            status=200,  # Retorna status 200 de sucesso.
            safe=True,
        )

    except Exception as e:
        logger.error(
            f"Erro ao obter CSRF e lista de técnicos: {e}"
        )  # Registra erro se algo falhar.
        return JsonResponse(
            {"Error": f"Erro ao obter CSRF e lista técnica: {e}"},
            status=500,  # Retorna erro 500 em caso de falha.
        )


@login_required(login_url="/login")  # Exige que o usuário esteja autenticado.
@require_GET  # Permite apenas requisições GET para essa view.
def get_dash_board_pie(request, sector: str):
    if sector == "TI":  # Verifica se o setor é "TI".
        try:
            boardpie = [
                0,
                0,
                0,
                0,
                0,
            ]  # Inicializa a lista para os dados do gráfico pie.
            tickets_data = SupportTicket.objects.filter(
                respective_area="TI"
            )  # Obtém os tickets da área "TI".

            count = openTicket = closeTicket = stopTicket = count_urgent = (
                0  # Inicializa os contadores.
            )

            # Itera sobre todos os tickets para contar os status.
            for tickets in tickets_data:
                count += 1  # Incrementa o contador total de tickets.
                opens = tickets.open

                if opens is True:
                    openTicket += 1  # Conta tickets abertos.
                if opens is False:
                    closeTicket += 1  # Conta tickets fechados.
                if opens is None:
                    stopTicket += 1  # Conta tickets parados.

            tickets_data = SupportTicket.objects.filter(
                respective_area="TI", open=True
            )  # Obtém tickets abertos.

            # Verifica os tickets abertos há mais de 7 dias para contar como urgentes.
            for tickets in tickets_data:
                date_verify = tickets.start_date
                date_current = datetime.now(date_verify.tzinfo)
                diference = date_current - date_verify
                if diference > timedelta(days=7):
                    count_urgent += 1  # Conta tickets urgentes.

            # Preenche os dados para o gráfico pie.
            boardpie[0] = count
            boardpie[1] = openTicket
            boardpie[2] = closeTicket
            boardpie[3] = stopTicket
            boardpie[4] = count_urgent

            return JsonResponse(
                {"data": boardpie}, status=200, safe=True
            )  # Retorna os dados do gráfico pie.

        except Exception as e:
            logger.error(e)  # Registra erro caso ocorra.
            return JsonResponse(
                {"Error": f"Erro ao obter os chamados para DashBoardPie {e}"},
                status=331,  # Retorna erro 331 caso falhe.
            )


@login_required(login_url="/login")
@require_GET
@never_cache
def get_ticket_ti(request, quantity: int, status: str, order: str):
    """
    Obtém os primeiros chamados de TI, com filtros de quantidade e status (aberto, fechado, etc.).

    :param request: Objeto da requisição.
    :param quantity: Quantidade fixa de tickets a serem retornados.
    :param status: Status do ticket (aberto, fechado, parado ou todos).

    :return: Retorna um JSON com os tickets ou um erro se ocorrer algum problema.
    """
    # Define o status baseado no mapeamento
    status_opng = status_mapping.get(status, None)

    try:
        filters = Q()
        if status_opng not in {"All", "null"}:
            filters &= Q(open=status_opng)

            # Filtra os chamados com base nos critérios definidos e aplica a ordenação
        ticket_data = SupportTicket.objects.filter(filters).order_by(order or "-id")[
            :quantity
        ]

        # Serializa os tickets e prepara a resposta
        ticket_objects = [
            {**loads(serialize("json", [ticket]))[0]["fields"], "id": ticket.id}
            for ticket in ticket_data
        ]

        return JsonResponse({"tickets": ticket_objects}, status=200, safe=True)

    except Exception as e:
        logger.error(f"Erro ao obter ou montar os chamados: {e}")
        return JsonResponse({"Error": f"Erro ao obter os chamados {e}"}, status=332)


@require_GET
@never_cache
@login_required(login_url="/login")
def get_dash_board_bar(request: WSGIRequest, range_days: str):
    """
    Retorna os dados do dashboard Bar conforme o limite de datas estipulado.

    :param request: Objeto WSGIRequest contendo os dados da requisição HTTP.
    :param range_days: String que define o intervalo de tempo para os dados do dashboard
                       (semanal, mensal, anual ou total).
    """
    if range_days == "week":
        try:
            # Obtém a data atual
            today = date.today()

            # Obtém a semana e o ano atuais corretamente
            current_week, current_year = today.isocalendar()[1], today.isocalendar()[0]

            # Filtra os tickets com base na data sem hora
            tickets_data = SupportTicket.objects.annotate(
                week_number=Func(
                    F("start_date"),
                    function="WEEK",
                    template="WEEK(%(expressions)s, 1)",  # Similar ao MySQL WEEK com o parâmetro 1
                    output_field=IntegerField(),  # Garantir que o retorno seja um inteiro
                )
            ).filter(week_number=current_week)

            # Debug: Verifique o que está sendo retornado
            if tickets_data.exists():
                pass
            else:
                return JsonResponse({"Error": "Falta de dados"}, status=204, safe=True)

            # Lista dos dias da semana em português
            weekdays = [
                "Segunda-feira",
                "Terça-feira",
                "Quarta-feira",
                "Quinta-feira",
                "Sexta-feira",
                "Sábado",
                "Domingo",
            ]

            # Inicializa a lista de valores para contagem dos tickets (inicia com 0 para cada dia)
            values = [0] * 7

            for ticket in tickets_data:
                ticket_day = ticket.start_date.date()
                # Incrementa o contador para o dia da semana correspondente
                values[ticket_day.weekday()] += 1

            # Verifica se não há dados de tickets e retorna erro 204
            if all(num == 0 for num in values):
                return JsonResponse({"Error": "Falta de dados"}, status=204, safe=True)

            # Monta os dados para o gráfico
            histogram_data = {"days": weekdays, "values": values}

            # Retorna os dados como resposta JSON
            return JsonResponse(histogram_data, status=200, safe=True)

        except Exception as e:
            # Registra qualquer erro inesperado que ocorra
            logger.error(f"Erro inesperado em DashBoardBar: {e}")
            # Retorna uma resposta de erro JSON
            return JsonResponse(
                {"Error": f"Erro inesperado DashBoardBar {e}"}, status=210
            )

    elif range_days == "month":
        try:
            # Obtém a data e hora atuais
            now = datetime.now()
            current_month = now.month
            current_year = now.year

            # Verifica quantos dias tem no mês atual
            days_in_month = monthrange(current_year, current_month)[1]

            # Inicializa a lista de valores com 0 para cada dia do mês
            values = [0] * days_in_month

            # Anota os tickets com o número do mês
            tickets_data = SupportTicket.objects.annotate(
                month_number=Func(
                    F("start_date"),
                    function="MONTH",
                    template="MONTH(%(expressions)s)",  # Similar ao MySQL MONTH
                    output_field=IntegerField(),  # Garantir que o retorno seja um inteiro
                )
            ).filter(month_number=now.month, start_date__year=current_year)

            if tickets_data.count() == 0:
                logger.error("Nenhum ticket encontrado para este mês")
                return JsonResponse(
                    {"Error": "Nenhum ticket encontrado para este mês"}, status=204
                )

            # Itera sobre os tickets para contar quantos ocorreram em cada dia do mês
            for ticket in tickets_data:
                ticket_day = ticket.start_date.day
                values[
                    ticket_day - 1
                ] += 1  # Incrementa o contador para o dia correspondente

            # Monta os dados para o gráfico
            histogram_data = {
                "days": list(range(1, days_in_month + 1)),
                "values": values,
            }

            # Retorna os dados como resposta JSON
            return JsonResponse(histogram_data, status=200, safe=True)

        except Exception as e:
            logger.error(f"Erro inesperado em DashBoardBarMonth: {e}")
            return JsonResponse({"Error": f"Erro inesperado {e}"}, status=210)

    elif range_days == "year":
        try:
            # Obtém a data atual
            today = date.today()
            # Lista dos meses do ano em português
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

            # Obtém a contagem de chamados agrupados por mês, para o ano atual e para a área de TI
            tickets_data = SupportTicket.objects.annotate(
                month_number=Func(
                    F("start_date"),
                    function="MONTH",
                    template="MONTH(%(expressions)s)",  # Similar ao MySQL MONTH
                    output_field=IntegerField(),  # Garantir que o retorno seja um inteiro
                )
            ).filter(start_date__year=today.year, respective_area="TI")

            # Obtém a contagem de chamados agrupados por mês
            ticket_counts = tickets_data.values("month_number").annotate(
                count=Count("id")
            )

            # Inicializa todos os meses com 0, e preenche com os valores da contagem
            values = defaultdict(
                int,
                {item["month_number"]: item["count"] for item in ticket_counts},
            )

            # Monta os dados para o gráfico, incluindo os meses do ano e os valores contados
            histogram_data = {
                "days": months,
                "values": [
                    values.get(i, 0) for i in range(1, 13)
                ],  # Garante que os meses estejam na ordem correta
            }

            # Retorna os dados como resposta JSON
            return JsonResponse(histogram_data, status=200, safe=True)

        except Exception as e:
            # Registra qualquer erro inesperado que ocorra
            logger.error(f"Erro inesperado em get_dashboard_bar: {e}")
            # Retorna uma resposta de erro JSON
            return JsonResponse(
                {"Error": f"Erro inesperado em DashBoardBarYear: {e}"}, status=210
            )

    elif range_days == "all":
        try:
            tickets_data = SupportTicket.objects.annotate(
                year_number=Func(
                    F("start_date"),
                    function="YEAR",
                    template="YEAR(%(expressions)s)",  # Similar ao MySQL YEAR
                    output_field=IntegerField(),  # Garantir que o retorno seja um inteiro
                )
            )

            # Obtém a contagem de chamados agrupados por ano
            ticket_counts = (
                tickets_data.values("year_number")
                .annotate(count=Count("id"))
                .order_by("year_number")
            )

            # Extrai os anos únicos dos resultados
            years = sorted({item["year_number"] for item in ticket_counts})

            # Monta os dados para o gráfico, incluindo os anos e os valores contados
            histogram_data = {
                "days": years,
                "values": [
                    item["count"] for item in ticket_counts
                ],  # Garante que os anos estejam na ordem correta
            }

            # Retorna os dados como resposta JSON
            return JsonResponse(histogram_data, status=200, safe=True)

        except Exception as e:
            # Registra qualquer erro inesperado que ocorra
            logger.error(f"Erro inesperado em get_dashboard_bar: {e}")
            # Retorna uma resposta de erro JSON
            return JsonResponse(
                {"Error": f"Erro inesperado em DashBoardBarYear: {e}"}, status=210
            )


def verify_valid_or_not(file: InMemoryUploadedFile, types: list):
    """
    Verifica se o arquivo enviado é de um tipo válido.

    Esta função lê o arquivo enviado, verifica seu tipo MIME e compara com os tipos permitidos fornecidos na lista.
    Caso o tipo MIME do arquivo corresponda a algum tipo na lista de tipos permitidos, retorna 'True', indicando que o arquivo é válido.

    :param file: Arquivo carregado, geralmente uma imagem ou outro tipo de arquivo.
    :param types: Lista de tipos MIME permitidos para o arquivo.
    :return: Tupla contendo um valor booleano (True se válido, False se não) e os bytes do arquivo.
    """
    image_bytes = file.read()
    mime = Magic()
    file_type = mime.from_buffer(image_bytes)
    valid = False
    for typeUn in types:
        if typeUn.replace('"', "").lower() in file_type.lower():
            valid = True
            break
    return valid, image_bytes


def process_files(file: TicketFile):
    """
    Processa arquivos de diferentes tipos (imagem, texto, documentos) e converte seu conteúdo para uma representação base64.

    A função verifica se o arquivo é uma imagem ou outro tipo de arquivo, realizando o processamento adequado.
    Para imagens, os dados são convertidos em formato PNG e codificados em base64.
    Para outros tipos de arquivos, como documentos e e-mails, o tipo MIME é detectado e o conteúdo é codificado em base64.
    Em caso de erro, a função captura exceções e registra os erros apropriados.

    :param file: Objeto que representa o arquivo a ser processado.
    :return: Tupla contendo três listas:
        - content_file: Contém os dados codificados em base64 dos arquivos.
        - name_file: Contém os nomes dos arquivos processados.
        - image_data: Contém os dados específicos de imagem ou tipo detectado.
    """
    image_data = []
    name_file = []
    content_file = []
    try:
        with file.file.open() as img:
            pil_image = Image.open(img)
            img_bytes = BytesIO()
            pil_image.save(img_bytes, format="PNG")

            image_data.append(
                {"image": b64encode(img_bytes.getvalue()).decode("utf-8")}
            )
            content_file.append("img")
            name_file.append("/".join(str(file.file).split("/")[2:]))
            file_abs_path = path.join(getcwd(), file_path)

            if not path.exists(file_abs_path):
                print(f"Arquivo não encontrado: {file_abs_path}")
                pass
            file.file.close()

    except UnidentifiedImageError:
        try:
            file.file.open()
            image_bytes = file.file.read()

            mime = Magic()
            file_type = mime.from_buffer(image_bytes)
            file_path = str(file.file)
            file_name = "/".join(file_path.split("/")[2:])
            file_abs_path = path.join(getcwd(), file_path)

            if not path.exists(file_abs_path):
                print(f"Arquivo não encontrado: {file_abs_path}")
                pass

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

            type_detected = None
            for key, value in type_mapping.items():
                if key in file_type.lower():
                    image_data.append(value)
                    type_detected = value
                    break

            if type_detected:
                with open(file_path, "rb") as f:
                    content_file.append(b64encode(f.read()).decode("utf-8"))
                name_file.append(file_name)
        except Exception as e:
            logger.error(f"Error processing file {file.file.name}: {e}")
            return JsonResponse({"error": str(e)}, status=340)

    except Exception as e:
        logger.error(f"Unexpected error processing file {file.file.name}: {e}")
        return JsonResponse({"error": str(e)}, status=340)
    return content_file, name_file, image_data


@require_POST
@transaction.atomic
@requires_csrf_token
def upload_new_files(request, id):
    """
    Realiza o upload de novos arquivos para um chamado de suporte.

    A função recebe arquivos enviados via requisição POST, valida os tipos permitidos e salva os arquivos associados ao chamado.
    Atualiza o histórico do chamado com informações sobre o upload e processa os arquivos para extração de conteúdo.
    Em caso de erro, registra a exceção no log e retorna uma resposta JSON com a mensagem de erro.

    :param request: Objeto da requisição HTTP contendo os arquivos e metadados do upload.
    :param id: Identificador único do chamado de suporte ao qual os arquivos serão associados.
    :return: Resposta JSON contendo os detalhes do upload, incluindo histórico atualizado e arquivos processados.
    """
    try:
        other_files = request.FILES.getlist("files")
        ticket = SupportTicket.objects.get(id=id)
        date = request.POST.get("date")
        hours = request.POST.get("hours")
        types = [type.strip() for type in types_str.split(",")]

        if other_files:
            for unit_file in other_files:
                valid, image_bytes = verify_valid_or_not(unit_file, types_str)

                if not valid:
                    image_str = str(unit_file)
                    other_image = guess_type(image_str)
                    for typeUn in types:
                        if (
                            typeUn.replace('"', "").lower()
                            in other_image[0].replace('"', "").lower()
                        ):
                            valid = True
                            break

                if valid:
                    Ticket = SupportTicket.objects.get(id=id)
                    ticket_file = TicketFile(ticket=Ticket)
                    ticket_file.save()
                    ticket.chat += f",[[Date:{date}],[System:{request.user.first_name} {request.user.last_name} Anexou o arquivo {unit_file}],[Hours:{hours}]]"
                    ticket_file.file.save(str(unit_file), ContentFile(image_bytes))
                    ticket.save()
                    ticket_file.save()

        image = TicketFile.objects.filter(ticket_id=id)
        for file in image:
            content_file, name_file, image_data = process_files(file)
        return JsonResponse(
            {
                "chat": ticket.chat,
                "files": image_data,
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
def details_chat(request: WSGIRequest, id: int):
    """
    Obtém os detalhes técnicos de um chamado de suporte.

    :param request: Objeto WSGIRequest contendo os dados da requisição.
    :param id: Identificador único do chamado de suporte.
    :return: JsonResponse com os detalhes do chamado ou mensagem de erro.
    """

    try:
        user = request.user  # Obtém o usuário autenticado na requisição.

        # Verifica se o usuário pertence a um dos grupos autorizados.
        if not user.groups.filter(name__in=[tech_group, leader_group]).exists():
            return redirect(
                "/helpdesk"
            )  # Redireciona para a página do helpdesk caso não autorizado.

        # Busca o chamado de suporte pelo ID ou retorna erro 404 se não encontrado.
        ticket = get_object_or_404(SupportTicket, id=id)

        # Retorna os detalhes do chamado em formato JSON.
        return JsonResponse({"details": ticket.details}, status=200, safe=True)

    except Exception as e:
        # Registra o erro no sistema de logs para análise posterior.
        logger.error(f"Erro inesperado em detailsChat: {e}")

        # Retorna uma resposta JSON com mensagem de erro e código HTTP 500 (Erro interno do servidor).
        return JsonResponse(
            {"Error": f"Erro inesperado ao obter detalhes técnicos: {e}"}, status=500
        )
