/**
 * Sends a query to the AI Lab Assistant backend function.
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
    const response = await fetch('/geminiService', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'assistant', 
        prompt, 
        context, 
        mode,
        imageBase64,
        imageMimeType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
      throw new Error(errorData.error || `An unknown server error occurred.`);
    }

    const data = await response.json();
    if (!data.result) {
        throw new Error(`The AI assistant could not provide a response.`);
    }
    return data.result;
  } catch (error: any) {
    console.error("AI Assistant call failed:", error);
    throw new Error(error.message || 'Failed to get a response from the assistant.');
  }
};