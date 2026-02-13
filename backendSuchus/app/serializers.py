from rest_framework import serializers
from .models import Usuario, UsuarioTipo, Pedido, Impresion, Producto, PedidoProductoDetalle, PedidoImpresionDetalle, PedidoEstadoHistorial, Reporte, TipoImpresion



class UsuarioTipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioTipo
        fields = ['id', 'descripcion', 'descuento']
    
class UsuarioRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["email", "contraseña", "nombre", "apellido", "telefono"]

    def validate_telefono(self, value):
        if value:  # Solo validar si se proporciona un teléfono
            import re
            # Verificar que solo contenga números
            if not re.match(r'^[0-9]+$', value):
                raise serializers.ValidationError("El teléfono solo debe contener números")
            # Verificar longitud
            if len(value) < 8 or len(value) > 15:
                raise serializers.ValidationError("El teléfono debe tener entre 8 y 15 dígitos")
        return value

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
    tipo_usuario = serializers.ChoiceField(
        choices=['Cliente', 'Admin', 'Frecuente', 'Alumno'],
        write_only=True,
        required=False,
        default='Cliente'
    )
    
    class Meta:
        model = Usuario
        fields = ['email', 'contraseña', 'confirmar_contraseña', 'nombre', 'apellido', 
                  'telefono', 'tipo_usuario']
    
    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con ese mail.")
        return value
    
    def validate_telefono(self, value):
        if value:  # Solo validar si se proporciona un teléfono
            import re
            # Verificar que solo contenga números
            if not re.match(r'^[0-9]+$', value):
                raise serializers.ValidationError("El teléfono solo debe contener números")
            # Verificar longitud
            if len(value) < 8 or len(value) > 15:
                raise serializers.ValidationError("El teléfono debe tener entre 8 y 15 dígitos")
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
    tipo_usuario = serializers.CharField(required=False)
    
    class Meta:
        model = Usuario
        fields = ['email', 'nombre', 'apellido', 'telefono', 'tipo_usuario',
                  'contraseña_actual', 'contraseña_nueva', 'confirmar_contraseña']
    
    def validate_email(self, value):
        usuario = self.instance
        if Usuario.objects.exclude(pk=usuario.pk).filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está en uso por otro usuario")
        return value
    
    def validate_telefono(self, value):
        if value:  # Solo validar si se proporciona un teléfono
            import re
            # Verificar que solo contenga números
            if not re.match(r'^[0-9]+$', value):
                raise serializers.ValidationError("El teléfono solo debe contener números")
            # Verificar longitud
            if len(value) < 8 or len(value) > 15:
                raise serializers.ValidationError("El teléfono debe tener entre 8 y 15 dígitos")
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
        
        # Manejar el cambio de tipo de usuario
        tipo_usuario = validated_data.pop('tipo_usuario', None)
        if tipo_usuario:
            try:
                usuario_tipo_obj = UsuarioTipo.objects.get(descripcion=tipo_usuario)
                instance.usuarioTipo = usuario_tipo_obj
            except UsuarioTipo.DoesNotExist:
                raise serializers.ValidationError({
                    "tipo_usuario": f"El tipo de usuario '{tipo_usuario}' no existe"
                })
        
        # Si hay contraseña nueva, hashearla
        if contraseña_nueva:
            instance.contraseña = make_password(contraseña_nueva)
        
        # Actualizar otros campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class ImpresionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Impresion
        # Agregamos 'url' a la lista de campos
        # Puedes quitar 'archivo' y 'archivo_url' si ya no los necesitas en el JSON
        fields = ['id', 'nombre_archivo', 'formato', 'color', 'url', 'archivo']
# Asegúrate de que PedidoImpresionDetalleSerializer incluya la impresión serializada
class PedidoImpresionDetalleSerializer(serializers.ModelSerializer):
    # Usamos fk_impresion porque ese es el nombre real en tu modelo
    fk_impresion_data = ImpresionSerializer(source='fk_impresion', read_only=True)
    
    class Meta:
        model = PedidoImpresionDetalle
        fields = ['id', 'cantidadCopias', 'subtotal', 'fk_impresion_data']

