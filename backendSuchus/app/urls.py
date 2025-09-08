from django.urls import path
from .views import UsuarioRegisterView

urlpatterns = [
    path("register/", UsuarioRegisterView.as_view(), name='usuario-register'),
]