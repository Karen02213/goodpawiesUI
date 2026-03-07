# Resumen de Negocio de la Base de Datos

Este documento explica cómo está organizada la información en GoodPawies (`database`). La base de datos es la memoria a largo plazo de la empresa, donde se guarda todo lo que importa.

## 1. Concepto Fundamental: Relacional

La base de datos utiliza un modelo **Relacional** (MySQL). Esto significa que la información está organizada en tablas conectadas entre sí, no como documentos sueltos.
*   **Por qué es importante para el negocio**: Garantiza la integridad de los datos. No puede existir una "Mascota" sin un "Dueño" válido. Si un usuario se da de baja, el sistema sabe exactamente qué datos relacionados limpiar.

## 2. Áreas de Información (Dominios de Datos)

### 2.1. Dominio de Usuarios (`users`, `user_info`)
Almacena todo lo relativo a las personas que usan la plataforma.
*   **Identidad**: Nombre, Apellidos, Email, Teléfono.
*   **Seguridad Mejorada**: Tablas especiales (`login_attempts`, `refresh_tokens`) rastrean intentos de acceso y sesiones activas para detectar hackers o accesos no autorizados.
*   **Verificación**: Campos como `email_verified` permiten al negocio saber qué usuarios son reales y confiables.

### 2.2. Dominio de Mascotas (`pets`, `pets_images`)
El activo más importante del negocio.
*   **Expediente Completo**: No solo guarda el nombre y la raza. La tabla `pets` evolucionó (`enhanced_pets_setup.sql`) para incluir datos críticos de salud y logística:
    *   **Salud**: `b_vaccinated`, `b_sterilized`. Clave para saber si la mascota es segura o requiere cuidados especiales.
    *   **Físico**: `s_gender`, `s_size`. Ayuda a quien la encuentra a confirmar que es la mascota correcta.
*   **Catálogos Maestros**: Tablas auxiliares (`pets_types`, `pets_breed`) definen qué tipos de animales acepta el sistema (Perros, Gatos, etc.). Esto permite al negocio controlar la expansión a nuevas especies en el futuro sin romper el código.

### 2.3. Dominio Multimedia (`*_images`)
*   Se separa la información de texto de las imágenes (fotos de perfil).
*   Esto permite que en el futuro una mascota pueda tener una galería de fotos (historial de crecimiento) sin afectar el rendimiento de la búsqueda rápida de datos básicos.

## 3. Reglas de Negocio en Datos

### 3.1. Auditoría Automática
Casi todas las tablas tienen campos `dt_created_at` (cuándo se creó) y `dt_updated_at` (cuándo se modificó por última vez).
*   **Valor**: Permite al negocio responder preguntas como "¿Cuántos usuarios nuevos tuvimos la semana pasada?" o "¿Cuándo fue la última vez que este usuario actualizó la foto de su perro?".

### 3.2. Soft Delete (Borrado Lógico)
El campo `b_active` (bit activo) actúa como un interruptor.
*   Cuando un usuario "borra" una mascota, en realidad solo se apaga este interruptor.
*   **Valor**: Permite recuperar datos borrados por error y mantiene el histórico para análisis de datos, sin perder la referencia inmediata.

### 3.3. Integridad Referencial (Cascada)
Las reglas `ON DELETE CASCADE` significan que si se elimina un usuario del sistema (por ejemplo, por solicitud de GDPR), la base de datos elimina automáticamente y de forma segura todas sus mascotas, fotos y sesiones asociadas, garantizando que no queden "datos fantasma" o huérfanos.

## 4. Evolución del Modelo

El sistema ha pasado por una mejora significativa ("Enhanced Setup").
*   Inicialmente (`user_setup.sql`) solo guardaba datos básicos.
*   La versión actual (`enhanced_pets_setup.sql`) soporta un modelo de negocio más maduro, listo para funcionalidades premium como alertas médicas o filtrado avanzado de mascotas.

## 5. Diccionario de Negocio (Detalle por Tabla)

A continuación, se detalla el propósito de negocio de cada una de las tablas clave del sistema (reflejadas en el diagrama principal de la arquitectura), el tipo de cada atributo, por qué tienen ese valor y cómo se relacionan estratégicamente:

