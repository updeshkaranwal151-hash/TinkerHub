import { AISuggestions } from '../types.ts';
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API;
  if (!apiKey) {
    throw new Error('API_KEY or GEMINI_API environment variable is not configured.');
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Sends a query to the AI Lab Assistant via Gemini API.
 * @param {string} prompt - The user's question.
 * @param {string} context - The stringified JSON of the current component inventory.
 * @param {'fast' | 'deep'} mode - The requested processing mode for the AI.
 * @param {string} [imageBase64] - Optional Base64 encoded string of an image.
 * @param {string} [imageMimeType] - Optional MIME type of the image (e.g., 'image/png').
 * @returns {Promise<string>} A promise that resolves to the AI's answer.
 * @throws {Error} Throws an error if the API call fails.
 */
export const askAILabAssistant = async (
  prompt: string, 
  context: string, 
  mode: 'fast' | 'deep', 
  imageBase64?: string, 
  imageMimeType?: string
): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const modelName = mode === 'deep' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    let contents: any = [{ text: `Context:\n${context}\n\nQuestion:\n${prompt}` }];
    
    if (imageBase64 && imageMimeType) {
        contents.push({ inlineData: { mimeType: imageMimeType, data: imageBase64 } });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: { parts: contents },
        config: {
            systemInstruction: "You are a helpful lab assistant for an Atal Tinkering Lab. Your name is Tinker. Provide concise, helpful, and safe advice. You have access to the current inventory context. Use it to answer questions accurately. If asked for code, provide it in a markdown block.",
        }
    });
    return response.text;
  } catch (error: any) {
    console.error("AI Assistant call failed:", error);
    throw new Error(error.message || 'Failed to get a response from the assistant.');
  }
};

/**
 * Sends an image to the Gemini API to be identified and counted.
 * @param {string} imageBase64 - Base64 encoded string of the image.
 * @param {string} imageMimeType - The MIME type of the image.
 * @returns {Promise<AISuggestions[]>} A promise that resolves to the AI's analysis as an array of suggestions.
 * @throws {Error} Throws an error if the API call fails.
 */
export const analyzeAndCountComponents = async (
  imageBase64: string,
  imageMimeType: string
): Promise<AISuggestions[]> => {
  try {
    const ai = getGeminiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: {
            parts: [
                { text: "Analyze the image to identify all electronic components. For each distinct component type, provide its name, a brief description, count, and suggest a category. Return a JSON array of objects. Use only the following categories: Microcontroller, Sensor, Motor, Display, Power Supply, General Component." },
                { inlineData: { mimeType: imageMimeType, data: imageBase64 } }
            ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        quantity: { type: Type.NUMBER },
                        category: {
                            type: Type.STRING,
                            enum: ['Microcontroller', 'Sensor', 'Motor', 'Display', 'Power Supply', 'General Component']
                        }
                    },
                    required: ['name', 'description', 'quantity', 'category']
                }
            }
        }
    });
    const parsed = JSON.parse(response.text.trim());
    return parsed as AISuggestions[];
  } catch (error: any) {
    console.error("Component analysis call failed:", error);
    throw new Error(error.message || 'Failed to get a response from the analysis service.');
  }
};