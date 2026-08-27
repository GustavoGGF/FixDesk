from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from dotenv import load_dotenv
from os import getenv
from ldap3 import SUBTREE, Connection, SAFE_SYNC
from django.contrib.auth.models import User, Group
from django.contrib.auth import login
from django.views.decorators.http import require_POST
from django.views.decorators.cache import never_cache
from django.db import transaction
from logging import basicConfig, INFO, getLogger
from django.core.handlers.wsgi import WSGIRequest
from django.shortcuts import redirect
from rest_framework.exceptions import ParseError
from rest_framework.request import Request
from classes.exceptions.auth_exeption import AuthenticationError, LDAPServerError
from classes.exceptions.create_class_exeption import CreateClassError
from classes.users.helpdesk import UserHelpDesk
from typing import Any
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from .serializers import UserLoginRequestSerializer, UserLoginResponseSerializer, LoginErrorResponseSerializer

load_dotenv()
dominio = getenv("DOMAIN_NAME_HELPDESK")
server = getenv("SERVER1", "")
tech_user = getenv("TECH_USER", "CN=CH - User")
tech_ti = getenv("TECH_TECH_TI", "CN=CH - Technician_TI")
tech_fiscal = getenv("TECH_TECH_FISCAL", "CN=CH - Technician_Fiscal")
tech_leader = getenv("TECH_LEADER", "CN=CH - Leader_TI")

django_group_user = getenv("DJANGO_GROUP_USER", "Helpdesk_User")
django_group_tech = getenv("DJANGO_GROUP_TECH", "Helpdesk_Technician_TI")
django_group_tech_fiscal = getenv("DJANGO_GROUP_TECH_FISCAL", "Helpdesk_Technician_Fiscal")
django_group_leader = getenv("DJANGO_GROUP_LEADER", "Helpdesk_Leader_TI")

basicConfig(level=INFO)
logger = getLogger(__name__)


def sync_user_managed_groups(user: User, roles: list[str]) -> None:
    """
    Sincroniza os grupos gerenciados do usuário com base nos papéis retornados do AD.
    Remove grupos gerenciados que o usuário não deve mais ter e adiciona os necessários.
    """
    group_map: dict[str, list[str]] = {
        "User": [django_group_user],
        "Tecnico TI": [django_group_tech],
        "Tecnico Fiscal": [django_group_tech_fiscal],
        "Gestor": [django_group_leader, django_group_tech],
    }

    managed_groups: list[str] = [
        django_group_user,
        django_group_tech,
        django_group_tech_fiscal,
        django_group_leader,
    ]

    desired_group_names: set[str] = set()
    for r in roles:
        if r in group_map:
            desired_group_names.update(group_map[r])

    groups_to_add: list[Group] = []
    groups_to_remove: list[Group] = []
    
    for g_name in managed_groups:
        group_obj, _ = Group.objects.get_or_create(name=g_name)
        if g_name in desired_group_names:
            groups_to_add.append(group_obj)
        else:
            groups_to_remove.append(group_obj)
            
    if groups_to_remove:
        user.groups.remove(*groups_to_remove)
    if groups_to_add:
        user.groups.add(*groups_to_add)


