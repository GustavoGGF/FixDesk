from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import (
    TemplateView,
)  # Para servir templates diretamente como views.
from . import views  # Importa as views definidas no mesmo diretório.
from pathlib import Path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from django.conf import settings
from django.views.static import serve

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
    path("dashboard/", include("dashboards.urls")),
    path("dashboard-ti/", include("dashboards.urls")),
    path("gerenciar-usuarios/", include("dashboards.urls")),
    # Inclui as URLs do aplicativo "database_pool" para monitoramento.
    # Rotas: /api/database-pool/status/, /api/database-pool/health/, /api/database-pool/reset/
    path("api/database-pool/", include("database_pool.urls")),

    # Swagger endpoints
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Optional UI:
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

urlpatterns += [
    re_path(
        r"^static/(?P<path>.*)$",
        serve,
        {"document_root": Path(settings.STATICFILES_DIRS[0])},
    ),
]
