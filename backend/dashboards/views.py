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


# Create your views here.
@csrf_exempt
@login_required(login_url="/login")
def dashboard_TI(request):
    if request.method == "POST":
        userData = None
        data = None
        csrf = None

        try:
            data = getenv("REACT_DATA")

            userData = loads(data)

            csrf = get_token(request)

            return JsonResponse(
                {"userData": userData, "token": csrf}, status=200, safe=True
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
