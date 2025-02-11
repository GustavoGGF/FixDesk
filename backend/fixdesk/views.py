import time
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from dotenv import load_dotenv
from django.shortcuts import redirect
from json import loads
from os import getenv
from ldap3 import Connection, SAFE_SYNC, ALL_ATTRIBUTES
from threading import Thread
from django.contrib.auth.models import User, Group
from django.contrib.auth import login
import logging
from django.views.decorators.http import require_POST
from django.views.decorators.cache import never_cache

# Configuração básica de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Função que cria usuario no /admin
def CreateOrVerifyUser(user, password, request, helpdesk, name_create_user):
    global Valid

    userAuthentic = None
    Back_User = None
    Back_Tech = None
    Back_Leader = None
    group_user = None
    group_tech = None
    Valid = None

    try:
        userAuthentic = User.objects.get(username=user)

    except User.DoesNotExist:
        name_create_user = name_create_user.split()

        userAuthentic = User.objects.create_user(
            username=user,
            password=password,
            first_name=name_create_user[0],
            last_name=name_create_user[1],
        )
        userAuthentic.save()

    Back_User = getenv("DJANGO_GROUP_USER")
    Back_Tech = getenv("DJANGO_GROUP_TECH")
    Back_Leader = getenv("DJANGO_GROUP_LEADER")

    try:
        group_user = Group.objects.get(name=Back_User)
        group_tech = Group.objects.get(name=Back_Tech)
        group_leader = Group.objects.get(name=Back_Leader)
        if helpdesk == "User":
            userAuthentic.groups.add(group_user)
            userAuthentic.groups.remove(group_tech)
            userAuthentic.groups.remove(group_leader)
            group_user.save()
            group_tech.save()
            group_leader.save()
            login(request, userAuthentic)
            Valid = True
        elif helpdesk == "Tecnico TI":
            userAuthentic.groups.add(group_tech)
            userAuthentic.groups.remove(group_user)
            userAuthentic.groups.remove(group_leader)
            group_user.save()
            group_tech.save()
            group_leader.save()
            login(request, userAuthentic)
            Valid = True
        elif helpdesk == "Gestor":
            userAuthentic.groups.add(group_leader)
            userAuthentic.groups.remove(group_user)
            userAuthentic.groups.add(group_tech)
            group_user.save()
            group_tech.save()
            group_leader.save()
            login(request, userAuthentic)
            Valid = True
        else:
            userAuthentic.groups.remove(group_user)
            userAuthentic.groups.remove(group_tech)
            userAuthentic.groups.remove(group_leader)
            group_user.save()
            group_tech.save()
            group_leader.save()
            Valid = False
    except Exception as e:
        logger.info("Deu ruim autenticação")
        Valid = False
        logger.info("Validação não validada: ", e)
        return JsonResponse({"status": "error"}, status=400, safe=True)


# Função que acessar o AD
@csrf_exempt
@never_cache
@require_POST
def validation(request):
    load_dotenv()

    body = None
    user = None
    password = None

    try:
        body = loads(request.body)
        user = str(body["user"])
        password = str(body["password"])

    except Exception as e:
        logger.info(e)
        erro = str(e)
        logger.info(erro, flush=True)
        return JsonResponse({"status": e}, status=1, safe=True)

    dominio = None
    server1 = None

    try:
        dominio = getenv("DOMAIN_NAME_HELPDESK")

        server1 = getenv("SERVER1")

    except Exception as e:
        logger.info(e)
        erro = str(e)
        logger.info(erro, flush=True)
        return JsonResponse({"status": e}, status=2)

    server = None
    conn = None
    base_ldap = None
    response = None
    try:
        server = server1

        conn = Connection(
            server,
            f"{dominio}\{user}",
            password,
            auto_bind=True,
            client_strategy=SAFE_SYNC,
        )

        base_ldap = getenv("LDAP_BASE")

        if conn.bind():
            conn.read_only = True
            search_filter = f"(sAMAccountName={user})"
            ldap_base_dn = base_ldap
            response = conn.search(
                ldap_base_dn,
                search_filter,
                attributes=ALL_ATTRIBUTES,
                search_scope="SUBTREE",
                types_only=False,
            )

    except Exception as e:
        logger.info(e)
        return JsonResponse({"status": "invalid access"}, status=401, safe=True)

    extractor = None
    information = None
    task = None
    tech_user = None
    tech_ti = None
    tech_leader = None

    try:
        extractor = response[2][0]
        information = extractor.get("attributes")

        class UserHelpDesk:
            def __init__(
                self,
                name,
                department,
                job_title,
                mail,
                company,
                helpdesk,
                pid,
            ):
                self.name = name if name is not None else ""
                self.department = department if department is not None else ""
                self.job_title = job_title if job_title is not None else ""
                self.mail = mail if mail is not None else ""
                self.company = company if company is not None else ""
                self.helpdesk = helpdesk
                self.pid = pid if pid is not None else ""

        tech_user = getenv("TECH_USER")
        tech_ti = getenv("TECH_TECH_TI")
        tech_leader = getenv("TECH_LEADER")

    except Exception as e:
        logger.info(e)
        return JsonResponse({"status": e}, status=400)

    helpdesk = ""
    name = ""
    department = ""
    job_title = ""
    mail = ""
    company = ""
    pid = ""
    groups = None

    try:
        name_create_user_fn = information["givenName"]
        name_create_user_ln = information["sn"]
        name_create_user = name_create_user_fn + " " + name_create_user_ln

        # groups = information["memberOf"]

        groups = information.get("memberOf", [])
        helpdesk = None

        for item in groups:
            if tech_user in item:
                helpdesk = "User"
                break  # Se encontrou, não precisa continuar procurando
            elif tech_ti in item:
                helpdesk = "Tecnico TI"
                break  # Se encontrou, não precisa continuar procurando
            elif tech_leader in item:
                helpdesk = "Gestor"
                break  # Se encontrou, não precisa continuar procurando
        task = Thread(
            target=CreateOrVerifyUser,
            args=(user, password, request, helpdesk, name_create_user),
        )

        task.start()

        if "displayName" in information:
            name = information["displayName"]
        else:
            name = ""
        if "department" in information:
            department = information["department"]
        else:
            department = ""
        if "title" in information:
            job_title = information["title"]
        else:
            job_title = ""
        if "mail" in information:
            mail = information["mail"]
        else:
            mail = ""
        if "company" in information:
            company = information["company"]
        else:
            company = ""
        if "employeeID" in information:
            pid = information["employeeID"]
        else:
            pid = ""

    except Exception as e:
        logger.info(e)
        return JsonResponse({"status": e}, status=400)

    client = None
    client_data = None

    try:
        client = UserHelpDesk(name, department, job_title, mail, company, helpdesk, pid)

        client_data = {
            "name": client.name,
            "departament": client.department,
            "job_title": client.job_title,
            "mail": client.mail,
            "company": client.company,
            "helpdesk": client.helpdesk,
            "pid": client.pid,
        }

        while not Valid:
            if Valid:
                break
            time.sleep(0.1)
        # return render(request, "index.html")
        return JsonResponse({"data": client_data}, status=200, safe=True)

    except Exception as e:
        logger.info("Não foi")
        error_message = str(e)
        logger.info(error_message)
        return JsonResponse({"status": error_message}, status=400)


def handler404(request, exception):
    return redirect("/login")
