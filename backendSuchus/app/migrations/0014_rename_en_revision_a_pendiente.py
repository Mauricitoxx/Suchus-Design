# Migración de datos: "En revisión" -> "Pendiente"

from django.db import migrations


def en_revision_a_pendiente(apps, schema_editor):
    Pedido = apps.get_model('app', 'Pedido')
    PedidoEstadoHistorial = apps.get_model('app', 'PedidoEstadoHistorial')
    Pedido.objects.filter(estado='En revisión').update(estado='Pendiente')
    PedidoEstadoHistorial.objects.filter(estado='En revisión').update(estado='Pendiente')


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0013_remove_reporte_tipo'),
    ]

    operations = [
        migrations.RunPython(en_revision_a_pendiente, migrations.RunPython.noop),
    ]
