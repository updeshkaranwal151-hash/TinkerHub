import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available in the environment variables
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDescription = async (componentName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide a concise, one-paragraph technical description for the following electronic component, suitable for an inventory management system: "${componentName}". Focus on its primary function and key features.`,
        config: {
            temperature: 0.5,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 150,
        },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return `Failed to generate a description for ${componentName}. Please write one manually.`;
  }
};

export const generateImage = async (componentName: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A high-quality, professional product photograph of a single "${componentName}" electronic component, on a clean, white background. The image should be clear, well-lit, and show the component in a standard orientation.`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '4:3',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("No image was generated.");

  } catch (error) {
    console.error("Imagen API call failed:", error);
    throw new Error(`Failed to generate an image for ${componentName}.`);
  }
};
