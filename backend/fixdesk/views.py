from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from dotenv import load_dotenv
from django.shortcuts import render
from json import loads, dumps
from os import getenv, environ
from ping3 import ping
from ldap3 import Connection, SAFE_SYNC, ALL_ATTRIBUTES
from threading import Thread
from django.contrib.auth.models import User, Group
from django.contrib.auth import login
from re import search as re_sh
from requests import post
from django.contrib.auth import logout


def CreateOrVerifyUser(user, password, request, helpdesk, name_create_user):
    global Valid

    userAuthentic = None
    Back_User = None
    Back_Tech = None
    # Back_Leader = None
    # Back_ADM = None
    group_user = None
    group_tech = None
    Valid = None
    name = None

    try:
        userAuthentic = User.objects.get(username=user)
        name = str(name_create_user)

    except User.DoesNotExist:
        if "ADM" in name_create_user:
            name = name.replace("ADM", "").strip()
            name = name.split()
        else:
            name = name.split()

        userAuthentic = User.objects.create_user(
            username=user, password=password, first_name=name[0], last_name=name[1]
        )
        userAuthentic.save()

    Back_User = getenv("DJANGO_GROUP_USER")
    Back_Tech = getenv("DJANGO_GROUP_TECH")
    Valid = True

    try:
        group_user = Group.objects.get(name=Back_User)
        group_tech = Group.objects.get(name=Back_Tech)
        if helpdesk == "User":
            userAuthentic.groups.add(group_user)
            group_user.save()
            Valid = True
        elif helpdesk == "Tecnico TI":
            userAuthentic.groups.add(group_tech)
            group_user.save()
            Valid = True
        else:
            userAuthentic.groups.remove(group_user)
            userAuthentic.groups.remove(group_tech)
            group_user.save()
            group_tech.save()
            Valid = False
    except Exception as e:
        json_error = str(e)
        print(json_error)
        return JsonResponse({"status": json_error}, status=400)

    try:
        if not group_user:
            return Valid
        if userAuthentic:
            return login(request, userAuthentic)

    except Exception as e:
        json_error = str(e)
        print(json_error)
        return JsonResponse({"status": json_error}, status=400)


@csrf_exempt
def validation(request):
    if request.method == "GET":
        return render(request, "index.html", {})
    if request.method == "POST":
        load_dotenv()

        body = None
        user = None
        password = None

        try:
            body = loads(request.body)
            user = str(body["user"])
            password = str(body["password"])

        except Exception as e:
            print(e)
            return JsonResponse({"status": e}, status=400)

        dominio = None
        server1 = None
        server2 = None
        server3 = None
        server4 = None
        server5 = None
        server6 = None
        ldap_servers = []

        try:
            dominio = getenv("DOMAIN_NAME_HELPDESK")

            server1 = getenv("SERVER1")
            server2 = getenv("SERVER2")
            server3 = getenv("SERVER3")
            server4 = getenv("SERVER4")
            server5 = getenv("SERVER5")
            server6 = getenv("SERVER6")

            ldap_servers = [server1, server2, server3, server4, server5, server6]

        except Exception as e:
            print(e)
            return JsonResponse({"status": e}, status=400)

        avg_ping = None
        pingFormat = None
        server_pings = {}
        min_ping_server = None

        try:
            for server in ldap_servers:
                try:
                    avg_ping = ping(server, unit="ms")
                    pingFormat = "{:.2f}".format(avg_ping)

                    server_pings.append(server, pingFormat)

                except:
                    server_pings[server] = float("inf")

            min_ping_server = min(server_pings, key=lambda x: x[1])

        except Exception as e:
            print(e)
            json_error = {"error": str(e)}
            return JsonResponse(json_error, status=400)

        server = None
        conn = None
        base_ldap = None
        response = None
        try:
            server = min_ping_server

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
            error_message = str(e)
            print(error_message)
            return JsonResponse({"status": error_message}, status=401)

        extractor = None
        information = None
        task = None
        tech_user = None
        tech_ti = None
        tech_admin = None
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
            tech_admin = getenv("TECH_ADM")
            tech_leader = getenv("TECH_LEADER")

        except Exception as e:
            print(e)
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

            groups = information["memberOf"]

            for item in groups:
                if tech_user in item:
                    if helpdesk == "Tecnico TI":
                        pass
                    else:
                        helpdesk = "User"
                elif tech_ti in item:
                    helpdesk = "Tecnico TI"
            # if tech_admin in information["memberOf"][0]:
            #     helpdesk = "Admin"
            # if tech_leader in information["memberOf"][0]:
            #     helpdesk = "Gestor"
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

            task = Thread(
                target=CreateOrVerifyUser,
                args=(user, password, request, helpdesk, name_create_user),
            )

            task.start()

            task.join()

            if not Valid:
                return JsonResponse({"status": "Error"}, status=425)

        except Exception as e:
            print(e)
            return JsonResponse({"status": e}, status=400)

        client = None
        data_json = None

        try:
            client = UserHelpDesk(
                name, department, job_title, mail, company, helpdesk, pid
            )

            data_json = dumps(client.__dict__)

            environ["REACT_DATA"] = data_json

            return JsonResponse({"status": "valid"}, status=200)

        except Exception as e:
            error_message = str(e)
            print(error_message)
            return JsonResponse({"status": error_message}, status=400)
