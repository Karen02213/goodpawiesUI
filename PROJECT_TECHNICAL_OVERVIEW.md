# Visión Técnica General del Proyecto (Full Stack)

Este documento detalla la arquitectura técnica global de **GoodPawies** y cómo se integran sus componentes principales: Cliente y Servidor.

## 1. Arquitectura del Sistema

El proyecto implementa una arquitectura **Cliente-Servidor (Client-Server)** desacoplada, soportada por una base de datos relacional y orquestada mediante contenedores.

```mermaid
graph LR
    Client[Cliente React (Puerto 3000)] <-->|JSON / HTTP| Proxy[Nginx Reverse Proxy (Puerto 80)]
    Proxy <-->|API Request| Server[Servidor Express (Puerto 5000)]
    Server <-->|SQL| Database[MariaDB Docker (Puerto 3306)]
```

### 1.1. Principios de Diseño
*   **Separación de Responsabilidades (SoC)**: El `client` maneja exclusivamente la presentación y experiencia de usuario, mientras que el `server` maneja la lógica de negocio, validación y persistencia.
*   **RESTful API**: La comunicación entre cliente y servidor se realiza mediante una interfaz HTTP estandarizada/predecible.
*   **Stateless**: El servidor no mantiene estado de sesión en memoria (usa tokens o DB), permitiendo escalabilidad.

---

## 2. El Cliente (Frontend)

Ubicación: `/client`
Tecnología: **React.js**

### 2.1. Funcionamiento Técnico
*   **Single Page Application (SPA)**: La aplicación carga una sola vez y navega dinámicamente usando `react-router-dom` sin recargar la página.
*   **Consumo de API**: Utiliza una capa de abstracción (`ApiClient` en `src/utils/api.js`) para comunicarse con el servidor.
    *   No hace `fetch` directo en los componentes.
    *   Intercepta respuestas para manejar errores globales (401, 500) o expiración de sesión.
*   **Gestión de Estado**:
    *   **Context API**: Para estados globales como Autenticación (`AuthContext`) y Errores/Modales (`ErrorContext`).
    *   **Hooks**: Lógica encapsulada (ej. `useModal`, `usePetDropdowns`).
*   **Generación de QR**: Realizada en el navegador (`client-side`) usando `qr-code-styling` para reducir carga al servidor, generando la imagen visualmente a partir de la URL del perfil público.

---

## 3. El Servidor (Backend)

Ubicación: `/server`
Tecnología: **Node.js + Express**

### 3.1. Funcionamiento Técnico
*   **Layered Architecture (Capas)**:
    1.  **Rutas (`/routes`)**: Reciben la petición HTTP.
    2.  **Middleware (`/middleware`)**: Validan seguridad (JWT), input (`express-validator`) y protegen contra abuso (Rate Limiting).
    3.  **Controladores/Lógica**: Procesan la petición.
    4.  **Acceso a Datos (`/db`)**: Ejecutan consultas SQL optimizadas (Raw SQL queries con `mysql2` pool).
*   **Seguridad**:
    *   **Helmet**: Protege cabeceras HTTP.
    *   **CORS**: Configurado estrictamente para permitir orígenes de desarrollo y producción.
    *   **Logging**: Winston registra cada petición con metadatos para auditoría.
*   **Autenticación**:
    *   Utiliza **JWT (JSON Web Tokens)** o sesiones basadas en cookies seguras.
    *   El servidor verifica la firma criptográfica del token en cada petición protegida.

---

## 4. Integración y Flujo de Datos

### 4.1. El Rol de Nginx
El archivo `nginx/goodpawies.local.conf` actúa como el pegamento del sistema en el entorno local:
*   **Unificación de Puertos**: Expone todo en el puerto `80`.
    *   Tráfico `/` -> Redirige al puerto `3000` (React).
    *   Tráfico `/api/` -> Redirige al puerto `5000` (Node).
*   **Ventaja**: Elimina problemas de CORS (Cross-Origin Resource Sharing) en producción y simula un dominio real (`goodpawies.local`).

### 4.2. Ejemplo de Flujo: "Ver Perfil de Mascota"
1.  **Usuario**: Entra a `/perfil`.
2.  **Cliente**: Verifica si hay token. Si sí, renderiza la estructura de la página y muestra "Cargando...".
3.  **Cliente**: Llama a `GET /api/users/me/pets`.
4.  **Servidor (Middleware)**: Intercepta la llamada. Verifica que el token sea válido.
5.  **Servidor (DB)**: Ejecuta `SELECT * FROM pets WHERE userid = ?`.
6.  **Servidor**: Retorna JSON `[{ name: "Fido", ... }]`.
7.  **Cliente**: Recibe datos, actualiza el estado (`setPets(...)`) y React "pinta" las tarjetas de mascotas.

---

## 5. Infraestructura Base

*   **Base de Datos**: Contenerizada en Docker (`goodpawies-mariadb`).
    *   Volúmenes persistentes aseguran que los datos no se pierdan al apagar el contenedor.
    *   Scripts de inicio (`/database/*.sql`) crean automáticamente la estructura de tablas y relaciones al arrancar por primera vez.
*   **Setup Script (`setup.sh`)**: Automatiza la instalación de dependencias (`npm install` en ambos lados) y la puesta en marcha de la base de datos, garantizando que el entorno de desarrollo sea idéntico para todos los programadores.
