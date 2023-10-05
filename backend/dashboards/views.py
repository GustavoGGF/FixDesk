from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token


# Create your views here.
@csrf_exempt
def dashboard_TI(request):
    if request.method == "POST":
        return
    if request.method == "GET":
        return render(request, "index.html", {})
