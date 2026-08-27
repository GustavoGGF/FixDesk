from django.urls import path
from database_pool.views import (
    PoolStatusView,
    PoolHealthCheckView,
    PoolResetView,
)

app_name = 'database_pool'

urlpatterns = [
    path('status/', PoolStatusView.as_view(), name='pool_status'),
    path('health/', PoolHealthCheckView.as_view(), name='pool_health'),
    path('reset/', PoolResetView.as_view(), name='pool_reset'),
]
