from pathlib import Path
from os import path

# Define o diretório base do projeto.
# BASE_DIR aponta para o diretório pai do arquivo atual (settings.py),
# permitindo caminhos relativos confiáveis para outros arquivos do projeto.
BASE_DIR = Path(__file__).resolve().parent.parent

# Chave secreta usada para fornecer assinatura criptográfica no Django.
SECRET_KEY = "django-insecure-4h1mm_oolu%b$@g=eragw%v*=dp5qbvv8dkzd2rf+!#tz-(&wt"

# Habilita o modo de depuração (debug).
# AVISO DE SEGURANÇA: Desative (DEBUG = False) em produção para evitar
# a exposição de informações sensíveis e erros detalhados.
DEBUG = True

# Configura a política de segurança para o cabeçalho X-Frame-Options.
# "SAMEORIGIN" permite que o conteúdo seja exibido em frames apenas no mesmo domínio,
# prevenindo ataques de clickjacking.
X_FRAME_OPTIONS = "SAMEORIGIN"


# Habilita o cabeçalho X-Content-Type-Options: nosniff.
# Impede que navegadores tentem adivinhar o tipo MIME de um recurso,
# reduzindo riscos de execução de scripts maliciosos.
SECURE_CONTENT_TYPE_NOSNIFF = True

# Lista de hosts/domínios permitidos para servir a aplicação.
# Em produção, especifique apenas os domínios válidos para evitar
# ataques de Host Header Injection.
ALLOWED_HOSTS = ["localhost", "sappp01.lupatech.com.br", "sappp01", "10.1.1.73"]

# Lista de origens confiáveis para proteção CSRF (Cross-Site Request Forgery).
# Define quais domínios podem enviar requisições POST seguras para a aplicação.
CSRF_TRUSTED_ORIGINS = [
    "https://sappp01.lupatech.com.br",
]

# Lista de aplicativos instalados no projeto Django.
# Inclui aplicativos padrão do Django (como admin, autenticação, sessões, etc.)
# e aplicativos personalizados do projeto (fixdesk, helpdesk, dashboards).
INSTALLED_APPS = [
    "django.contrib.admin",  # Interface de administração do Django.
    "django.contrib.auth",  # Sistema de autenticação de usuários.
    "django.contrib.contenttypes",  # Framework para tipos de conteúdo.
    "django.contrib.sessions",  # Gerenciamento de sessões.
    "django.contrib.messages",  # Framework de mensagens para usuários.
    "django.contrib.staticfiles",  # Gerenciamento de arquivos estáticos (CSS, JS, etc.).
    "fixdesk",  # Aplicativo personalizado do projeto.
    "helpdesk",  # Aplicativo personalizado do projeto.
    "dashboards",  # Aplicativo personalizado do projeto.
]

# Lista de middlewares aplicados globalmente no projeto.
# Middlewares são camadas que processam requisições e respostas.
# A ordem é importante, pois define a sequência de execução.
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",  # Adiciona medidas de segurança básicas.
    "django.contrib.sessions.middleware.SessionMiddleware",  # Gerencia sessões de usuários.
    "django.middleware.common.CommonMiddleware",  # Processa requisições comuns (ex: normalização de URL).
    "django.middleware.csrf.CsrfViewMiddleware",  # Proteção contra ataques CSRF (Cross-Site Request Forgery).
    "django.contrib.auth.middleware.AuthenticationMiddleware",  # Autenticação de usuários.
    "django.contrib.messages.middleware.MessageMiddleware",  # Gerencia mensagens para usuários.
    "django.middleware.clickjacking.XFrameOptionsMiddleware",  # Proteção contra clickjacking.
]

# Define o módulo de configuração de URLs principal do projeto.
# Este arquivo contém as rotas (URL patterns) que mapeiam requisições para views.
ROOT_URLCONF = "fixdesk.urls"

# Configurações dos templates (modelos de renderização de HTML).
# Define como o Django deve carregar e processar templates.
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",  # Usa o sistema de templates do Django.
        "DIRS": [BASE_DIR / "build"],  # Diretórios adicionais para procurar templates.
        "APP_DIRS": True,  # Habilita a busca de templates dentro de diretórios de aplicativos.
        "OPTIONS": {
            "context_processors": [
                # Processadores de contexto que adicionam variáveis globais aos templates.
                "django.template.context_processors.debug",  # Adiciona informações de debug.
                "django.template.context_processors.request",  # Adiciona o objeto 'request'.
                "django.contrib.auth.context_processors.auth",  # Adiciona informações de autenticação.
                "django.contrib.messages.context_processors.messages",  # Adiciona mensagens para o usuário.
            ],
        },
    },
]

# Define a aplicação WSGI (Web Server Gateway Interface) para o projeto.
# WSGI é a interface entre o servidor web e o Django.
WSGI_APPLICATION = "fixdesk.wsgi.application"

# Configurações do banco de dados do projeto.
# Define o banco de dados padrão como SQLite3, com o arquivo de banco de dados localizado
# no diretório base do projeto (BASE_DIR) com o nome 'db.sqlite3'.
# SQLite é ideal para desenvolvimento, mas em produção, considere usar PostgreSQL, MySQL ou outro SGBD robusto.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",  # Usa o backend do SQLite3.
        "NAME": BASE_DIR / "db.sqlite3",  # Caminho para o arquivo do banco de dados.
    }
}

