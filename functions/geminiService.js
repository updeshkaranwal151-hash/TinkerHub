import { GoogleGenAI, Type } from "@google/genai";
import { Category } from '../types.ts';

/**
 * Cloudflare Pages Function to handle POST requests for Gemini API.
 * It expects a JSON body with a `type` of 'assistant' or 'identify'.
 * - For 'assistant', it requires `prompt`, `context`, `mode`, and optionally image data.
 * - For 'identify', it requires `imageBase64` and `imageMimeType`.
 * The API key is securely accessed from environment variables.
 * @param {object} context - The Cloudflare function context.
 * @returns {Response} A JSON response with the result or an error.
 */
export async function onRequestPost(context) {
  try {
    const { env } = context;
    const apiKey = env.API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'The API_KEY secret is not configured.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    const body = await context.request.json();
    const { type } = body;

    if (type === 'assistant') {
      const { prompt, context: inventoryContext, mode, imageBase64, imageMimeType } = body;
      if (!prompt && !imageBase64) {
        return new Response(JSON.stringify({ error: 'Invalid assistant request. A prompt or image is required.' }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }
      // Context is not strictly required but highly recommended for good answers.
      const modelName = mode === 'deep' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
      const systemInstruction = `You are "TinkerHub AI", a helpful and friendly lab assistant for an electronics inventory. Be concise and helpful. Use markdown for lists if needed.`;
      const userQueryWithContext = `Here is the current inventory data in JSON format: ${inventoryContext || '[]'}\n\nMy query is: "${prompt}"`;
      
      const contentParts = [{ text: userQueryWithContext }];
      if (imageBase64 && imageMimeType) {
          contentParts.push({ inlineData: { data: imageBase64, mimeType: imageMimeType } });
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: contentParts },
        config: { systemInstruction, temperature: 0.7, topP: 0.95, topK: 64, maxOutputTokens: 800 },
      });
      
      return new Response(JSON.stringify({ result: response.text }), {
        headers: { 'Content-Type': 'application/json' },
      });

    } else if (type === 'identify') {
        const { imageBase64, imageMimeType } = body;
        if (!imageBase64 || !imageMimeType) {
            return new Response(JSON.stringify({ error: 'Image data and MIME type are required for identification.' }), {
                status: 400, headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const validCategories = Object.values(Category).join(', ');
        const identificationPrompt = `You are an expert in identifying electronic components for a school's tinkering lab. Analyze the provided image. Your task is to identify the main component and provide its details in the specified JSON format.

**Instructions:**
1.  **Focus on the primary component.** If multiple items are visible, identify the most prominent one.
2.  **Be specific.** For example, "Arduino Uno R3" is better than "Microcontroller board".
3.  **Handle common, simple components correctly.** For example:
    *   Wires with pin connectors at the ends are "Jumper Wires".
    *   A white or transparent plastic board with a grid of holes is a "Breadboard".
    *   Small, two-legged colored components are likely "LEDs" or "Resistors".
4.  **Provide the output strictly in the following JSON format.**

**JSON Output Structure:**
1.  **name**: The most common and specific name for the component (e.g., "Arduino Uno R3", "HC-SR04 Ultrasonic Sensor", "Jumper Wires").
2.  **description**: A concise, one-sentence technical description of its primary function. For simple components, describe their use (e.g., "Used to connect components on a breadboard without soldering.").
3.  **category**: Classify it into ONE of the following exact categories: [${validCategories}]. "Jumper Wires" and "Breadboard" belong to the "General Component" category.

If you cannot confidently identify the component, set the name to "Unknown Component" and use the description to detail what you see in the image.`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The common name of the component." },
                description: { type: Type.STRING, description: "A brief technical description of the component's function." },
                category: { type: Type.STRING, description: `The component's category, chosen from: [${validCategories}]` },
            },
            required: ["name", "description", "category"],
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { text: identificationPrompt },
                    { inlineData: { data: imageBase64, mimeType: imageMimeType } }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        
        let identifiedData = JSON.parse(response.text);
        
        // Validate category from AI, default if it hallucinates a new one
        if (!Object.values(Category).includes(identifiedData.category)) {
            identifiedData.category = Category.GENERAL;
        }

        return new Response(JSON.stringify({ result: identifiedData }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } else {
      return new Response(JSON.stringify({ error: 'Invalid request type specified.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error("Cloudflare Function Error:", error);
    let errorMessage = error.message || 'An internal server error occurred.';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}