### 5.1. Módulo Core de Usuarios
*   **`users`**: Es la tabla maestra del sistema. Representa al "Dueño" o usuario registrado.
    *   **Atributos clave**: 
        *   `id [int(11)]`: Identificador único universal del usuario. Es el ancla de todo el sistema.
        *   `s_username [varchar(30)]`: Nombre de usuario único, para fines de display e inicio de sesión.
        *   `s_phone_prefix [varchar(5)]` y `s_phone_number [varchar(10)]`: Dividir el número (ej. +52 y 5512345678) permite escalar el producto a diferentes países fácilmente y estructurar SMS automatizados sin errores de formato. El número telefónico utiliza especificamente `varchar` (texto) en lugar de un tipo numérico (como `INT`) porque los números telefónicos no son valores matemáticos con los que se harán operaciones (no vas a sumar o restar teléfonos). Además, un tipo entero recortaría los ceros a la izquierda (ej. "055" se convertiría en un incorrecto "55") y traería límites de tamaño para teléfonos largos dependiendo del tipo de entero en MySQL.
        *   `s_password_hash [varchar(300)]`: Fundamental para cumplimiento legal; usa 300 caracteres para asegurar espacio suficiente para encriptaciones pesadas. En el sistema actual, la contraseña original escrita por el usuario se procesa utilizando **Argon2** (el algoritmo estándar de la industria). Se usa su variante `argon2id` configurada con un alto costo de memoria (64MB) y tiempo de procesamiento, lo que la hace extremadamente resistente a ataques por hardware y fuerza bruta. Esta abstracción salva a la empresa de cualquier implicación legal o filtración.
        *   `two_factor_secret [varchar(32)]` y `two_factor_enabled [tinyint(1)]`: Sistema preparado para soportar MFA/2FA (Autenticación de Dos Factores). Este "secreto" de 32 caracteres actúa como una llave semilla para sincronizarse con aplicaciones como Authy o Google Authenticator. Su existencia es una característica de seguridad avanzada vital para negocio: evita que un atacante vulnere el perfil de alguien si la contraseña fuera robada.
        *   `s_email [varchar(50)]`, `s_full_name [varchar(30)]`, `s_full_surname [varchar(30)]`, `s_city [varchar(100)]`: Datos de contacto y demográficos del dueño.
        *   Atributos de estado y seguridad (`email_verified [tinyint(1)]`, `phone_verified [tinyint(1)]`): Banderas booleanas (0/1) que dictan si un usuario es "real" confirmando sus datos de contacto.
        *   Atributos de auditoría de acceso (`failed_login_attempts [int(11)]`, `account_locked [tinyint(1)]`, `lock_until [timestamp]`): Un requerimiento de negocio para cumplir con protocolos de seguridad antibots. Si un usuario falla la clave muchas veces, la cuenta se bloquea hasta la fecha `lock_until`.
        *   `last_login [timestamp]` y `password_changed_at [timestamp]`: Auditoría temporal. El valor `last_login` guarda el sello de tiempo (fecha y hora exacta) de la última entrada exitosa al sistema. A nivel de negocio, esto es totalmente distinto al estado de la cuenta; sirve estrictamente para medir la participación (frecuencia con la que alguien usa la app) y realizar estrategias de retargeting de mercadotecnia (ej. "Te extrañamos, regresa a usar la app" si pasan meses sin arranques de sesión). Específicamente, `password_changed_at` se utiliza como mecanismo de seguridad (revocación forzosa de sesiones). Si este campo registra un cambio reciente de contraseña, el sistema puede programarse para hacer caducar e invalidar inmediatamente todos los accesos previos registrados desde cualquier otro dispositivo (Tokens) o computadoras, protegiendo al usuario en caso de estar cambiando su contraseña tras sospechas de un robo de dispositivo o hackeo.
        *   Campos base (`dt_created_at`, `dt_updated_at`, `b_active`): Auditoría presente en casi todas las tablas. El campo **`b_active [bit]` (Borrado Lógico)** es el interruptor maestro de existencia. A diferencia de `last_login` (que es solo una fecha del último uso de un usuario existente), `b_active` define si la entidad sigue estando viva/vigente en el sistema o fue "eliminada". En bases de datos corporativas nunca se destruye la información y por eso si un usuario o mascota es "eliminado" en la aplicación, simplemente se cambia este bit de `1` (Verdadero) a `0` (Falso). El sistema deja de mostrarlo en pantalla, pero la empresa no pierde su histórico.
    *   **Relaciones**: Es el "centro de la estrella". Casi todas las tablas derivan de este `id` (`userid` en otras tablas).
*   **`user_info`**: Una "extensión" del usuario que almacena datos descriptivos.
    *   **Atributos clave**: 
        *   `userid [int(11)]`: Foránea a la tabla users.
        *   `s_description [varchar(200)]`: Pequeña biografía del dueño (ej. "Trabajo de noche, envíame WhatsApp"). Está separada en esta tabla para optimizar la velocidad y que `users` se mantenga liviana para los inicios de sesión.
    *   **Relaciones**: Relación de dependencia 1:1 con `users` a través de `userid`.
