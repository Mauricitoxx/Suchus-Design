# Suchus Design - Backend API

API REST para la gestión de impresiones y productos de Suchus Design & Copy.

## Requisitos previos

- Python 3.8+
- Django 5.2.4
- PostgreSQL (recomendado) o SQLite (desarrollo)

## Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repo>
cd backendSuchus
```

2. **Crear ambiente virtual**
```bash
python -m venv venv
```

3. **Activar ambiente virtual**
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

4. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

5. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus valores
```

6. **Ejecutar migraciones**
```bash
python manage.py migrate
```

7. **Crear superusuario**
```bash
python manage.py createsuperuser
```

8. **Ejecutar servidor de desarrollo**
```bash
python manage.py runserver
```

El servidor estará disponible en `http://localhost:8000`

## Estructura del proyecto

```
backendSuchus/
├── app/                    # Aplicación principal
│   ├── models.py          # Modelos de base de datos
│   ├── views.py           # Vistas API
│   ├── serializers.py     # Serializadores DRF
│   ├── urls.py            # URLs de la app
│   └── migrations/        # Migraciones de base de datos
├── backendSuchus/         # Configuración del proyecto
│   ├── settings.py        # Configuración Django
│   ├── urls.py            # URLs principales
│   └── wsgi.py
├── manage.py
├── requirements.txt       # Dependencias Python
├── .env.example           # Ejemplo de variables de entorno
└── README.md              # Este archivo
```

## Variables de entorno

Las siguientes variables pueden configurarse en `.env`:

- `DEBUG`: Modo debug (True/False)
- `SECRET_KEY`: Clave secreta de Django
- `ALLOWED_HOSTS`: Hosts permitidos (separados por comas)
- `CLOUDFLARE_ACCOUNT_ID`: ID de cuenta Cloudflare
- `CLOUDFLARE_ACCESS_KEY`: Clave de acceso Cloudflare
- `CLOUDFLARE_SECRET_KEY`: Clave secreta Cloudflare
- `CLOUDFLARE_BUCKET_NAME`: Nombre del bucket R2
- `CORS_ALLOWED_ORIGINS`: Orígenes CORS permitidos

## Endpoints principales

### Autenticación
- `POST /api/register/` - Registrar nuevo usuario
- `POST /api/login/` - Iniciar sesión

### Usuarios
- `GET /api/usuarios/` - Listar usuarios
- `GET /api/usuarios/{id}/` - Obtener usuario
- `POST /api/usuarios/` - Crear usuario (admin)
- `PUT /api/usuarios/{id}/` - Actualizar usuario
- `DELETE /api/usuarios/{id}/` - Eliminar usuario (desactivar)

### Productos
- `GET /api/productos/` - Listar productos
- `GET /api/productos/activos/` - Listar productos activos
- `POST /api/productos/` - Crear producto
- `PUT /api/productos/{id}/` - Actualizar producto
- `PATCH /api/productos/{id}/desactivar/` - Desactivar producto
- `PATCH /api/productos/{id}/activar/` - Activar producto

### Impresiones
- `GET /api/impresiones/` - Listar impresiones
- `POST /api/impresiones/` - Subir nueva impresión
- `DELETE /api/impresiones/{id}/` - Eliminar impresión

### Pedidos
- `GET /api/pedidos/` - Listar pedidos
- `GET /api/pedidos/{id}/` - Obtener pedido
- `POST /api/pedidos/` - Crear pedido
- `PATCH /api/pedidos/{id}/cambiar_estado/` - Cambiar estado del pedido

## Modelos

### Usuario
- email (unique)
- nombre
- apellido
- telefono
- usuarioTipo (FK)
- activo
- created_at
- updated_at

### Producto
- nombre
- descripcion
- precioUnitario
- activo
- created_at
- updated_at

### Impresion
- color (boolean)
- formato (choices: A0-A6)
- url
- nombre_archivo
- cloudflare_key
- fk_usuario (FK)
- created_at
- updated_at
- last_accessed

### Pedido
- estado (choices)
- observacion
- total
- fk_usuario (FK)
- created_at
- updated_at

### Pago
- estado (choices)
- fecha
- metodoPago (choices)
- monto
- fk_pedido (FK)

## Seguridad

⚠️ **IMPORTANTE**: 
- Nunca commitear `.env` con datos reales
- Usar `SECRET_KEY` segura en producción
- Mantener `DEBUG=False` en producción
- Configurar `ALLOWED_HOSTS` apropiadamente

## Testing

```bash
python manage.py test
```

## Contribuciones

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## License

Este proyecto está bajo licencia MIT.
