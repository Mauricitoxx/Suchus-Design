"""
Django settings for backendSuchus project.
Versión Final Blindada para Koyeb + Neon - CORREGIDA
"""

from pathlib import Path
import os
from datetime import timedelta
from django.conf.urls.static import static
# 1. DEFINICIÓN DE BASE_DIR (Mover arriba para usarlo en load_dotenv)
BASE_DIR = Path(__file__).resolve().parent.parent

# 2. CARGA EXPLÍCITA DEL .ENV
try:
    from dotenv import load_dotenv
    # Buscamos el archivo .env específicamente en la raíz del proyecto
    env_path = os.path.join(BASE_DIR, '.env')
    load_dotenv(env_path)
except ImportError:
    pass

try:
    import dj_database_url
except ImportError:
    dj_database_url = None

# --- CONFIGURACIÓN DE SEGURIDAD ---
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-x$e$u^seus*v0t4x&)x460sdl#n&^bs@pl)h0koo)njqmz$%4t')

# En producción DEBUG debe ser False. En local debe ser True en el .env
DEBUG = os.getenv('DEBUG', 'False') == 'True'



# --- DEFINICIÓN DE APLICACIONES ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic', 
    'django.contrib.staticfiles',
    'app', # Tu aplicación de fotocopiadora
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'cloudinary',
    'cloudinary_storage',
    
]
Q_CLUSTER = {
    'name': 'DjangORM',
    'workers': 2,        # 2 procesos son suficientes para reportes diarios
    'timeout': 90,
    'retry': 120,
    'queue_limit': 50,
    'bulk': 10,
    'orm': 'default',    # Almacena las tareas en tu base de datos actual
}
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', 
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# --- CONFIGURACIÓN DE SEGURIDAD ---
# Agregamos .onrender.com para que acepte cualquier subdominio de Render
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.onrender.com', '.koyeb.app']

# --- CONFIGURACIÓN DE CORS & CSRF ---
CORS_ALLOWED_ORIGINS = [
    "https://suchus-design.vercel.app",
    "https://clud2025.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "https://*.koyeb.app",
    "https://clud2025.onrender.com",
    "https://*.onrender.com",
    "https://suchus-design.vercel.app",
]

# --- REST FRAMEWORK & JWT ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'app.authentication.CustomJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_COOKIE_SECURE': not DEBUG,
    'AUTH_COOKIE_HTTP_ONLY': True,
    'AUTH_COOKIE_SAMESITE': 'Lax',
}

# --- CLOUDINARY ---
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.getenv('CLOUDINARY_API_KEY'),
    'API_SECRET': os.getenv('CLOUDINARY_API_SECRET')
}
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.RawMediaCloudinaryStorage'

ROOT_URLCONF = 'backendSuchus.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [], # Puedes dejarlo vacío si usas carpetas dentro de las apps
        'APP_DIRS': True, # <--- ESTO DEBE ESTAR EN TRUE
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backendSuchus.wsgi.application'

# --- CONFIGURACIÓN DE BASE DE DATOS (SUPER REFORZADA) ---

DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    print(f"[OK] Conectando a Neon: {DATABASE_URL[:30]}...")
    
    # Si dj_database_url funciona, lo usamos (es lo ideal)
    if dj_database_url:
        DATABASES = {
            'default': dj_database_url.config(
                default=DATABASE_URL,
                conn_max_age=600,
                ssl_require=True
            )
        }
    else:
        # PLAN B: Configuración manual si dj_database_url falla
        print("[AVISO] dj_database_url no disponible, usando config manual.")
        import urllib.parse as urlparse
        url = urlparse.urlparse(DATABASE_URL)
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': url.path[1:],
                'USER': url.username,
                'PASSWORD': url.password,
                'HOST': url.hostname,
                'PORT': url.port or 5432,
            }
        }
    
    # Esto es vital para Neon
    DATABASES['default']['OPTIONS'] = {'sslmode': 'require'}
else:
    print("[OK] No hay DATABASE_URL, usando SQLite.")
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# --- VALIDACIÓN DE CONTRASEÑAS ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- INTERNACIONALIZACIÓN ---
LANGUAGE_CODE = 'es-ar'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# --- ARCHIVOS ESTÁTICOS ---
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- MERCADO PAGO ---
# Prioriza el token del .env si existe, sino usa el fallback
MP_ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN", "APP_USR-5006527019840999-020415-bd90aef781be9ac6dbb5908fdf64bbf6-3182278274")


# settings.py

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_USE_TLS = True
EMAIL_PORT = 587
EMAIL_HOST_USER = 'Valenxity@gmail.com'
EMAIL_HOST_PASSWORD = 'tomt dlsd gwna kbzl' # No es tu clave normal, es una clave de app de Google