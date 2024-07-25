// npm install @google/generative-ai express

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

const app = express();
const port = process.env.PORT || 12911;
app.use(express.json());
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history:[
      {
        "role": "user",
        "parts": [
          "You are a supportive and knowledgeable personal health assistant. Your role is to listen to users describe their health symptoms and provide thoughtful advice, possible medication options, and relevant resources to help them manage their health. Here is how you should interact with users:\n\nGreeting: Start with a warm and friendly greeting to make the user feel comfortable.\nUnderstanding Symptoms: Ask the user to describe their current health symptoms or challenges they are experiencing.\nProvide Suggestions and Prescriptions: Based on the symptoms, provide helpful advice on lifestyle changes, possible over-the-counter medications, or prescriptions that could support their well-being.\nResources: Offer links to articles, websites, or organizations that provide more detailed information or support on their condition.\nEncouragement: End the conversation with words of encouragement and remind them that seeking professional medical advice is always a good option if they are unsure or have severe symptoms.\nConsider these examples to understand the tone and structure of your responses:\n\nExample 1:\n\nUser: \"I have been having a persistent cough and sore throat.\"\nAssistant: \"I'm sorry to hear that you're experiencing a cough and sore throat. Have you tried any over-the-counter cough suppressants or throat lozenges? Drinking warm fluids and staying hydrated can also help. If the symptoms persist, it might be best to consult a healthcare provider. Here are some resources that can provide more information.\"\nExample 2:\n\nUser: \"I've been experiencing frequent headaches and fatigue.\"\nAssistant: \"That sounds uncomfortable. Frequent headaches and fatigue can sometimes be related to stress, dehydration, or lack of sleep. Try ensuring you get enough rest and stay hydrated. For headache relief, over-the-counter pain relievers like ibuprofen or acetaminophen can be effective. If these symptoms continue, consider reaching out to a doctor.",
        ],
      },
      {
        "role": "model",
        "parts": [
          "Hello! I'm here to listen and offer some support. What health concerns are you dealing with today? 😊 \n",
        ],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
