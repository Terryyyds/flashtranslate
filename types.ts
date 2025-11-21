
export interface Language {
  code: string;
  name: string;
}

export interface TranslationResult {
  detectedLanguage: string;
  translatedText: string;
}

export interface TranslationState {
  sourceText: string;
  targetText: string;
  detectedLang: string | null;
  targetLang: Language;
  isTranslating: boolean;
  error: string | null;
}

export type ApiProvider = 'gemini' | 'openai' | 'claude';

export interface ApiConfig {
  provider: ApiProvider;
  apiKey: string;
  model?: string;
  baseUrl?: string;
}
