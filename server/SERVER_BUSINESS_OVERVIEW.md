# Resumen de Negocio del Servidor (Backend)

Este documento explica las funciones del servidor de GoodPawies desde una perspectiva de negocio. Mientras que el "Cliente" es lo que los usuarios ven, el "Servidor" es el cerebro y el guardián que procesa la información, asegura los datos y hace cumplir las reglas del negocio.

## 1. Misión Principal del Servidor

El servidor de GoodPawies tiene tres responsabilidades fundamentales para el negocio:
1.  **Custodia de Datos**: Es la única fuente de verdad para la información de usuarios y mascotas.
2.  **Seguridad y Control de Acceso**: Decide quién puede ver o modificar qué información.
3.  **Lógica de Negocio Central**: Ejecuta las reglas que definen cómo funciona la plataforma (ej. "solo el dueño puede editar a su mascota").

## 2. Capacidades de Negocio (Business Capabilities)

### 2.1. Gestión de Identidad y Acceso (IAM)
El servidor gestiona la puerta de entrada a la plataforma.
*   **Seguridad de Usuarios**: Protege las cuentas mediante encriptación de contraseñas y manejo de sesiones seguras.
*   **Prevención de Fraude/Abuso**: Detecta y bloquea intentos de acceso sospechosos o ataques de fuerza bruta (intentar muchas contraseñas rápidamente).
*   **Roles**: Distingue entre un usuario normal y un administrador, otorgando permisos especiales si fuera necesario.

### 2.2. Ciclo de Vida de las Mascotas
El servidor administra todo el inventario de mascotas registradas.
*   **Registro Oficial**: Cuando un usuario registra una mascota, el servidor valida que los datos sean coherentes (ej. que la fecha de nacimiento sea válida) antes de guardarlos permanentemente.
*   **Registro Mejorado ("Enhanced")**: Soporta un perfil rico en datos (vacunas, esterilización, descripción) que añade valor al producto final (el perfil QR).
*   **Vinculación**: Mantiene la relación estricta entre "Dueño" y "Mascota".

### 2.3. Sistema de Privacidad y Propiedad
Una regla de negocio crítica que el servidor hace cumplir rigurosamente.
*   **Protección de Datos Privados**: Asegura que el perfil público de una mascota muestre solo la información necesaria para recuperarla, protegiendo datos sensibles del usuario.
*   **Control de Edición**: El servidor rechaza inmediatamente cualquier intento de modificar una mascota si la solicitud no proviene de su dueño legítimo. Esto evita sabotajes o errores malintencionados.

### 2.4. Soporte para Tecnología QR
Aunque el cliente dibuja el código QR, el servidor valida la lógica detrás de él.
*   **Generación de Recursos**: Puede generar versiones estáticas de los códigos QR para que los usuarios puedan descargarlos e imprimirlos en alta calidad.
*   **Resolución de Enlaces**: Asegura que el enlace codificado en el QR (`/pet/:id`) siempre corresponda a un registro válido en base de datos.

## 3. Auditoría y Análisis
El servidor no solo procesa datos, sino que observa cómo se usa la plataforma.
*   **Registro de Actividad (Logs)**: Cada acción importante (registrar una mascota, iniciar sesión) queda registrada. Esto es vital para:
    *   Resolver disputas o problemas de soporte.
    *   Entender métricas de uso (ej. "¿A qué hora se registran más mascotas?").
    *   Cumplimiento normativo y seguridad.

## 4. API como Producto
El servidor expone sus funciones a través de una API (Interfaz de Programación de Aplicaciones).
*   Esto permite que en el futuro, además de la página web actual (Web Client), GoodPawies pueda desarrollar fácilmente una **App Móvil (iOS/Android)** que se conecte al mismo servidor sin tener que reescribir la lógica de negocio.
