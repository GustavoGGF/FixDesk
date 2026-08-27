from rest_framework import serializers

class HelpdeskErrorResponseSerializer(serializers.Serializer):
    status = serializers.CharField(help_text="Status de erro ou sucesso")
    message = serializers.CharField(required=False)

class GetTokenResponseSerializer(serializers.Serializer):
    token = serializers.CharField(help_text="Token CSRF")
    name = serializers.CharField()
    departament = serializers.CharField()
    job_title = serializers.CharField()
    mail = serializers.EmailField()
    company = serializers.CharField()
    helpdesk = serializers.CharField()

class GetImageResponseSerializer(serializers.Serializer):
    image = serializers.CharField(help_text="Imagem convertida para base64")
    model = serializers.CharField(help_text="Modelo do equipamento")

class FirstViewResponseSerializer(serializers.Serializer):
    data = serializers.DictField()

class HistoryGetTicketResponseSerializer(serializers.Serializer):
    data = serializers.ListField()

class EquipamentsForAlocateResponseSerializer(serializers.Serializer):
    data = serializers.ListField()

class DateEquipamentsAlocateResponseSerializer(serializers.Serializer):
    date = serializers.CharField()

class ChangeLastViewerResponseSerializer(serializers.Serializer):
    status = serializers.CharField()

class LogErrorFrontendRequestSerializer(serializers.Serializer):
    message = serializers.CharField()
    stack = serializers.CharField(required=False)

class LogErrorFrontendResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    message = serializers.CharField(required=False)

class GetTicketFilterResponseSerializer(serializers.Serializer):
    data = serializers.ListField()

class UpdateChatResponseSerializer(serializers.Serializer):
    data = serializers.ListField()
