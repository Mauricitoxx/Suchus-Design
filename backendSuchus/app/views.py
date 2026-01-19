from django.shortcuts import render
from rest_framework import generics, status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta
import boto3
import uuid
import os
from .models import Usuario, Pedido, Impresion, Producto, UsuarioTipo
from .serializers import (UsuarioRegisterSerializer, UsuarioLoginSerializer, PedidoSerializer, 
                          ImpresionSerializer, ProductoSerializer, UsuarioSerializer,
                          UsuarioCreateSerializer, UsuarioUpdateSerializer)

# Create your views here.

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT Token Serializer for Usuario model (email-based authentication)"""
    
    username_field = 'email'
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        token['nombre'] = user.nombre
        return token
    
    def validate(self, attrs):
        from rest_framework.exceptions import AuthenticationFailed
        
        # Get email and password from attrs (username_field is 'email')
        email = attrs.get(self.username_field)
        password = attrs.get('password')
        
        try:
            user = Usuario.objects.get(email=email, activo=True)
        except Usuario.DoesNotExist:
            raise AuthenticationFailed('Credenciales inválidas')
        
        # Check password manually since Usuario uses custom password handling
        if not check_password(password, user.contraseña):
            raise AuthenticationFailed('Credenciales inválidas')
        
        # Generate tokens
        refresh = self.get_token(user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'email': user.email,
                'nombre': user.nombre,
                'tipo': user.usuarioTipo.descripcion,
            }
        }
        return data


class UsuarioRegisterView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioRegisterSerializer
    permission_classes = []  # AllowAny


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT Token endpoint with email authentication"""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = []  # AllowAny


class UsuarioLoginView(CustomTokenObtainPairView):
    """Deprecated: Use CustomTokenObtainPairView instead"""
    pass

