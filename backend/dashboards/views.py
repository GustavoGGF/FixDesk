from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token
from os import getenv
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, JsonResponse
from dotenv import load_dotenv
from helpdesk.models import SupportTicket, TicketFile
from json import loads
from django.core.serializers import serialize
from django.middleware.csrf import get_token
from django.contrib.auth.models import Group, User
from .models import Equipaments
from datetime import date, datetime, timedelta
from django.db.models import Q
import calendar
from magic import Magic
import mimetypes
from django.core.files.base import ContentFile
from PIL import Image, UnidentifiedImageError
from io import BytesIO
from base64 import b64encode
from django.db.models.functions import TruncDate
from django.utils.timezone import make_aware
import pytz
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_http_methods
from django.db import transaction


# Create your views here.
@csrf_exempt
@login_required(login_url="/login")
@never_cache
def dashboard_TI(request):
    if request.method == "POST":
        csrf = None
        techs = []
        group = None
        group_name = None
        user_in_group = None
        name_first = None
        name_last = None
        name_tech = None

        try:
            csrf = get_token(request)

            group_name = getenv("DJANGO_GROUP_TECH")

            group = Group.objects.get(name=group_name)

            user_in_group = User.objects.filter(groups=group)

            for user in user_in_group:
                name_first = str(user.first_name)
                name_last = str(user.last_name)

                name_tech = name_first + " " + name_last

                techs.append(name_tech)

            return JsonResponse(
                {"token": csrf, "techs": techs},
                status=200,
                safe=True,
            )
        except Exception as e:
            print(e)

    if request.method == "GET":
        UserFront = None
        user = None
        groups = None
        group1 = None
        try:
            UserFront = request.user
            group1 = getenv("DJANGO_GROUP_TECH")
            group2 = getenv("DJANGO_GROUP_LEADER")

            user = User.objects.get(username=UserFront)

            groups = user.groups.all()

            for group in groups:
                if group.name != group1 and group.name != group2:
                    return redirect("/helpdesk")

            return render(request, "index.html", {})
        except Exception as e:
            print(e)


@login_required(login_url="/login")
@never_cache
@require_http_methods(["GET"])
def getDashBoardPie(request, sector):
    if sector == "TI":
        boardpie = None
        tickets_data = None
        opens = None
        date_current = None
        diference = None

        try:
            boardpie = [0, 0, 0, 0, 0]
            tickets_data = SupportTicket.objects.filter(respective_area="TI")

            count = 0
            openTicket = 0
            count_urgent = 0
            closeTicket = 0
            stopTicket = 0
            date_verify = None

            for tickets in tickets_data:
                count += 1

                opens = tickets.open

                if opens == True:
                    openTicket += 1
                if opens == False:
                    closeTicket += 1
                if opens == None:
                    stopTicket += 1

            tickets_data = SupportTicket.objects.filter(respective_area="TI", open=True)

            for tickets in tickets_data:

                date_verify = tickets.start_date

                date_current = datetime.now(date_verify.tzinfo)

                diference = date_current - date_verify

                if diference > timedelta(days=7):
                    count_urgent += 1

            boardpie[0] = count
            boardpie[1] = openTicket
            boardpie[2] = closeTicket
            boardpie[3] = stopTicket
            boardpie[4] = count_urgent

            return JsonResponse({"data": boardpie}, status=200, safe=True)

        except Exception as e:
            print(e)


@login_required(login_url="/login")
@never_cache
@require_http_methods(["GET"])
def get_ticket_TI(request):
    ticket_list = []
    ticket_data = None
    ticket_json = None
    try:
        ticket_data = SupportTicket.objects.filter(
            respective_area="TI", open=True
        ).order_by("-id")[:10]

        for ticket in ticket_data:
            ticket_json = serialize("json", [ticket])
            ticket_list.append(ticket_json)

    except Exception as e:
        print(e)

    ticket_objects = []
    try:
        for ticket in ticket_list:
            ticket_data = loads(ticket)[0]["fields"]
            ticket_data["id"] = loads(ticket)[0]["pk"]
            ticket_objects.append(ticket_data)

        return JsonResponse({"tickets": ticket_objects}, status=200, safe=True)

    except Exception as e:
        print(e)


