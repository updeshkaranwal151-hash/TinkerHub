import { GoogleGenAI, Modality } from "@google/genai";

// Ensure the API key is available in the environment variables
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDescription = async (componentName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: `Provide a concise, one-paragraph technical description for the following electronic component, suitable for an inventory management system: "${componentName}". Focus on its primary function and key features.`,
        config: {
            temperature: 0.5,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 150,
        },
    });

    const text = response.text;
    if (text) {
      return text.trim();
    }
    
    console.warn(`Gemini API returned no text for component: "${componentName}". The response might have been blocked.`);
    return `A description could not be automatically generated for ${componentName}. Please write one manually.`;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    return `Failed to generate a description for ${componentName}. Please write one manually.`;
  }
};

export const generateImage = async (componentName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high-quality, professional product photograph of a single "${componentName}" electronic component, on a clean, white background. The image should be clear, well-lit, and show the component in a standard orientation.` }],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });
    
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData) {
        const base64ImageBytes: string = imagePart.inlineData.data;
        const mimeType = imagePart.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
    }

    throw new Error("No image was generated.");

  } catch (error: any) {
    console.error("Gemini Image Generation API call failed:", error);
    
    if (error.toString().includes('RESOURCE_EXHAUSTED') || error.toString().includes('429')) {
        throw new Error(`Image generation quota exceeded. Please try again in a few moments.`);
    }

    throw new Error(`Failed to generate an image for ${componentName}. The model may have refused the request.`);
  }
};