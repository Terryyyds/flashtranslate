# FlashTranslate

Lightning-fast, cross-platform AI translation UI built with React + Vite. By default it uses Anthropic Claude 3.5 Haiku via a built-in system key/endpoint; you can switch to Gemini Flash Lite or GPT-4o Mini in settings.

## Features
- Auto-detects source language and translates to 16+ targets with a single keystroke (press Enter to translate)
- Switchable providers: Claude 3.5 Haiku (default via system key), Gemini 2.5 Flash Lite, or GPT-4o Mini; optional custom API endpoints/proxies
- Two-pane layout with word/character counts, loading overlay, detected-language badge, and copy-to-clipboard for results
- Local-only storage of API settings; validation badge in the header shows whether the key/endpoint combination works

## Requirements
- Node.js 18+ and npm
- An API key for at least one provider (Gemini/OpenAI/Claude). Gemini can optionally use a build-time key without user input.

## Getting Started
```bash
npm install          # install dependencies
npm run dev          # start Vite dev server (http://localhost:3000)
npm run build        # production build
npm run preview      # preview the production build
```

## Configuration
- Built-in system key (Claude only): leave API Key blank while on Claude to use the bundled system key. When using it, the default endpoint is `https://apic1.ohmycdn.com/api/v1/ai/openai/cc-omg/v1`.
- Custom keys: when you enter your own API key, the endpoint auto-fills to the provider default (Gemini `https://generativelanguage.googleapis.com`, OpenAI `https://api.openai.com/v1`, Claude `https://api.anthropic.com/v1`).
- `GEMINI_API_KEY` (optional): when set at build time, it is bundled as `process.env.API_KEY`/`process.env.GEMINI_API_KEY` and used if no Gemini key is entered in the UI.
- In-app settings (gear icon):
  - Choose provider (Gemini/OpenAI/Claude)
  - Enter API key (stored in `localStorage` under `flash_translate_api_config`; cleared with the trash icon)
  - Optional API endpoint override (useful for proxies such as `/v1` compatible gateways)
- Default endpoints (when you supply your own keys): Gemini `https://generativelanguage.googleapis.com`, OpenAI `https://api.openai.com/v1`, Claude `https://api.anthropic.com/v1`.

## Usage
- Select a target language (source is auto-detected)
- Type or paste text in “Original Text” and press Enter or click Translate
- View the detected language and translated text; click the copy icon to copy results
- Status pill in the header shows provider label and key validation state (checking/valid/invalid)

## Project Structure
- `App.tsx`: main layout, translation flow, API state, and settings modal control
- `components/LanguageSelector.tsx`, `components/TranslationArea.tsx`, `components/SettingsModal.tsx`: UI building blocks
- `services/translationService.ts`: provider-agnostic translation + API key validation; `constants.ts` holds languages; `types.ts` defines shared interfaces
- `vite.config.ts`: Vite setup, env injection for Gemini keys, and `@` alias; Tailwind is loaded via CDN in `index.html`

## Notes
- Keys are stored locally in the browser and sent only to the chosen provider endpoint during requests.
- No automated tests are included yet.
