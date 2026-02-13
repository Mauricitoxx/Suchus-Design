from django.contrib import admin
from app.models import Usuario, UsuarioTipo, Pedido, Producto, Impresion, TipoImpresion

# Register your models here.

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'nombre', 'apellido', 'usuarioTipo', 'activo', 'created_at')
    list_filter = ('usuarioTipo', 'activo', 'created_at')
    search_fields = ('email', 'nombre', 'apellido', 'telefono')
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 20
    
    def save_model(self, request, obj, form, change):
        # Si es un nuevo usuario o si la contraseña ha cambiado
        if not change or 'contraseña' in form.changed_data:
            # Hashear la contraseña si no está hasheada
            if obj.contraseña and not obj.contraseña.startswith('pbkdf2_'):
                from django.contrib.auth.hashers import make_password
                obj.contraseña = make_password(obj.contraseña)
        super().save_model(request, obj, form, change)

@admin.register(UsuarioTipo)
class UsuarioTipoAdmin(admin.ModelAdmin):
    list_display = ('id', 'descripcion')
    search_fields = ('descripcion',)

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'fk_usuario', 'estado', 'total', 'created_at')
    list_filter = ('estado', 'created_at')
    search_fields = ('fk_usuario__email', 'fk_usuario__nombre')
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 20

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'precioUnitario', 'activo', 'created_at')
    list_filter = ('activo', 'created_at')
    search_fields = ('nombre', 'descripcion')
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 20

@admin.register(TipoImpresion)
class TipoImpresionAdmin(admin.ModelAdmin):
    list_display = ('id', 'formato', 'color', 'descripcion', 'precio', 'activo', 'created_at')
    list_filter = ('formato', 'color', 'activo', 'created_at')
    search_fields = ('descripcion', 'formato')
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 20

@admin.register(Impresion)
class ImpresionAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_archivo', 'formato', 'color', 'fk_usuario', 'created_at')
    list_filter = ('formato', 'color', 'created_at')
    search_fields = ('nombre_archivo', 'fk_usuario__email')
    readonly_fields = ('created_at', 'updated_at', 'last_accessed')
    list_per_page = 20