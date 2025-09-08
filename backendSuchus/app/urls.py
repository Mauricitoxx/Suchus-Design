from django.urls import path
from .views import UsuarioRegisterView, UsuarioLoginView

urlpatterns = [
    path("register/", UsuarioRegisterView.as_view(), name='usuario-register'),
    path("login/", UsuarioLoginView.as_view()),
]