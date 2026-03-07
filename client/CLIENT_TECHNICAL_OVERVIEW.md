# Resumen Técnico del Cliente (Frontend)

Este documento describe la arquitectura y las decisiones técnicas implementadas en el frontend de GoodPawies, basado en React.js.

## 1. Stack Tecnológico

*   **Framework Principal**: `React.js` (con Hooks para gestión de estado y efectos).
*   **Enrutamiento**: `react-router-dom` (v7) para navegación SPA (Single Page Application).
*   **Peticiones HTTP**: Fetch API + utilidades personalizadas (`apiClient` y `authService`) para manejo de tokens y errores.
*   **Gestión de Estado**:
    *   **Estado Local**: `useState`, `useRef`.
    *   **Context API**:
        *   `ErrorContext`: Gestión centralizada de errores y modales.
        *   `AuthContext` (en `auth.js`): Gestión de sesión de usuario y persistencia de tokens.
*   **Estilos**: CSS modular y frameworks ligeros (`PureCSS`, `Bootstrap` utilities, `Materialize` components). Uso de CSS personalizado en carpeta `styles/`.
*   **Funcionalidades Especiales**:
    *   **QR**: `qr-code-styling` para generación y renderizado dinámico de códigos QR en el cliente.

## 2. Arquitectura de Carpetas

La estructura sigue un patrón modular basado en funcionalidad y tipos de recursos:

*   `src/components/`: Componentes reutilizables de UI (Navbar, Modales, Botones).
*   `src/pages/`: Vistas completas compuestas por componentes. Organizadas por dominio (login, profile, register).
*   `register/`: Formularios de registro de usuario y mascotas.
*   `src/contexts/`: Proveedores de estado global (Error, Auth).
*   `src/hooks/`: Hooks personalizados (ej. `useModal`) para abstraer lógica compleja.
*   `src/utils/`: Funciones auxiliares puras (validación, llamadas API, formateo).
*   `src/styles/`: Archivos CSS organizados incluyendo una configuración base y estilos específicos por página.

## 3. Patrones de Diseño Implementados

### 3.1. Abstracción de API (`utils/api.js`)
Se utiliza una clase `ApiClient` (singleton) que centraliza todos los endpoints.
*   Separa la lógica de UI de la lógica de datos.
*   Métodos tipados como `getPet(id)`, `createPet(data)`, `generateQRCode(data)`.
*   Integración transparente con `authService` para inyección de JWT en cabeceras.

### 3.2. Manejo de Errores Centralizado (Wrapper Pattern)
Implementado en `ErrorContext.js` y `errorHandler.js`.
*   **`wrapApiCall`**: Un High-Order Function (o función envoltorio) que toma una promesa de API y maneja automáticamente:
    *   Estados de carga.
    *   Captura de errores HTTP (404, 500).
    *   Navegación automática a página de error si es crítico.
    *   Despliegue de Modales para errores de usuario (ej. validación fallida).

### 3.3. Rutas Protegidas (HOC / Wrapper)
Componente `ProtectedRoute.js`.
*   Verifica la existencia y validez del token de autenticación antes de renderizar componentes privados (`/perfil`, etc.).
*   Redirige a `/login` si no hay sesión, preservando la intención de navegación.

### 3.4. Renderizado Condicional y Modales
Uso de un sistema de modales gestionado por `ModalContainer` en la raíz de `App.js`.
*   Permite invocar modales desde cualquier parte profunda del árbol de componentes usando `useError()` o `useModal()`, evitando "prop drilling" de estados de visibilidad.

## 4. Detalles de Implementación Clave

### 4.1. Generación de QR
El código QR se genera en el lado del cliente (Client-side rendering) usando `qr-code-styling`.
*   Evita carga en el servidor para generar imágenes estáticas.
*   Permite previsualización en tiempo real de personalizaciones (colores, formas).
*   La URL embebida se construye dinámicamente: `${window.location.origin}/pet/${petid}`.

### 4.2. Formularios Dinámicos
En `RegisterPetForm.js`:
*   Uso de custom hooks (`usePetDropdowns`) para cargar datos maestros (razas, tipos) desde el backend al montar.
*   Lógica dependiente: Al seleccionar "Perro", el dropdown de "Razas" se filtra automáticamente en el cliente para mostrar solo razas caninas.

## 5. Seguridad en el Cliente

*   **Almacenamiento de Tokens**: `localStorage` para persistencia de sesión (AccessToken).
*   **Sanitización**: React escapa por defecto el contenido renderizado para prevenir XSS.
*   **Interceptors**: La capa de servicio de API intercepta respuestas 401 (Unauthorized) para cerrar sesión automáticamente si el token expira.
