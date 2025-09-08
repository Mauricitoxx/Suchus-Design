from rest_framework import serializers
from .models import Usuario, UsuarioTipo

class UsuarioRegister(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["email", "contraseña", "nombre", "apellido", "telefono"]

    def create(self, validated_data):
        from django.contrib.auth.hashers import make_password
        validated_data['contraseña'] = make_password(validated_data['contraseña'])
        cliente_tipo = UsuarioTipo.objects.get(descripcion="Cliente")
        validated_data['usuarioTipo'] = cliente_tipo #Chavales esto es para que sea cliente si o si
        return super().create(validated_data)