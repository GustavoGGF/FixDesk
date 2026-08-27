from rest_framework import serializers

class UserLoginRequestSerializer(serializers.Serializer):
    user = serializers.CharField(help_text="Nome de usuário LDAP")
    password = serializers.CharField(help_text="Senha do usuário")

class UserDataSerializer(serializers.Serializer):
    name = serializers.CharField()
    departament = serializers.CharField()
    job_title = serializers.CharField()
    mail = serializers.EmailField()
    company = serializers.CharField()
    helpdesk = serializers.CharField()
    roles = serializers.ListField(child=serializers.CharField(), required=False)
    groups = serializers.ListField(child=serializers.CharField(), required=False)

class UserLoginResponseSerializer(serializers.Serializer):
    data = UserDataSerializer()  # type: ignore[assignment]

class LoginErrorResponseSerializer(serializers.Serializer):
    status = serializers.CharField(required=False)
    Error = serializers.CharField(required=False)
