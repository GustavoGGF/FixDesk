import json
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from database_pool.health_check import DatabaseHealthCheck
from database_pool.pool_manager import PoolManager
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from .serializers import (
    PoolErrorResponseSerializer,
    PoolStatusSerializer,
    PoolHealthCheckSerializer,
    PoolResetRequestSerializer,
    PoolResetResponseSerializer
)

class PoolStatusView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Verifica o status do pool de banco de dados",
        description="Retorna informações sobre as conexões atuais em um pool de banco de dados, como conexões ativas e em uso.",
        parameters=[
            OpenApiParameter("db", OpenApiTypes.STR, description="Alias do banco de dados (padrão: 'default')", required=False),
        ],
        responses={
            200: PoolStatusSerializer,
            500: PoolErrorResponseSerializer
        },
        tags=['Database Pool']
    )
    def get(self, request):
        db_alias = request.GET.get('db', 'default')
        
        try:
            status = DatabaseHealthCheck.check_pool_status(db_alias)
            return JsonResponse(status)
        except Exception as e:
            return JsonResponse(
                {'error': str(e)},
                status=500
            )


class PoolHealthCheckView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Realiza verificação de saúde nos bancos de dados",
        description="Retorna o status geral de saúde de todos os bancos configurados no pool, incluindo quais estão saudáveis e inativos.",
        responses={
            200: PoolHealthCheckSerializer,
            500: PoolErrorResponseSerializer
        },
        tags=['Database Pool']
    )
    def get(self, request):
        try:
            all_status = DatabaseHealthCheck.check_all_databases()
            
            healthy_count = sum(
                1 for status in all_status.values() if status['is_healthy']
            )
            
            return JsonResponse({
                'overall_health': 'healthy' if healthy_count == len(all_status) else 'unhealthy',
                'total_databases': len(all_status),
                'healthy_databases': healthy_count,
                'databases': all_status
            })
        except Exception as e:
            return JsonResponse(
                {'error': str(e)},
                status=500
            )


class PoolResetView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Reseta o pool de banco de dados",
        description="Reseta um pool específico fechando conexões ativas. Útil em casos de travamentos de pool.",
        request=PoolResetRequestSerializer,
        responses={
            200: PoolResetResponseSerializer,
            500: PoolErrorResponseSerializer
        },
        tags=['Database Pool']
    )
    def post(self, request):
        try:
            data = json.loads(request.body) if request.body else {}
            db_alias = data.get('db', 'default')
            
            PoolManager.clear_pool(db_alias)
            
            return JsonResponse({
                'status': 'success',
                'message': f'Pool {db_alias} foi resetado'
            })
        except Exception as e:
            return JsonResponse(
                {'error': str(e)},
                status=500
            )
