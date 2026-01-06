# Endpoints de Impresiones - Guía de Pruebas

## Base URL
`http://127.0.0.1:8000/app/impresiones/`

## 1. Listar todas las impresiones (GET)
```
GET /app/impresiones/
```

**Filtros disponibles:**
- `?usuario_id=1` - Filtrar por usuario
- `?formato=A4` - Filtrar por formato
- `?color=true` - Filtrar por color (true/false)

## 2. Obtener una impresión específica (GET)
```
GET /app/impresiones/{id}/
```

## 3. Crear impresión con archivo (POST)
```
POST /app/impresiones/
Content-Type: multipart/form-data
```

**Body (form-data):**
- `archivo`: [FILE] - Archivo PDF/imagen a subir
- `color`: true o false
- `formato`: A0, A1, A2, A3, A4, A5, A6
- `fk_usuario`: [ID del usuario] (opcional)

**Nota:** Este endpoint sube el archivo a Cloudflare R2 y genera la URL pública automáticamente.

## 4. Actualizar impresión (PUT/PATCH)
```
PATCH /app/impresiones/{id}/
Content-Type: application/json
```

**Body:**
```json
{
  "color": false,
  "formato": "A3"
}
```

**Nota:** Actualiza el registro sin cambiar el archivo. También actualiza `last_accessed`.

## 5. Eliminar impresión (DELETE)
```
DELETE /app/impresiones/{id}/
```

**Nota:** Elimina el archivo de Cloudflare R2 y el registro de la base de datos.

## 6. Actualizar último acceso (PATCH)
```
PATCH /app/impresiones/{id}/actualizar_acceso/
```

Actualiza solo el timestamp de `last_accessed` para mantener el archivo activo.

## 7. Limpiar impresiones antiguas (POST)
```
POST /app/impresiones/limpiar_antiguos/
Content-Type: application/json
```

**Body:**
```json
{
  "dias": 30
}
```

Elimina todas las impresiones que no se han accedido en los últimos X días (por defecto 30).

## Respuesta de ejemplo

```json
{
  "id": 1,
  "color": true,
  "formato": "A4",
  "url": "https://pub-xxxxx.r2.dev/impresiones/uuid.pdf",
  "nombre_archivo": "documento-color.pdf",
  "cloudflare_key": "impresiones/uuid.pdf",
  "created_at": "2025-12-12T10:50:00Z",
  "updated_at": "2025-12-12T10:50:00Z",
  "last_accessed": "2025-12-12T10:50:00Z",
  "fk_usuario": 2,
  "usuario_nombre": "Juan",
  "dias_sin_uso": 0
}
```

## Configuración de Cloudflare R2

Para que funcione la subida de archivos, necesitas:

1. Crear un archivo `.env` basado en `.env.example`
2. Configurar las credenciales de Cloudflare R2:
   - CLOUDFLARE_ACCOUNT_ID
   - CLOUDFLARE_ACCESS_KEY
   - CLOUDFLARE_SECRET_KEY
   - CLOUDFLARE_BUCKET_NAME
   - CLOUDFLARE_PUB_ID

**Nota:** Sin estas credenciales, los endpoints de lectura funcionarán pero la creación y eliminación de archivos fallarán.
