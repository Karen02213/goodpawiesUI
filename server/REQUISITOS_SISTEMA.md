# Requisitos Funcionales y No Funcionales del Sistema

Este documento describe de manera formal e integral las capacidades que debe tener el sistema (Requisitos Funcionales) y las restricciones o atributos de calidad bajo los cuales debe operar (Requisitos No Funcionales) para el proyecto **GoodPawies**. Se hace especial énfasis en el módulo de Asistencia Veterinaria con Inteligencia Artificial.

---

## 1. Requisitos Funcionales (RF)

Los requisitos funcionales describen lo que el sistema *debe hacer*. Son las funcionalidades, comportamientos y procesos de negocio que el software debe proveer al usuario.

### 1.1. Gestión de Usuarios y Autenticación
- **RF01 - Registro de Usuarios:** El sistema debe permitir a los usuarios crear una cuenta proporcionando nombre, correo electrónico y contraseña.
- **RF02 - Autenticación y Autorización:** El sistema debe autenticar a los usuarios mediante credenciales válidas y generar una sesión segura (basada en JWT).
- **RF03 - Recuperación de Acceso:** El sistema debe proveer un mecanismo seguro para que el usuario recupere el acceso a su cuenta en caso de olvido de contraseña.

### 1.2. Gestión de Mascotas (Ciclo de Vida)
- **RF04 - Registro de Mascotas:** El sistema debe permitir a los usuarios autenticados dar de alta perfiles de mascotas, guardando atributos como nombre, especie, raza, edad, peso y condiciones médicas previas.
- **RF05 - Generación de Código QR Médicos:** Por cada mascota registrada, el sistema debe autogenerar un Código QR dinámico enlazado al perfil técnico y médico de la mascota.
- **RF06 - Modificación y Lectura:** El sistema debe permitir al dueño actualizar la información médica y demográfica de su mascota en cualquier momento.

### 1.3. Módulo de Asistencia Inteligente (IA y Modelos Ajustados)
- **RF07 - Ingesta de Contexto de Usuario:** El Bot conversacional debe ser capaz de consultar el contexto previo de la conversación y (opcionalmente) los datos médicos de las mascotas del usuario para entregar repuestas precisas.
- **RF09 - Respuestas con Modelo Fine-Tuned (Ajuste Fino):** Las respuestas deberán ser procesadas y redactadas por un modelo base adaptado/fine-tuned (basado en Google Gemini / Vertex AI) entrenado específicamente en un tono compasivo, empático y profesional de asistencia veterinaria.
- **RF10 - Restricción de Diagnóstico Clínico:** El chatbot debe identificar cuando los síntomas descritos son graves y debe responder siempre exhortando al usuario a buscar atención veterinaria presencial (Disclaimer ético de la IA).
- **RF11 - Idioma Obligatorio (Español):** El módulo de IA debe forzar sus respuestas explícitamente y mantener la estructuración en idioma Español en todo momento, independientemente del idioma de entrada del usuario.
- **RF12 - Fallback de Modelos de IA:** Si el modelo ajustado sufre una interrupción, el sistema debe poseer la capacidad de transmutar (fallback) la consulta hacia un motor de IA general base para no paralizar la asistencia al usuario.

---

## 2. Requisitos No Funcionales (RNF)

Los requisitos no funcionales definen las restricciones de rendimiento, resiliencia, usabilidad y calidad del sistema en general (el *cómo* lo hace).

### 2.1. Rendimiento, Disponibilidad y Conectividad
- **RNF01 - Tiempos de Respuesta IA:** La inferencia del modelo (Fine-Tuned LLM) no debe exceder en la medida de lo posible los tiempos de timeout estándar para una API (esperado: < 15 segundos).
- **RNF02 - Mitigación de Sobrecarga (Rate Limiting):** El servidor deberá bloquear los intentos automatizados y limitar el número de accesos al chat inteligente por minuto/hora, previniendo abusos económicos en la facturación con proveedores de Nube (Google Vertex).
- **RNF03 - Dependencia de Conectividad (Always-Online):** El sistema (especialmente el cliente web y la aplicación móvil) requiere de una conexión a internet constante, activa y estable para operar. No existe modo *Offline*, ya que la validación de usuarios y la generación de inferencias de IA dependen de los servidores alojados en la nube del negocio y de Google Cloud.

### 2.2. Seguridad y Privacidad (Cumplimiento)
- **RNF04 - Protección de Datos Sensibles (Hashing):** Todas las contraseñas depositadas en la base de datos deben estar cifradas mediante algoritmos fuertes, concretamente *Bcrypt/Argon2*.
- **RNF05 - Protección en Tránsito:** Las comunicaciones cliente-servidor para recuperación de información médica o chats veterinarios deben ocurrir bajo un entorno seguro (CORS validado y cabeceras resguardadas por Helmet).
- **RNF06 - Prevención Inyecciones:** Los datos entregados a las Bases de Datos relacionales (MySQL) deben estar estrictamente saneados con validadores para impedir inyecciones SQL u de Prompts de IA.

### 2.3. Arquitectura y Mantenibilidad
- **RNF07 - Trazabilidad y Logs:** El sistema backend deberá utilizar un gestor de registro formal (Logs diarios asíncronos), donde toda comunicación errónea o respuesta fallida del modelo de IA se registre de inmediato sin afectar la experiencia del usuario.
- **RNF09 - Soporte Cross-Origin:** El sistema backend debe proveer flexibilidad estricta bajo orígenes dev/production tolerados (`localhost`, `goodpawies.local`), permitiendo escalabilidad por micro-frontends o Single Page Applications de manera remota.