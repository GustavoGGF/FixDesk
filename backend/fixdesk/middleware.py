from django.shortcuts import redirect
from django.core.exceptions import PermissionDenied
from django.utils.deprecation import MiddlewareMixin


class CustomCsrfMiddleware(MiddlewareMixin):
    """
    Middleware personalizado para tratar exceções de permissão negada (PermissionDenied).

    Se uma exceção `PermissionDenied` for levantada durante o processamento da requisição,
    o usuário será redirecionado para a página de login ("/login").
    """

    def process_exception(self, request, exception):
        """
        Intercepta exceções levantadas durante o processamento da requisição.

        :param request: Objeto HttpRequest da requisição atual.
        :param exception: Exceção capturada durante o processamento da requisição.
        :return: Redirecionamento para "/login" se for uma exceção `PermissionDenied`,
                 ou `None` para continuar com o fluxo normal de tratamento de erros.
        """
        if isinstance(exception, PermissionDenied):
            return redirect("/login")
        return None
