require('dotenv').config({ path: '/home/karen/Documents/goodpawiesUI/server/.env' });
const { GoogleGenAI } = require('@google/genai');

const SYSTEM_PROMPT = "You are a vet.";

async function callGeminiAPI(messages, context = '') {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: '687446770739',
    location: 'us-central1'
  });
  const model = 'projects/687446770739/locations/us-central1/endpoints/3664591991028580352';

  const formattedMessages = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const fullSystemPrompt = context ? `${SYSTEM_PROMPT}\n\nCurrent Pet Context:\n${context}` : SYSTEM_PROMPT;

  const generationConfig = {
    maxOutputTokens: 2048,
    temperature: 1,
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

  return fullResponse;
}

callGeminiAPI([{ role: 'user', content: 'hola' }]).then(console.log).catch(console.error);
