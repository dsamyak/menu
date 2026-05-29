import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Lazily initialize Gemini AI client to protect against server crash on startup if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Return a dummy client or throw error, but let's handle gracefull-checking inside the API
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Check Status
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', keyAvailable: !!process.env.GEMINI_API_KEY });
  });

  // AI Head Chef Assistant Endpoint
  app.post('/api/chef/ask', async (req, res): Promise<any> => {
    const { message, dishName, dishDetails, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message query is required' });
    }

    try {
      const ai = getAiClient();
      
      const systemInstruction = `You are "Chef Jacques", the extraordinary elite head chef of D-Dish 3D Restaurant Showcase. 
Your personality is highly passionate, sophisticated, friendly, articulate, and deeply artistic. You treat culinary arts like micro-architecture.
Talk directly to the customer currently inspecting the "${dishName}". 
Here are the culinary details of this dish:
${JSON.stringify(dishDetails)}

Your job is to:
1. Answer their queries about this dish, ingredients, wine recommendations, cooking techniques, or customization.
2. Maintain high-end French/global Michelin culinary prestige in your wording. Keep answers inspiring, relatively concise, and warm. No robotic boilerplate.
3. Suggest an action if they ask for something that triggers a 3D visual change. 
You can choose to trigger one of these specific actions ("suggestedAction") if applicable:
- "set_theme" (value: "warm" | "cool" | "cyberpunk" | "candle"): trigger if user asks for mood lighting, romantic theme, dark theme, cyberpunk feel, or neon colors.
- "explode_layers" (value: "1" | "0"): trigger to separated layers (value: "1") if user asks "what is inside", "show me how it is stacked", "show layers", "deconstruct it" or reset/combine layers (value: "0").
- "add_to_cart" (value: "1"): trigger if user says "order this", "add to cart", "I want to buy", "add to ticket", or similar.

You MUST respond strictly in the requested JSON scheme. Do NOT add markdown wrappers or triple backticks around the json. Only raw JSON is allowed.`;

      const contents = [
        ...(chatHistory || []).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              responseText: {
                type: Type.STRING,
                description: 'The elegant culinary response from Chef Jacques, formatted nicely in simple Markdown.'
              },
              suggestedAction: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: 'Optional triggered action code: set_theme, explode_layers, add_to_cart or none'
                  },
                  value: {
                    type: Type.STRING,
                    description: 'The action value (e.g. "cyberpunk", "candle" for light theme, or "1"/"0" for explode/combine)'
                  }
                },
                required: ['type', 'value']
              }
            },
            required: ['responseText', 'suggestedAction']
          }
        }
      });

      const responseText = response.text || '{}';
      let parsedData;
      try {
        parsedData = JSON.parse(responseText.trim());
      } catch (err) {
        parsedData = {
          responseText: responseText.trim() || 'Pardon, my kitchen is extremely busy at this moment. How can I serve you today?',
          suggestedAction: { type: 'none', value: '' }
        };
      }

      res.json(parsedData);
    } catch (error: any) {
      console.error('Gemini Chef Error:', error);
      res.json({
        responseText: `***Chef Jacques Chef's Note***: Welcome to our showroom! Note that to unlock my live custom recipes, culinary advice, and automatic 3D environment transitions, please make sure to configure a **GEMINI_API_KEY** secret in your App Settings.

Here's my classic chef's advice on the **${dishName}**: It features premium artisan selections, hand-molded and curated with professional passion. I highly recommend ordering it with a complementary vintage wine pairing!`,
        suggestedAction: { type: 'none', value: '' }
      });
    }
  });

  // Serve static client assets in production, otherwise spin up Vite middlewares
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Dev server starting with Vite middleware active...');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Full-Stack Node Server] listening on http://localhost:${PORT}`);
  });
}

startServer();
