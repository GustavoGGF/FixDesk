from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token
from os import getenv
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from helpdesk.models import SupportTicket


# Create your views here.
@csrf_exempt
@login_required(login_url="/login")
def dashboard_TI(request):
    if request.method == "POST":
        return JsonResponse({"status": "ok"}, status=200, safe=True)
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
