from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token
from os import getenv
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from helpdesk.models import SupportTicket
from json import loads
from django.core.serializers import serialize
from django.middleware.csrf import get_token
from django.contrib.auth.models import Group, User
from .models import Equipaments
from datetime import date
from django.db.models import Q


# Create your views here.
@csrf_exempt
@login_required(login_url="/login")
def dashboard_TI(request):
    if request.method == "POST":
        userData = None
        data = None
        csrf = None
        techs = []
        group = None
        group_name = None
        user_in_group = None
        name_first = None
        name_last = None
        name_tech = None

        try:
            data = getenv("REACT_DATA")

            userData = loads(data)

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
                {"userData": userData, "token": csrf, "techs": techs},
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

            user = User.objects.get(username=UserFront)

            groups = user.groups.all()

            for group in groups:
                if group.name != group1:
                    return redirect("/helpdesk")

            return render(request, "index.html", {})
        except Exception as e:
            print(e)


def getDashBoardPie(request, sector):
    if request.method == "POST":
        return JsonResponse({"status": "ok"}, status=200, safe=True)
    if request.method == "GET":
        if sector == "TI":
            boardpie = None
            tickets_data = None
            count = None
            openTicket = None
            opens = None

            try:
                boardpie = [0, 0, 0, 0]
                tickets_data = SupportTicket.objects.filter(respective_area="TI")

                count = 0
                openTicket = 0

                for tickets in tickets_data:
                    count += 1

                    opens = tickets.open

                    if opens:
                        openTicket += 1

                boardpie[0] = count
                boardpie[1] = openTicket

                return JsonResponse({"data": boardpie}, status=200, safe=True)

            except Exception as e:
                print(e)


def get_ticket_TI(request):
    if request.method == "POST":
        return JsonResponse({"status": "ok"}, status=200, safe=True)
    if request.method == "GET":
        ticket_list = []
        ticket_data = None
        ticket_json = None
        try:
            ticket_data = SupportTicket.objects.filter(respective_area="TI")

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


def equipment_inventory(request):
    if request.method == "POST":
        image = None
        company = None
        model = None
        Equipament = None
        try:
            image = request.FILES.get("image")
            company = request.POST.get("company")
            model = request.POST.get("model")

            print(model)

            Equipament = Equipaments(equipament=image, company=company, model=model)

            Equipament.save()

            return JsonResponse({"status": "ok"}, status=200, safe=True)

        except Exception as e:
            print(e)

    if request.method == "GET":
        return JsonResponse({"status": "ok"}, status=200, safe=True)


def getTicketFilter(request):
    if request.method == "GET":
        Quantity_tickets = None
        ticket_data = None
        ticket_list = []
        ticket_json = None
        order = None
        problemnFront = None
        sectorFront = None
        try:
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
                    ticket_data = SupportTicket.objects.filter(
                        respective_area="TI"
                    ).order_by("-id")[:Quantity_tickets]

                else:
                    ticket_data = SupportTicket.objects.filter(respective_area="TI")[
                        :Quantity_tickets
                    ]

            elif "HTTP_SECTOR_TICKET" in request.META and sectorFront == "all":
                if order == "-id":
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

    if request.method == "POST":
        return


def getTicketFilterWords(request):
    if request.method == "GET":
        magic_word = None
        ticket_data = None
        ticket_list = []
        ticket_json = None
        magic_word_int = None
        test_for_date = None
        order = None
        Quantity_tickets = None
        try:
            magic_word = request.META.get("HTTP_WORD_FILTER")
            order = request.META.get("HTTP_ORDER_BY")
            test_for_date = date.fromisoformat(magic_word)
            Quantity_tickets = int(request.META.get("HTTP_QUANTITY_TICKETS"))
        except ValueError:
            test_for_date = None
        try:
            magic_word_int = int(magic_word)

            if order == "-id":
                ticket_data = SupportTicket.objects.filter(
                    respective_area="TI",
                    id=magic_word_int,
                ).order_by("-id")[:Quantity_tickets]
            else:
                ticket_data = SupportTicket.objects.filter(
                    respective_area="TI",
                    id=magic_word_int,
                )[:Quantity_tickets]

            if test_for_date:
                if order == "-id":
                    ticket_data = SupportTicket.objects.filter().order_by("-id")[
                        :Quantity_tickets
                    ]
                else:
                    ticket_data = SupportTicket.objects.filter()[:Quantity_tickets]

        except ValueError:
            if order == "-id":
                ticket_data = SupportTicket.objects.filter(
                    Q(sector__icontains=magic_word)
                    | Q(ticketRequester=magic_word)
                    | Q(occurrence__icontains=magic_word)
                    | Q(problemn__icontains=magic_word)
                    | Q(observation__icontains=magic_word)
                    | Q(respective_area__icontains=magic_word)
                    | Q(responsible_technician__icontains=magic_word),
                ).order_by("-id")[:Quantity_tickets]

            else:
                ticket_data = SupportTicket.objects.filter(
                    Q(sector__icontains=magic_word)
                    | Q(ticketRequester=magic_word)
                    | Q(occurrence__icontains=magic_word)
                    | Q(problemn__icontains=magic_word)
                    | Q(observation__icontains=magic_word)
                    | Q(respective_area__icontains=magic_word)
                    | Q(responsible_technician__icontains=magic_word),
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


def moreTicket(request):
    if request.method == "POST":
        return
    if request.method == "GET":
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
                    ticket_data = SupportTicket.objects.filter(respective_area="TI")[
                        :count
                    ]

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