class PedidoProductoDetalleSerializer(serializers.ModelSerializer):
    fk_producto_nombre = serializers.CharField(source='fk_producto.nombre', read_only=True)
    fk_producto_precio = serializers.FloatField(source='fk_producto.precioUnitario', read_only=True)

    class Meta:
        model = PedidoProductoDetalle
        fields = ['id', 'fk_producto', 'fk_producto_nombre', 'fk_producto_precio', 'cantidad', 'subtotal']


class PedidoEstadoHistorialSerializer(serializers.ModelSerializer):
    class Meta:
        model = PedidoEstadoHistorial
        fields = ['id', 'estado', 'fecha']


class PedidoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='fk_usuario.nombre', read_only=True)
    usuario_apellido = serializers.CharField(source='fk_usuario.apellido', read_only=True)
    usuario_email = serializers.EmailField(source='fk_usuario.email', read_only=True)

    detalles = PedidoProductoDetalleSerializer(many=True, read_only=True, source='pedidoproductodetalle_set')
    detalle_impresiones = PedidoImpresionDetalleSerializer(many=True, read_only=True, source='pedidoimpresiondetalle_set')
    historial_estados = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Pedido
        fields = ['id', 'estado', 'observacion', 'motivo_correccion', 'total', 'fecha', 'fk_usuario',
                  'usuario_nombre', 'usuario_apellido', 'usuario_email', 'detalles', 'detalle_impresiones', 'historial_estados', 'updated_at']
        read_only_fields = ['id', 'updated_at']

    def get_historial_estados(self, obj):
        from django.utils import timezone
        try:
            historial = obj.historial_estados.all().order_by('fecha')
            if historial.exists():
                lista = PedidoEstadoHistorialSerializer(historial, many=True).data
                # Siempre incluir el estado inicial "Pendiente" si no está en el historial
                primera_fecha = obj.created_at if obj.created_at else timezone.now()
                if lista and lista[0].get('estado') != 'Pendiente':
                    entrada_inicial = {
                        'id': None,
                        'estado': 'Pendiente',
                        'fecha': primera_fecha.isoformat() if hasattr(primera_fecha, 'isoformat') else str(primera_fecha)
                    }
                    lista = [entrada_inicial] + list(lista)
                return lista
        except Exception:
            pass
        # Pedidos sin historial o si falla la consulta: mostrar estado actual con fecha de creación
        fecha = obj.created_at if obj.created_at else timezone.now()
        return [{'id': None, 'estado': obj.estado, 'fecha': fecha.isoformat() if hasattr(fecha, 'isoformat') else str(fecha)}]



class ProductoSerializer(serializers.ModelSerializer):
    estado = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'descripcion', 'precioUnitario', 'activo', 
                  'created_at', 'updated_at', 'estado']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_estado(self, obj):
        return "Activo" if obj.activo else "Inactivo"


class TipoImpresionSerializer(serializers.ModelSerializer):
    estado = serializers.SerializerMethodField(read_only=True)
    formato_display = serializers.CharField(source='get_formato_display', read_only=True)
    tipo_color = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = TipoImpresion
        fields = ['id', 'formato', 'formato_display', 'color', 'tipo_color', 
                  'descripcion', 'precio', 'activo', 'estado', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_estado(self, obj):
        return "Activo" if obj.activo else "Inactivo"
    
    def get_tipo_color(self, obj):
        return "Color" if obj.color else "Blanco y Negro"


class ReporteSerializer(serializers.ModelSerializer):
    nombre_creador = serializers.ReadOnlyField(source='fk_usuario_creador.nombre')
    datos_reporte = serializers.ReadOnlyField() # Aquí se guardará el JSON que calculamos arriba

    class Meta:
        model = Reporte
        fields = [
            'id', 
            'titulo', 
            'fecha_inicio', 
            'fecha_fin', 
            'fk_usuario_creador', 
            'nombre_creador', 
            'created_at', 
            'datos_reporte'
        ]
        # Muy importante que estos sean ReadOnly para que no den error al hacer el POST
        read_only_fields = ['fk_usuario_creador', 'created_at', 'datos_reporte']