@transaction.atomic
def create_or_verify_user(
    user: str,
    password: str,
    request: Any,
    helpdesk: str | list[str],
    name_create_user: str,
    roles: list[str] | None = None,
) -> tuple[bool, str]:
    """
    Cria um usuário Django caso não exista ou verifica sua existência, ajustando seus grupos conforme necessário.

    Fluxo:
    1. Verifica se o usuário já existe no banco de dados.
    2. Se não existir, cria um novo usuário com os dados fornecidos.
    3. Sincroniza todos os grupos do usuário de forma idempotente, removendo grupos obsoletos e adicionando os corretos.
    4. Realiza login do usuário e retorna sucesso.

    :param user: Nome de usuário.
    :param password: Senha do usuário.
    :param request: Objeto da requisição HTTP para autenticação do usuário.
    :param helpdesk: Cargo principal do usuário ou lista de cargos.
    :param name_create_user: Nome completo do usuário, utilizado para separar primeiro e último nome.
    :param roles: Lista opcional de papéis/funções do usuário.
    :return: Tupla (bool, str), onde o booleano indica sucesso e a string contém mensagem de erro vazia em caso de sucesso.
    """
    try:
        user_auth = User.objects.get(username=user)
    except User.DoesNotExist:
        first_name, last_name = (name_create_user.split() + [""])[:2]
        user_auth = User.objects.create_user(
            username=user, password=password, first_name=first_name, last_name=last_name
        )

    target_roles: list[str] = []
    if roles:
        target_roles.extend(roles)
    elif isinstance(helpdesk, list):
        target_roles.extend(helpdesk)
    elif isinstance(helpdesk, str) and helpdesk:
        target_roles.append(helpdesk)

    try:
        sync_user_managed_groups(user_auth, target_roles)

        http_request = request._request if hasattr(request, "_request") else request
        if not hasattr(http_request, "session") or getattr(http_request, "session", None) is None:
            from django.contrib.sessions.backends.db import SessionStore
            http_request.session = SessionStore()

        login(http_request, user_auth)
        return True, ""
    except Exception as e:
        raise CreateClassError(f"Erro ao atualizar grupos do usuário: {e}")


@extend_schema(
    summary="Validação e Login de Usuário",
    description="Valida as credenciais do usuário via autenticação LDAP e retorna seus dados, realizando o login no Django.",
    request=UserLoginRequestSerializer,
    responses={
        200: UserLoginResponseSerializer,
        400: LoginErrorResponseSerializer,
        401: LoginErrorResponseSerializer
    },
    tags=['Autenticação']
)
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
@never_cache
@transaction.atomic
def validation(request: Request):
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
        payload = request.data
    except ParseError:
        logger.error("Erro ao extrair dados da requisição: payload inválido")
        return JsonResponse(
            {"status": "Erro ao extrair dados da requisição: payload inválido"},
            status=400,
            safe=True,
        )

    serializer = UserLoginRequestSerializer(data=payload)
    if not serializer.is_valid():
        logger.error("Erro ao extrair dados da requisição: payload inválido")
        return JsonResponse(
            {"status": "Erro ao extrair dados da requisição: payload inválido"},
            status=400,
            safe=True,
        )

    credentials = serializer.validated_data
    if not isinstance(credentials, dict):
        logger.error("Erro ao extrair dados da requisição: payload inválido")
        return JsonResponse(
            {"status": "Erro ao extrair dados da requisição: payload inválido"},
            status=400,
            safe=True,
        )

    user = str(credentials.get("user", ""))
    password = str(credentials.get("password", ""))

    try:
        ldap_data = connect_ldap_with_failover(
            user,
            password,
            primary_server=server,
            failover_servers=get_ldap_failover_servers(),
        )

    except AuthenticationError as e:
        logger.warning("Autenticação LDAP não concluída: %s", e)
        return JsonResponse({"status": "invalid access"}, status=401, safe=True)

    # Extração dos dados do usuário autenticado no LDAP
    try:
        extractor: dict[str, Any] | None = None
        if ldap_data is not None and isinstance(ldap_data, (list, tuple)) and len(ldap_data) > 2:
            sub = ldap_data[2]
            if isinstance(sub, (list, tuple)) and len(sub) > 0:
                extractor = sub[0]
    except (IndexError, TypeError) as e:
        # Se um dia o LDAP mudar a estrutura e o [2][0] não existir mais,
        # captura o erro aqui em vez de quebrar a View inteira.
        raise ValueError(f"Estrutura inesperada do LDAP: {e}")

    try:
        data_class: UserHelpDesk | None = None
        name_create_user: str | None = None
        if extractor is not None:
            # Criação da instância do usuário com os dados extraídos do LDAP
            data_class, name_create_user = create_class_user(extractor)

    except CreateClassError as e:
        # Retorna erro caso haja falha na criação da classe de usuário
        return JsonResponse({"Erro ao criar a classe": str(e)}, status=400, safe=True)

    helpdesk = None
    if data_class is None:
        logger.error(
            "Dados do usuário não encontrados no LDAP, não é possível criar a classe."
        )
        return JsonResponse(
            {
                "Error": "Dados do usuário não encontrados no LDAP, não é possível criar a classe."
            },
            status=400,
            safe=True,
        )
    helpdesk = data_class.helpdesk
    user_roles = data_class.roles

    try:
        if not helpdesk or not name_create_user:
            logger.error(
                "Cargo do usuário não identificado, não é possível determinar os grupos de acesso."
            )
            return JsonResponse(
                {
                    "Error": "Cargo do usuário não identificado, não é possível determinar os grupos de acesso."
                },
                status=400,
                safe=True,
            )

        create_or_verify_user(
            user, password, request, helpdesk, name_create_user, roles=user_roles
        )
    except CreateClassError as e:
        return JsonResponse(
            {"Erro ao criar ou verificar o usuario": str(e)}, status=400, safe=True
        )

    user_auth = User.objects.get(username=user)
    assigned_groups: list[str] = list(user_auth.groups.values_list("name", flat=True))

    client_data = {
        "name": data_class.name,
        "departament": data_class.department,
        "job_title": data_class.job_title,
        "mail": data_class.mail,
        "company": data_class.company,
        "helpdesk": data_class.helpdesk,
        "roles": user_roles,
        "groups": assigned_groups,
    }

    return JsonResponse({"data": client_data}, status=200, safe=True)


