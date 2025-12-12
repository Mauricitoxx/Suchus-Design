from django.shortcuts import render
from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from datetime import timedelta
import boto3
import uuid
import os
from .models import Usuario, Pedido, Impresion
from .serializers import UsuarioRegisterSerializer, UsuarioLoginSerializer, PedidoSerializer, ImpresionSerializer

# Create your views here.

class UsuarioRegisterView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioRegisterSerializer

class UsuarioLoginView(APIView):
    def post(self, request):
        serializer = UsuarioLoginSerializer(data = request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            contraseña = serializer.validated_data['contraseña']
            try:
                usuario = Usuario.objects.get(email = email)
                if check_password(contraseña, usuario.contraseña):
                    return Response({"mensaje": "Login exitoso", "usuario_id": usuario.id})
                else:
                    return Response({"error": "Contraseña incorrecta"}, status = status.HTTP_401_UNAUTHORIZED)
            except:
                return Response({"error": "Usuario no encontrado"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer
    
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