class LogoutView(APIView):
    """Logout endpoint - cliente debe eliminar los tokens localmente"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Como no usamos blacklist (incompatible con modelo Usuario custom),
        el cliente debe eliminar los tokens del localStorage/sessionStorage.
        Este endpoint solo confirma que el usuario está autenticado.
        """
        return Response(
            {
                "mensaje": "Logout exitoso. Elimina los tokens del cliente.",
                "nota": "Los tokens expiran automáticamente después de 1 hora (access) y 1 día (refresh)"
            },
            status=status.HTTP_200_OK
        )

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Pedido.objects.all()
        usuario_id = self.request.query_params.get('usuario_id', None)
        estado = self.request.query_params.get('estado', None)
        
        if usuario_id is not None:
            queryset = queryset.filter(fk_usuario_id=usuario_id)
        if estado is not None:
            queryset = queryset.filter(estado=estado)
            
        return queryset.order_by('-id')
    
    @action(detail=True, methods=['patch'])
    def cambiar_estado(self, request, pk=None):
        pedido = self.get_object()
        nuevo_estado = request.data.get('estado')
        
        if nuevo_estado in dict(Pedido.ESTADO).keys():
            pedido.estado = nuevo_estado
            pedido.save()
            serializer = self.get_serializer(pedido)
            return Response(serializer.data)
        
        return Response(
            {"error": "Estado inválido"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

class ImpresionViewSet(viewsets.ModelViewSet):
    queryset = Impresion.objects.all()
    serializer_class = ImpresionSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [permissions.IsAuthenticated]
    
    def get_cloudflare_client(self):
        """Inicializa el cliente S3 para Cloudflare R2"""
        # Configuración para Cloudflare R2
        # Estas credenciales deberían estar en variables de entorno
        account_id = os.getenv('CLOUDFLARE_ACCOUNT_ID', 'tu-account-id')
        access_key = os.getenv('CLOUDFLARE_ACCESS_KEY', 'tu-access-key')
        secret_key = os.getenv('CLOUDFLARE_SECRET_KEY', 'tu-secret-key')
        bucket_name = os.getenv('CLOUDFLARE_BUCKET_NAME', 'suchus-impresiones')
        
        s3 = boto3.client(
            's3',
            endpoint_url=f'https://{account_id}.r2.cloudflarestorage.com',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name='auto'
        )
        return s3, bucket_name
    
    def get_queryset(self):
        queryset = Impresion.objects.all()
        usuario_id = self.request.query_params.get('usuario_id', None)
        formato = self.request.query_params.get('formato', None)
        color = self.request.query_params.get('color', None)
        
        if usuario_id is not None:
            queryset = queryset.filter(fk_usuario_id=usuario_id)
        if formato is not None:
            queryset = queryset.filter(formato=formato)
        if color is not None:
            queryset = queryset.filter(color=color.lower() == 'true')
            
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """Alta de impresión con subida a Cloudflare R2"""
        archivo = request.FILES.get('archivo')
        
        if not archivo:
            return Response(
                {"error": "Archivo requerido"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generar nombre único para el archivo
            extension = archivo.name.split('.')[-1] if '.' in archivo.name else 'pdf'
            cloudflare_key = f"impresiones/{uuid.uuid4()}.{extension}"
            
            # Subir a Cloudflare R2
            s3, bucket_name = self.get_cloudflare_client()
            s3.upload_fileobj(
                archivo,
                bucket_name,
                cloudflare_key,
                ExtraArgs={'ContentType': archivo.content_type}
            )
            
            # Generar URL pública
            url = f"https://pub-{os.getenv('CLOUDFLARE_PUB_ID', 'your-pub-id')}.r2.dev/{cloudflare_key}"
            
            # Crear registro en BD
            impresion = Impresion.objects.create(
                color=request.data.get('color', 'false').lower() == 'true',
                formato=request.data.get('formato', 'A4'),
                url=url,
                nombre_archivo=archivo.name,
                cloudflare_key=cloudflare_key,
                fk_usuario_id=request.data.get('fk_usuario') if request.data.get('fk_usuario') else None
            )
            
            serializer = self.get_serializer(impresion)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": f"Error al subir archivo: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        """Actualización de impresión (sin cambiar archivo)"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Actualizar last_accessed al acceder
        instance.last_accessed = timezone.now()
        instance.save()
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Baja de impresión con eliminación de Cloudflare R2"""
        instance = self.get_object()
        
        try:
            # Eliminar de Cloudflare R2 si existe la key
            if instance.cloudflare_key:
                s3, bucket_name = self.get_cloudflare_client()
                s3.delete_object(Bucket=bucket_name, Key=instance.cloudflare_key)
            
            # Eliminar registro de BD
            self.perform_destroy(instance)
            return Response(
                {"mensaje": "Impresión eliminada correctamente"}, 
                status=status.HTTP_204_NO_CONTENT
            )
            
        except Exception as e:
            return Response(
                {"error": f"Error al eliminar: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['patch'])
    def actualizar_acceso(self, request, pk=None):
        """Actualiza el timestamp de último acceso"""
        impresion = self.get_object()
        impresion.last_accessed = timezone.now()
        impresion.save()
        serializer = self.get_serializer(impresion)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def limpiar_antiguos(self, request):
        """Elimina impresiones sin usar por más de X días"""
        dias = int(request.data.get('dias', 30))
        fecha_limite = timezone.now() - timedelta(days=dias)
        
        impresiones_antiguas = Impresion.objects.filter(last_accessed__lt=fecha_limite)
        count = impresiones_antiguas.count()
        
        try:
            s3, bucket_name = self.get_cloudflare_client()
            
            # Eliminar archivos de Cloudflare
            for impresion in impresiones_antiguas:
                if impresion.cloudflare_key:
                    try:
                        s3.delete_object(Bucket=bucket_name, Key=impresion.cloudflare_key)
                    except:
                        pass
            
            # Eliminar registros de BD
            impresiones_antiguas.delete()
            
            return Response(
                {"mensaje": f"{count} impresiones eliminadas", "dias": dias}, 
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {"error": f"Error en limpieza: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    
    def get_queryset(self):
        """Obtener productos con filtros opcionales"""
        queryset = Producto.objects.all()
        
        # Filtro por estado (activo/inactivo)
        activo = self.request.query_params.get('activo', None)
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        
        # Filtro por rango de precios
        precio_min = self.request.query_params.get('precio_min', None)
        precio_max = self.request.query_params.get('precio_max', None)
        if precio_min is not None:
            queryset = queryset.filter(precioUnitario__gte=float(precio_min))
        if precio_max is not None:
            queryset = queryset.filter(precioUnitario__lte=float(precio_max))
        
        # Búsqueda por nombre
        nombre = self.request.query_params.get('nombre', None)
        if nombre is not None:
            queryset = queryset.filter(nombre__icontains=nombre)
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """Alta de producto"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Validaciones adicionales
        if serializer.validated_data['precioUnitario'] <= 0:
            return Response(
                {"error": "El precio unitario debe ser mayor a 0"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def update(self, request, *args, **kwargs):
        """Modificación completa de producto"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Validar que el producto esté activo
        if not instance.activo:
            return Response(
                {"error": "No se puede modificar un producto inactivo"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Validar precio si se está actualizando
        if 'precioUnitario' in serializer.validated_data:
            if serializer.validated_data['precioUnitario'] <= 0:
                return Response(
                    {"error": "El precio unitario debe ser mayor a 0"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        self.perform_update(serializer)
        return Response(serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        """Actualización parcial de producto"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Baja física de producto (solo para testing)"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"mensaje": "Producto eliminado físicamente"},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=True, methods=['patch'])
    def desactivar(self, request, pk=None):
        """Baja lógica de producto"""
        producto = self.get_object()
        
        if not producto.activo:
            return Response(
                {"error": "El producto ya está inactivo"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        producto.activo = False
        producto.save()
        serializer = self.get_serializer(producto)
        return Response({
            "mensaje": "Producto desactivado correctamente",
            "producto": serializer.data
        })
    
    @action(detail=True, methods=['patch'])
    def activar(self, request, pk=None):
        """Reactivar producto"""
        producto = self.get_object()
        
        if producto.activo:
            return Response(
                {"error": "El producto ya está activo"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        producto.activo = True
        producto.save()
        serializer = self.get_serializer(producto)
        return Response({
            "mensaje": "Producto activado correctamente",
            "producto": serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """Listar solo productos activos"""
        productos_activos = Producto.objects.filter(activo=True).order_by('-created_at')
        page = self.paginate_queryset(productos_activos)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(productos_activos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def inactivos(self, request):
        """Listar solo productos inactivos"""
        productos_inactivos = Producto.objects.filter(activo=False).order_by('-updated_at')
        page = self.paginate_queryset(productos_inactivos)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(productos_inactivos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def actualizar_precio(self, request, pk=None):
        """Actualización específica de precio"""
        producto = self.get_object()
        
        if not producto.activo:
            return Response(
                {"error": "No se puede modificar el precio de un producto inactivo"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        nuevo_precio = request.data.get('precioUnitario')
        if nuevo_precio is None:
            return Response(
                {"error": "El campo 'precioUnitario' es requerido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            nuevo_precio = float(nuevo_precio)
            if nuevo_precio <= 0:
                return Response(
                    {"error": "El precio debe ser mayor a 0"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {"error": "El precio debe ser un número válido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        precio_anterior = producto.precioUnitario
        producto.precioUnitario = nuevo_precio
        producto.save()
        
        serializer = self.get_serializer(producto)
        return Response({
            "mensaje": "Precio actualizado correctamente",
            "precio_anterior": precio_anterior,
            "precio_nuevo": nuevo_precio,
            "producto": serializer.data
        })

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UsuarioCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UsuarioUpdateSerializer
        return UsuarioSerializer
    
    def get_queryset(self):
        queryset = Usuario.objects.all()
        activo = self.request.query_params.get('activo', None)
        tipo_usuario = self.request.query_params.get('tipo_usuario', None)
        search = self.request.query_params.get('search', None)
        
        if activo is not None:
            activo_bool = activo.lower() == 'true'
            queryset = queryset.filter(activo=activo_bool)
        
        if tipo_usuario is not None:
            queryset = queryset.filter(usuarioTipo__descripcion__icontains=tipo_usuario)
        
        if search is not None:
            queryset = queryset.filter(
                Q(nombre__icontains=search) |
                Q(apellido__icontains=search) |
                Q(email__icontains=search)
            )
        
        return queryset.select_related('usuarioTipo')
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Verificar si intenta crear un Admin
        tipo_usuario_id = serializer.validated_data.get('usuarioTipo')
        tipo_usuario = UsuarioTipo.objects.get(id=tipo_usuario_id.id)
        
        if tipo_usuario.descripcion.lower() == 'admin':
            # Verificar si el usuario que crea es Admin
            usuario_id = request.data.get('usuario_actual_id')
            if not usuario_id:
                return Response(
                    {"error": "Se requiere usuario_actual_id para crear Admins"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            try:
                usuario_actual = Usuario.objects.get(id=usuario_id, activo=True)
                if not usuario_actual.es_admin():
                    return Response(
                        {"error": "Solo los Admins pueden crear otros Admins"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Usuario.DoesNotExist:
                return Response(
                    {"error": "Usuario actual no válido"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "mensaje": "Usuario creado correctamente",
                "usuario": UsuarioSerializer(serializer.instance).data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            "mensaje": "Usuario actualizado correctamente",
            "usuario": UsuarioSerializer(serializer.instance).data
        })
    
    def destroy(self, request, *args, **kwargs):
        usuario = self.get_object()
        
        # Verificar si es Admin intentando eliminar
        if usuario.es_admin():
            usuario_id = request.data.get('usuario_actual_id')
            if not usuario_id:
                return Response(
                    {"error": "Se requiere usuario_actual_id para eliminar Admins"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            try:
                usuario_actual = Usuario.objects.get(id=usuario_id, activo=True)
                if not usuario_actual.es_admin():
                    return Response(
                        {"error": "Solo los Admins pueden eliminar otros Admins"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Usuario.DoesNotExist:
                return Response(
                    {"error": "Usuario actual no válido"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Baja lógica
        usuario.activo = False
        usuario.save()
        
        return Response({
            "mensaje": "Usuario desactivado correctamente",
            "usuario": UsuarioSerializer(usuario).data
        })
    
    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        usuario = self.get_object()
        
        if not usuario.activo:
            return Response(
                {"error": "El usuario ya está inactivo"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar permisos si es Admin
        if usuario.es_admin():
            usuario_id = request.data.get('usuario_actual_id')
            if not usuario_id:
                return Response(
                    {"error": "Se requiere usuario_actual_id para desactivar Admins"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            try:
                usuario_actual = Usuario.objects.get(id=usuario_id, activo=True)
                if not usuario_actual.es_admin():
                    return Response(
                        {"error": "Solo los Admins pueden desactivar otros Admins"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Usuario.DoesNotExist:
                return Response(
                    {"error": "Usuario actual no válido"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        usuario.activo = False
        usuario.save()
        
        serializer = self.get_serializer(usuario)
        return Response({
            "mensaje": "Usuario desactivado correctamente",
            "usuario": serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        usuario = self.get_object()
        
        if usuario.activo:
            return Response(
                {"error": "El usuario ya está activo"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        usuario.activo = True
        usuario.save()
        
        serializer = self.get_serializer(usuario)
        return Response({
            "mensaje": "Usuario activado correctamente",
            "usuario": serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def activos(self, request):
        usuarios = Usuario.objects.filter(activo=True).select_related('usuarioTipo')
        serializer = self.get_serializer(usuarios, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def inactivos(self, request):
        usuarios = Usuario.objects.filter(activo=False).select_related('usuarioTipo')
        serializer = self.get_serializer(usuarios, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cambiar_contraseña(self, request, pk=None):
        usuario = self.get_object()
        
        contraseña_actual = request.data.get('contraseña_actual')
        contraseña_nueva = request.data.get('contraseña_nueva')
        confirmar_contraseña = request.data.get('confirmar_contraseña')
        
        if not all([contraseña_actual, contraseña_nueva, confirmar_contraseña]):
            return Response(
                {"error": "Se requieren contraseña_actual, contraseña_nueva y confirmar_contraseña"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not check_password(contraseña_actual, usuario.contraseña):
            return Response(
                {"error": "La contraseña actual es incorrecta"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if contraseña_nueva != confirmar_contraseña:
            return Response(
                {"error": "Las contraseñas nuevas no coinciden"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(contraseña_nueva) < 6:
            return Response(
                {"error": "La contraseña debe tener al menos 6 caracteres"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        usuario.contraseña = make_password(contraseña_nueva)
        usuario.save()
        
        return Response({
            "mensaje": "Contraseña actualizada correctamente"
        })
    
    @action(detail=True, methods=['post'])
    def promover_admin(self, request, pk=None):
        usuario = self.get_object()
        
        # Verificar que el usuario actual es Admin
        usuario_actual_id = request.data.get('usuario_actual_id')
        if not usuario_actual_id:
            return Response(
                {"error": "Se requiere usuario_actual_id"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            usuario_actual = Usuario.objects.get(id=usuario_actual_id, activo=True)
            if not usuario_actual.es_admin():
                return Response(
                    {"error": "Solo los Admins pueden cambiar roles de usuario"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Usuario.DoesNotExist:
            return Response(
                {"error": "Usuario actual no válido"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener el tipo Admin
        try:
            tipo_admin = UsuarioTipo.objects.get(descripcion__iexact='admin')
        except UsuarioTipo.DoesNotExist:
            return Response(
                {"error": "No existe el tipo de usuario Admin"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if usuario.usuarioTipo == tipo_admin:
            return Response(
                {"error": "El usuario ya es Admin"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        usuario.usuarioTipo = tipo_admin
        usuario.save()
        
        serializer = self.get_serializer(usuario)
        return Response({
            "mensaje": "Usuario promovido a Admin correctamente",
            "usuario": serializer.data
        })
