from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (UsuarioRegisterView, UsuarioLoginView, CustomTokenObtainPairView,
                   LogoutView, PedidoViewSet, ImpresionViewSet, ProductoViewSet, UsuarioViewSet)
from .pago import crear_preferencia

router = DefaultRouter()
router.register(r'pedidos', PedidoViewSet, basename='pedido')
router.register(r'impresiones', ImpresionViewSet, basename='impresion')
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path("register/", UsuarioRegisterView.as_view(), name='usuario-register'),
    path("login/", CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("logout/", LogoutView.as_view(), name='logout'),
    path("token/refresh/", TokenRefreshView.as_view(), name='token_refresh'),
    path("mercadopago/crear-preferencia/", crear_preferencia),

    path("", include(router.urls)),
]