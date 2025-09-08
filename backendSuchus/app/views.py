from django.shortcuts import render
from rest_framework import generics
from .models import Usuario
from .serializers import UsuarioRegister

# Create your views here.

class UsuarioRegisterView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioRegister