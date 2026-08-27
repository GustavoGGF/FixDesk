from os import environ
from django.core.wsgi import get_wsgi_application

# Define a variável de ambiente para o módulo de configurações do Django
environ.setdefault("DJANGO_SETTINGS_MODULE", "fixdesk.settings")

# Cria a aplicação WSGI para servir o projeto Django
application = get_wsgi_application()
