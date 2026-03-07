# Resumen Técnico del Servidor (Backend)

Este documento detalla la arquitectura, tecnologías y patrones de diseño utilizados en el servidor de GoodPawies (`/server`).

## 1. Stack Tecnológico

*   **Runtime**: `Node.js`.
*   **Framework Web**: `Express.js` (v5.0+, versión moderna).
*   **Base de Datos**: `MySQL` (interactuando mediante `mysql2` con soporte de Promesas/Pool).
*   **Seguridad**:
    *   `helmet`: Cabeceras HTTP seguras.
    *   `cors`: Control de acceso de recursos cruzados (permitiendo `localhost:3000` y `goodpawies.local`).
    *   `argon2` / `bcrypt`: Hashing de contraseñas.
    *   `express-rate-limit`: Protección contra fuerza bruta/DDoS a nivel de API.
*   **Logging**: `winston` y `winston-daily-rotate-file` para bitácoras estructuradas y rotación de archivos.
*   **Validación**: `express-validator` para saneamiento y validación de entradas.

## 2. Arquitectura de Carpetas

La estructura sigue un diseño en capas (Layered Architecture) para separar responsabilidades:

*   `routes/`: Definición de endpoints y enrutamiento (`auth`, `users`, `pets`, `qr`).
*   `middleware/`: Funciones intermedias para validación, autenticación y seguridad (`auth.js`, `rateLimiting.js`).
*   `db/`: Capa de acceso a datos (DAL).
    *   `index.js`: Configuración del Pool de conexiones.
    *   `*Queries.js`: Consultas SQL crudas separadas por dominio (evita ORMs pesados para mayor control).
*   `utils/`: Herramientas transversales (`logger`, `response`, `errors`).

## 3. Patrones de Diseño de Base de Datos

### 3.1. Gestión de Conexiones
Se utiliza un **Connection Pool** (`mysql.createPool`) configurado en `server/db/index.js`. Esto permite reutilizar conexiones abiertas, mejorando significativamente el rendimiento bajo carga.

### 3.2. Estrategias de Transacción
El módulo de base de datos implementa abstracciones para dos tipos de operaciones críticas:

*   **`executeWithNoLock`**:
    *   Establece `SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED`.
    *   Utilizado para lecturas rápidas donde la consistencia estricta instantánea no es crítica (ej. chequeos de salud, listados públicos masivos), evitando bloqueos innecesarios en la BD.
*   **`executeTransaction`**:
    *   Maneja transacciones ACID completas (`BEGIN`, `COMMIT`, `ROLLBACK`).
    *   Utilizado para escrituras críticas que involucran múltiples tablas (ej. registrar usuario + crear perfil inicial).

## 4. Seguridad y Middleware

### 4.1. Rate Limiting
Todo el prefijo `/api` está protegido por `apiRateLimiter`. Esto previene el abuso de la API limitando el número de peticiones por IP en un intervalo de tiempo.

### 4.2. Autenticación JWT / Cookies
Aunque el código muestra manejo de `Authorization` header, también se configura `cookieParser`, lo que sugiere capacidad para manejar sesiones híbridas o tokens en cookies `HttpOnly` para mayor seguridad.

### 4.3. Logging Estructurado
Se implementa un middleware global que intercepta el evento `finish` de la respuesta (`res.on('finish')`).
*   Registra: IP, Método, Ruta, Status Code, Duración (ms), User Agent, y ID de usuario (si está autenticado).
*   Formato JSON para fácil ingestión en sistemas de monitoreo (ELK, Splunk, etc.).

## 5. Manejo de Respuestas

Se utiliza un patrón estandarizado (`utils/response.js`) para todas las respuestas HTTP.
*   Garantiza que el frontend siempre reciba una estructura predecible: `success: true/false`, `data: {}` o `error: { code, message }`.
*   Esto desacopla la lógica de negocio de la estructura de transporte HTTP.

## 6. Endpoints Principales

*   `/api/auth`: Login, registro, renovación de tokens.
*   `/api/users`: Gestión de perfil de usuario.
*   `/api/pets`: CRUD de mascotas. Lógica principal del negocio.
*   `/api/qr`: Endpoints específicos para la gestión lógica de los códigos QR (aunque la generación visual se haga en el cliente, el servidor valida y asocia los datos).
