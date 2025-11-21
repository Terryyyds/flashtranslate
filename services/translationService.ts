
import { GoogleGenAI, Type } from "@google/genai";
import { TranslationResult, ApiConfig } from "../types";
import { SYSTEM_API_KEY, SYSTEM_BASE_URL, PROVIDER_DEFAULT_BASE_URLS } from "../constants";

const GEMINI_MODEL = "gemini-flash-lite-latest";
const GEMINI_VALIDATION_MODEL = "gemini-2.5-flash"; // Use standard flash for validation
const OPENAI_MODEL = "gpt-4o-mini";
const CLAUDE_MODEL = "claude-3-5-haiku-20241022";

const SYSTEM_INSTRUCTION = "You are a professional translator. Detect the source language automatically and translate the text accurately. Return the result in JSON format. Do not add any explanations.";

const trimBase = (url?: string) => url?.trim().replace(/\/+$/, '');
const resolveBaseUrl = (provider: ApiConfig['provider'], apiKey: string, baseUrl?: string) => {
  const cleaned = trimBase(baseUrl);
  if (cleaned) return cleaned;
  const hasCustomKey = !!apiKey?.trim();
  if (!hasCustomKey && provider === 'claude') return trimBase(SYSTEM_BASE_URL);
  return trimBase(PROVIDER_DEFAULT_BASE_URLS[provider]);
};
const resolveApiKey = (provider: ApiConfig['provider'], apiKey: string) => {
  const trimmed = (apiKey || "").trim();
  if (trimmed) return trimmed;
  if (provider === 'claude') return SYSTEM_API_KEY;
  if (provider === 'gemini') return (process.env.API_KEY as string) || (process.env.GEMINI_API_KEY as string) || '';
  return '';
};

export const translateText = async (
  text: string,
  targetLanguage: string,
  config: ApiConfig
): Promise<TranslationResult> => {
  if (!text.trim()) {
    throw new Error("Text is empty");
  }

  switch (config.provider) {
    case 'openai':
      return translateWithOpenAI(text, targetLanguage, config.apiKey, config.baseUrl);
    case 'claude':
      return translateWithClaude(text, targetLanguage, config.apiKey, config.baseUrl);
    case 'gemini':
    default:
      return translateWithGemini(text, targetLanguage, config.apiKey, config.baseUrl);
  }
};

export const validateApiConfig = async (config: ApiConfig): Promise<boolean> => {
  const provider = config.provider;
  const userKey = (config.apiKey || "").trim();
  const baseUrl = config.baseUrl;

  if (provider === 'openai') {
    const keyToValidate = resolveApiKey(provider, userKey);
    if (!keyToValidate) return false;
    try {
      const base = resolveBaseUrl(provider, userKey, baseUrl) || PROVIDER_DEFAULT_BASE_URLS[provider];
      const url = `${base}/models`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Authorization": `Bearer ${keyToValidate}` }
      });
      return response.ok;
    } catch (error) {
      console.warn("OpenAI Validation failed:", error);
      return false;
    }
  } 

  if (provider === 'claude') {
    const keyToValidate = resolveApiKey(provider, userKey);
    if (!keyToValidate) return false;
    try {
      const base = resolveBaseUrl(provider, userKey, baseUrl) || PROVIDER_DEFAULT_BASE_URLS[provider];
      const url = `${base}/messages`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "x-api-key": keyToValidate,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "anthropic-dangerously-allow-browser": "true"
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 1,
          messages: [{ role: "user", content: "ping" }]
        })
      });
      return response.ok;
    } catch (error) {
      console.warn("Claude Validation failed:", error);
      return false;
    }
  }
  
  if (provider === 'gemini') {
    const keyToValidate = resolveApiKey(provider, userKey);

    if (!keyToValidate) return false;

    try {
      const base = resolveBaseUrl(provider, userKey, baseUrl);
      // If baseUrl is provided, pass it to the SDK constructor options if supported,
      // or fallback to a method that supports it. 
      // The GoogleGenAI constructor accepts client options including baseUrl.
      const options: any = { apiKey: keyToValidate };
      if (base) {
        options.baseUrl = base;
      }
      
      const ai = new GoogleGenAI(options);
      
      const nonce = Date.now();
      await ai.models.generateContent({
        model: GEMINI_VALIDATION_MODEL,
        contents: { parts: [{ text: `ping ${nonce}` }] },
        config: { 
             responseMimeType: "text/plain",
             thinkingConfig: { thinkingBudget: 0 }
        }
      });
      
      return true;
    } catch (error) {
      console.warn("[Validation] Failed:", error);
      return false;
    }
  }

  return false;
};

