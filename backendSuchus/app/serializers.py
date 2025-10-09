from rest_framework import serializers
from .models import Usuario, UsuarioTipo

class UsuarioRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["email", "contraseña", "nombre", "apellido", "telefono"]

    def create(self, validated_data):
        from django.contrib.auth.hashers import make_password
        validated_data['contraseña'] = make_password(validated_data['contraseña'])
        cliente_tipo = UsuarioTipo.objects.get(descripcion="Cliente")
        validated_data['usuarioTipo'] = cliente_tipo #Chavales esto es para que sea cliente si o si
        return super().create(validated_data)
    
class UsuarioLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    contraseña = serializers.CharField()

class UsuarioRegisterSerializer(serializers.ModelSerializer):
    contraseña = serializers.CharField(write_only=True)
    confirmar_contraseña = serializers.CharField(write_only=True)
    class Meta:
        model = Usuario
        fields = ["email", "contraseña", "confirmar_contraseña", "nombre", "apellido", "telefono"]

    def validate_email(self, value):
        if Usuario.objects.filter(email = value).exists():
            raise serializers.ValidationError("Ya existe un usuario con ese mail.")
        return value
    
    def validate(self, data):
        if data.get('contraseña') != data.get('confirmar_contraseña'):
            raise serializers.ValidationError({"confirmar_contraseña": "Las contraseñas no coinciden."})
        return data

    def create(self, validated_data):
        from django.contrib.auth.hashers import make_password
        validated_data['contraseña'] = make_password(validated_data['contraseña'])
        validated_data.pop('confirmar_contraseña', None)
        cliente_tipo = UsuarioTipo.objects.get(descripcion="Cliente")
        validated_data['usuarioTipo'] = cliente_tipo #Chavales esto es para que sea cliente si o si
        return super().create(validated_data)

class UsuarioUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['nombre', 'apellido', 'telefono']

class UsuarioEmailUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['email']
