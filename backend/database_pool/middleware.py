import logging
import time
from django.db import connection, reset_queries
from django.conf import settings

logger = logging.getLogger(__name__)


class DatabasePoolMonitoringMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.enable_query_logging = getattr(settings, 'DEBUG', False)

    def __call__(self, request):
        start_time = time.time()
        
        if self.enable_query_logging:
            reset_queries()
        
        try:
            response = self.get_response(request)
        finally:
            duration = time.time() - start_time
            
            if self.enable_query_logging:
                query_count = len(connection.queries)
                if query_count > 0:
                    logger.debug(
                        f"Request: {request.method} {request.path} | "
                        f"Queries: {query_count} | Duration: {duration:.3f}s"
                    )
                    
                    if query_count > 10:
                        logger.warning(
                            f"⚠️ Muitas queries detectadas ({query_count}) em "
                            f"{request.path} - considere usar select_related/prefetch_related"
                        )
        
        return response
