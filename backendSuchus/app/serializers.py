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
        validated_data['usuarioTipo'] = cliente_tipo
        return super().create(validated_data)
    
class UsuarioLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    contraseña = serializers.CharField()

class UsuarioSerializer(serializers.ModelSerializer):
    tipo_usuario = serializers.CharField(source='usuarioTipo.descripcion', read_only=True)
    es_admin = serializers.SerializerMethodField(read_only=True)
    estado = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nombre', 'apellido', 'telefono', 'usuarioTipo',
                  'tipo_usuario', 'es_admin', 'activo', 'estado', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'usuarioTipo': {'write_only': True}
        }
    
    def get_es_admin(self, obj):
        return obj.es_admin()
    
    def get_estado(self, obj):
        return "Activo" if obj.activo else "Inactivo"

class UsuarioCreateSerializer(serializers.ModelSerializer):
    contraseña = serializers.CharField(write_only=True, min_length=6)
    confirmar_contraseña = serializers.CharField(write_only=True)
    tipo_usuario = serializers.ChoiceField(choices=['Cliente', 'Admin'], write_only=True, required=False, default='Cliente')
    
    class Meta:
        model = Usuario
        fields = ['email', 'contraseña', 'confirmar_contraseña', 'nombre', 'apellido', 
                  'telefono', 'tipo_usuario']
    
    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con ese mail.")
        return value
    
    def validate(self, data):
        if data['contraseña'] != data['confirmar_contraseña']:
            raise serializers.ValidationError({
                "contraseña": "Las contraseñas no coinciden"
            })
        return data
    
    def create(self, validated_data):
        from django.contrib.auth.hashers import make_password
        validated_data.pop('confirmar_contraseña')
        tipo_nombre = validated_data.pop('tipo_usuario', 'Cliente')
        
        usuario_tipo = UsuarioTipo.objects.get(descripcion=tipo_nombre)
        validated_data['usuarioTipo'] = usuario_tipo
        validated_data['contraseña'] = make_password(validated_data['contraseña'])
        
        return super().create(validated_data)

class UsuarioUpdateSerializer(serializers.ModelSerializer):
    contraseña_actual = serializers.CharField(write_only=True, required=False)
    contraseña_nueva = serializers.CharField(write_only=True, required=False, min_length=6)
    confirmar_contraseña = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Usuario
        fields = ['email', 'nombre', 'apellido', 'telefono', 
                  'contraseña_actual', 'contraseña_nueva', 'confirmar_contraseña']
    
    def validate_email(self, value):
        usuario = self.instance
        if Usuario.objects.exclude(pk=usuario.pk).filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está en uso por otro usuario")
        return value
    
    def validate(self, data):
        # Si se intenta cambiar la contraseña
        if 'contraseña_nueva' in data or 'contraseña_actual' in data:
            if not all(k in data for k in ['contraseña_actual', 'contraseña_nueva', 'confirmar_contraseña']):
                raise serializers.ValidationError({
                    "contraseña": "Para cambiar la contraseña debes proporcionar: contraseña_actual, contraseña_nueva y confirmar_contraseña"
                })
            
            if data['contraseña_nueva'] != data['confirmar_contraseña']:
                raise serializers.ValidationError({
                    "contraseña_nueva": "Las contraseñas nuevas no coinciden"
                })
            
            # Validar contraseña actual
            from django.contrib.auth.hashers import check_password
            if not check_password(data['contraseña_actual'], self.instance.contraseña):
                raise serializers.ValidationError({
                    "contraseña_actual": "La contraseña actual es incorrecta"
                })
        
        return data
    
    def update(self, instance, validated_data):
        from django.contrib.auth.hashers import make_password
        
        # Remover campos de contraseña del validated_data
        validated_data.pop('contraseña_actual', None)
        validated_data.pop('confirmar_contraseña', None)
        contraseña_nueva = validated_data.pop('contraseña_nueva', None)
        
        # Si hay contraseña nueva, hashearla
        if contraseña_nueva:
            instance.contraseña = make_password(contraseña_nueva)
        
        # Actualizar otros campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

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
