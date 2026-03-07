require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

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

  const generationConfig = {
    maxOutputTokens: 1024,
    temperature: 0.3,
    topP: 1
  };

  const req = {
    model: model,
    contents: formattedMessages,
    config: generationConfig,
  };

  try {
    const streamingResp = await ai.models.generateContentStream(req);
    let fullResponse = '';

    for await (const chunk of streamingResp) {
      if (chunk.text) {
        fullResponse += chunk.text;
      }
    }
    console.log("Response:", fullResponse);
  } catch (error) {
    console.error("Error:", error);
  }
}

callGeminiAPI([{role: 'user', content: 'hola'}]);
