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
    Esta función es completamente independiente y si falla no afecta el cambio de estado.
    
    Args:
        pedido: Objeto Pedido de Django
    
    Returns:
        bool: True si el email se envió correctamente, False si falló
    """
    try:
        logger.info(f"Iniciando envío de notificación para pedido #{pedido.id}")
        
        # Obtener email del usuario
        usuario = pedido.fk_usuario
        if not usuario:
            logger.warning(f"Pedido #{pedido.id} no tiene usuario asociado")
            print(f"[NOTIFICACIÓN] Pedido #{pedido.id} no tiene usuario asociado")
            return False
            
        if not usuario.email:
            logger.warning(f"Pedido #{pedido.id} - Usuario {usuario.id} no tiene email")
            print(f"[NOTIFICACIÓN] Pedido #{pedido.id} no tiene email de usuario")
            return False
        
        logger.info(f"Preparando email para {usuario.email}")
        
        # Preparar contexto para el template
        contexto = {
            'pedido_id': pedido.id,
            'estado': pedido.estado,
            'usuario_nombre': usuario.nombre,
            'total': pedido.total,
            'fecha': pedido.fecha,
        }
        
        # Generar HTML del email
        html_content = render_to_string('emails/cambio_estado_pedido.html', contexto)
        logger.info(f"Template renderizado exitosamente")
        
        # Enviar usando smtplib directamente para evitar problemas de SSL en Windows
        import smtplib
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"📦 Actualización de tu Pedido #{pedido.id} - {pedido.estado}"
        msg['From'] = settings.EMAIL_HOST_USER
        msg['To'] = usuario.email
        
        parte_html = MIMEText(html_content, 'html')
        msg.attach(parte_html)
        
        logger.info(f"Enviando email a {usuario.email}...")
        
        # Conectar y enviar sin verificación estricta de SSL
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.starttls(context=context)
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"✅ Email enviado exitosamente a {usuario.email} para pedido #{pedido.id}")
        print(f"[NOTIFICACIÓN] ✅ Email enviado a {usuario.email} para pedido #{pedido.id}")
        return True
        
    except Exception as e:
        # Si falla, logueamos el error completo
        import traceback
        error_detail = traceback.format_exc()
        logger.error(f"❌ Error al enviar email para pedido #{pedido.id}: {str(e)}\n{error_detail}")
        print(f"[NOTIFICACIÓN] ❌ Error al enviar email para pedido #{pedido.id}: {str(e)}")
        return False


def enviar_notificacion_correccion_requerida(pedido, motivo):
    """
    Envía un email al cliente cuando su pedido requiere corrección.
    
    Args:
        pedido: Objeto Pedido de Django
        motivo: String con el motivo de la corrección
    
    Returns:
        bool: True si el email se envió correctamente, False si falló
    """
    try:
        logger.info(f"Iniciando envío de notificación de corrección para pedido #{pedido.id}")
        
        usuario = pedido.fk_usuario
        if not usuario:
            logger.warning(f"Pedido #{pedido.id} no tiene usuario asociado")
            print(f"[NOTIFICACIÓN] Pedido #{pedido.id} no tiene usuario asociado")
            return False
            
        if not usuario.email:
            logger.warning(f"Pedido #{pedido.id} - Usuario {usuario.id} no tiene email")
            print(f"[NOTIFICACIÓN] Pedido #{pedido.id} no tiene email de usuario")
            return False
        
        logger.info(f"Preparando email de corrección para {usuario.email}")
        
        contexto = {
            'pedido_id': pedido.id,
            'usuario_nombre': usuario.nombre,
            'motivo': motivo,
            'total': pedido.total,
        }
        
        html_content = render_to_string('emails/pedido_requiere_correccion.html', contexto)
        logger.info(f"Template de corrección renderizado exitosamente")
        
        # Enviar usando smtplib directamente para evitar problemas de SSL en Windows
        import smtplib
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"⚠️ Tu Pedido #{pedido.id} Requiere Corrección"
        msg['From'] = settings.EMAIL_HOST_USER
        msg['To'] = usuario.email
        
        parte_html = MIMEText(html_content, 'html')
        msg.attach(parte_html)
        
        logger.info(f"Enviando email de corrección a {usuario.email}...")
        
        # Conectar y enviar sin verificación estricta de SSL
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.starttls(context=context)
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"✅ Email de corrección enviado a {usuario.email} para pedido #{pedido.id}")
        print(f"[NOTIFICACIÓN] ✅ Email de corrección enviado a {usuario.email} para pedido #{pedido.id}")
        return True
        
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        logger.error(f"❌ Error al enviar email de corrección para pedido #{pedido.id}: {str(e)}\n{error_detail}")
        print(f"[NOTIFICACIÓN] ❌ Error al enviar email de corrección para pedido #{pedido.id}: {str(e)}")
        return False
