import { GoogleGenAI } from "@google/genai";

/**
 * Cloudflare Pages Function to handle POST requests for Gemini API.
 * It expects a JSON body with a `type` ('assistant'), a `prompt`, and a `context`.
 * The API key is securely accessed from environment variables.
 * @param {object} context - The Cloudflare function context.
 * @param {Request} context.request - The incoming request object.
 * @param {object} context.env - The environment variables.
 * @returns {Response} A JSON response with the result or an error.
 */
export async function onRequestPost(context) {
  try {
    const { env } = context;
    const body = await context.request.json();
    const { type, prompt, context: inventoryContext } = body;

    if (type !== 'assistant' || !prompt || !inventoryContext) {
      return new Response(JSON.stringify({ error: 'Invalid request. "assistant" type, a prompt, and context are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use API_KEY from Cloudflare's environment secrets
    const ai = new GoogleGenAI({ apiKey: env.API_KEY });
    
    const fullPrompt = `You are "TinkerHub AI", a helpful and friendly lab assistant for an electronics inventory. Be concise and helpful. Use markdown for lists if needed.
    Here is the current inventory data in JSON format: ${inventoryContext}
    The user's query is: "${prompt}"
    Based on the provided data, answer the user's query. If the user asks for a project idea, give them a simple but creative project idea using components from the inventory. Do not mention that you were given JSON data. Just answer the question naturally.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            temperature: 0.7,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 500,
        },
    });
    const result = response.text;

    if (!result) {
      throw new Error("The AI assistant could not provide a response.");
    }
    
    return new Response(JSON.stringify({ result }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Cloudflare Function Error:", error);
    
    let errorMessage = 'An internal server error occurred.';
    if (error.message) {
        if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429')) {
            errorMessage = 'API rate limit or quota exceeded. Please try again later.';
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