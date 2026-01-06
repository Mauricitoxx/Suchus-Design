import requests
import json

BASE_URL = "http://127.0.0.1:8000/app"

def print_response(title, response):
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    except:
        print(f"Response: {response.text}")

# 1. Crear tipo de usuario Cliente (si no existe)
print("\n1. CREAR TIPO CLIENTE")
response = requests.post(f"{BASE_URL}/register/", json={
    "usuarioTipo": "Cliente",
    "email": "test_cliente@mail.com",
    "contraseña": "password123",
    "nombre": "Juan",
    "apellido": "Pérez"
})
print_response("Crear tipo Cliente", response)

# 2. Crear tipo de usuario Admin (si no existe)
print("\n2. CREAR TIPO ADMIN")
response = requests.post(f"{BASE_URL}/register/", json={
    "usuarioTipo": "Admin",
    "email": "admin@mail.com",
    "contraseña": "admin123",
    "nombre": "Admin",
    "apellido": "Principal"
})
print_response("Crear tipo Admin", response)

# 3. Listar todos los usuarios
print("\n3. LISTAR TODOS LOS USUARIOS")
response = requests.get(f"{BASE_URL}/usuarios/")
print_response("GET /usuarios/", response)
usuarios = response.json()

# Guardar IDs para pruebas posteriores
cliente_id = None
admin_id = None
for usuario in usuarios:
    if usuario.get('email') == 'test_cliente@mail.com':
        cliente_id = usuario['id']
    elif usuario.get('email') == 'admin@mail.com':
        admin_id = usuario['id']

print(f"\n-> Cliente ID: {cliente_id}")
print(f"-> Admin ID: {admin_id}")

# 4. Crear un nuevo usuario Cliente usando el endpoint de usuarios
print("\n4. CREAR USUARIO CLIENTE (vía endpoint ABM)")
response = requests.post(f"{BASE_URL}/usuarios/", json={
    "email": "nuevo_cliente@mail.com",
    "contraseña": "password456",
    "confirmar_contraseña": "password456",
    "nombre": "María",
    "apellido": "González",
    "telefono": "1122334455",
    "tipo_usuario": "Cliente"
})
print_response("POST /usuarios/ (Cliente)", response)
if response.status_code == 201:
    nuevo_cliente_id = response.json()['usuario']['id']
else:
    nuevo_cliente_id = None

# 5. Intentar crear un Admin SIN ser Admin (debe fallar)
print("\n5. INTENTAR CREAR ADMIN SIN PERMISO (debe fallar)")
response = requests.post(f"{BASE_URL}/usuarios/", json={
    "email": "admin_no_autorizado@mail.com",
    "contraseña": "admin456",
    "confirmar_contraseña": "admin456",
    "nombre": "Admin",
    "apellido": "No Autorizado",
    "tipo_usuario": "Admin"
})
print_response("POST /usuarios/ (Admin sin permisos)", response)

# 6. Crear un Admin SIENDO Admin (debe funcionar)
if admin_id:
    print("\n6. CREAR ADMIN CON PERMISO (siendo Admin)")
    response = requests.post(f"{BASE_URL}/usuarios/", json={
        "email": "admin2@mail.com",
        "contraseña": "admin789",
        "confirmar_contraseña": "admin789",
        "nombre": "Segundo",
        "apellido": "Admin",
        "tipo_usuario": "Admin",
        "usuario_actual_id": admin_id
    })
    print_response("POST /usuarios/ (Admin autorizado)", response)
    if response.status_code == 201:
        admin2_id = response.json()['usuario']['id']
    else:
        admin2_id = None

# 7. Obtener un usuario específico
if cliente_id:
    print(f"\n7. OBTENER USUARIO {cliente_id}")
    response = requests.get(f"{BASE_URL}/usuarios/{cliente_id}/")
    print_response(f"GET /usuarios/{cliente_id}/", response)

# 8. Actualizar datos de usuario
if nuevo_cliente_id:
    print(f"\n8. ACTUALIZAR USUARIO {nuevo_cliente_id}")
    response = requests.patch(f"{BASE_URL}/usuarios/{nuevo_cliente_id}/", json={
        "nombre": "María Actualizada",
        "telefono": "9988776655"
    })
    print_response(f"PATCH /usuarios/{nuevo_cliente_id}/", response)

