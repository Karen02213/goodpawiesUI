const { GoogleGenAI } = require('@google/genai');

async function test() {
  try {
    const ai = new GoogleGenAI({
      apiKey: 'TEST_KEY'
    });
    console.log('AI headers:', Object.keys(ai));
    
    if (ai.chats) {
      console.log('ai.chats exists');
    } else {
      console.log('ai.chats DOES NOT EXIST');
    }
  } catch (e) {
    console.error(e);
  }
}

test();