async function translateWithGemini(text: string, targetLanguage: string, apiKey: string, baseUrl?: string): Promise<TranslationResult> {
  const userKey = (apiKey || "").trim();
  const key = resolveApiKey('gemini', userKey);
  
  if (!key) {
    throw new Error("Gemini API Key is missing. Please configure it in settings.");
  }

  const options: any = { apiKey: key };
  const resolvedBase = resolveBaseUrl('gemini', userKey, baseUrl);
  if (resolvedBase) {
    options.baseUrl = resolvedBase;
  }

  const ai = new GoogleGenAI(options);

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
           { text: `Translate the following text to ${targetLanguage}.\n\nText:\n"${text}"` }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
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
    if (!jsonText) throw new Error("No response from AI");
    return JSON.parse(jsonText) as TranslationResult;
  } catch (error) {
    console.error("Gemini Translation error:", error);
    throw error;
  }
}

async function translateWithOpenAI(text: string, targetLanguage: string, apiKey: string, baseUrl?: string): Promise<TranslationResult> {
  const userKey = (apiKey || "").trim();
  const key = resolveApiKey(userKey);
  if (!key) {
    throw new Error("OpenAI API Key is missing.");
  }

  // Construct URL: Use custom base or default, then append endpoint
  const base = resolveBaseUrl('openai', userKey, baseUrl) || PROVIDER_DEFAULT_BASE_URLS.openai;
  const url = `${base}/chat/completions`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION + " Return JSON with keys: detectedLanguage, translatedText." },
          { role: "user", content: `Translate the following text to ${targetLanguage}.\n\nText:\n"${text}"` }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      let errorMessage = "OpenAI API request failed";
      try {
        const err = await response.json();
        if (err.error?.message) {
          errorMessage = err.error.message;
        }
      } catch (e) { /* ignore */ }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content from OpenAI");

    return JSON.parse(content) as TranslationResult;
  } catch (error) {
    console.error("OpenAI Translation error:", error);
    throw error;
  }
}

async function translateWithClaude(text: string, targetLanguage: string, apiKey: string, baseUrl?: string): Promise<TranslationResult> {
  const userKey = (apiKey || "").trim();
  const key = resolveApiKey(userKey);
  if (!key) {
    throw new Error("Claude API Key is missing.");
  }

  // Construct URL: Use custom base or default, then append endpoint
  const base = resolveBaseUrl('claude', userKey, baseUrl) || PROVIDER_DEFAULT_BASE_URLS.claude;
  const url = `${base}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerously-allow-browser": "true"
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: SYSTEM_INSTRUCTION + " Return strictly JSON. No markdown, no explanations. keys: detectedLanguage, translatedText.",
        messages: [
          { role: "user", content: `Translate the following text to ${targetLanguage}.\n\nText:\n"${text}"` }
        ]
      })
    });

    if (!response.ok) {
      let errorMessage = "Claude API request failed";
      try {
        const err = await response.json();
        if (err.error?.message) {
          errorMessage = err.error.message;
        }
      } catch (e) { /* ignore */ }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const contentText = data.content?.[0]?.text;
    
    if (!contentText) throw new Error("No content from Claude");

    const cleanJson = contentText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as TranslationResult;

  } catch (error) {
    console.error("Claude Translation error:", error);
    throw error;
  }
}
