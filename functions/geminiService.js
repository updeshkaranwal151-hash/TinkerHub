import { GoogleGenAI } from "@google/genai";

/**
 * Cloudflare Pages Function to handle POST requests for Gemini API.
 * It expects a JSON body with a `type` of 'assistant'.
 * - For 'assistant', it requires a `prompt`, `context`, `mode`, and optionally `imageBase64` and `imageMimeType`.
 * The API key is securely accessed from environment variables.
 * @param {object} context - The Cloudflare function context.
 * @param {Request} context.request - The incoming request object.
 * @param {object} context.env - The environment variables.
 * @returns {Response} A JSON response with the result or an error.
 */
export async function onRequestPost(context) {
  try {
    const { env } = context;
    const apiKey = env.API_KEY;

    // Validate the API key at the beginning.
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'The API_KEY secret is not configured on the server.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize the Gemini client once.
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const body = await context.request.json();
    const { type, prompt, context: inventoryContext, mode, imageBase64, imageMimeType } = body;

    if (type === 'assistant') {
      if (!prompt && !imageBase64) { // Allow image-only prompts if desired, but still require context
        return new Response(JSON.stringify({ error: 'Invalid assistant request. A prompt or image is required.' }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }
      if (!inventoryContext) {
        return new Response(JSON.stringify({ error: 'Inventory context is required for the assistant.' }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }

      // Select the model based on the requested mode.
      const modelName = mode === 'deep' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
      
      // Define the system instruction for the AI's role
      const systemInstruction = `You are "TinkerHub AI", a helpful and friendly lab assistant for an electronics inventory. Be concise and helpful. Use markdown for lists if needed.`;

      // Combine inventory context and user's query into a single text part for the user's turn
      const userQueryWithContext = `Here is the current inventory data in JSON format: ${inventoryContext}\n\nMy query is: "${prompt}"`;
      
      const contentParts = [];
      if (userQueryWithContext) {
          contentParts.push({ text: userQueryWithContext });
      }

      // Add image part if provided
      if (imageBase64 && imageMimeType) {
          contentParts.push({ 
              inlineData: {
                  data: imageBase64,
                  mimeType: imageMimeType,
              } 
          });
      }

      // Ensure there's at least one part to send
      if (contentParts.length === 0) {
        return new Response(JSON.stringify({ error: 'No content parts to send to the AI assistant.' }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }

      const generateContentParams = {
        model: modelName,
        contents: { parts: contentParts }, // Always send as parts array for consistency in multimodal
        config: {
            systemInstruction: systemInstruction, // Use systemInstruction config for the fixed role
            temperature: 0.7, 
            topP: 0.95, 
            topK: 64, 
            maxOutputTokens: 800 
        },
      };
      
      const response = await ai.models.generateContent(generateContentParams);
      const result = response.text;

      if (!result) {
        throw new Error("The AI assistant could not provide a response.");
      }
      
      return new Response(JSON.stringify({ result }), {
        headers: { 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({ error: 'Invalid request type specified.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error("Cloudflare Function Error:", error);
    
    let errorMessage = 'An internal server error occurred.';
    if (error.message) {
      if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429')) {
        errorMessage = 'API rate limit or quota exceeded. Please try again later.';
      } else if (error.message.includes('API key not valid')) {
          errorMessage = 'The configured API key is invalid. Please check the server configuration.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}