const { GoogleGenAI } = require('@google/genai');
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { success, errors, send } = require('../utils/response');
const logger = require('../utils/logger');
const { getPetById } = require('../db/petQueries');
const { searchRAG } = require('../utils/rag');

// System prompt for the veterinary AI assistant
const SYSTEM_PROMPT = `You are a veterinary AI assistant named GoodPawies. You ONLY answer medical questions regarding Dogs and Cats.

## Core Behavior
- ALWAYS respond in Spanish (Latin American Spanish), regardless of the language used in the question.
- Be compassionate and understanding - pet owners are often worried about their furry friends.
- Maintain a friendly and approachable tone throughout the conversation.
- Use layman's terms - avoid medical jargon unless explained simply or asked for.

## Scope & Boundaries
- If the user asks about other topics or other animals (birds, reptiles, horses, fish, etc.), politely decline in Spanish and explain you only specialize in dogs and cats.
- Assume the user is seeking advice for their pet's health and wellbeing.
- User can be anywhere in the world, so avoid location-specific advice.

## Medical Guidelines
- Do NOT provide definitive diagnoses. Instead, offer general guidance and information.
- Ask clarifying questions when needed (age, breed, duration of symptoms, etc.).
- Provide practical first-aid advice when appropriate, but emphasize professional care.
- Never recommend specific prescription medications - only a vet can prescribe.
- Always remind users that your advice does not replace professional veterinary care.

## Emergencies
- If symptoms suggest an emergency (difficulty breathing, seizures, severe bleeding, toxin ingestion), urge immediate veterinary care in Spanish.
- Always suggest visiting a veterinarian for serious symptoms, emergencies, or when in doubt.

## Response Format
- Responses should be in Spanish markdown format for better readability.
- Response must be concise but informative.
- Keep responses focused and helpful.
- Always use Markdown format with bullet points, emojis, and clear sections when appropriate to enhance readability.
- Mardown formatting should be used to break down complex information into digestible parts, making it easier for pet owners to understand and follow the advice provided. Use headings, bullet points, and emojis to create a friendly and engaging response that resonates with pet owners while conveying important information effectively.
- Formatting should be used to create a clear and engaging response that resonates with pet owners while conveying important information effectively. Use headings, bullet points, and emojis to break down complex information into digestible parts, making it easier for pet owners to understand and follow the advice provided. Always maintain a compassionate and supportive tone, acknowledging the emotional aspect of caring for a beloved pet while providing practical guidance. Remember, your goal is to be a helpful guide, not a replacement for professional veterinary care. Always encourage users to seek in-person veterinary attention when necessary, especially in cases of emergencies or severe symptoms.
- ALWAYS respond in spanish language, regardless of the language used by the user. This is to ensure that all users receive information in a language they can understand, as many pet owners may be more comfortable with Spanish. Always maintain the same compassionate and informative tone in Spanish, providing clear and helpful advice while encouraging users to seek professional veterinary care when needed. Remember, your goal is to be a helpful guide for pet owners, and responding in Spanish can help ensure that your advice is accessible and understandable to a wider audience.;

Remember: You are a helpful guide, not a replacement for professional veterinary care.`;

// Helper function to call Google Gemini API using @google/genai SDK
async function callGeminiAPI(messages, context = '') {
  // Initialize Vertex with your Cloud project and location
  const ai = new GoogleGenAI({
    vertexai: true,
    project: '687446770739',
    location: 'us-central1'
  });
  const model = 'projects/687446770739/locations/us-central1/endpoints/3664591991028580352';

  // Format messages for Gemini
  const formattedMessages = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const fullSystemPrompt = context ? `${SYSTEM_PROMPT}\n\nCurrent Pet Context:\n${context}` : SYSTEM_PROMPT;

  const generationConfig = {
    maxOutputTokens: 1024,
    temperature: 0.3,
    topP: 1,
    systemInstruction: {
      parts: [{ text: fullSystemPrompt }]
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' }
    ],
    tools: [{ googleSearch: {} }]
  };

  const req = {
    model: model,
    contents: formattedMessages,
    config: generationConfig,
  };

  const streamingResp = await ai.models.generateContentStream(req);
  let fullResponse = '';

  for await (const chunk of streamingResp) {
    if (chunk.text) {
      fullResponse += chunk.text;
    }
  }

  if (!fullResponse) {
    throw new Error('Invalid response from Gemini API');
  }

  return fullResponse;
}

// Helper function to call OpenAI API
async function callOpenAIAPI(messages, context = '') {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const fullSystemPrompt = context ? `${SYSTEM_PROMPT}\n\nCurrent Pet Context:\n${context}` : SYSTEM_PROMPT;

  // Format messages for OpenAI
  const formattedMessages = [
    { role: 'system', content: fullSystemPrompt },
    ...messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    logger.error('OpenAI API error', { status: response.status, error: errorData });
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error('Invalid response from OpenAI API');
  }

  return data.choices[0].message.content;
}

