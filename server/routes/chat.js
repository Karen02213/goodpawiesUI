// server/routes/chat.js - AI Chat API with LLM Integration
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { success, errors, send } = require('../utils/response');
const logger = require('../utils/logger');
const { getPetById } = require('../db/petQueries');

// System prompt for the veterinary AI assistant
const SYSTEM_PROMPT = `You are a veterinary AI assistant named GoodPawies. You ONLY answer medical questions regarding Dogs and Cats. 

Important guidelines:
1. If the user asks about other topics or other animals (birds, reptiles, horses, fish, etc.), politely decline and explain you only specialize in dogs and cats.
2. Do NOT provide definitive diagnoses. Instead, offer general guidance and information.
3. Always suggest visiting a veterinarian for serious symptoms, emergencies, or when in doubt.
4. Be compassionate and understanding - pet owners are often worried about their furry friends.
5. Ask clarifying questions when needed (age, breed, duration of symptoms, etc.).
6. Provide practical first-aid advice when appropriate, but emphasize professional care.
7. Never recommend specific prescription medications - only a vet can prescribe.
8. If symptoms suggest an emergency (difficulty breathing, seizures, severe bleeding, toxin ingestion), urge immediate veterinary care.
9. Asume the user is seeking advice for their pet's health and wellbeing.
10. User can be anywhere in the world, so avoid location-specific advice.
11. Use layman's terms - avoid medical jargon unless explained simply.
12. Always remind users that your advice does not replace professional veterinary care. 
13. Maintain a friendly and approachable tone throughout the conversation.
Remember: You are a helpful guide, not a replacement for professional veterinary care.
14. Your responses should be concise, informative, and empathetic.
15. Responses should be in markdown format for better readability.
16. Response must be short but informative`;

// Helper function to call Google Gemini API
async function callGeminiAPI(messages, context = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // Format messages for Gemini
  const formattedMessages = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const fullSystemPrompt = context ? `${SYSTEM_PROMPT}\n\nCurrent Pet Context:\n${context}` : SYSTEM_PROMPT;

  // Add system instruction
  const requestBody = {
    contents: formattedMessages,
    systemInstruction: {
      parts: [{ text: fullSystemPrompt }]
    },
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
    ]
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    logger.error('Gemini API error', { status: response.status, error: errorData });
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
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
  
  // Check for emergency keywords
  const emergencyKeywords = ['bleeding', 'seizure', 'unconscious', 'not breathing', 'poison', 'toxic', 'hit by car', 'choking'];
  if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return "⚠️ This sounds like it could be an emergency! Please contact your nearest emergency veterinary clinic immediately. Time is critical in these situations. Do not wait - seek professional help right away.";
  }
  
  // Check for non-dog/cat animals
  const otherAnimals = ['bird', 'fish', 'rabbit', 'hamster', 'snake', 'lizard', 'turtle', 'horse', 'cow', 'pig', 'chicken', 'parrot', 'guinea pig', 'ferret', 'rat', 'mouse'];
  if (otherAnimals.some(animal => lowerMessage.includes(animal))) {
    return "I appreciate your question, but I specialize specifically in dogs and cats. For other animals, I'd recommend consulting with a veterinarian who specializes in exotic pets or the specific type of animal you're asking about. Is there anything I can help you with regarding a dog or cat?";
  }
  
  // Check for off-topic questions
  const offTopicKeywords = ['weather', 'recipe', 'news', 'politics', 'sports', 'movie', 'music', 'joke', 'story'];
  if (offTopicKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return "I'm specifically designed to help with veterinary questions about dogs and cats. I can't help with that topic, but I'd be happy to answer any questions about your pet's health, behavior, nutrition, or care!";
  }
  
  // Default helpful response
  return `Thank you for your question about your pet! While I'm currently in demo mode (no AI API configured), I want to help you as best as I can.

For the best guidance, please include:
• Your pet's species (dog or cat), age, and breed
• How long the symptoms have been present
• Any changes in eating, drinking, or behavior
• Whether your pet is up to date on vaccinations

**Important:** If your pet is showing severe symptoms like difficulty breathing, seizures, collapse, or severe pain, please contact your veterinarian or emergency animal hospital immediately.

To enable full AI responses, configure the GEMINI_API_KEY or OPENAI_API_KEY in the server environment.`;
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
    
    logger.info('Chat request received', {
      userId: req.user.id,
      messageCount: messages.length,
      hasContext: !!context,
      lastMessagePreview: lastUserMessage?.content?.substring(0, 50)
    });

    let aiResponse;
    let provider = 'fallback';

    // Try Gemini first, then OpenAI, then fallback
    try {
      if (process.env.GEMINI_API_KEY) {
        aiResponse = await callGeminiAPI(messages, context);
        provider = 'gemini';
      } else if (process.env.OPENAI_API_KEY) {
        aiResponse = await callOpenAIAPI(messages, context);
        provider = 'openai';
      } else {
        // No API configured - use fallback
        aiResponse = getFallbackResponse(lastUserMessage?.content || '');
        provider = 'fallback';
      }
    } catch (apiError) {
      logger.error('AI API call failed', { error: apiError.message, provider });
      
      // Try the other provider as backup
      try {
        if (provider === 'gemini' && process.env.OPENAI_API_KEY) {
          aiResponse = await callOpenAIAPI(messages, context);
          provider = 'openai-fallback';
        } else if (provider === 'openai' && process.env.GEMINI_API_KEY) {
          aiResponse = await callGeminiAPI(messages, context);
          provider = 'gemini-fallback';
        } else {
          throw apiError;
        }
      } catch (backupError) {
        // Both failed, use fallback
        aiResponse = getFallbackResponse(lastUserMessage?.content || '');
        provider = 'fallback';
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
