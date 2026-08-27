from rest_framework import serializers

class PoolErrorResponseSerializer(serializers.Serializer):
    error = serializers.CharField(help_text="Mensagem de erro")

class PoolStatusSerializer(serializers.Serializer):
    pool_size = serializers.IntegerField(help_text="Tamanho atual do pool")
    checked_out = serializers.IntegerField(help_text="Número de conexões em uso")
    available = serializers.IntegerField(help_text="Número de conexões disponíveis")
    db_alias = serializers.CharField(help_text="Alias do banco de dados")

class PoolHealthCheckDatabaseSerializer(serializers.Serializer):
    is_healthy = serializers.BooleanField(help_text="Indica se o banco de dados está saudável")
    pool_size = serializers.IntegerField(help_text="Tamanho do pool de conexões", required=False)
    checked_out = serializers.IntegerField(help_text="Conexões em uso", required=False)
    error = serializers.CharField(help_text="Mensagem de erro em caso de falha", required=False)

class PoolHealthCheckSerializer(serializers.Serializer):
    overall_health = serializers.ChoiceField(choices=['healthy', 'unhealthy'], help_text="Status geral de saúde dos bancos")
    total_databases = serializers.IntegerField(help_text="Total de bancos verificados")
    healthy_databases = serializers.IntegerField(help_text="Total de bancos saudáveis")
    databases = serializers.DictField(child=PoolHealthCheckDatabaseSerializer(), help_text="Status detalhado de cada banco de dados")

class PoolResetRequestSerializer(serializers.Serializer):
    db = serializers.CharField(required=False, default='default', help_text="Alias do banco de dados a ser resetado")

class PoolResetResponseSerializer(serializers.Serializer):
    status = serializers.CharField(help_text="Status da operação")
    message = serializers.CharField(help_text="Mensagem descrevendo a operação realizada")
