from rest_framework import serializers
from .models import Usuario, UsuarioTipo, Pedido, Impresion, Producto

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

class PedidoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='fk_usuario.nombre', read_only=True)
    usuario_apellido = serializers.CharField(source='fk_usuario.apellido', read_only=True)
    usuario_email = serializers.EmailField(source='fk_usuario.email', read_only=True)
    
    class Meta:
        model = Pedido
        fields = ['id', 'estado', 'observacion', 'total', 'fk_usuario', 
                  'usuario_nombre', 'usuario_apellido', 'usuario_email']
        read_only_fields = ['id']

class ImpresionSerializer(serializers.ModelSerializer):
    archivo = serializers.FileField(write_only=True, required=False)
    usuario_nombre = serializers.CharField(source='fk_usuario.nombre', read_only=True)
    dias_sin_uso = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Impresion
        fields = ['id', 'color', 'formato', 'url', 'nombre_archivo', 'cloudflare_key',
                  'created_at', 'updated_at', 'last_accessed', 'fk_usuario', 
                  'usuario_nombre', 'archivo', 'dias_sin_uso']
        read_only_fields = ['id', 'url', 'cloudflare_key', 'created_at', 'updated_at', 'last_accessed']
    
    def get_dias_sin_uso(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.last_accessed
        return delta.days

class ProductoSerializer(serializers.ModelSerializer):
    estado = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'descripcion', 'precioUnitario', 'activo', 
                  'created_at', 'updated_at', 'estado']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_estado(self, obj):
        return "Activo" if obj.activo else "Inactivo"