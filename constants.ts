import { ApiProvider, Language } from './types';

// System defaults for provider selection and managed credentials
export const DEFAULT_PROVIDER: ApiProvider = 'claude';
export const SYSTEM_API_KEY = 'sk-C0ttZeUVBBCF34873ba0T3BlBkFJeb4E2CfAA1724df98031';
export const SYSTEM_BASE_URL = 'https://apic1.ohmycdn.com/api/v1/ai/openai/cc-omg/v1';

export const PROVIDER_DEFAULT_BASE_URLS: Record<ApiProvider, string> = {
  gemini: 'https://generativelanguage.googleapis.com',
  openai: 'https://api.openai.com/v1',
  claude: 'https://api.anthropic.com/v1',
};

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ko', name: 'Korean' },
  { code: 'tr', name: 'Turkish' },
  { code: 'id', name: 'Indonesian' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
];

export const DEFAULT_TARGET_LANGUAGE = SUPPORTED_LANGUAGES[0]; // English