*   **`user_images`**: El componente visual del dueño de la mascota.
    *   **Atributos clave**: 
        *   `userid [int(11)]`: Foránea a la tabla users.
        *   `image_id [varchar(255)]`: Este campo **NO** guarda la fotografía en sí misma (el archivo binario no está en la base de datos). En su lugar, guarda únicamente un "apuntador" (el nombre único del archivo, por ejemplo `f7a9b2_perrito.jpg`). El archivo físico pesado se almacena en el disco duro del servidor (en la carpeta `server/uploads/users/`) o potencialmente en un sistema de nube económico como AWS S3. Esta decisión arquitectónica ahorra miles de dólares a la empresa, ya que el almacenamiento en disco es inmensamente más barato que el almacenamiento dentro de una base de datos de alta velocidad, y evita que la base de datos se vuelva lenta por procesar imágenes pesadas.
    *   **Relaciones**: Apunta al `userid`. Si el usuario borra su cuenta, esta estructura se borra en cascada.

### 5.2. Módulo de Autenticación
Este módulo es el que permite que GoodPawies sea seguro frente a los usuarios y atacantes. La existencia separada (y complementaria) de `user_sessions` y `cookies` responde a una madurez de negocio:

*   **`user_sessions`**: Representa un "inicio de sesión activo" del lado del sistema (Servidor). La necesito porque centraliza la autoridad de quién está conectado.
    *   **Atributos clave**: 
        *   `userid [int(11)]`: Foránea a la tabla users.
        *   `session_id [varchar(128)]`, `expires_at [timestamp]`: Mantiene la sesión viva en la memoria del servidor para saber en tiempo real quién está conectado. Este `session_id` no es una llave foránea, sino un código que actúa como puente de confianza con el navegador del usuario.
        *   `ip_address [varchar(45)]` y `user_agent [varchar(500)]`: Herramientas vitales de seguridad y analítica:
            *   **`ip_address`**: Detecta fraudes (ej. si una cuenta de México inicia sesión de repente desde Rusia, el sistema genera alertas) y permite banear (bloquear) a atacantes maliciosos. Usa 45 caracteres para soportar las direcciones largas del estándar IPv6.
            *   **`user_agent`**: Es el "identificador del dispositivo" (ej. "Safari en iPhone 13" o "Chrome en Windows"). En seguridad, permite mostrarle al dueño en su pantalla una lista de sus "Dispositivos Conectados" para que expulse aparatos extraños. A nivel negocio, le dice a modo de estadística a los dueños de GoodPawies si sus clientes usan más celular o computadora, indicando dónde invertir presupuesto de desarrollo. Usa `varchar(500)` porque estos identificadores enviados por las marcas suelen ser cadenas de texto excesivamente largas.
        *   `is_active [tinyint(1)]`: Permite revocar sesiones remotamente. Si te roban tu celular, puedes entrar desde una computadora, solicitar a la base de datos que cambie esta bandera a `0`, e instantáneamente el ladrón que tiene tu teléfono perderá el acceso a la cuenta (Kick-out).
*   **`cookies`**: Representa la "permanencia" del lado del navegador del usuario (Cliente). La necesito para no arruinar la experiencia del usuario interrumpiendo su uso.
    *   **Atributos clave**: 
        *   `userid [int(11)]`: Foránea a la tabla users.
        *   `s_cookie_value [varchar(255)]` y `dt_expires_at [timestamp]`: El campo `s_cookie_value` contiene un **Token de Persistencia ("Remember Me")**, que es una cadena de texto larga, aleatoria y encriptada (ej. `j8f9s2a...`). Es crucial entender que **NO** contiene la contraseña del usuario ni sus datos personales. Funciona como un "Pase VIP temporal". Si un usuario cierra la pestaña y la vuelve a abrir 1 hora después, el navegador envía este valor al servidor. El servidor lo busca en esta tabla, comprueba que le pertenece al usuario y que su fecha `dt_expires_at` (caducidad) sigue vigente, dejándolo pasar sin pedir usuario y contraseña. Garantiza retención y una experiencia fluida. No son alternativas, sesiones y cookies conviven y se leen mutuamente para asegurar la plataforma de inicio a fin.

