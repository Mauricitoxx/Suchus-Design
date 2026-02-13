from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
# Create your models here.
class UsuarioTipo(models.Model):
    descripcion = models.CharField(max_length=100, null=False)
    descuento = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Porcentaje de descuento (0-100)"
    )

    def __str__(self):
        # Es útil ver el descuento al seleccionar el tipo en el admin
        return f"{self.descripcion} ({self.descuento}%)"

class Usuario(models.Model):
    email = models.EmailField(unique=True)
    contraseña = models.CharField(max_length=128, null=False)
    nombre = models.CharField(max_length=50, null=False)
    apellido = models.CharField(max_length=50, null=False)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    usuarioTipo = models.ForeignKey(UsuarioTipo, on_delete=models.CASCADE)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    def __str__(self):
        return f"{self.nombre} {self.apellido}"
    
    def es_admin(self):
        return self.usuarioTipo.descripcion == "Admin"


class Pedido(models.Model):
    ESTADO = [
        ("Pendiente", "pendiente"),
        ("En proceso", "en proceso"),
        ("Preparado", "preparado"),
        ("Retirado", "retirado"),
        ("Cancelado", "cancelado"),
        ("Requiere Corrección", "requiere corrección")
    ]
    estado = models.CharField(max_length=100, choices=ESTADO, default="Pendiente")
    observacion = models.TextField(null=True, blank=True)
    motivo_correccion = models.TextField(null=True, blank=True)
    total = models.FloatField(null=False)
    fecha = models.DateField(auto_now_add=True)
    fk_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    def __str__(self):
        return f"Pedido #{self.id} - {self.fk_usuario.nombre}"


class PedidoEstadoHistorial(models.Model):
    """Registro de cada cambio de estado de un pedido."""
    fk_pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='historial_estados')
    estado = models.CharField(max_length=100, choices=Pedido.ESTADO)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['fecha']
        verbose_name = 'Historial de estado de pedido'
        verbose_name_plural = 'Historial de estados de pedidos'

    def __str__(self):
        return f"Pedido {self.fk_pedido_id} - {self.estado} ({self.fecha})"


class Producto(models.Model):
    nombre = models.CharField(max_length=100, null=False)
    descripcion = models.TextField(null=False)
    precioUnitario = models.FloatField(null=False)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        ordering = ['id']


class TipoImpresion(models.Model):
    FORMATO = [
        ("A0", "A0 (841 × 1189 mm)"),
        ("A1", "A1 (594 × 841 mm)"),
        ("A2", "A2 (420 × 594 mm)"),
        ("A3", "A3 (297 × 420 mm)"),
        ("A4", "A4 (210 × 297 mm)"),
        ("A5", "A5 (148 × 210 mm)"),
        ("A6", "A6 (105 × 148 mm)"),
    ]
    formato = models.CharField(max_length=3, choices=FORMATO, null=False)
    color = models.BooleanField(null=False)
    descripcion = models.TextField(null=False)
    precio = models.FloatField(null=False)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    def __str__(self):
        tipo_color = "Color" if self.color else "B/N"
        return f"{self.formato} {tipo_color} - ${self.precio}"
    
    class Meta:
        ordering = ['formato', 'color']
        verbose_name = 'Tipo de Impresión'
        verbose_name_plural = 'Tipos de Impresión'


class Impresion(models.Model):
    FORMATO = [
        ("A0", "A0 (841 × 1189 mm)"),
        ("A1", "A1 (594 × 841 mm)"),
        ("A2", "A2 (420 × 594 mm)"),
        ("A3", "A3 (297 × 420 mm)"),
        ("A4", "A4 (210 × 297 mm)"),
        ("A5", "A5 (148 × 210 mm)"),
        ("A6", "A6 (105 × 148 mm)"),
    ]
    archivo = models.FileField(upload_to='impresiones/', null=True, blank=True)
    color = models.BooleanField(null=False)
    formato = models.CharField(max_length=3, choices=FORMATO, default="A4")
    url = models.CharField(null=False, max_length=300)
    nombre_archivo = models.CharField(max_length=255, null=True, blank=True)
    cloudflare_key = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    last_accessed = models.DateTimeField(auto_now=True, null=True, blank=True)
    fk_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, null=True, blank=True)
    
    def __str__(self):
        return f"{self.nombre_archivo} - {self.formato}"


class PedidoImpresionDetalle(models.Model):
    subtotal = models.FloatField(null=False)
    fk_impresion = models.ForeignKey(Impresion, on_delete=models.CASCADE)
    cantidadCopias = models.IntegerField(null=False)
    fk_pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    
    def __str__(self):
        return f"Impresión {self.fk_impresion.id} - Pedido {self.fk_pedido.id}"


class PedidoProductoDetalle(models.Model):
    subtotal = models.FloatField(null=False)
    cantidad = models.IntegerField(null=False)
    fk_producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    fk_pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    
    def __str__(self):
        return f"Producto {self.fk_producto.id} - Pedido {self.fk_pedido.id}"


class Pago(models.Model):
    ESTADO = [
        ("Pendiente", "pendiente"),
        ("Completado", "completado"),
        ("Fallido", "fallido")
    ]
    MEDIO = [
        ("Crédito", "crédito"),
        ("Transferencia", "transferencia"),
        ("Débito", "débito"),
        ("Efectivo", "efectivo")
    ]
    estado = models.CharField(max_length=10, choices=ESTADO, default="Pendiente")
    fecha = models.DateTimeField(auto_now_add=True, null=False)
    metodoPago = models.CharField(max_length=15, choices=MEDIO, default="Efectivo")
    monto = models.FloatField(null=False)
    fk_pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"Pago {self.id} - {self.estado}"

from django.db import models

class Reporte(models.Model):
    titulo = models.CharField(max_length=200)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    fk_usuario_creador = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Aquí guardaremos TODA la ensalada de cálculos
    datos_reporte = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.titulo} ({self.fecha_inicio} - {self.fecha_fin})"