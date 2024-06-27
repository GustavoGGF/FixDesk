from django.shortcuts import redirect
from django.core.exceptions import PermissionDenied
from django.utils.deprecation import MiddlewareMixin


class CustomCsrfMiddleware(MiddlewareMixin):
    def process_exception(self, request, exception):
        if isinstance(exception, PermissionDenied):
            return redirect("/login")
        return None
