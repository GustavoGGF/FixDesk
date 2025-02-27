from time import sleep
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from dotenv import load_dotenv
from json import loads
from os import getenv
from ldap3 import Connection, SAFE_SYNC, ALL_ATTRIBUTES
from threading import Thread
from django.contrib.auth.models import User, Group
from django.contrib.auth import login
from django.views.decorators.http import require_POST
from django.views.decorators.cache import never_cache
from django.db import transaction

load_dotenv()
dominio = getenv("DOMAIN_NAME_HELPDESK")
server = getenv("SERVER1")
tech_user = getenv("TECH_USER")
tech_ti = getenv("TECH_TECH_TI")
tech_leader = getenv("TECH_LEADER")
name_create_user = None


@transaction.atomic
def CreateOrVerifyUser(user, password, request, helpdesk, name_create_user):
    """Cria ou verifica um usuário e ajusta seus grupos de acordo com a função."""

    # Obtém ou cria o usuário
    try:
        user_auth = User.objects.get(username=user)
    except User.DoesNotExist:
        first_name, last_name = (name_create_user.split() + [""])[
            :2
        ]  # Evita erro se houver apenas um nome
        user_auth = User.objects.create_user(
            username=user, password=password, first_name=first_name, last_name=last_name
        )

    # Dicionário de papéis e seus grupos
    group_map = {
        "User": ["Helpdesk_User"],
        "Tecnico TI": ["Helpdesk_Technician_TI"],
        "Gestor": ["Helpdesk_Leader_TI", "Helpdesk_Technician_TI"],
    }

    # Obtém grupos existentes no banco de dados
    try:
        all_groups = {
            group.name: group
            for group in Group.objects.filter(
                name__in=[
                    "Helpdesk_User",
                    "Helpdesk_Technician_TI",
                    "Helpdesk_Technician_TI",
                ]
            )
        }
    except Exception as e:
        print(e)
        return False, e  # Retorna erro silencioso caso haja problema nos grupos

    try:
        # Ajusta os grupos do usuário
        user_auth.groups.clear()  # Remove de todos os grupos antes de adicionar novos
        if helpdesk in group_map:
            user_auth.groups.add(
                *(all_groups[g] for g in group_map[helpdesk] if g in all_groups)
            )
            login(request, user_auth)  # Autentica o usuário
            return True, ""
    except Exception as e:
        return False, e


# Importação de decoradores para segurança e controle de cache
@csrf_exempt  # Desativa a proteção CSRF para esta view, permitindo requisições sem token CSRF
@never_cache  # Garante que a resposta não será armazenada em cache
@require_POST  # Restringe a view para aceitar apenas requisições do tipo POST
@transaction.atomic  # Garante que todas as operações no banco de dados dentro da view sejam atômicas
def validation(request):
    """
    Função para validar as credenciais do usuário via autenticação LDAP e retornar seus dados.

    Fluxo:
    1. Obtém e valida os dados da requisição (usuário e senha).
    2. Conecta ao LDAP para autenticação.
    3. Se autenticado, extrai as informações do usuário e instancia a classe correspondente.
    4. Retorna os dados do usuário em formato JSON para o frontend.

    :param request: Objeto da requisição HTTP contendo as credenciais do usuário.
    :return: JsonResponse com status e dados do usuário autenticado ou erro correspondente.
    """
    try:
        # Decodifica o corpo da requisição e extrai usuário e senha
        body = loads(request.body)
        user = str(body["user"])
        password = str(body["password"])
    except Exception as e:
        # Retorna erro caso ocorra falha na extração dos dados da requisição
        print(e)
        erro = str(e)
        return JsonResponse({"status": erro}, status=400, safe=True)

    # Chama a função de conexão com o LDAP para validar o usuário
    response = connect_ldap(user, password)

    if response == 401:
        # Retorna erro caso o acesso ao LDAP seja negado
        return JsonResponse({"status": "invalid access"}, status=401, safe=True)

    # Extração dos dados do usuário autenticado no LDAP
    extractor = response[2][0]

    # Criação da instância do usuário com os dados extraídos do LDAP
    data_class, error_class_user = create_class_user(extractor)

    if data_class == 400:
        # Retorna erro caso haja falha na criação da classe de usuário
        return JsonResponse({"status": error_class_user}, status=400, safe=True)

    helpdesk = data_class.helpdesk

    create_user, error = CreateOrVerifyUser(
        user, password, request, helpdesk, name_create_user
    )

    if create_user:
        pass
    else:
        return JsonResponse({"Error": error}, status=400, safe=True)

    # Montagem do dicionário com os dados relevantes do usuário para envio ao frontend
    client_data = {
        "name": data_class.name,
        "departament": data_class.department,
        "job_title": data_class.job_title,
        "mail": data_class.mail,
        "company": data_class.company,
        "helpdesk": data_class.helpdesk,
        "pid": data_class.pid,
    }

    # Retorna os dados do usuário autenticado em formato JSON
    return JsonResponse({"data": client_data}, status=200, safe=True)


def connect_ldap(user, password):
    try:
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

        return response

    except Exception as e:
        print(e)
        return 401


def create_class_user(extractor):
    try:
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

    except Exception as e:
        print(e)
        return 400, e

    helpdesk = ""
    name = ""
    department = ""
    job_title = ""
    mail = ""
    company = ""
    pid = ""
    groups = None
    client = None

    try:
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
        print(e)
        return 400, e

    client = UserHelpDesk(name, department, job_title, mail, company, helpdesk, pid)
    try:
        return client, 200

    except Exception as e:
        error_message = str(e)
        print(e)
        return 400, error_message
