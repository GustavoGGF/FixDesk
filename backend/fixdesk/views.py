from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from dotenv import load_dotenv
from json import loads
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

load_dotenv()
dominio = getenv("DOMAIN_NAME_HELPDESK")
server = getenv("SERVER1")
tech_user = getenv("TECH_USER")
tech_ti = getenv("TECH_TECH_TI")

basicConfig(level=INFO)
logger = getLogger(__name__)


@transaction.atomic  # Garante que todas as operações no banco de dados sejam atômicas
def create_or_verify_user(
    user: str, password: str, request: WSGIRequest, helpdesk: str, name_create_user: str
):
    """
    Cria um usuário Django caso não exista ou verifica sua existência, ajustando seus grupos conforme necessário.

    Fluxo:
    1. Verifica se o usuário já existe no banco de dados.
    2. Se não existir, cria um novo usuário com os dados fornecidos.
    3. Define a relação entre cargos e grupos do Django.
    4. Recupera os grupos existentes no banco de dados.
    5. Atualiza os grupos do usuário conforme sua função no helpdesk.
    6. Realiza login do usuário e retorna sucesso.

    :param user: Nome de usuário.
    :param password: Senha do usuário.
    :param request: Objeto da requisição HTTP para autenticação do usuário.
    :param helpdesk: Cargo do usuário, utilizado para definir grupos de acesso.
    :param name_create_user: Nome completo do usuário, utilizado para separar primeiro e último nome.
    :return: Tupla (bool, str|Exception), onde o booleano indica sucesso e o segundo valor contém erro ou mensagem vazia.
    """
    try:
        # Verifica se o usuário já existe no banco de dados
        user_auth = User.objects.get(username=user)
    except User.DoesNotExist:
        # Se o usuário não existir, extrai primeiro e último nome e cria o usuário
        first_name, last_name = (name_create_user.split() + [""])[:2]
        user_auth = User.objects.create_user(
            username=user, password=password, first_name=first_name, last_name=last_name
        )

    # Mapeamento de cargos do helpdesk para os grupos correspondentes no Django
    group_map = {
        "User": ["Helpdesk_User"],
        "Tecnico TI": ["Helpdesk_Technician_TI"],
        "Gestor": ["Helpdesk_Leader_TI", "Helpdesk_Technician_TI"],
    }

    try:
        # Recupera os grupos existentes no banco de dados
        all_groups = {
            group.name: group
            for group in Group.objects.filter(
                name__in=[
                    "Helpdesk_User",
                    "Helpdesk_Technician_TI",
                    "Helpdesk_Leader_TI",  # Corrigido nome duplicado para evitar erro
                ]
            )
        }
    except Exception as e:
        # Retorna erro caso haja falha ao recuperar os grupos do banco de dados
        logger.error(e)
        return False, e

    try:
        # Remove todos os grupos atuais do usuário
        user_auth.groups.clear()

        # Adiciona os grupos correspondentes ao cargo do usuário no helpdesk
        if helpdesk in group_map:
            user_auth.groups.add(
                *(all_groups[g] for g in group_map[helpdesk] if g in all_groups)
            )
            # Realiza login do usuário na requisição
            login(request, user_auth)
            return True, ""
    except Exception as e:
        # Retorna erro caso ocorra falha ao ajustar os grupos
        return False, e


# Importação de decoradores para segurança e controle de cache
@csrf_exempt  # Desativa a proteção CSRF para esta view, permitindo requisições sem token CSRF
@never_cache  # Garante que a resposta não será armazenada em cache
@require_POST  # Restringe a view para aceitar apenas requisições do tipo POST
@transaction.atomic  # Garante que todas as operações no banco de dados dentro da view sejam atômicas
def validation(request: WSGIRequest):
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
        logger.error(e)
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
    data_class, error_class_user, name_create_user = create_class_user(extractor)

    if data_class == 400:
        # Retorna erro caso haja falha na criação da classe de usuário
        return JsonResponse({"status": error_class_user}, status=400, safe=True)

    helpdesk = data_class.helpdesk

    create_user, error = create_or_verify_user(
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
    }

    # Retorna os dados do usuário autenticado em formato JSON
    return JsonResponse({"data": client_data}, status=200, safe=True)