def get_ldap_failover_servers() -> list[str]:
    configured_servers = getenv("LDAP_FAILOVER_SERVERS", "SERVER2")
    server_names = [name.strip() for name in configured_servers.split(",")]
    return [
        configured_server
        for server_name in server_names
        if server_name
        and (configured_server := getenv(server_name, "").strip())
    ]


def _ldap_operation_succeeded(result: object) -> bool:
    if isinstance(result, tuple) and result:
        return bool(result[0])
    return bool(result)


def connect_ldap(
    server_host: str,
    user: str,
    password: str,
) -> tuple[bool, str, list[dict[str, Any]]]:
    """
    Estabelece uma conexão segura com um servidor LDAP e retorna os dados do usuário.

    Fluxo:
    1. Cria uma conexão LDAP com as credenciais fornecidas.
    2. Define a base de pesquisa do LDAP a partir das variáveis de ambiente.
    3. Executa uma busca pelo usuário usando o atributo `sAMAccountName`.
    4. Retorna a resposta com todos os atributos encontrados.
    5. Caso ocorra um erro, retorna 401 (acesso inválido).
    6. Finaliza a conexão LDAP corretamente.

    :param user: Nome de usuário para autenticação no LDAP.
    :param password: Senha do usuário para autenticação no LDAP.
    :return: Resposta da busca LDAP se bem-sucedida, ou 401 em caso de erro.
    """
    conn: Connection | None = None
    try:
        conn = Connection(
            server_host,
            f"{dominio}\\{user}",
            password,
            auto_bind=False,
            client_strategy=SAFE_SYNC,
        )

        base_ldap = getenv("LDAP_BASE")

        bind_result = getattr(conn, "bind")()
        if not _ldap_operation_succeeded(bind_result):
            result = getattr(conn, "result", {})
            description = result.get("description") if isinstance(result, dict) else None
            reason = (
                "credenciais inválidas"
                if description == "invalidCredentials"
                else "bind rejeitado"
            )
            raise LDAPServerError(reason)

        conn.read_only = True
        search_result = getattr(conn, "search")(
            base_ldap,
            f"(sAMAccountName={user})",
            attributes=[
                "mail",
                "memberOf",
                "displayName",
                "department",
                "title",
                "company",
                "givenName",
                "sn",
            ],
            search_scope=SUBTREE,
            types_only=False,
        )
        if not _ldap_operation_succeeded(search_result):
            raise LDAPServerError("busca LDAP rejeitada")
        return search_result

    except LDAPServerError:
        raise
    except Exception as e:
        raise LDAPServerError(f"falha de comunicação: {type(e).__name__}") from e

    finally:
        if conn is not None:
            try:
                getattr(conn, "unbind")()
            except Exception as e:
                logger.warning(
                    "Falha ao fechar conexão LDAP com o servidor %s: %s",
                    server_host,
                    type(e).__name__,
                )


