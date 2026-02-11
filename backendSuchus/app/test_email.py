# test_email.py
# Script de prueba para verificar que el email funcione
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings

def test_email_simple():
    """
    Prueba simple de envío de email
    """
    try:
        email = EmailMessage(
            subject='🧪 Test de Email - Suchus Design',
            body='Este es un email de prueba. Si lo recibís, el sistema de notificaciones funciona correctamente.',
            from_email=settings.EMAIL_HOST_USER,
            to=['juantest@example.com'],  # CAMBIÁ ESTO POR TU EMAIL REAL
        )
        email.send()
        print("✅ Email de prueba enviado correctamente")
        return True
    except Exception as e:
        print(f"❌ Error al enviar email de prueba: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_email_con_template(email_destino):
    """
    Prueba con template HTML
    """
    try:
        contexto = {
            'pedido_id': 999,
            'estado': 'Preparado',
            'usuario_nombre': 'Juan Test',
            'total': 5000,
            'fecha': '2026-02-09',
        }
        
        html_content = render_to_string('emails/cambio_estado_pedido.html', contexto)
        
        email = EmailMessage(
            subject='🧪 Test - Actualización de Pedido',
            body=html_content,
            from_email=settings.EMAIL_HOST_USER,
            to=[email_destino],
        )
        email.content_subtype = "html"
        email.send()
        
        print(f"✅ Email con template enviado a {email_destino}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
