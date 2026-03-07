# Resumen de Negocio del Cliente (Frontend)

Este documento describe la funcionalidad de la aplicación cliente (frontend) de **GoodPawies** desde una perspectiva de negocio. La aplicación actúa como la interfaz principal para que los dueños de mascotas gestionen sus perfiles y la seguridad de sus mascotas mediante códigos QR.

## 1. Visión General del Producto

GoodPawies es una plataforma diseñada para la identificación y seguridad de mascotas. El cliente web permite a los usuarios registrar sus mascotas y generar identificadores únicos (Códigos QR) que, al ser escaneados, dirigen a un perfil público de la mascota. Esto facilita la recuperación de mascotas perdidas y proporciona una gestión centralizada de la información de las mismas.

## 2. Actores y Roles

*   **Usuario Visitante (Guest)**: 
    *   Puede ver la página de inicio.
    *   Puede escanear un código QR de una mascota y ver su perfil público (información de contacto y detalles de la mascota) sin necesidad de iniciar sesión.
    *   Puede registrarse o iniciar sesión en la plataforma.
*   **Usuario Registrado (Dueño)**:
    *   Tiene acceso completo a las funciones de gestión.
    *   Puede registrar nuevas mascotas.
    *   Puede editar su perfil y el de sus mascotas.
    *   Puede generar, personalizar y descargar los códigos QR para sus mascotas.

## 3. Flujos de Negocio Principales

### 3.1. Autenticación y Seguridad
*   **Registro**: Los usuarios crean una cuenta proporcionando información básica.
*   **Inicio de Sesión**: Acceso seguro a su panel de control.
*   **Rutas Protegidas**: El sistema asegura que solo los usuarios autenticados puedan acceder a las funciones de gestión (`/perfil`, `/agregar-mascota`, etc.). Si un usuario intenta acceder sin sesión, es redirigido.

### 3.2. Gestión de Mascotas (Pet Management)
El núcleo del valor para el usuario registrado. Permite digitalizar la información de sus mascotas.
*   **Registro de Mascota**: Se recopilan datos exhaustivos para la identificación precisa:
    *   Datos básicos: Nombre, Tipo, Raza, Color, Edad, Género, Tamaño.
    *   Datos médicos: Estado de vacunación, Esterilización.
    *   Descripción: Una sección para detalles únicos o historias sobre la mascota.
    *   Validación: El sistema valida la coherencia de los datos (ej. raza coincide con tipo de mascota) mediante menús desplegables dinámicos.

### 3.3. Sistema de Identificación QR (Safety Feature)
Esta es la característica diferenciadora de seguridad.
*   **Generación de QR**: Cada mascota registrada tiene un código QR único asociado.
*   **Enlace Inteligente**: El QR codifica una URL directa al perfil público de la mascota (ej. `goodpawies.com/pet/{id}`).
*   **Personalización**: Los dueños pueden personalizar el diseño del QR (colores, formas) para que coincida con la estética deseada antes de imprimirlo o usarlo en una placa.
*   **Uso Práctico**: El QR está pensado para ser colocado en el collar de la mascota. En caso de pérdida, quien la encuentre puede escanearlo y obtener información inmediata.

### 3.4. Perfil Público de la Mascota
La página de aterrizaje para quien escanea el QR.
*   **Accesibilidad**: Es pública, no requiere login.
*   **Información Visible**: Muestra la foto, nombre, raza y detalles importantes para identificar y cuidar a la mascota temporalmente.
*   **Propósito**: Facilitar el reencuentro entre la mascota y su dueño.

## 4. Estructura de Navegación

*   **Pública**:
    *   `/`: Home (Landing page).
    *   `/login`, `/registrarse`: Acceso.
    *   `/pet/:petid`: Perfil público de mascota (Destino del QR).
*   **Privada (Requiere Autenticación)**:
    *   `/perfil`: Panel principal del usuario.
    *   `/profile/:uid/pet/:petid`: Detalle y edición de mascota.
    *   `/profile/:uid/pet/:petid/qr`: Generador y visualizador de QR específico.
    *   `/register/pet`: Formulario de alta de mascota.

## 5. Experiencia de Usuario (UX)
*   **Manejo de Errores**: El sistema cuenta con un manejo robusto de errores (Contexto de Error y Modales) para informar al usuario amigablemente si algo falla (ej. mascota no encontrada, problemas de conexión).
*   **Responsive**: Diseño adaptado para ser escaneado y visto en dispositivos móviles (caso de uso principal al encontrar una mascota en la calle).