# 9. Cambiar contraseña
if nuevo_cliente_id:
    print(f"\n9. CAMBIAR CONTRASEÑA {nuevo_cliente_id}")
    response = requests.post(f"{BASE_URL}/usuarios/{nuevo_cliente_id}/cambiar_contraseña/", json={
        "contraseña_actual": "password456",
        "contraseña_nueva": "newpassword789",
        "confirmar_contraseña": "newpassword789"
    })
    print_response(f"POST /usuarios/{nuevo_cliente_id}/cambiar_contraseña/", response)

# 10. Filtrar por activo
print("\n10. FILTRAR USUARIOS ACTIVOS")
response = requests.get(f"{BASE_URL}/usuarios/?activo=true")
print_response("GET /usuarios/?activo=true", response)

# 11. Filtrar por tipo de usuario
print("\n11. FILTRAR USUARIOS TIPO ADMIN")
response = requests.get(f"{BASE_URL}/usuarios/?tipo_usuario=admin")
print_response("GET /usuarios/?tipo_usuario=admin", response)

# 12. Buscar usuarios
print("\n12. BUSCAR USUARIOS (search=María)")
response = requests.get(f"{BASE_URL}/usuarios/?search=María")
print_response("GET /usuarios/?search=María", response)

# 13. Listar usuarios activos (custom endpoint)
print("\n13. LISTAR USUARIOS ACTIVOS (endpoint custom)")
response = requests.get(f"{BASE_URL}/usuarios/activos/")
print_response("GET /usuarios/activos/", response)

# 14. Desactivar un usuario (baja lógica)
if nuevo_cliente_id:
    print(f"\n14. DESACTIVAR USUARIO {nuevo_cliente_id}")
    response = requests.post(f"{BASE_URL}/usuarios/{nuevo_cliente_id}/desactivar/")
    print_response(f"POST /usuarios/{nuevo_cliente_id}/desactivar/", response)

# 15. Listar usuarios inactivos (custom endpoint)
print("\n15. LISTAR USUARIOS INACTIVOS (endpoint custom)")
response = requests.get(f"{BASE_URL}/usuarios/inactivos/")
print_response("GET /usuarios/inactivos/", response)

# 16. Activar un usuario
if nuevo_cliente_id:
    print(f"\n16. ACTIVAR USUARIO {nuevo_cliente_id}")
    response = requests.post(f"{BASE_URL}/usuarios/{nuevo_cliente_id}/activar/")
    print_response(f"POST /usuarios/{nuevo_cliente_id}/activar/", response)

# 17. Promover a Admin (siendo Admin)
if nuevo_cliente_id and admin_id:
    print(f"\n17. PROMOVER USUARIO {nuevo_cliente_id} A ADMIN")
    response = requests.post(f"{BASE_URL}/usuarios/{nuevo_cliente_id}/promover_admin/", json={
        "usuario_actual_id": admin_id
    })
    print_response(f"POST /usuarios/{nuevo_cliente_id}/promover_admin/", response)

# 18. Intentar promover sin ser Admin (debe fallar)
if cliente_id and nuevo_cliente_id:
    print(f"\n18. INTENTAR PROMOVER SIN SER ADMIN (debe fallar)")
    response = requests.post(f"{BASE_URL}/usuarios/{cliente_id}/promover_admin/", json={
        "usuario_actual_id": nuevo_cliente_id
    })
    print_response(f"POST /usuarios/{cliente_id}/promover_admin/ (sin permiso)", response)

# 19. DELETE con baja lógica
if nuevo_cliente_id:
    print(f"\n19. DELETE USUARIO {nuevo_cliente_id} (baja lógica)")
    response = requests.delete(f"{BASE_URL}/usuarios/{nuevo_cliente_id}/")
    print_response(f"DELETE /usuarios/{nuevo_cliente_id}/", response)

# 20. Verificar que el usuario está inactivo
if nuevo_cliente_id:
    print(f"\n20. VERIFICAR USUARIO {nuevo_cliente_id} INACTIVO")
    response = requests.get(f"{BASE_URL}/usuarios/{nuevo_cliente_id}/")
    print_response(f"GET /usuarios/{nuevo_cliente_id}/ (verificar inactivo)", response)

print("\n" + "="*60)
print("TESTS COMPLETADOS")
print("="*60)
