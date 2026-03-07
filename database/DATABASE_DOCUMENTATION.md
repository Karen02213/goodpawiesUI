# Documentación de la Base de Datos (Modelo Relacional)

Este documento detalla la arquitectura, el diseño relacional y las políticas de persistencia implementadas en la base de datos MySQL (o MariaDB) del proyecto **GoodPawies**.

---

## 1. Motor y Arquitectura Base
- **Sistema de Gestión de Bases de Datos (RDBMS):** MySQL / MariaDB.
- **Paradigma:** Base de datos Relacional (SQL) fuertemente tipada y normalizada (Tercera Forma Normal - 3NF).
- **Control de Concurrencia:** Integración con backend a través del módulo `mysql2` utilizando **Promise Pool Connections** para sostener múltiples conexiones asíncronas y eficientes sin sobrecargar la memoria.

---

## 2. Diagrama de Dominios (Entidades Principales)

El esquema de la base de datos se divide lógicamente en tres (3) dominios principales o contextos (Bounded Contexts): **Gestión de Usuarios**, **Ciclo de Vida de Mascotas (Catálogos y Registros)**, y **Seguridad Operativa**.

### Dominio 1: Usuarios (Gestión de Identidad)
Almacena el perfil público e inicio de sesión de los clientes (dueños de mascotas).
- **`users`**: Entidad central de autenticación. Guarda el identificador primario (ID), el correo electrónico (email), la contraseña fuertemente encriptada (con su respectivo Salt) y su estado (activo/inactivo, verificado).
- **`user_info`**: Entidad de extensión uno-a-uno (1:1) con `users`. Almacena datos demográficos que no son necesarios durante el inicio de sesión, como nombre, apellido y número telefónico.
- **`user_images`**: Tabla para gestionar los identificadores o URLs de los avatares e imágenes de perfil de los dueños.

### Dominio 2: Mascotas (Registro y Expediente Clínico)
Es el "Core" del modelo de negocio, donde recaen los historiales asociados a los dueños a través de relaciones de uno-a-muchos (1:N) donde un Usuario `tiene_muchas` Mascotas.
- **`pets`**: La entidad principal de negocio que alberga la información vital del animal: Nombre, fecha de nacimiento, peso actual y observaciones de salud (alergias o condiciones previas preexistentes). 
- **Tablas de Catálogo (Normalización)**:
    - **`pets_types`**: Catálogo paramétrico de la especie (ej. Perro, Gato, Ave).
    - **`pets_breed`**: Derivado del tipo, contiene el catálogo de la raza (ej. Pug, Border Collie, Siamés).
    - **`pets_gender`**: Define biológicamente o castrado el sexo de la mascota.
    - **`pets_size`**: Escala de volumetría del animal (Pequeño, Mediano, Grande).
- **`pets_images`**: Registra la fototeca evolutiva de cada mascota.

### Dominio 3: Seguridad Operativa y Anti-Fraude (Auth)
A causa de la naturaleza sensible que maneja el proyecto, existen tablas encargadas de limitar y resguardar intrusiones.
- **`user_sessions` / `refresh_tokens`**: Administra a detalle las sesiones activas en la SPA. Si alguien roba un token o cierra sesión remotamente, estas tablas permiten la revocación (Blacklisting) o renovación fluida segura.
- **`login_attempts`**: Registro vital de mitigación de ataques de "Fuerza Bruta". Cuenta los fallos en intentos de login. Si la suma excede el límite impuesto por el servidor, bloquea virtualmente a la cuenta.
- **`password_reset_tokens`**: Registro efímero de Pines (OTP) o tokens (UUID) autogenerados y con fecha de expiración para la validación del flujo de "Olvidé mi contraseña".

---

## 3. Relaciones y Llaves Foráneas (Foreign Keys)
La base de datos se mantiene íntegra bajo la aplicación estricta de restricciones de vinculación (`FOREIGN KEY` y sentencias transaccionales `ON DELETE CASCADE` / `RESTRICT`).

1. **Usuario - Mascota (`users` 1:N `pets`):**
   - Una mascota siempre debe tener el `user_id` de su dueño emparejado. 
   - *Regla de negocio SQL:* Si un usuario borra su cuenta, en cascada se eliminarán o derivarán sus mascotas (`ON DELETE CASCADE`).
2. **Mascotas - Catálogos (`pets` N:1 `pets_types`, `pets_sizes`...):**
   - Un registro en `pets` no aloja la palabra "Perro" de forma quemada o en "Hardcode" en la columna, en su lugar, aloja el ID estandarizado (Ej: `type_id = 1`) extraído de las tablas secundarias, mitigando errores ortográficos de inserción y permitiendo métricas escalables (Data Analytics).
3. **Usuario - Info (`users` 1:1 `user_info`):**
   - Garantiza que cargar las credenciales pesadas del usuario en memoria no extraiga su nombre y biografía hasta que el cliente SPA explícitamente demande procesar el "Perfil" del usuario completo a través de las sentencias SQL de tipo `JOIN`.

---

## 4. Políticas de Almacenamiento e Integridad
- **Saneamiento por Motor:** La base de datos asume que todo flujo entrante ha sido pre-sanitizado por los Middlewares de `express-validator` expuestos en Node.
- **Consultas Parametrizadas (Prepared Statements):** A nivel backend (`/server/db/*.js`), ninguna consulta inyecta variables nativas (como `SELECT * FROM users WHERE email = ${email}`). Todas se apoyan estrictamente de interpolación paramétrica (uso de `?`) por medio del driver `mysql2` para bloquear por defecto los intentos de **Inyección SQL (SQLi)**.
- **Manejo de Tiempos:** Uso implícito de variables de metadatos `created_at` (fecha de alta de la fila) y `updated_at` (fecha de la última modificación en la trama transaccional).