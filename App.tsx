
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowRightLeft, Sparkles, Zap, Settings, Key } from 'lucide-react';
import { Language, TranslationState, ApiConfig } from './types';
import { SUPPORTED_LANGUAGES, DEFAULT_TARGET_LANGUAGE } from './constants';
import { translateText, validateApiConfig } from './services/translationService';
import { LanguageSelector } from './components/LanguageSelector';
import { TranslationArea } from './components/TranslationArea';
import { SettingsModal } from './components/SettingsModal';

const App: React.FC = () => {
  const [state, setState] = useState<TranslationState>({
    sourceText: '',
    targetText: '',
    detectedLang: null,
    targetLang: DEFAULT_TARGET_LANGUAGE,
    isTranslating: false,
    error: null,
  });

  // API Configuration State
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const saved = localStorage.getItem('flash_translate_api_config');
    // Backward compatibility: if saved config exists but doesn't handle new providers well, validation will catch it
    return saved ? JSON.parse(saved) : { provider: 'gemini', apiKey: '' };
  });

  // API Validation State
  const [apiStatus, setApiStatus] = useState<'valid' | 'invalid' | 'checking' | 'unknown'>('unknown');

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validate API Key whenever config changes
  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      setApiStatus('checking');
      setState(prev => ({ ...prev, error: null })); // Clear errors on config change

      // Artificial delay to let user see the "checking" state (better UX)
      const minDelay = new Promise(resolve => setTimeout(resolve, 600));
      const validationPromise = validateApiConfig(apiConfig);
      
      const [_, isValid] = await Promise.all([minDelay, validationPromise]);

      if (isMounted) {
        setApiStatus(isValid ? 'valid' : 'invalid');
      }
    };
    
    checkStatus();

    return () => { isMounted = false; };
  }, [apiConfig]);

  const handleSaveApiConfig = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    localStorage.setItem('flash_translate_api_config', JSON.stringify(newConfig));
  };

  const handleTranslate = useCallback(async () => {
    if (!state.sourceText.trim()) return;

    setState(prev => ({ ...prev, isTranslating: true, error: null }));

    try {
      const result = await translateText(
        state.sourceText, 
        state.targetLang.name,
        apiConfig
      );
      
      setState(prev => ({
        ...prev,
        targetText: result.translatedText,
        detectedLang: result.detectedLanguage,
        isTranslating: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'An unexpected error occurred',
        isTranslating: false,
      }));
    }
  }, [state.sourceText, state.targetLang, apiConfig]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  // Helper to find language name from code for display
  const getLanguageName = (code: string | null) => {
    if (!code) return 'AUTO (Detected)';
    const found = SUPPORTED_LANGUAGES.find(l => l.code.toLowerCase() === code.toLowerCase());
    return found ? `${found.name} (Detected)` : `${code.toUpperCase()} (Detected)`;
  };

  // Determine status dot color
  const getStatusDotColor = () => {
    switch (apiStatus) {
      case 'valid': return 'bg-green-500';
      case 'invalid': return 'bg-gray-400';
      case 'checking': return 'bg-yellow-400 animate-pulse';
      default: return 'bg-blue-500';
    }
  };

  const getModelLabel = () => {
    if (apiConfig.provider === 'openai') return 'GPT-4o Mini';
    if (apiConfig.provider === 'claude') return 'Claude 3.5 Haiku';
    return 'Gemini 2.5 Flash Lite';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        {/* Updated padding to match main content alignment */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <Zap className="w-5 h-5 fill-current" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900">FlashTranslate</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Removed 'hidden sm:flex' to show on mobile, added responsive text hiding */}
            <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 transition-colors duration-300">
               <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${getStatusDotColor()}`} />
               <span className="hidden sm:inline">Powered by</span>
               {getModelLabel()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Controls Bar */}
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-2">
            
            {/* Source Language Display */}
            <div className="w-full sm:w-1/3 px-4 py-2.5 text-slate-600 font-medium text-sm bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <span>{getLanguageName(state.detectedLang)}</span>
                <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                  {state.detectedLang || 'AUTO'}
                </span>
            </div>

            <div className="p-2 text-slate-300">
                <ArrowRightLeft className="w-5 h-5" />
            </div>

            {/* Target Language Selector */}
            <div className="w-full sm:w-1/3">
                <LanguageSelector 
                    selected={state.targetLang}
                    onChange={(lang) => setState(prev => ({ ...prev, targetLang: lang }))}
                />
            </div>

            {/* Actions Group: Translate + Settings */}
            <div className="w-full sm:w-auto sm:ml-auto sm:pl-2 flex items-center gap-2">
                {/* Translate Button */}
                <button
                    onClick={handleTranslate}
                    disabled={state.isTranslating || !state.sourceText.trim()}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm active:scale-95"
                >
                    {state.isTranslating ? (
                        <span className="flex items-center gap-2">Translating...</span>
                    ) : (
                        <>
                            <span>Translate</span>
                            <Sparkles className="w-4 h-4 fill-blue-400/20" />
                        </>
                    )}
                </button>

                {/* Settings Dropdown */}
                <div className="relative" ref={settingsRef}>
                  <button 
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-lg transition-all flex items-center justify-center shadow-sm"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  
                  {showSettingsMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowApiModal(true);
                            setShowSettingsMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                        >
                          <Key className="w-4 h-4" />
                          Configure API Key
                        </button>
                      </div>
                    </div>
                  )}
                </div>
            </div>
        </div>

        {/* Translation Area Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">
            {/* Input Side */}
            <div className="h-full" onKeyDown={handleKeyDown}>
                <TranslationArea
                    label="Original Text"
                    placeholder="Type or paste text here..."
                    value={state.sourceText}
                    onChange={(val) => setState(prev => ({ ...prev, sourceText: val }))}
                />
            </div>

            {/* Output Side */}
            <div className="h-full">
                <TranslationArea
                    label={`Translation (${state.targetLang.name})`}
                    placeholder="Translation will appear here..."
                    value={state.targetText}
                    readonly={true}
                    isLoading={state.isTranslating}
                />
            </div>
        </div>

        {/* Error Message Toast */}
        {state.error && (
            <div className="fixed bottom-4 right-4 max-w-md bg-red-50 text-red-600 px-4 py-3 rounded-lg shadow-lg border border-red-100 flex items-start gap-3 animate-in slide-in-from-bottom-4 fade-in z-50">
                <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full flex-shrink-0" />
                <p className="text-sm font-medium break-words">{state.error}</p>
                <button 
                    onClick={() => setState(prev => ({ ...prev, error: null }))}
                    className="ml-auto text-red-400 hover:text-red-700"
                >
                    &times;
                </button>
            </div>
        )}

      </main>

        {/* Footer Info */}
      <footer className="py-6 text-center text-slate-400 text-sm">
          <p>Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-sans text-xs mx-1">Enter</kbd> to translate</p>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        config={apiConfig}
        onSave={handleSaveApiConfig}
      />
    </div>
  );
};

export default App;