# Validadores de senha para garantir a segurança das senhas dos usuários.
# Cada validador verifica uma condição específica para aumentar a robustez das senhas.
AUTH_PASSWORD_VALIDATORS = [
    {
        # Verifica se a senha é muito similar a atributos do usuário (ex: nome, email).
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        # Define um comprimento mínimo para a senha (o padrão é 8 caracteres).
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        # Verifica se a senha está entre as senhas mais comuns (evita senhas fracas).
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        # Verifica se a senha não é composta apenas por números.
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Define o código de idioma padrão do projeto.
# "pt-br" configura o Django para usar português brasileiro como idioma padrão.
LANGUAGE_CODE = "pt-br"

# Define o fuso horário padrão do projeto.
# "Brazil/East" refere-se ao fuso horário do Brasil (Horário de Brasília, UTC-3).
TIME_ZONE = "Brazil/East"

# Habilita a internacionalização (i18n) do projeto.
# Permite a tradução do projeto para múltiplos idiomas.
USE_I18N = True

# Habilita o suporte a fusos horários (timezone awareness).
# Armazena datas e horas no banco de dados em UTC e converte para o fuso horário definido em TIME_ZONE.
USE_TZ = True

# URL base para servir arquivos estáticos (CSS, JavaScript, imagens, etc.).
# Durante o desenvolvimento, o Django usa essa URL para servir arquivos estáticos diretamente.
# Em produção, configure o servidor web (ex: Nginx, Apache) para servir arquivos estáticos.
STATIC_URL = "/static/"

# Lista de diretórios adicionais onde o Django deve procurar por arquivos estáticos.
# Esses diretórios são usados durante o desenvolvimento e coletados no `STATIC_ROOT` durante o deploy.
# Aqui, o diretório "build/static" é incluído, o que sugere o uso de uma ferramenta de build (ex: Webpack).
STATICFILES_DIRS = (path.join(BASE_DIR, "build/static"),)

# Diretório onde os arquivos estáticos serão coletados durante o comando `collectstatic`.
# Esse diretório é usado em produção para servir todos os arquivos estáticos de um único local.
# Certifique-se de que o servidor web tenha permissão para acessar esse diretório.
STATIC_ROOT = path.join(BASE_DIR, "static")

# Define o tipo de campo automático padrão para modelos (models) que não especificam um campo primário.
# "django.db.models.BigAutoField" é um campo de auto-incremento de 64 bits, adequado para projetos
# que podem exigir um grande número de registros.
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Habilita a flag "Secure" no cookie CSRF (Cross-Site Request Forgery).
# Isso garante que o cookie CSRF só seja enviado em conexões HTTPS, aumentando a segurança.
CSRF_COOKIE_SECURE = True

# Habilita a flag "Secure" no cookie de sessão.
# Isso garante que o cookie de sessão só seja enviado em conexões HTTPS, prevenindo interceptação em conexões inseguras.
SESSION_COOKIE_SECURE = True

# Define o mecanismo de armazenamento de sessões.
# "django.contrib.sessions.backends.db" armazena as sessões no banco de dados,
# o que é seguro e escalável, mas pode exigir manutenção periódica para limpar sessões expiradas.
SESSION_ENGINE = "django.contrib.sessions.backends.db"

# Define o nome do cookie de sessão.
# O valor padrão é "sessionid", mas pode ser personalizado se necessário.
SESSION_COOKIE_NAME = "sessionid"

# Define o tempo de vida (em segundos) do cookie de sessão.
# Aqui, o cookie expira após 14.400 segundos (4 horas).
# Após esse período, o usuário precisará fazer login novamente.
SESSION_COOKIE_AGE = 14400

# Define se a sessão deve ser salva no banco de dados a cada requisição.
# Quando False, a sessão só é salva quando modificada, o que melhora o desempenho.
# Quando True, a sessão é salva a cada requisição, o que pode ser útil para aplicações
# que exigem alta precisão no tempo de expiração da sessão.
SESSION_SAVE_EVERY_REQUEST = False

# Habilita o cabeçalho HTTP Strict Transport Security (HSTS).
# HSTS força o navegador a se conectar apenas via HTTPS, prevenindo ataques de downgrade.
# O valor define o tempo (em segundos) que o navegador deve lembrar de usar HTTPS (aqui, 4 horas).
SECURE_HSTS_SECONDS = 14400

# Inclui subdomínios na política HSTS.
# Isso garante que todos os subdomínios também sejam acessados apenas via HTTPS.
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

# Habilita o pré-carregamento (preload) da política HSTS.
# Isso permite que o site seja incluído na lista de pré-carregamento HSTS dos navegadores,
# garantindo que a política seja aplicada mesmo antes do primeiro acesso.
SECURE_HSTS_PRELOAD = True

# Habilita o filtro de proteção contra ataques XSS (Cross-Site Scripting) no navegador.
# Isso adiciona o cabeçalho "X-XSS-Protection: 1; mode=block" às respostas,
# instruindo o navegador a bloquear scripts maliciosos.
SECURE_BROWSER_XSS_FILTER = True

# Habilita o cabeçalho "X-Content-Type-Options: nosniff".
# Impede que o navegador tente adivinhar o tipo MIME de um recurso,
# reduzindo riscos de execução de scripts maliciosos.
SECURE_CONTENT_TYPE_NOSNIFF = True
