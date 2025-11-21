import { GoogleGenAI, Type } from "@google/genai";
import { TranslationResult } from "../types";

// Using the specified fast model: gemini-flash-lite-latest (maps to gemini-2.5-flash-lite)
const MODEL_NAME = "gemini-flash-lite-latest";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const translateText = async (
  text: string,
  targetLanguage: string
): Promise<TranslationResult> => {
  if (!text.trim()) {
    throw new Error("Text is empty");
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Translate the following text to ${targetLanguage}.\n\nText:\n"${text}"`,
      config: {
        systemInstruction: "You are a professional translator. Detect the source language automatically and translate the text accurately. Return the result in JSON format. Do not add any explanations.",
        responseMimeType: "application/json",
        // Disable thinking for lowest latency as this is a simple translation task
        thinkingConfig: { thinkingBudget: 0 }, 
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: {
              type: Type.STRING,
              description: "The detected 2-letter ISO language code of the source text (e.g., 'en', 'fr', 'ja').",
            },
            translatedText: {
              type: Type.STRING,
              description: "The translated text content.",
            },
          },
          required: ["detectedLanguage", "translatedText"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(jsonText) as TranslationResult;
    return result;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Failed to translate text. Please try again.");
  }
};