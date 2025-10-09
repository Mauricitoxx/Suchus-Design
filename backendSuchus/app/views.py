from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from .models import Usuario
from .serializers import UsuarioRegisterSerializer, UsuarioLoginSerializer, UsuarioUpdateSerializer ,UsuarioEmailUpdateSerializer

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
    
class UsuarioUpdateView(generics.UpdateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UsuarioEmailUpdateView(generics.UpdateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioEmailUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
