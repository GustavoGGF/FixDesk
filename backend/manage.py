import os
import sys
import os.path

# Define o diretório base do projeto
BASE_DIR = os.path.dirname(__file__)

# Define o caminho relativo para o arquivo settings.py
SETTINGS_MODULE = "fixdesk.settings"

# Define a variável de ambiente DJANGO_SETTINGS_MODULE
os.environ.setdefault("DJANGO_SETTINGS_MODULE", SETTINGS_MODULE)


def main():
    # ...
    # Carrega o modulo de gerenciamento do Django
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        # Trata o erro de importação do Django
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    # Executa o comando do Django
    execute_from_command_line(sys.argv)


# ...

if __name__ == "__main__":
    main()