@login_required(login_url="/login")
@never_cache
@require_http_methods(["GET"])
def getTicketFilter(request):

    # Inicializa a variável Quantity_tickets com valor None.
    # Usada para armazenar a quantidade total de tickets que atendem aos filtros aplicados.
    Quantity_tickets = None

    # Inicializa a variável ticket_data com valor None.
    # Usada para armazenar os dados dos tickets retornados, geralmente em formato de dicionário ou objeto.
    ticket_data = None

    # Inicializa a lista ticket_list como uma lista vazia.
    # Usada para armazenar a lista de tickets que atendem aos critérios de filtro.
    ticket_list = []

    # Inicializa a variável ticket_json com valor None.
    # Usada para armazenar os dados dos tickets em formato JSON para ser retornado na resposta.
    ticket_json = None

    # Inicializa a variável order com valor None.
    # Usada para armazenar informações sobre a ordem de classificação dos tickets, se aplicável.
    order = None

    # Inicializa a variável problemnFront com valor None.
    # Usada para armazenar informações relacionadas ao problema do frontend, caso haja um filtro baseado em problema.
    problemnFront = None

    # Inicializa a variável sectorFront com valor None.
    # Usada para armazenar informações relacionadas ao setor do frontend, se houver um filtro baseado em setor.
    sectorFront = None

    # Inicializa a variável status como uma string vazia.
    # Usada para armazenar o status dos tickets ou o status do filtro aplicado, se aplicável.
    status = ""

    try:
        # Pegando o valor do status
        status = request.META.get("HTTP_STATUS_TICKET")
        if status == "open":
            status = True
        elif status == "close":
            status = False
        elif status == "stop":
            status = None
        elif status == "all":
            status = ""

        # Pegando Valores Necessarios
        Quantity_tickets = int(request.META.get("HTTP_QUANTITY_TICKETS"))
        order = request.META.get("HTTP_ORDER_BY")
        sectorFront = request.META.get("HTTP_SECTOR_TICKET")
        problemnFront = request.META.get("HTTP_PROBLEMN_TICKET")

        if (
            "HTTP_ORDER_BY" in request.META
            and sectorFront == "null"
            and problemnFront == "null"
        ):
            order = request.META.get("HTTP_ORDER_BY")
            if order == "-id":
                if status != "":
                    ticket_data = SupportTicket.objects.filter(
                        respective_area="TI", open=status
                    ).order_by("-id")[:Quantity_tickets]
                else:
                    ticket_data = SupportTicket.objects.filter(
                        respective_area="TI"
                    ).order_by("-id")[:Quantity_tickets]

            else:
                ticket_data = SupportTicket.objects.filter(respective_area="TI")[
                    :Quantity_tickets
                ]

        elif "HTTP_SECTOR_TICKET" in request.META and sectorFront == "all":
            if order == "-id":
                if status != "":
                    ticket_data = SupportTicket.objects.filter(
                        respective_area="TI", open=status
                    ).order_by("-id")[:Quantity_tickets]
                else:
                    ticket_data = SupportTicket.objects.filter(
                        respective_area="TI"
                    ).order_by("-id")[:Quantity_tickets]

            else:
                ticket_data = SupportTicket.objects.filter(respective_area="TI")[
                    :Quantity_tickets
                ]

        elif (
            "HTTP_SECTOR_TICKET" in request.META
            and sectorFront != "null"
            and problemnFront == "all"
        ):
            if order == "-id":
                if status != "":
                    ticket_data = SupportTicket.objects.filter(
                        respective_area="TI", sector=sectorFront, open=status
                    ).order_by("-id")[:Quantity_tickets]
                else:
                    ticket_data = SupportTicket.objects.filter(
                        respective_area="TI",
                        sector=sectorFront,
                    ).order_by("-id")[:Quantity_tickets]

            else:
                ticket_data = SupportTicket.objects.filter(
                    sector=sectorFront, respective_area="TI"
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
                        respective_area="TI", sector=sectorFront, open=status
                    ).order_by("-id")[:Quantity_tickets]
                else:
                    ticket_data = SupportTicket.objects.filter(
                        respective_area="TI", sector=sectorFront
                    ).order_by("-id")[:Quantity_tickets]

            else:
                ticket_data = SupportTicket.objects.filter(
                    respective_area="TI", sector=sectorFront
                )[:Quantity_tickets]

        elif (
            "HTTP_SECTOR_TICKET" in request.META
            and sectorFront != "null"
            and problemnFront != "null"
        ):
            if order == "-id":
                if status != "":
                    ticket_data = SupportTicket.objects.filter(
                        respective_area="TI",
                        sector=sectorFront,
                        occurrence=problemnFront,
                        open=status,
                    ).order_by("-id")[:Quantity_tickets]
                else:
                    ticket_data = SupportTicket.objects.filter(
                        respective_area="TI",
                        sector=sectorFront,
                        occurrence=problemnFront,
                    ).order_by("-id")[:Quantity_tickets]

            else:
                ticket_data = SupportTicket.objects.filter(
                    respective_area="TI",
                    sector=sectorFront,
                    occurrence=problemnFront,
                )[:Quantity_tickets]

        for ticket in ticket_data:
            ticket_json = serialize("json", [ticket])
            ticket_list.append(ticket_json)

    except Exception as e:
        print(e)

    ticket_objects = []
    try:
        for ticket in ticket_list:
            ticket_data = loads(ticket)[0]["fields"]
            ticket_data["id"] = loads(ticket)[0]["pk"]
            ticket_objects.append(ticket_data)

        return JsonResponse({"tickets": ticket_objects}, status=200, safe=True)

    except Exception as e:
        print(e)


