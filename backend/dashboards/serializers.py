from rest_framework import serializers

class DashboardsErrorSerializer(serializers.Serializer):
    status = serializers.CharField()
    message = serializers.CharField(required=False)

class GetInfoResponseSerializer(serializers.Serializer):
    name = serializers.CharField()
    helpdesk = serializers.CharField()

class DashBoardPieResponseSerializer(serializers.Serializer):
    series = serializers.ListField()
    labels = serializers.ListField()

class GetTicketTiResponseSerializer(serializers.Serializer):
    data = serializers.ListField()

class GetDashboardBarResponseSerializer(serializers.Serializer):
    data = serializers.ListField()

class GetUsersFixdeskResponseSerializer(serializers.Serializer):
    users = serializers.ListField()
    total_users = serializers.IntegerField()
    total_pages = serializers.IntegerField()
    current_page = serializers.IntegerField()
    page_size = serializers.IntegerField()

class UploadFilesRequestSerializer(serializers.Serializer):
    files = serializers.ListField(
        child=serializers.FileField(),
        help_text="Lista de arquivos anexos"
    )

class GenericResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
