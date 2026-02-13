import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backendSuchus.settings')
django.setup()

from app.models import TipoImpresion

# Datos de prueba para tipos de impresión
tipos_impresion = [
    {"formato": "A4", "color": True, "descripcion": "Impresión A4 a color", "precio": 150.00},
    {"formato": "A4", "color": False, "descripcion": "Impresión A4 blanco y negro", "precio": 50.00},
    {"formato": "A3", "color": True, "descripcion": "Impresión A3 a color", "precio": 300.00},
    {"formato": "A3", "color": False, "descripcion": "Impresión A3 blanco y negro", "precio": 100.00},
    {"formato": "A5", "color": True, "descripcion": "Impresión A5 a color", "precio": 80.00},
    {"formato": "A5", "color": False, "descripcion": "Impresión A5 blanco y negro", "precio": 30.00},
]

print("Creando tipos de impresión...")

for tipo_data in tipos_impresion:
    tipo, created = TipoImpresion.objects.get_or_create(
        formato=tipo_data["formato"],
        color=tipo_data["color"],
        defaults={
            "descripcion": tipo_data["descripcion"],
            "precio": tipo_data["precio"],
            "activo": True
        }
    )
    
    if created:
        print(f"✓ Creado: {tipo}")
    else:
        print(f"- Ya existe: {tipo}")

print(f"\nTotal de tipos de impresión en la base de datos: {TipoImpresion.objects.count()}")
