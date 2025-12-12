from django.db import models

# Create your models here.
class UsuarioTipo(models.Model):
    descripcio=models.CharField(max_length=100, null=False)

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
        return self.usuarioTipo.descripcio == "Admin"

class Pedido (models.Model):
    ESTADO= [
        ("En revisión", "en revisión"),
        ("En proceso", "en proceso"),
        ("Preparado","preparado"),
        ("Retirado", "retirado"),
        ("Cancelado","cancelado")
        ]
    estado= models.CharField(max_length=100, choices=ESTADO, default="En revisión")
    observacion=models.TextField(null=True, blank=True)
    total=models.FloatField(null=False)
    fk_usuario=models.ForeignKey(Usuario, on_delete=models.CASCADE)

class Producto (models.Model):
    nombre=models.CharField(max_length=100, null=False)
    descripcion=models.TextField(null=False)
    precioUnitario=models.FloatField(null=False)
    activo=models.BooleanField(default=True)
    created_at=models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at=models.DateTimeField(auto_now=True, null=True, blank=True)
    #stockActual=models.IntegerField(null=False)
    #stockMinimo=models.IntegerField(null=False) 

class Impresion (models.Model):
    FORMATO= [
        ("A0", "A0 (841 × 1189 mm)"),
        ("A1", "A1 (594 × 841 mm)"),
        ("A2", "A2 (420 × 594 mm)"),
        ("A3", "A3 (297 × 420 mm)"),
        ("A4", "A4 (210 × 297 mm)"),
        ("A5", "A5 (148 × 210 mm)"),
        ("A6", "A6 (105 × 148 mm)"),
    ]
    color=models.BooleanField(null=False)
    formato=models.CharField(max_length=3, choices=FORMATO, default="A4")
    url=models.CharField(null=False, max_length=300)
    nombre_archivo=models.CharField(max_length=255, null=True, blank=True)
    cloudflare_key=models.CharField(max_length=500, null=True, blank=True)
    created_at=models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at=models.DateTimeField(auto_now=True, null=True, blank=True)
    last_accessed=models.DateTimeField(auto_now=True, null=True, blank=True)
    fk_usuario=models.ForeignKey(Usuario, on_delete=models.CASCADE, null=True, blank=True)

class PedidoImpresionDetalle(models.Model):
    subtotal=models.FloatField(null=False)
    fk_impresion=models.ForeignKey(Impresion, on_delete=models.CASCADE)
    cantidadCopias=models.IntegerField(null=False)
    fk_pedido=models.ForeignKey(Pedido, on_delete=models.CASCADE)

class PedidoProductoDetalle(models.Model):
    subtotal=models.FloatField(null=False)
    cantidad=models.IntegerField(null=False)
    fk_producto=models.ForeignKey(Producto, on_delete=models.CASCADE)
    fk_pedido=models.ForeignKey(Pedido, on_delete=models.CASCADE)

class Pago(models.Model):
    ESTADO=[
        ("Pendiente", "pendiente"),
        ("Completado", "completado"),
        ("Fallido", "fallido")
    ]
    MEDIO=[
        ("Crédito", "crédito"),
        ("Transferencia", "transferencia"),
        ("Débito", "débito"),
        ("Efectivo", "efectivo")
    ]
    estado=models.CharField(max_length=10, choices=ESTADO, default="Pendiente")
    fecha=models.DateTimeField(auto_now_add=True,null=False)
    metodoPago=models.CharField(max_length=15, choices=MEDIO, default="Efectivo")
    monto=models.FloatField(null=False)
    #numero=models.IntegerField("null=False")
    fk_pedido=models.ForeignKey(Pedido, on_delete=models.CASCADE)