@never_cache
@require_http_methods(["GET"])
@login_required(login_url="/login")
def getTicketFilterWords(request):
    magic_word = None
    ticket_data = None
    ticket_list = []
    ticket_json = None
    magic_word_int = None
    order = None
    Quantity_tickets = None
    ticket_objects = []
    sector_ticket = None
    occurrence_ticket = None
    try:
        magic_word = request.META.get("HTTP_WORD_FILTER")
        order = request.META.get("HTTP_ORDER_BY")
        Quantity_tickets = int(request.META.get("HTTP_QUANTITY_TICKETS"))
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
                        ).order_by("-id")[:Quantity_tickets]

                    else:
                        ticket_data = SupportTicket.objects.filter(
                            respective_area="TI",
                            id=magic_word_int,
                            sector=sector_ticket,
                            occurrence=occurrence_ticket,
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
                            Q(occurrence__icontains=occurrence_ticket)
                            | Q(ticketRequester=magic_word)
                            | Q(problemn__icontains=magic_word)
                            | Q(observation__icontains=magic_word)
                            | Q(respective_area__icontains=magic_word)
                            | Q(responsible_technician__icontains=magic_word),
                        ).order_by("-id")[:Quantity_tickets]

                    else:
                        ticket_data = SupportTicket.objects.filter(
                            Q(ticketRequester=magic_word)
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
                        ).order_by("-id")[:Quantity_tickets]

                    else:
                        ticket_data = SupportTicket.objects.filter(
                            respective_area="TI",
                            id=magic_word_int,
                            sector=sector_ticket,
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
                            Q(occurrence__icontains=magic_word)
                            | Q(ticketRequester=magic_word)
                            | Q(problemn__icontains=magic_word)
                            | Q(observation__icontains=magic_word)
                            | Q(respective_area__icontains=magic_word)
                            | Q(responsible_technician__icontains=magic_word),
                        ).order_by("-id")[:Quantity_tickets]

                    else:
                        ticket_data = SupportTicket.objects.filter(
                            Q(ticketRequester=magic_word)
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
                    ).order_by("-id")[:Quantity_tickets]

                else:
                    ticket_data = SupportTicket.objects.filter(
                        respective_area="TI",
                        id=magic_word_int,
                        sector=sector_ticket,
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
                        Q(occurrence__icontains=magic_word)
                        | Q(ticketRequester=magic_word)
                        | Q(problemn__icontains=magic_word)
                        | Q(observation__icontains=magic_word)
                        | Q(respective_area__icontains=magic_word)
                        | Q(responsible_technician__icontains=magic_word),
                    ).order_by("-id")[:Quantity_tickets]

                else:
                    ticket_data = SupportTicket.objects.filter(
                        Q(ticketRequester=magic_word)
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
@never_cache
@require_http_methods(["GET"])
def moreTicket(request):
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
            if order == "-id":
                ticket_data = SupportTicket.objects.filter(
                    respective_area="TI"
                ).order_by("-id")[:count]

            else:
                ticket_data = SupportTicket.objects.filter(respective_area="TI")[:count]

        else:
            ticket_data = SupportTicket.objects.get[:count]

        for ticket in ticket_data:
            ticket_json = serialize("json", [ticket])
            ticket_list.append(ticket_json)

    except Exception as e:
        print(e)

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


@never_cache
@require_http_methods(["GET"])
@login_required(login_url="/login")
def getDashBoardBar(request):
    histogram_data = None
    tickets_data = None
    today = None
    ticket_get_date = None
    ticket_day = None
    day = None
    try:
        tickets_data = SupportTicket.objects.all()
        values = [0, 0, 0, 0, 0, 0, 0]

        for tickets in tickets_data:
            tickets_area = tickets.respective_area

            today = date.today()

            ticket_get_date = tickets.start_date

            ticket_day = ticket_get_date.date()

            if tickets_area == "TI":
                if ticket_day.strftime("%U%Y") == today.strftime("%U%Y"):
                    try:
                        weekeds = [
                            "Segunda-feira",
                            "Terça-feira",
                            "Quarta-feira",
                            "Quinta-feira",
                            "Sexta-feira",
                            "Sábado",
                            "Domingo",
                        ]
                        day = ticket_day.weekday()

                        values[day] += 1

                        histogram_data = {"days": weekeds, "values": values}

                    except Exception as e:
                        print(e)

            else:
                return JsonResponse({"data": None}, status=210, safe=True)

        if histogram_data == None:
            return JsonResponse({"data": None}, status=210, safe=True)

        return JsonResponse(histogram_data, status=200, safe=True)

    except Exception as e:
        print(e)


@login_required(login_url="/login")
@never_cache
@require_http_methods(["GET"])
def getDashBoardBarMonth(request):
    tickets_data = None
    current_month = None
    current_year = None
    days_in_month = None
    values = None
    try:
        tickets_data = SupportTicket.objects.all()

        current_month = datetime.now().month

        current_year = datetime.now().year

        days_in_month = calendar.monthrange(current_year, current_month)[1]

        values = [0] * days_in_month

    except Exception as e:
        print(e)

    today = None
    month_days = None
    ticket_get_date = None
    ticket_day = None
    tickets_area = None
    day = None
    histogram_data = None
    try:
        today = date.today()
        month_days = list(range(1, days_in_month + 1))

        for tickets in tickets_data:
            ticket_get_date = tickets.start_date

            ticket_day = ticket_get_date.date()

            tickets_area = tickets.respective_area

            if tickets_area == "TI":
                if ticket_day.strftime("%m%Y") == today.strftime("%m%Y"):
                    try:
                        day = ticket_day.day

                        values[day - 1] += 1

                        histogram_data = {"days": month_days, "values": values}

                    except Exception as e:
                        print(e)

        if histogram_data == None:
            return JsonResponse({"data": None}, status=210, safe=True)

        return JsonResponse(histogram_data, status=200, safe=True)

    except Exception as e:
        print(e)


@login_required(login_url="/login")
@never_cache
@require_http_methods(["GET"])
def getDashBoardBarYear(request):
    tickets_data = None
    values = None
    try:
        tickets_data = SupportTicket.objects.all()

        values = [0] * 12

    except Exception as e:
        print(e)

    today = None
    months = None
    ticket_day = None
    tickets_area = None
    day = None
    histogram_data = None
    try:
        today = date.today()
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

        for tickets in tickets_data:
            ticket_get_date = tickets.start_date

            ticket_day = ticket_get_date.date()

            tickets_area = tickets.respective_area

            if tickets_area == "TI":
                if ticket_day.strftime("%Y") == today.strftime("%Y"):
                    try:
                        day = ticket_day.month

                        values[day - 1] += 1

                        histogram_data = {"days": months, "values": values}

                    except Exception as e:
                        print(e)

        if histogram_data == None:
            return JsonResponse({"data": None}, status=210, safe=True)

        return JsonResponse(histogram_data, status=200, safe=True)

    except Exception as e:
        print(e)


@login_required(login_url="/login")
@never_cache
@require_http_methods(["GET"])
def getDashBoardBarAll(request):
    tickets_data = None
    tickets_year = None
    try:
        tickets_data = SupportTicket.objects.all()

        years = []
        values = []

        for tickets in tickets_data:
            tickets_date = tickets.start_date

            tickets_year = tickets_date.strftime("%Y")

            if tickets_year not in years:
                years.append(tickets_year)

    except Exception as e:
        print(e)

    cont = None
    try:
        cont = len(years)
        values = [0] * cont
        for tickets in tickets_data:
            tickets_date = tickets.start_date

            tickets_year = tickets_date.strftime("%Y")

            if tickets_year in years:
                index = years.index(tickets_year)
                values[index] = values[index] + 1

        if not years or not values:
            return JsonResponse({"data": None}, status=210, safe=True)
        else:
            histogram_data = {"days": years, "values": values}

            return JsonResponse(histogram_data, status=200, safe=True)

    except Exception as e:
        print(e)


@login_required(login_url="/login")
@never_cache
@require_http_methods(["GET"])
def getTicketFilterStatus(request):
    order = None
    Quantity_tickets = None
    Status = None
    ticket_data = None
    try:
        order = request.META.get("HTTP_ORDER_BY")
        Quantity_tickets = int(request.META.get("HTTP_QUANTITY_TICKETS"))
        Status = request.META.get("HTTP_STATUS_REQUEST")

        if order == "-id":
            if Status == "open":
                ticket_data = SupportTicket.objects.filter(open=True).order_by("-id")[
                    :Quantity_tickets
                ]
            elif Status == "close":
                ticket_data = SupportTicket.objects.filter(open=False).order_by("-id")[
                    :Quantity_tickets
                ]
            elif Status == "stop":
                ticket_data = SupportTicket.objects.filter(open=None).order_by("-id")[
                    :Quantity_tickets
                ]
            elif Status == "all":
                ticket_data = SupportTicket.objects.filter().order_by("-id")[
                    :Quantity_tickets
                ]
        else:
            if Status == "open":
                ticket_data = SupportTicket.objects.filter(open=True)[:Quantity_tickets]
            elif Status == "stop":
                ticket_data = SupportTicket.objects.filter(open=None)[:Quantity_tickets]
            elif Status == "close":
                ticket_data = SupportTicket.objects.filter(open=False)[
                    :Quantity_tickets
                ]
            elif Status == "all":
                ticket_data = SupportTicket.objects.filter()[:Quantity_tickets]

    except Exception as e:
        print(e)

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

    return


@login_required(
    login_url="/login"
)  # Decorador que exige que o usuário esteja autenticado. Redireciona para a página de login se não estiver.
@requires_csrf_token  # Decorador que assegura que o token CSRF seja verificado para evitar ataques CSRF.
@never_cache
@require_http_methods(["POST"])
@transaction.atomic
def upload_new_files(
    request, id
):  # Função para realizar upload de novos arquivos, recebendo a requisição e o ID do ticket.

    # Inicializando variáveis que serão utilizadas na função.
    other_files = None  # Variável para armazenar outros arquivos.
    image_bytes = None  # Variável para armazenar bytes de imagem.
    mime = None  # Variável para armazenar informações MIME do arquivo.
    file_type = None  # Variável para armazenar o tipo do arquivo.
    types_str = None  # Variável para armazenar a string dos tipos permitidos.
    types = None  # Variável para armazenar os tipos permitidos como lista.
    valid = None  # Variável para armazenar o estado de validade do arquivo.
    image_str = None  # Variável para armazenar a string codificada da imagem.
    other_image = None  # Variável para armazenar outras imagens.
    ticket = None  # Variavel para vincular o ticker do Chamado.
    date = None  # Variavel para pegar a data.
    hours = None  # varaivel para pegar a hora.
    image = None  # variavel que resgatar as imagens do ticketFile

    try:
        load_dotenv()
        other_files = request.FILES.getlist("files")

        for unit_file in other_files:
            image_bytes = unit_file.read()

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
                image_str = str(unit_file)

                other_image = mimetypes.guess_type(image_str)

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

                ticket_file.file.save(str(unit_file), ContentFile(image_bytes))

        ticket = SupportTicket.objects.get(id=id)

        date = request.POST.get("date")
        hours = request.POST.get("hours")

        ticket.chat += f",[[Date:{date}],[System:{request.user.first_name} {request.user.last_name} Anexou o arquivo {unit_file}],[Hours:{hours}]]"
        ticket.save()
        ticket_file.save()

        image = TicketFile.objects.filter(ticket_id=id)

        for file in image:
            pil_image = None
            img_bytes = None
            image_data = []
            name_file = []
            file_type = None
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
                    file.file.close()

            except UnidentifiedImageError:
                mime = None
                try:
                    file.file.open()
                    image_bytes = file.file.read()

                    mime = Magic()

                    file_type = mime.from_buffer(image_bytes)
                    file_path = str(file.file)
                    file_name = "/".join(file_path.split("/")[2:])

                    if "mail" in file_type.lower():
                        image_data.append("mail")
                        type_detected = "mail"
                    elif "excel" in file_type.lower():
                        image_data.append("excel")
                        type_detected = "excel"
                    elif "zip" in file_type.lower():
                        image_data.append("zip")
                        type_detected = "zip"
                    elif (
                        "utf-8" in file_type.lower() and "text" in file_type.lower()
                    ) or ("ascii" in file_type.lower() and "text" in file_type.lower()):
                        image_data.append("txt")
                        type_detected = "txt"
                    elif (
                        "microsoft" in file_type.lower() and "word" in file_type.lower()
                    ):
                        image_data.append("word")
                        type_detected = "word"
                    elif "pdf" in file_type.lower() and "document" in file_type.lower():
                        image_data.append("pdf")
                        type_detected = "pdf"
                    else:
                        type_detected = None

                    if type_detected:
                        with open(file_path, "rb") as f:
                            content_file.append(b64encode(f.read()).decode("utf-8"))
                        name_file.append(file_name)

                    file.file.close()

                except Exception as e:
                    print(e)
                    return JsonResponse({"error": e}, status=666)
        ticket = SupportTicket.objects.get(id=id)

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
        print(e)


@login_required(login_url="/login")
@never_cache
@require_http_methods(["GET"])
def detailsChat(request, id):
    UserFront = None
    user = None
    groups = None
    group1 = None
    ticket = None
    details = ""
    try:
        UserFront = request.user
        group1 = getenv("DJANGO_GROUP_TECH")
        group2 = getenv("DJANGO_GROUP_LEADER")

        user = User.objects.get(username=UserFront)

        groups = user.groups.all()

        for group in groups:
            if group.name != group1 and group.name != group2:
                return redirect("/helpdesk")

        ticket = SupportTicket.objects.get(id=id)

        details = ticket.details

        return JsonResponse({"details": details}, status=200, safe=True)

    except Exception as e:
        print(e)
    return


@login_required(login_url="/login")
@never_cache
@require_http_methods(["GET"])
def getTicketFilterTech(request):
    tech = None
    ticket_data = None
    try:
        tech = request.META.get("HTTP_TECH_SELECT")
        ticket_data = SupportTicket.objects.filter(responsible_technician=tech)
    except Exception as e:
        return print(e)

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
        return print(e)


@csrf_exempt
def redirect_to_specific_url(request: HttpRequest, *args, **kwargs):
    if request.method == "POST":
        return redirect("/helpdesk")
    if request.method == "GET":
        return redirect("/helpdesk")
