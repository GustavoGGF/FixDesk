from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from database_pool.health_check import DatabaseHealthCheck
from database_pool.pool_manager import PoolManager


@admin.register
class PoolMetricsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False


class PoolStatusAdmin(admin.AdminSite):
    site_header = "Database Pool Manager"
    site_title = "Pool Status"
    
    def index(self, request, extra_context=None):
        try:
            health_status = DatabaseHealthCheck.check_all_databases()
            
            extra_context = extra_context or {}
            extra_context['pool_metrics'] = health_status
            extra_context['title'] = 'Connection Pool Status'
            
        except Exception as e:
            extra_context = extra_context or {}
            extra_context['error'] = str(e)
        
        return super().index(request, extra_context)
