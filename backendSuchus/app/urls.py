from django.urls import path
from .views import UsuarioRegisterView, UsuarioLoginView, UsuarioEmailUpdateView, UsuarioUpdateView

urlpatterns = [
    path("register/", UsuarioRegisterView.as_view(), name='usuario-register'),
    path("login/", UsuarioLoginView.as_view()),
    path("usuario/actualizar/", UsuarioUpdateView.as_view(), name="actualizar-usuario"),
    path("usuario/cambiar-email/", UsuarioEmailUpdateView.as_view(), name="cambiar-email"),
]