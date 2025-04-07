from django.contrib import admin
from django.urls import path, include
from django.views.generic import (
    TemplateView,
)  # Para servir templates diretamente como views.
from . import views  # Importa as views definidas no mesmo diretório.
from django.contrib.staticfiles.urls import (
    staticfiles_urlpatterns,
)  # Para servir arquivos estáticos durante o desenvolvimento.

# Configuração dos padrões de URL (URL patterns) do projeto.
# Cada entrada mapeia uma URL para uma view específica ou inclui URLs de outros aplicativos.
urlpatterns = [
    # URL para a interface de administração do Django.
    path("admin/", admin.site.urls),
    # URL raiz ("/") e URL de login ("/login/") servem o template "index.html".
    # Ambas usam TemplateView para renderizar o template diretamente.
    path("", TemplateView.as_view(template_name="index.html"), name="login"),
    path("login/", TemplateView.as_view(template_name="index.html"), name="login"),
    # URLs para validação de usuário.
    # Ambas as URLs ("/validation/" e "/login/validation/") mapeiam para a view `validation`.
    path("validation/", views.validation, name="central-validation"),
    path("login/validation/", views.validation, name="central-validation"),
    # Inclui as URLs do aplicativo "helpdesk".
    # Todas as URLs que começam com "/helpdesk/" serão roteadas para o arquivo `urls.py` do aplicativo "helpdesk".
    path("helpdesk/", include("helpdesk.urls")),
    # Inclui as URLs do aplicativo "dashboards".
    # Todas as URLs que começam com "/dashboard_TI/" serão roteadas para o arquivo `urls.py` do aplicativo "dashboards".
    path("dashboard-ti/", include("dashboards.urls")),
]

# Adiciona suporte para servir arquivos estáticos durante o desenvolvimento.
# Isso é útil para servir arquivos CSS, JavaScript e imagens quando DEBUG = True.
urlpatterns += staticfiles_urlpatterns()
