# Documentación de Integración de IA Avanzada en Goodpawies

Este documento describe a detalle la arquitectura, componentes y configuración implementados para potenciar el asistente virtual veterinario de Goodpawies utilizando dos tecnologías de Google Cloud: **Modelos Ajustados (Fine-Tuning)** y **Recuperación Generativa Aumentada (RAG)** mediante Vertex AI Search & Conversation (anteriormente Discovery Engine).

---

## 1. Arquitectura y Flujo del Sistema

El flujo completo de interacción para proveer respuestas veterinarias fundamentadas funciona de la siguiente manera:

1. **Recepción del Mensaje**: El usuario envía una pregunta desde la UI (ej. *"¿Qué hago si mi gato tiene pulgas?"*), la cual es recibida por el endpoint `/api/chat` en el servidor Node.js.
2. **Obtención de Contexto (Motor RAG)**: 
   - El backend extrae el último mensaje del usuario y se lo envía a la función `searchRAG()`.
   - Se realiza una petición autenticada vía REST a **Google Discovery Engine**.
   - El motor busca dentro de corpus documentales veterinarios previamente indexados (PDFs, manuales) y devuelve extractos de texto con alto grado de relevancia (hasta 5 documentos).
3. **Inyección de Contexto (Prompt Engineering)**: 
   - El backend purga los extractos del RAG (limpieza de HTML) y los concatena en un formato estricto bajo la cabecera: *### BASA TU RESPUESTA EN ESTA INFORMACIÓN VETERINARIA OFICIAL ###*.
   - Se añade este contexto al *System Prompt* y a la información general de la mascota activa (raza, edad, etc.).
4. **Inferencia con LLM Ajustado (Fine-Tuned)**:
   - El prompt enriquecido se envía a un modelo de la familia Gemini alojado en un EndPoint específico de Google Cloud. Este modelo ha sido previamente ajustado (Fine-Tuned) con conjuntos de datos de interacciones médico-paciente.
   - El modelo procesa la pregunta combinando su naturaleza empática ajustada, junto con el contexto médico duro proveniente del RAG.
5. **Respuesta al Cliente**: El backend recibe la respuesta del LLM y la envía de vuelta al cliente React, mostrándose al usuario en la interfaz del chat.

---

## 2. Dependencias y Paquetes de Software Instalados

Para lograr esta implementación en el backend (`/server`), se instalaron mediante NPM los siguientes paquetes nodulares clave:

*   `@google/genai` (^1.43.0): SDK oficial moderno para interactuar con los endpoints de los modelos generativos de Gemini. Se utiliza exclusivamente para la inferencia conversacional del chatbot.
*   `google-auth-library`: Utilizado para firmar de manera criptográficamente segura las peticiones HTTP que consultan el motor de recuperación RAG (Discovery Engine), gestionando el ciclo de vida de los *Access Tokens* y las cuentas de servicio.

*(Nota: En iteraciones previas se utilizaron dependencias heredadas como `@google-cloud/discoveryengine`, pero fueron deprecadas en favor de la API REST nativa combinada con `google-auth-library` para mayor control estructural como recomienda Google Cloud).*

---

## 3. Variables de Entorno y Configuraciones (.env)

El sistema emplea el principio de menor privilegio aislando los accesos a los distintos servicios mediante dos archivos de credenciales JSON diferentes. El archivo `server/.env` utiliza las siguientes variables:

*   **`GOOGLE_APPLICATION_CREDENTIALS`**: 
    *   *Valor:* `./config/google-credentials.json`
    *   *Propósito:* Identifica la cuenta de servicio principal usada por la librería `@google/genai` para llamar e instanciar el modelo Gemini Fine-Tuned.
*   **`GOOGLE_APPLICATION_CREDENTIALS_RAG`**: 
    *   *Valor:* `./config/google-credentials-rag.json`
    *   *Propósito:* Identifica exclusivamente una cuenta de servicio secundaria (ej. `rag-goodpawies@...`) a la cual se le otorgó el rol IAM *"Usuario de Discovery Engine"*. Se usa estrictamente para consultar los manuales veterinarios.
*   **`GOOGLE_CLOUD_API_KEY`**: Llave pública para servicios generales (si aplica).

## 4. Archivos Clave en la Implementación

### `server/utils/rag.js`
Es el núcleo de la Recuperación. Contiene la función `searchRAG(query)`:
1. Instancia el cliente pasándole explícitamente la variable de entorno `..._RAG`.
2. Llama al endpoint de Vertex AI Search (`servingConfigs/default_search:search`).
3. Define los IDs crudos de consumo:
    - **ProjectId:** `project-2581b264-5d72-4eff-937`
    - **EngineId:** `goodpawies-rag_1771982117627`
4. Parsea el array `data.results[].document.derivedStructData.extractive_answers` unificando la base del conocimiento.

### `server/routes/chat.js`
Es el orquestador principal.
1. Alberga el **SYSTEM_PROMPT** maestro que le da la personalidad de "Veterinario Conciso" a la IA y dicta el formato Markdown y la directiva de seguridad (recomendar asistencia presencial).
2. Maneja la función `callGeminiAPI()` que apunta directamente al endpoint customizado donde vive el modelo refinado: `endpoints/3664591991028580352`.
3. Maneja los "fallbacks" a OpenAI en caso de caídas del entorno GCP para asegurar la Alta Disponibilidad.

---

## 5. Justificación de Decisiones de Arquitectura

1. **Separación de Archivos JSON:** Se optó por mantener dos cuentas de servicio distintas para evitar que el compromiso de una credencial del frontend/bot comprometa los assets de indexación documental en Vertex.
2. **Método de Consulta `:search` vs `:answer`:** Se estructuró el código usando el endpoint base `:search` de Discovery Engine para delegar únicamente la búsqueda indexada, previniendo que motores anticuados generaran respuestas finales, y permitiendo que sea siempre nuestra propia IA (Gemini Fine-Tuned) quien tenga la última palabra conversacional integrando el contexto provisto por el RAG.