### 5.3. Módulo Central de Mascotas (Producto Principal)
*   **`pets`**: El inventario vital de GoodPawies. Representa el "Perfil de la Mascota" que saldrá al escanear un QR.
    *   **Atributos clave**:
        *   `userid [int(11)]`: Vincula la propiedad de la mascota a un usuario.
        *   Textos para visualización básica (`s_petname [varchar(30)]`, `s_type [varchar(30)]`, `s_breed [varchar(30)]`, `s_color [varchar(50)]`, `s_age [varchar(20)]`, `s_gender [varchar(20)]`, `s_size [varchar(10)]`). 
            *   **¿Por qué no usar Llaves Foráneas (ID) para el tipo, raza y color?** Es una técnica llamada *Desnormalización intencional*. Las tablas de catálogos (`pets_types`, `pets_breed`) se usan exclusivamente en el Frontend para llenar las listas desplegables cuando el usuario registra a la mascota. Sin embargo, al guardar, la base de datos almacena el texto directo (`varchar`) en la tabla `pets` por tres motivos de negocio clave:
                1. **Velocidad de Lectura (Escaneo QR):** Cuando alguien en la calle escanea el QR en una emergencia, el servidor debe responder en milisegundos. Al tener el texto ya guardado en la tabla `pets`, el sistema hace una sola búsqueda simple. Si utilizara IDs, la base de datos tendría que hacer ensamblajes complejos (múltiples `JOINs`) recorriendo 4 tablas distintas para saber que el ID 2 significa "Perro" y el ID 15 significa "Pug", haciendo el escaneo más lento.
                2. **Protección Histórica (Snapshot):** Si en el futuro el administrador del sistema decide borrar la raza "Mestizo" del catálogo o cambiarle el nombre a "Cruza", las mascotas que ya fueron registradas bajo ese término no perderán su información ni se romperán, porque su expediente guardó una "fotografía" del texto en su momento.
                3. **Flexibilidad:** Permite que, si la mascota tiene una raza exótica que no está en el catálogo, el sistema pueda aceptar un texto personalizado ingresado manualmente por el dueño sin ensuciar los catálogos principales.
        *   `s_description [text]`: Un campo más grande que el anterior, en caso de necesitar incluir cuidados especiales largos (ej. "La comida no tiene que tener granos...").
        *   Banderas médicas (`b_vaccinated [bit(1)]`, `b_sterilized [bit(1)]`): Se usan "bits" porque solo admiten Verdadero/Falso (1 o 0). Son el corazón de la utilidad médica del sistema ante emergencias.
    *   **Relaciones**: Nace de `users`. Si se borra el usuario se borran a sus mascotas (Borrado en Cascada).
*   **`pets_images`**: La capa probatoria visual de la mascota.
    *   **Atributos clave**: 
        *   `petid [int(11)]`: Foránea a `pets`.
        *   `image_id [varchar(255)]`: Funciona exactamente igual que en usuarios; guarda texto con el nombre único del archivo almacenado físicamente en la carpeta `server/uploads/pets/`. El tamaño `(255)` de largo garantiza que haya espacio si en el futuro migran a servidores remotos guardando URLs completas (`https://aws.amazon...`).
    *   **Relaciones**: Apunta a `petid` (ID de la mascota), no al dueño. Esto permite arquitectónicamente que una mascota pueda ser adoptada por otro usuario (`userid` nuevo en la tabla `pets`) y las fotos migrarán intactas con la mascota.

### 5.4. Módulo de Catálogos / Diccionarios de Datos
El beneficio para el negocio es forzar la entrada estandarizada en los formularios del usuario final (frontend), haciendo los datos limpios y aptos para analítica al no dejar espacios para ambigüedades.
*   **`pets_types`**: Lista las especies (Perro, Gato, Ave). Atributo `s_type [varchar(30)]`. 
*   **`pets_breed`**: Depende estrictamente de `pets_types`. 
    *   **Atributos clave**: `id_type [int(11)]` y `s_breed [varchar(30)]`. 
    *   **Por qué**: Al estar atado a `id_type`, a nivel UI ("Frontend") permite hacer un "Cascading Dropdown" dinámico: si escogiste "Perro", la lista de razas carga solo registros conectados al tipo Perro (id: 1).
*   **`pets_size`**: Define las tallas fijas de la plataforma.
    *   **Atributos clave**: `s_size_code [varchar(10)]` es el código computacional corto y seguro usado internamente (ej: "sm"), y `s_size [varchar(20)]` es la representación amigable ("Pequeño/Small").
*   **`pets_gender`**: Define los sexos permitidos en un `s_gender [varchar(20)]` (ej: Hembra, Macho).
*   **`pets_color`**: Atributos `s_color [varchar(30)]` y `s_hex [varchar(10)]`. 
    *   **Por qué**: El `s_hex` anexa el código hexadecimal de diseño (`#000000`), decisión arquitectónica para que la Aplicación Web o Android dibuje UI de círculos coloridos en base de datos sin obligar a los programadores a codificar ("hardcodear") estilos cada que se agregue un color nuevo a la plataforma.
