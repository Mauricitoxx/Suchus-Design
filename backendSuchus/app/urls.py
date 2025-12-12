from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioRegisterView, UsuarioLoginView, PedidoViewSet, ImpresionViewSet

router = DefaultRouter()
router.register(r'pedidos', PedidoViewSet, basename='pedido')
router.register(r'impresiones', ImpresionViewSet, basename='impresion')

urlpatterns = [
    path("register/", UsuarioRegisterView.as_view(), name='usuario-register'),
    path("login/", UsuarioLoginView.as_view()),
    path("", include(router.urls)),
]