from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from os import getenv
from json import dumps, loads
from django.middleware.csrf import get_token
from datetime import datetime
import pytz
from .models import SupportTicket
from django.contrib.auth.models import User, Group
from .models import SupportTicket
from django.core.serializers import serialize
from django.contrib.auth import logout


# Create your views here.
@csrf_exempt
@login_required(login_url="/login")
def firstView(request):
    if request.method == "POST":
        data = None
        Data_User = None
        csrf = None
        try:
            data = getenv("REACT_DATA")

            Data_User = loads(data)

            csrf = get_token(request)

            return JsonResponse({"data": Data_User, "token": csrf}, status=200)
        except Exception as e:
            json_error = str(e)
            print(json_error)
            return JsonResponse({"status": json_error}, status=300)
    if request.method == "GET":
        if request.user.is_authenticated:
            Back_User = None
            User = None
            data = None
            try:
                Back_User = getenv("DJANGO_GROUP_USER")
                User = request.user
                if User.groups.filter(name=Back_User):
                    return render(request, "index.html", {})

                else:
                    return redirect("/login")
            except Exception as e:
                json_error = str(e)
                print(json_error)
                return JsonResponse({"status": json_error}, status=300)
        else:
            redirect("/login")
    else:
        redirect("/login")


@requires_csrf_token
@login_required(login_url="/login")
def submitTicket(request):
    if request.method == "POST":
        body = None
        ticketRequester = None
        department = None
        mail = None
        company = None
        sector = None
        respective_area = None
        occurrence = None
        problemn = None
        observation = None
        start_date_str = None
        start_date = None
        pid = None
        try:
            body = loads(request.body)
            ticketRequester = body.get("ticketRequester")
            department = body.get("department")
            mail = body.get("mail")
            company = body.get("company")
            sector = body.get("sector")
            respective_area = body.get("respective_area")
            occurrence = body.get("occurrence")
            problemn = body.get("problemn")
            observation = body.get("observation")
            start_date_str = body.get("start_date")
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").replace(
                tzinfo=pytz.timezone("America/Sao_Paulo")
            )
            pid = body.get("PID")

            if pid:
                pass
            else:
                return JsonResponse({"error": "error"}, status=400, safe=True)

        except Exception as e:
            print(e)
            return

        try:
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
            )

            Ticket.save()
            # * Monta o ticket e salva no banco

            return JsonResponse({"status": "ok"}, status=200, safe=True)
        except Exception as e:
            print(e)
            return
    if request.method == "GET":
        return redirect("/helpdesk")


@csrf_exempt
@login_required(login_url="/login")
def history(request):
    if request.method == "POST":
        csrf = None
        data = None
        Data_User = None
        try:
            csrf = get_token(request)
            data = getenv("REACT_DATA")
            Data_User = loads(data)

            if data is not None:
                pass

        except Exception as e:
            print(e)
            return JsonResponse({"status": "Invalid Credentials"}, status=402)

        ticket_list = []
        ticket_data = None
        ticket_json = None
        try:
            ticket_data = SupportTicket.objects.filter(
                ticketRequester=Data_User["name"]
            )

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
                {"data": Data_User, "token": csrf, "tickets": ticket_objects}
            )

        except Exception as e:
            print(e)

    if request.method == "GET":
        return render(request, "index.html", {})


@login_required(login_url="/login")
@requires_csrf_token
def toDashboard(request):
    if request.method == "POST":
        return
    if request.method == "GET":
        UserFront = None
        user = None
        groups = None
        group1 = None
        try:
            UserFront = request.user
            group1 = getenv("DJANGO_GROUP_USER")

            user = User.objects.get(username=UserFront)

            groups = user.groups.all()

            for group in groups:
                if group.name == group1:
                    return JsonResponse({"status": "Credentials Invalid"}, status=403)

        except Exception as e:
            print(e)


@login_required(login_url="/login")
@requires_csrf_token
def faq(request):
    if request.method == "POST":
        return
    if request.method == "GET":
        return render(request, "index.html", {})


@csrf_exempt
def exit(request):
    if request.method == "POST":
        return
    if request.method == "GET":
        try:
            logout(request)
            return redirect("/")
        except Exception as e:
            print(e)


@login_required(login_url="/login")
@requires_csrf_token
def ticket(request, id):
    if request.method == "POST":
        return
    if request.method == "GET":
        ticket = None
        pid = None
        try:
            ticket = SupportTicket.objects.filter(id=id)

            for t in ticket:
                pid = t.PID

        except Exception as e:
            print(e)

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
                    pidViwer = int(request.META.get("HTTP_PID"))
                    if pid == pidViwer:
                        pass
                    else:
                        return JsonResponse(
                            {"status": "Credentials Invalid"}, status=402
                        )

        except Exception as e:
            print(e)

        serialized_ticket = []
        try:
            for t in ticket:
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
                    }
                )

            return JsonResponse({"data": serialized_ticket}, status=200, safe=True)

        except Exception as e:
            print(e)