def connect_ldap_with_failover(
    user: str,
    password: str,
    primary_server: str,
    failover_servers: list[str],
) -> tuple[bool, str, list[dict[str, Any]]]:
    servers = [primary_server, *failover_servers]
    attempted_servers: set[str] = set()

    for server_host in servers:
        if not server_host or server_host in attempted_servers:
            continue
        attempted_servers.add(server_host)
        try:
            return connect_ldap(server_host, user, password)
        except LDAPServerError as e:
            logger.error(
                "Falha no servidor LDAP %s: tipo=%s detalhe=%s",
                server_host,
                type(e).__name__,
                str(e),
            )

    raise AuthenticationError("nenhum servidor LDAP pôde autenticar o usuário")


def create_class_user(extractor: dict[str, Any]) -> tuple[UserHelpDesk, str]:
    """
    Cria uma instância de usuário a partir dos dados extraídos do LDAP.

    Fluxo:
    1. Obtém os atributos do usuário do dicionário `extractor`.
    2. Extrai e formata o nome completo do usuário.
    3. Define uma classe `UserHelpDesk` para armazenar os dados processados.
    4. Preenche os atributos da classe com os dados do usuário.
    5. Determina todos os papéis/grupos do usuário com base nos grupos LDAP.
    6. Retorna a instância do usuário junto com o nome formatado.

    :param extractor: Dicionário contendo os atributos do usuário extraídos do LDAP.
    :return: Uma tupla (UserHelpDesk, str) com a instância do usuário e o nome formatado.
    """
    try:
        information = extractor.get("attributes", {})
        name_create_user_fn = information.get("givenName", "")
        name_create_user_ln = information.get("sn", "")
        name_create_user = f"{name_create_user_fn} {name_create_user_ln}".strip()

        name = information.get("displayName", "")
        department = information.get("department", "")
        job_title = information.get("title", "")
        mail = information.get("mail", "")
        company = information.get("company", "")

        roles: list[str] = []
        groups = information.get("memberOf", [])
        if isinstance(groups, str):
            groups = [groups]

        for item in groups:
            if not isinstance(item, str):
                continue
            if (tech_leader and tech_leader in item) or "CN=CH - Leader" in item:
                if "Gestor" not in roles:
                    roles.append("Gestor")
            if tech_ti and tech_ti in item:
                if "Tecnico TI" not in roles:
                    roles.append("Tecnico TI")
            if tech_fiscal and tech_fiscal in item:
                if "Tecnico Fiscal" not in roles:
                    roles.append("Tecnico Fiscal")
            if tech_user and tech_user in item:
                if "User" not in roles:
                    roles.append("User")

        primary_helpdesk = ""
        if "Gestor" in roles:
            primary_helpdesk = "Gestor"
        elif "Tecnico TI" in roles:
            primary_helpdesk = "Tecnico TI"
        elif "Tecnico Fiscal" in roles:
            primary_helpdesk = "Tecnico Fiscal"
        elif "User" in roles:
            primary_helpdesk = "User"

        client = UserHelpDesk(
            name, department, job_title, mail, company, primary_helpdesk, roles=roles
        )

        return (
            client,
            name_create_user,
        )

    except Exception as e:
        logger.error(f"Erro ao criar classe de usuário: {e}")
        raise CreateClassError(f"Erro ao criar classe de usuário: {e}")


def csrf_failure(request: WSGIRequest, reason: str = ""):
    return redirect("/login")
