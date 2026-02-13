# notifications.py
# Sistema de notificaciones por email - Totalmente aislado del resto del sistema
from django.core.mail import EmailMessage, get_connection
from django.template.loader import render_to_string
from django.conf import settings
import logging
from datetime import datetime
import ssl

# Configurar logger específico para notificaciones
logger = logging.getLogger('notificaciones')
logger.setLevel(logging.INFO)

# Handler para archivo
try:
    import os
    BASE_DIR = settings.BASE_DIR
    log_file = os.path.join(BASE_DIR, 'logs', 'notificaciones.log')
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
except Exception as e:
    print(f"[ADVERTENCIA] No se pudo configurar el log de notificaciones: {e}")


def enviar_notificacion_cambio_estado(pedido):
    """
    Envía un email al cliente cuando cambia el estado de su pedido.
    Usa el backend de Django configurado en settings.py (SendGrid en prod, Gmail en dev)
    
    Args:
        pedido: Objeto Pedido de Django
    
    Returns:
        bool: True si el email se envió correctamente, False si falló
    """
    try:
        print(f"\n[EMAIL] Iniciando envío de notificación para pedido #{pedido.id}")
        logger.info(f"Iniciando envío de notificación para pedido #{pedido.id}")
        
        # Obtener email del usuario
        usuario = pedido.fk_usuario
        if not usuario:
            logger.warning(f"Pedido #{pedido.id} no tiene usuario asociado")
            print(f"[EMAIL] ⚠️ Pedido #{pedido.id} no tiene usuario asociado")
            return False
            
        if not usuario.email:
            logger.warning(f"Pedido #{pedido.id} - Usuario {usuario.id} no tiene email")
            print(f"[EMAIL] ⚠️ Pedido #{pedido.id} no tiene email de usuario")
            return False
        
        print(f"[EMAIL] Usuario encontrado: {usuario.email}")
        logger.info(f"Preparando email para {usuario.email}")
        
        # Preparar contexto para el template
        contexto = {
            'pedido_id': pedido.id,
            'estado': pedido.estado,
            'usuario_nombre': usuario.nombre,
            'total': pedido.total,
            'fecha': pedido.fecha,
        }
        
        # Generar HTML del email con mejor manejo de errores
        try:
            html_content = render_to_string('emails/cambio_estado_pedido.html', contexto)
            print(f"[EMAIL] Template renderizado exitosamente")
            logger.info(f"Template renderizado exitosamente")
        except Exception as template_error:
            print(f"[EMAIL] ❌ Error al renderizar template: {template_error}")
            logger.error(f"Error al renderizar template: {template_error}")
            # Si la template falla, usar un email simple
            html_content = f"""
            <html>
            <body style="font-family: Arial; padding: 20px;">
                <h2>Actualización de tu Pedido #{pedido.id}</h2>
                <p>Hola {usuario.nombre},</p>
                <p>Tu pedido ha sido actualizado al estado: <strong>{pedido.estado}</strong></p>
                <p>Total: ${pedido.total}</p>
                <p>Gracias por elegirnos.</p>
            </body>
            </html>
            """
            print(f"[EMAIL] Usando template fallback")
        
        # Usar Django EmailMessage con el backend configurado en settings
        from django.core.mail import EmailMessage
        
        email = EmailMessage(
            subject=f"📦 Actualización de tu Pedido #{pedido.id} - {pedido.estado}",
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[usuario.email]
        )
        email.content_subtype = 'html'
        
        print(f"[EMAIL] Enviando email mediante {settings.EMAIL_BACKEND}...")
        logger.info(f"Enviando email a {usuario.email}...")
        
        # Enviar el email
        resultado = email.send(fail_silently=False)
        
        if resultado:
            logger.info(f"✅ Email enviado exitosamente a {usuario.email} para pedido #{pedido.id}")
            print(f"[EMAIL] ✅ Email enviado exitosamente a {usuario.email}\n")
            return True
        else:
            logger.warning(f"⚠️ Email.send() retornó 0 para {usuario.email}")
            print(f"[EMAIL] ⚠️ Email.send() no confirmó envío\n")
            return False
        
    except Exception as e:
        # Si falla, logueamos el error completo pero NO lo propagamos
        import traceback
        error_detail = traceback.format_exc()
        logger.error(f"❌ Error al enviar email para pedido #{pedido.id}: {str(e)}\n{error_detail}")
        print(f"[EMAIL] ❌ Error al enviar email para pedido #{pedido.id}:")
        print(f"[EMAIL] {str(e)}")
        print(f"[EMAIL] Traceback: {error_detail}\n")
        return False


