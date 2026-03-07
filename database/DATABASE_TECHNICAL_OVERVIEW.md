# Resumen Técnico de la Base de Datos

Este documento describe la arquitectura, esquema y especificaciones técnicas de la base de datos de GoodPawies, implementada en **MySQL**.

## 1. Diseño del Esquema

El esquema utiliza un modelo relacional normalizado (3NF en su mayoría) para optimizar la integridad y reducir la redundancia.

### 1.1. Tablas Principales (Core Entities)
*   **`users`**: Tabla maestra de identidades.
    *   Clave primaria: `id` (INT AUTO_INCREMENT).
    *   Constraints: `s_username` (UNIQUE).
    *   Seguridad: `s_password_hash` almacena hashes (Argon2/Bcrypt), no texto plano.
*   **`pets`**: Tabla central del negocio.
    *   Relación: N:1 con `users` (campo `userid`).
    *   Evolución: Originalmente básica, extendida por `enhanced_pets_setup.sql` para incluir bio-datos (`n_age`, `s_color`, `b_vaccinated`).

### 1.2. Tablas de Diccionario (Lookup Tables)
Se utilizan para estandarizar valores y alimentar dropdowns en el frontend.
*   **`pets_types`**: (Perro, Gato, Ave...).
*   **`pets_breed`**: Relacionada con `pets_types` (1:N). Define razas específicas por tipo.
*   **`pets_gender` / `pets_size`**: Catálogos estáticos para normalizar atributos físicos.

### 1.3. Tablas de Seguridad (Auth System)
Implementadas en `enhanced_auth_setup.sql` para soportar seguridad moderna.
*   **`refresh_tokens`**: Almacena tokens de larga duración con hash (`token_hash`), expiración y metadatos de usuario (IP, User-Agent).
*   **`user_sessions`**: Gestión de sesiones activas.
*   **`login_attempts`**: Registro para rate-limiting y bloqueo de IPs (fuerza bruta).

## 2. Convenciones de Nomenclatura

La base de datos utiliza una variante de **Notación Húngara** simplificada en los prefijos de las columnas para indicar el tipo de dato:

*   **`s_`**: String/Varchar (ej. `s_username`, `s_petname`).
*   **`n_`**: Numeric/Int (ej. `n_age`).
*   **`b_`**: Bit/Boolean (ej. `b_active`, `b_vaccinated`).
*   **`dt_`**: DateTime/Timestamp (ej. `dt_created_at`).
*   **`id` / `*_id`**: Identificadores y Claves Foráneas.

## 3. Tipos de Datos Específicos

*   **Booleanos**: Se utiliza `BIT` (o `BIT(1)`). Una práctica común en esquemas SQL Server/MySQL para optimizar espacio, donde `1` = true y `0` = false.
*   **Fechas**: `TIMESTAMP`.
    *   Configuración automática: `DEFAULT CURRENT_TIMESTAMP`.
    *   Configuración de actualización: `ON UPDATE CURRENT_TIMESTAMP` para campos `dt_updated_at`.
*   **Claves Primarias**: `INT AUTO_INCREMENT`.
*   **Imágenes**: Referencias `VARCHAR` (ids/paths) a un sistema de almacenamiento de archivos (no BLOBs en DB).

## 4. Integridad y Relaciones

El esquema impone integridad referencial fuerte a nivel de motor (InnoDB):

```sql
FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
```

*   **ON DELETE CASCADE**: Si un registro padre (User) se elimina, los hijos (Pets, Images, Tokens) se eliminan automáticamente. Esto simplifica la lógica de "Eliminar Cuenta" en el backend.
*   **ON UPDATE CASCADE**: Si un ID cambiara (raro en auto-increment, pero posible), las referencias se actualizan.

## 5. Índices y Rendimiento

Se han definido índices explícitamente para optimizar las consultas más frecuentes (JOINs y Búsquedas):

*   **Claves Foráneas**: `idx_pets_userid`, `idx_pets_images_petid`. Vitales para `JOIN` rápidos entre usuarios y mascotas.
*   **Búsqueda**: `idx_users_username` (Login rápido).
*   **Seguridad**: Índices en `token_hash` y `expires_at` para validación rápida de tokens sin full-table scans.
*   **Filtrado**: Índices en `s_type` y `s_breed` para facilitar búsquedas futuras en el catálogo.

## 6. Scripts de Migración/Setup

La base de datos está construida modularmente mediante scripts SQL ejecutables:
1.  `user_setup.sql`: Base legacy/core.
2.  `enhanced_pets_setup.sql`: Migración que añade campos médicos y tablas de atributos extendidos. Incluye "Guard clauses" para verificar existencia de tablas previas.
3.  `enhanced_auth_setup.sql`: Añade la capa de seguridad extra. Utiliza bloques `PREPARE stmt` para añadir columnas de forma condicional (idempotencia), simulando `ADD COLUMN IF NOT EXISTS`.
