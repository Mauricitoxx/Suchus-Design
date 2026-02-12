# tasks.py
import io
import pandas as pd
from django.utils import timezone
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from .models import Reporte, Usuario # Importamos Usuario para buscar los admins
from .utils import calcular_datos_reporte 

def generar_y_enviar_reporte_diario():
    hoy = timezone.now().date()
    titulo = f"Cierre Diario Automático - {hoy.strftime('%d/%m/%Y')}"

    # 1. Obtenemos los datos calculados
    datos = calcular_datos_reporte(hoy, hoy)

    # 2. Guardamos en BD para el Panel de React
    reporte_obj = Reporte.objects.create(
        titulo=titulo,
        fecha_inicio=hoy,
        fecha_fin=hoy,
        datos_reporte=datos,
        fk_usuario_creador_id=1
    )

    # 3. Buscamos los emails de TODOS los administradores
    # Ajusta 'rol' o 'is_staff' según como manejes los permisos en tu modelo
    emails_admins = list(Usuario.objects.filter(rol='Admin').values_list('email', flat=True))
    
    if not emails_admins:
        return "No se encontraron usuarios administradores para enviar el reporte."

    # 4. Creamos el Excel en memoria
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='xlsxwriter') as writer:
        pd.DataFrame([datos['resumen_general']]).to_excel(writer, sheet_name='Resumen', index=False)
        pd.DataFrame(datos['finanzas_por_estado']).to_excel(writer, sheet_name='Por Estado', index=False)
    buffer.seek(0)

    # 5. Cuerpo del mail HTML
    resumen = datos.get('resumen_general', {})
    html_content = render_to_string('emails/reporte_diario.html', {
        'titulo': titulo,
        'monto': resumen.get('monto_total_periodo', 0),
        'pedidos': resumen.get('cantidad_total_pedidos', 0),
        'ticket': resumen.get('promedio_por_venta', 0),
    })

    # 6. Enviamos el correo a la lista de admins
    email = EmailMessage(
        subject=f"📊 Reporte de Ventas Diario - {hoy.strftime('%d/%m/%Y')}",
        body=html_content,
        from_email='tu-sistema@gmail.com',
        to=emails_admins, # <--- Enviado a toda la lista de una vez (usando BCC si prefieres privacidad)
    )
    email.content_subtype = "html"
    email.attach(
        f"Reporte_{hoy}.xlsx",
        buffer.getvalue(),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    email.send()
    return f"Reporte enviado a {len(emails_admins)} administradores."