def connect_ldap(user: str, password: str):
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
    conn = None  # Inicializa a variável para evitar erro de referência no finally
    try:
        # Configura a conexão LDAP com autenticação segura
        conn = Connection(
            server,  # Servidor LDAP (deve estar previamente configurado)
            f"{dominio}\\{user}",  # Formato esperado pelo Active Directory
            password,
            auto_bind=True,  # Habilita a conexão automática
            client_strategy=SAFE_SYNC,  # Estratégia segura para sincronização
        )

        base_ldap = getenv(
            "LDAP_BASE"
        )  # Obtém o DN base do LDAP a partir das variáveis de ambiente

        if conn.bind():  # Verifica se a autenticação foi bem-sucedida
            conn.read_only = True  # Garante que a conexão seja somente leitura
            search_filter = f"(sAMAccountName={user})"  # Filtro para buscar o usuário pelo sAMAccountName
            ldap_base_dn = base_ldap  # Define a base de pesquisa

            # Executa a busca no LDAP
            response = conn.search(
                ldap_base_dn,
                search_filter,
                attributes=[
                    "mail",
                    "memberOf",
                    "displayName",
                    "department",
                    "title",
                    "company",
                    "givenName",
                    "sn",
                ],  # Retorna todos os atributos do usuário
                search_scope=SUBTREE,  # Busca recursivamente na árvore LDAP
                types_only=False,  # Retorna os valores completos dos atributos
            )
            return response  # Retorna os dados obtidos na busca

    except Exception as e:
        logger.error(e)  # Log do erro para depuração
        return 401  # Retorna código indicando falha na autenticação

    finally:
        if conn:  # Garante que a conexão seja encerrada corretamente
            conn.unbind()


def create_class_user(extractor: dict):
    """
    Cria uma instância de usuário a partir dos dados extraídos do LDAP.

    Fluxo:
    1. Obtém os atributos do usuário do dicionário `extractor`.
    2. Extrai e formata o nome completo do usuário.
    3. Define uma classe `UserHelpDesk` para armazenar os dados processados.
    4. Preenche os atributos da classe com os dados do usuário.
    5. Determina o nível de suporte do usuário com base nos grupos LDAP.
    6. Retorna a instância do usuário junto com um status de sucesso.

    :param extractor: Dicionário contendo os atributos do usuário extraídos do LDAP.
    :return: Uma instância de `UserHelpDesk`, status HTTP (200 ou 400) e o nome formatado do usuário.
    """
    try:
        # Obtém os atributos do usuário, garantindo um dicionário vazio como fallback
        information = extractor.get("attributes", {})

        # Construção do nome completo do usuário a partir de atributos LDAP
        name_create_user_fn = information.get("givenName", "")  # Primeiro nome
        name_create_user_ln = information.get("sn", "")  # Último nome
        name_create_user = (
            f"{name_create_user_fn} {name_create_user_ln}".strip()
        )  # Nome completo

        # Definição da classe para armazenar os dados do usuário
        class UserHelpDesk:
            def __init__(self, name, department, job_title, mail, company, helpdesk):
                self.name = name or ""
                self.department = department or ""
                self.job_title = job_title or ""
                self.mail = mail or ""
                self.company = company or ""
                self.helpdesk = helpdesk or ""

        # Extração dos dados relevantes do LDAP
        name = information.get("displayName", "")
        department = information.get("department", "")
        job_title = information.get("title", "")
        mail = information.get("mail", "")
        company = information.get("company", "")

        # Determinação do nível de suporte do usuário com base nos grupos LDAP
        helpdesk = ""
        groups = information.get("memberOf", [])
        for item in groups:
            if tech_user in item:
                helpdesk = "User"
                break
            elif tech_ti in item:
                helpdesk = "Tecnico TI"
                break

        # Criação da instância do usuário com os dados extraídos
        client = UserHelpDesk(name, department, job_title, mail, company, helpdesk)

        return (
            client,
            200,
            name_create_user,
        )  # Retorna a instância do usuário e o status de sucesso

    except Exception as e:
        logger.error(e)  # Registra o erro no log para depuração
        return 400, e, ""  # Retorna um código de erro e a exceção capturada

def csrf_failure(request, reason=""):
    return redirect('/login') 