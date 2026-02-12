# Manual de Usuario - Suchus Copy & Design

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Acceso al Sistema](#acceso-al-sistema)
4. [Registro de Usuario](#registro-de-usuario)
5. [Inicio de Sesión](#inicio-de-sesión)
6. [Navegación en la Página Principal](#navegación-en-la-página-principal)
7. [Realizar Pedidos](#realizar-pedidos)
8. [Gestión de Pedidos](#gestión-de-pedidos)
9. [Perfil de Usuario](#perfil-de-usuario)
10. [Panel de Administración](#panel-de-administración)
11. [Preguntas Frecuentes](#preguntas-frecuentes)
12. [Contacto y Soporte](#contacto-y-soporte)

---

## Introducción

**Suchus Copy & Design** es un sistema web diseñado para facilitar la gestión de pedidos de impresión y papelería. Permite a los usuarios:

- Solicitar servicios de impresión (A4/A3, blanco y negro/color)
- Comprar productos de papelería
- Gestionar y hacer seguimiento de pedidos
- Recibir notificaciones por email sobre el estado de los pedidos
- Comunicarse mediante chatbot asistente

---

## Requisitos del Sistema

### Requisitos Mínimos:
- **Navegador Web**: Google Chrome, Firefox, Safari o Edge (versión actualizada)
- **Conexión a Internet**: Estable para cargar contenido y realizar pedidos
- **Resolución de Pantalla**: Mínimo 1024x768 píxeles (optimizado para móviles y tablets)

### Cuentas Requeridas:
- Dirección de email válida para registro y notificaciones

---

## Acceso al Sistema

### URL de Acceso:
Ingrese a la aplicación mediante la URL proporcionada por el administrador o acceda localmente a:
```
http://localhost:5173/
```

Al acceder por primera vez, visualizará la **Página Principal (Landing Page)** con información sobre los servicios disponibles.

---

## Registro de Usuario

### Pasos para Registrarse:

1. **Desde la Página Principal**, haga clic en el botón **"Realizar Pedido"** o navegue al menú superior y seleccione **"Hola, Juan Cruz"** (si no está logueado aparecerá un botón de Login).

2. En la página de inicio de sesión, haga clic en **"Registrarse"** o **"¿No tenés cuenta? Registrate"**.

3. Complete el formulario de registro con:
   - **Nombre completo**
   - **Email** (será su nombre de usuario)
   - **Contraseña** (mínimo 8 caracteres)
   - **Confirmar contraseña**

4. Acepte los **Términos y Condiciones**.

5. Haga clic en **"Registrarse"**.

6. Si el registro es exitoso, será redirigido automáticamente a la página de inicio de sesión.

### Consideraciones:
- El email debe ser único (no puede estar registrado previamente)
- La contraseña debe ser segura (se recomienda incluir letras, números y símbolos)
- Recibirá un email de confirmación en su casilla

---

## Inicio de Sesión

### Pasos para Iniciar Sesión:

1. Desde la página principal, haga clic en el menú superior derecho donde aparece su nombre o el botón de **Login**.

2. Ingrese sus credenciales:
   - **Email** (registrado previamente)
   - **Contraseña**

3. Haga clic en **"Iniciar Sesión"**.

4. Si las credenciales son correctas, será redirigido a la **Página de Inicio (Home)** con acceso completo al sistema.

### Recuperación de Contraseña:
Si olvidó su contraseña:
- Haga clic en **"¿Olvidaste tu contraseña?"**
- Ingrese su email registrado
- Recibirá instrucciones en su correo electrónico

### Cerrar Sesión:
Para cerrar sesión de forma segura:
1. Haga clic en su nombre en el menú superior derecho
2. Seleccione **"Cerrar Sesión"**
3. Será redirigido a la página principal

---

## Navegación en la Página Principal

La **Landing Page** presenta las siguientes secciones:

### 1. Barra de Navegación Superior
- **Logo y Nombre**: Haga clic para volver al inicio en cualquier momento
- **Servicios**: Acceso rápido a la sección de servicios ofrecidos
- **Productos**: Ver catálogo de productos de papelería
- **Pedidos**: Información sobre cómo realizar pedidos
- **Contacto**: Información de contacto y chatbot
- **Usuario**: Acceso a perfil, pedidos y cerrar sesión

### 2. Sección Hero (Banner Principal)
Presenta una imagen destacada con un botón **"Realizar Pedido"** que lo dirige a:
- **Página de Login** si no está autenticado
- **Página Home** si ya inició sesión

### 3. Sección de Servicios
Muestra los servicios principales:
- **Impresión**: Documentos en diversos formatos
- **Escaneo y Digitalización**: Conversión de documentos físicos a digitales
- **Plastificado y Encuadernado**: Protección y presentación profesional

### 4. Servicios de Impresión
Detalla las opciones disponibles:
- **A4 Blanco y Negro**: $50 por hoja
- **A4 Color**: $100 por hoja
- **A3 Blanco y Negro**: $150 por hoja
- **A3 Color**: $200 por hoja

### 5. Nuestros Productos
Muestra productos de papelería disponibles con precios.

### 6. Pasos para Realizar un Pedido
Explica el proceso en 3 pasos:
1. Registrarse
2. Subir archivos
3. Confirmar pedido

### 7. Contacto
Información de contacto:
- **Chatbot**: Asistente virtual disponible 24/7 (esquina inferior derecha)
- **Email**: contacto@suchuscopy.com
- **WhatsApp**: +54 9 221 123-4567
- **Teléfono**: 221-123-4567

---

## Realizar Pedidos

Una vez autenticado, puede realizar dos tipos de pedidos:

### A. Pedido de Impresión

1. **Acceder a Home**: Desde el menú superior, haga clic en **"Home"** o navegue a `/home`.

2. **Seleccionar Impresión**:
   - En la sección de impresiones, visualizará las tarjetas con las opciones disponibles
   - Cada tarjeta muestra: formato, tipo (B/N o Color), precio por hoja

3. **Cargar Archivo**:
   - Haga clic en **"Seleccionar archivo"** dentro de la tarjeta de impresión deseada
   - Busque el archivo PDF en su computadora
   - El sistema mostrará el nombre del archivo cargado

4. **Especificar Cantidad**:
   - Ingrese la cantidad de copias que desea
   - El sistema calculará automáticamente el precio total

5. **Agregar al Carrito**:
   - Haga clic en **"Agregar al Carrito"**
   - Visualizará una confirmación
   - El ícono del carrito en la barra superior mostrará la cantidad de ítems

6. **Repetir** si desea agregar más archivos o diferentes formatos

### B. Pedido de Productos de Papelería

1. **Visualizar Productos**:
   - En la sección de productos, verá las tarjetas con los artículos disponibles
   - Cada tarjeta muestra: nombre, precio unitario, stock disponible

2. **Seleccionar Cantidad**:
   - Use los botones **+/-** o ingrese directamente la cantidad deseada
   - El sistema no permitirá cantidades mayores al stock disponible

3. **Agregar al Carrito**:
   - Haga clic en **"Agregar al Carrito"**
   - El producto se añadirá a su carrito de compras

### C. Revisar y Confirmar Pedido

1. **Ir al Carrito**:
   - Haga clic en el ícono del carrito en la barra superior
   - Será redirigido a `/pedidos`

2. **Revisar Pedido**:
   - Visualice todos los ítems agregados
   - Verifique cantidades y precios
   - Puede eliminar ítems haciendo clic en el ícono de papelera

3. **Aplicar Descuento** (si aplica):
   - Los usuarios con descuento asignado verán el porcentaje aplicado automáticamente
   - El precio total reflejará el descuento

4. **Confirmar Pedido**:
   - Haga clic en **"Confirmar Pedido"**
   - El sistema generará el pedido y lo enviará al administrador
   - Recibirá un **email de confirmación** con los detalles

5. **Método de Pago**:
   - Los pagos se realizan al momento de retirar el pedido en la sucursal
   - Puede elegir entre efectivo, tarjeta de débito o crédito

---

## Gestión de Pedidos

### Ver Mis Pedidos

1. **Acceder a Mis Pedidos**:
   - Desde el menú superior, seleccione su nombre
   - Haga clic en **"Mis Pedidos"** o navegue a `/mis-pedidos`

2. **Visualizar Lista de Pedidos**:
   El sistema muestra todos sus pedidos con:
   - **Número de Pedido**
   - **Fecha de creación**
   - **Estado actual**
   - **Total a pagar**
   - **Botón de acciones**

### Estados de Pedidos

Los pedidos pasan por diferentes estados:

1. **Pendiente**: El pedido fue recibido y está en espera de revisión
2. **En Preparación**: El pedido está siendo procesado
3. **Listo para Retirar**: El pedido está completo y puede retirarlo
4. **Completado**: El pedido fue retirado y pagado
5. **Requiere Corrección**: El administrador solicita que revise o corrija el pedido
6. **Cancelado**: El pedido fue cancelado

### Notificaciones por Email

Recibirá emails automáticos cuando:
- Se crea un nuevo pedido
- El pedido cambia de estado
- El pedido requiere corrección (con motivo del administrador)
- El pedido está listo para retirar

### Ver Detalles del Pedido

1. Haga clic en el botón **"Ver Detalles"** del pedido
2. Visualizará:
   - Todos los ítems incluidos (impresiones y productos)
   - Archivos adjuntos (puede descargarlos)
   - Cantidades y precios
   - Subtotal, descuento aplicado y total
   - Historial de cambios de estado con fechas

### Descargar Archivos

Para descargar los archivos que subió en un pedido de impresión:
1. Entre a los detalles del pedido
2. Haga clic en el nombre del archivo o en el botón **"Descargar"**
3. El archivo se descargará a su computadora

---

## Perfil de Usuario

### Acceder al Perfil

1. Haga clic en su nombre en el menú superior derecho
2. Seleccione **"Mi Perfil"** o navegue a `/perfil`

### Información del Perfil

En su perfil puede visualizar:
- **Nombre completo**
- **Email**
- **Tipo de usuario** (Cliente o Admin)
- **Descuento asignado** (si aplica)

### Editar Información

Para modificar su información:
1. Haga clic en **"Editar Perfil"**
2. Modifique los campos que desee:
   - Nombre
   - Email (debe ser único)
3. Haga clic en **"Guardar Cambios"**

### Cambiar Contraseña

Para cambiar su contraseña:
1. En la sección de perfil, haga clic en **"Cambiar Contraseña"**
2. Ingrese:
   - Contraseña actual
   - Nueva contraseña
   - Confirmar nueva contraseña
3. Haga clic en **"Actualizar Contraseña"**

---

## Panel de Administración

*Esta sección es solo para usuarios con rol de **Administrador***

### Acceso al Panel

Si es administrador:
1. Haga clic en su nombre en el menú superior
2. Seleccione **"Panel de Admin"** o navegue a `/admin`

### Funcionalidades del Administrador

#### 1. Gestión de Usuarios (`/admin/usuarios`)
- Ver lista completa de usuarios registrados
- Filtrar por tipo (Admin, Cliente)
- Asignar descuentos personalizados a clientes
- Editar información de usuarios
- Activar/Desactivar usuarios

#### 2. Gestión de Productos (`/admin/productos`)
- Ver catálogo completo de productos
- Agregar nuevos productos de papelería
- Editar productos existentes (nombre, precio, stock)
- Activar/Desactivar productos
- Control de inventario

#### 3. Gestión de Pedidos (`/admin/pedidos`)
- Ver todos los pedidos del sistema
- Filtrar por estado (Pendiente, En Preparación, etc.)
- Cambiar estado de pedidos
- Ver detalles completos de cada pedido
- Descargar archivos adjuntos
- Solicitar correcciones (con motivo)
- Cancelar pedidos

**Flujo de Trabajo del Administrador para Pedidos:**

1. **Revisar Pedidos Pendientes**:
   - Filtre por estado "Pendiente"
   - Revise archivos y requisitos del cliente

2. **Cambiar a "En Preparación"**:
   - Una vez revisado, cambie el estado
   - El cliente recibirá notificación por email

3. **Solicitar Corrección** (si es necesario):
   - Si el archivo tiene problemas, seleccione "Requiere Corrección"
   - Ingrese el motivo detallado
   - El cliente será notificado por email

4. **Cambiar a "Listo para Retirar"**:
   - Cuando el pedido esté completado
   - El cliente recibirá notificación para retirar

5. **Marcar como "Completado"**:
   - Una vez el cliente retire y pague
   - Cierra el ciclo del pedido

#### 4. Gestión de Descuentos (`/admin/descuentos`)
- Asignar porcentajes de descuento a usuarios específicos
- Modificar descuentos existentes
- Eliminar descuentos

#### 5. Reportes (`/admin/reportes`)
- Generar reportes diarios de actividad
- Ver estadísticas de pedidos
- Exportar datos para análisis
- Resumen de ventas y productos más solicitados

---

## Preguntas Frecuentes

### ¿Cómo puedo recuperar mi contraseña?
En la página de login, haga clic en "¿Olvidaste tu contraseña?" e ingrese su email. Recibirá instrucciones para restablecerla.

### ¿Qué formatos de archivo acepta el sistema para impresión?
Actualmente el sistema acepta archivos **PDF**. Se recomienda convertir documentos de Word, Excel o PowerPoint a PDF antes de subirlos.

### ¿Cuál es el tamaño máximo de archivo que puedo subir?
El tamaño máximo permitido depende de la configuración del servidor. Como referencia general, se aceptan archivos de hasta 10MB.

### ¿Cuánto tiempo tarda en procesarse un pedido?
Los tiempos de procesamiento varían según la complejidad y volumen del pedido:
- Impresiones simples: 1-2 horas
- Pedidos grandes o encuadernados: 24-48 horas
- Recibirá notificaciones por email cuando su pedido esté listo

### ¿Puedo cancelar un pedido?
Puede solicitar la cancelación contactando al administrador mediante:
- Chatbot en la página principal
- Email: contacto@suchuscopy.com
- WhatsApp: +54 9 221 123-4567

### ¿Puedo modificar un pedido después de confirmarlo?
Si necesita modificar un pedido, contacte inmediatamente al administrador. Si el pedido aún no ha sido procesado, se podrá realizar el cambio.

### ¿Cómo se aplica mi descuento?
Si el administrador le asignó un descuento:
- Se aplicará automáticamente al confirmar el pedido
- Verá el descuento reflejado en el total antes de confirmar
- Aparece en los detalles del pedido

### ¿Dónde retiro mi pedido?
Los pedidos se retiran en la sucursal:
- Dirección: [Dirección de la sucursal]
- Horarios: [Horarios de atención]
- Al retirar, presente su número de pedido

### ¿Qué métodos de pago aceptan?
- Efectivo
- Tarjeta de débito
- Tarjeta de crédito
El pago se realiza al momento de retirar el pedido en la sucursal.

### No recibo emails del sistema, ¿qué hago?
Verifique:
1. La carpeta de **Spam** o **Correo no deseado**
2. Que su email esté correctamente escrito en el perfil
3. Contacte al administrador si el problema persiste

### ¿El sistema funciona en dispositivos móviles?
Sí, **Suchus Copy & Design** está optimizado para funcionar en:
- Computadoras de escritorio
- Tablets
- Smartphones
Puede realizar pedidos desde cualquier dispositivo con navegador web.

---

## Contacto y Soporte

### Canales de Atención

**Chatbot Inteligente**:
- Disponible 24/7 en la esquina inferior derecha de la página
- Responde preguntas frecuentes de forma automática
- Ideal para consultas rápidas

**Email**:
- contacto@suchuscopy.com
- Tiempo de respuesta: 24-48 horas

**WhatsApp**:
- +54 9 221 123-4567
- Horario de atención: Lunes a Viernes 9:00 - 18:00hs

**Teléfono**:
- 221-123-4567
- Horario de atención: Lunes a Viernes 9:00 - 18:00hs

### Soporte Técnico

Para problemas técnicos con el sistema:
- Describa el problema en detalle
- Incluya capturas de pantalla si es posible
- Mencione el navegador que está utilizando
- Envíe la información al email de soporte

---

## Información Adicional

### Política de Privacidad
Su información personal está protegida y solo se utiliza para:
- Procesar pedidos
- Enviar notificaciones sobre sus pedidos
- Mejorar el servicio

No compartimos su información con terceros.

### Términos y Condiciones
Al utilizar el sistema, usted acepta:
- Proporcionar información veraz y actualizada
- Utilizar el sistema de forma responsable
- No cargar contenido ilegal o inapropiado
- Retirar los pedidos en el plazo establecido

### Actualizaciones del Sistema
El sistema puede recibir actualizaciones periódicas para:
- Agregar nuevas funcionalidades
- Mejorar la seguridad
- Optimizar el rendimiento

Las actualizaciones importantes serán notificadas por email.

---

## Conclusión

Este manual cubre las funcionalidades principales de **Suchus Copy & Design**. Para cualquier duda o consulta adicional, no dude en contactarnos a través de los canales de atención disponibles.

¡Gracias por confiar en Suchus Copy & Design!

---

**Versión del Manual**: 1.0  
**Última actualización**: Febrero 2026  
**Sistema**: Suchus Copy & Design  
**Desarrollado por**: Equipo Suchus Development Team