def enviar_notificacion_correccion_requerida(pedido, motivo):
    """
    Envía un email al cliente cuando su pedido requiere corrección.
    Usa el backend de Django configurado en settings.py
    
    Args:
        pedido: Objeto Pedido de Django
        motivo: String con el motivo de la corrección
    
    Returns:
        bool: True si el email se envió correctamente, False si falló
    """
    try:
        print(f"\n[EMAIL] Iniciando envío de notificación de corrección para pedido #{pedido.id}")
        logger.info(f"Iniciando envío de notificación de corrección para pedido #{pedido.id}")
        
        usuario = pedido.fk_usuario
        if not usuario:
            logger.warning(f"Pedido #{pedido.id} no tiene usuario asociado")
            print(f"[EMAIL] ⚠️ Pedido #{pedido.id} no tiene usuario asociado")
            return False
            
        if not usuario.email:
            logger.warning(f"Pedido #{pedido.id} - Usuario {usuario.id} no tiene email")
            print(f"[EMAIL] ⚠️ Pedido #{pedido.id} no tiene email de usuario")
            return False
        
        print(f"[EMAIL] Usuario encontrado: {usuario.email}")
        logger.info(f"Preparando email de corrección para {usuario.email}")
        
        contexto = {
            'pedido_id': pedido.id,
            'usuario_nombre': usuario.nombre,
            'motivo': motivo,
            'total': pedido.total,
        }
        
        try:
            html_content = render_to_string('emails/pedido_requiere_correccion.html', contexto)
            print(f"[EMAIL] Template de corrección renderizado exitosamente")
            logger.info(f"Template de corrección renderizado exitosamente")
        except Exception as template_error:
            print(f"[EMAIL] ❌ Error al renderizar template: {template_error}")
            logger.error(f"Error al renderizar template de corrección: {template_error}")
            # Si la template falla, usar un email simple
            html_content = f"""
            <html>
            <body style="font-family: Arial; padding: 20px;">
                <h2>⚠️ Tu Pedido Requiere Corrección</h2>
                <p>Hola {usuario.nombre},</p>
                <p>Tu pedido <strong>#{pedido.id}</strong> requiere corrección:</p>
                <p><strong>Motivo:</strong></p>
                <p>{motivo}</p>
                <p>Por favor, contacta con nosotros o vuelve a cargar los archivos corregidos.</p>
            </body>
            </html>
            """
            print(f"[EMAIL] Usando template fallback para corrección")
        
        # Usar Django EmailMessage con el backend configurado en settings
        from django.core.mail import EmailMessage
        
        email = EmailMessage(
            subject=f"⚠️ Tu Pedido #{pedido.id} Requiere Corrección",
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[usuario.email]
        )
        email.content_subtype = 'html'
        
        print(f"[EMAIL] Enviando email mediante {settings.EMAIL_BACKEND}...")
        logger.info(f"Enviando email de corrección a {usuario.email}...")
        
        # Enviar el email
        resultado = email.send(fail_silently=False)
        
        if resultado:
            logger.info(f"✅ Email de corrección enviado a {usuario.email} para pedido #{pedido.id}")
            print(f"[EMAIL] ✅ Email de corrección enviado a {usuario.email}\n")
            return True
        else:
            logger.warning(f"⚠️ Email.send() retornó 0 para {usuario.email}")
            print(f"[EMAIL] ⚠️ Email.send() no confirmó envío\n")
            return False
        
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        logger.error(f"❌ Error al enviar email de corrección para pedido #{pedido.id}: {str(e)}\n{error_detail}")
        print(f"[EMAIL] ❌ Error al enviar email de corrección para pedido #{pedido.id}:")
        print(f"[EMAIL] {str(e)}")
        print(f"[EMAIL] Traceback: {error_detail}\n")
        return False
