from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from . import views
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

# from django.conf.urls import handler404

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", TemplateView.as_view(template_name="index.html"), name="login"),
    path("login/", TemplateView.as_view(template_name="index.html"), name="login"),
    path("validation/", views.validation, name="central-validation"),
    path("login/validation/", views.validation, name="central-validation"),
    path("helpdesk/", include("helpdesk.urls")),
    path("dashboard_TI/", include("dashboards.urls")),
]

urlpatterns += staticfiles_urlpatterns()
# handler404 = views.handler404