// Fallback response when no API is configured
function getFallbackResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();

  // Check for emergency keywords (Spanish and English)
  const emergencyKeywords = ['bleeding', 'seizure', 'unconscious', 'not breathing', 'poison', 'toxic', 'hit by car', 'choking', 'sangrando', 'convulsión', 'inconsciente', 'no respira', 'veneno', 'tóxico', 'atropellado', 'ahogándose'];
  if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return "⚠️ ¡Esto parece ser una emergencia! Por favor, contacta a tu clínica veterinaria de emergencia más cercana inmediatamente. El tiempo es crítico en estas situaciones. No esperes - busca ayuda profesional de inmediato.";
  }

  // Check for non-dog/cat animals (Spanish and English)
  const otherAnimals = ['bird', 'fish', 'rabbit', 'hamster', 'snake', 'lizard', 'turtle', 'horse', 'cow', 'pig', 'chicken', 'parrot', 'guinea pig', 'ferret', 'rat', 'mouse', 'pájaro', 'pez', 'conejo', 'hámster', 'serpiente', 'lagarto', 'tortuga', 'caballo', 'vaca', 'cerdo', 'pollo', 'loro', 'cuy', 'hurón', 'rata', 'ratón'];
  if (otherAnimals.some(animal => lowerMessage.includes(animal))) {
    return "Aprecio tu pregunta, pero me especializo específicamente en perros y gatos. Para otros animales, te recomiendo consultar con un veterinario que se especialice en mascotas exóticas o el tipo específico de animal que mencionas. ¿Hay algo en lo que pueda ayudarte respecto a un perro o gato?";
  }

  // Check for off-topic questions (Spanish and English)
  const offTopicKeywords = ['weather', 'recipe', 'news', 'politics', 'sports', 'movie', 'music', 'joke', 'story', 'clima', 'receta', 'noticias', 'política', 'deportes', 'película', 'música', 'chiste', 'historia'];
  if (offTopicKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return "Estoy diseñado específicamente para ayudar con preguntas veterinarias sobre perros y gatos. No puedo ayudarte con ese tema, ¡pero estaría encantado de responder cualquier pregunta sobre la salud, comportamiento, nutrición o cuidado de tu mascota!";
  }

  // Default helpful response
  return `
¡Gracias por tu pregunta sobre tu mascota! Aunque actualmente estoy en modo demo (sin API de IA configurada), quiero ayudarte lo mejor que pueda.

**Para ofrecerte la mejor orientación, incluye:**

- La especie (perro o gato), la edad y la raza de tu mascota.
- Cuánto tiempo lleva presentando los síntomas.
- Cualquier cambio en su alimentación, bebida o comportamiento.
- Si tu mascota está al día con las vacunas.

**Importante:** Si su mascota presenta síntomas graves como dificultad para respirar, convulsiones, colapso o dolor intenso, póngase en contacto con su veterinario o con un hospital veterinario de urgencias inmediatamente.
Para habilitar las respuestas completas de IA, configure **GEMINI_API_KEY** u **OPENAI_API_KEY** en el entorno del servidor.`;
}

// POST /api/chat - Main chat endpoint
router.post('/', verifyToken, async (req, res) => {
  try {
    const { messages, petId } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return send(res, errors.VALIDATION_ERROR('Messages array is required'));
    }

    // Build context if petId provided
    let context = '';
    if (petId) {
      try {
        const pet = await getPetById(petId);
        // Verify ownership
        if (pet && pet.userid === req.user.id) {
          context = `
Name: ${pet.s_petname}
Type: ${pet.s_type}
Breed: ${pet.s_breed || 'Unknown'}
Age: ${pet.n_age} years
Gender: ${pet.s_gender}
Size: ${pet.s_size}
Vaccinated: ${pet.b_vaccinated ? 'Yes' : 'No'}
Sterilized: ${pet.b_sterilized ? 'Yes' : 'No'}
History/Notes: ${pet.s_description || 'None'}
`;
          logger.info('Chat context added for pet', { petId, petName: pet.s_petname });
        }
      } catch (err) {
        logger.error('Error fetching pet context', { error: err.message, petId });
      }
    }

    // Get the last user message for logging
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    // Fetch external RAG Context
    let ragContext = '';
    if (lastUserMessage && lastUserMessage.content) {
      ragContext = await searchRAG(lastUserMessage.content);
      if (ragContext) {
        context += `\n\n### BASA TU RESPUESTA EN ESTA INFORMACIÓN VETERINARIA OFICIAL (RAG Context) ###\n${ragContext}\n#####################################################################\nSolo usa esta información si es relevante a la consulta del usuario.`;
        logger.info('RAG context added successfully to the prompt for Gemini.');
      }
    }

    logger.info('Chat request received', {
      userId: req.user.id,
      messageCount: messages.length,
      hasContext: !!context,
      lastMessagePreview: lastUserMessage?.content?.substring(0, 50)
    });

    let aiResponse;
    let provider = 'fallback';

    if (!aiResponse) {
      // Try Gemini (Fine-Tuned) first, then fallback
      try {
        aiResponse = await callGeminiAPI(messages, context);
        provider = 'gemini-fine-tuned+rag';
      } catch (apiError) {
        logger.error('Gemini API call failed', { error: apiError.message, provider });
        
        // Try OpenAI as backup
        try {
          if (process.env.OPENAI_API_KEY) {
            aiResponse = await callOpenAIAPI(messages, context);
            provider = 'openai-fallback';
          } else {
            throw apiError;
          }
        } catch (backupError) {
          // Both failed, use fallback
          aiResponse = getFallbackResponse(lastUserMessage?.content || '');
          provider = 'fallback';
        }
      }
    }

    logger.info('Chat response generated', {
      userId: req.user.id,
      provider,
      responseLength: aiResponse.length
    });

    send(res, success({
      message: aiResponse,
      provider: process.env.NODE_ENV === 'development' ? provider : undefined
    }));

  } catch (error) {
    logger.error('Chat endpoint error', { error: error.message, stack: error.stack });
    send(res, errors.INTERNAL_ERROR('Failed to process chat message'));
  }
});

// GET /api/chat/status - Check AI service status
router.get('/status', verifyToken, (req, res) => {
  const status = {
    gemini: !!process.env.GEMINI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    available: !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY)
  };

  send(res, success(status));
});

module.exports = router;
