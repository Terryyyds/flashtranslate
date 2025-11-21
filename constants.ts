import { Language } from './types';

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