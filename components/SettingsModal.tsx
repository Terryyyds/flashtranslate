
import React, { useState, useEffect } from 'react';
import { X, Save, Key, Lock, Trash2, Globe } from 'lucide-react';
import { ApiConfig, ApiProvider } from '../types';
import { PROVIDER_DEFAULT_BASE_URLS, SYSTEM_BASE_URL } from '../constants';

const resolveBaseUrl = (provider: ApiProvider, apiKey: string, baseUrl?: string) => {
  const trimmedBase = baseUrl?.trim();
  if (trimmedBase) return trimmedBase;
  const hasCustomKey = !!apiKey?.trim();
  if (!hasCustomKey && provider === 'claude') return SYSTEM_BASE_URL;
  return PROVIDER_DEFAULT_BASE_URLS[provider];
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSave: (config: ApiConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [provider, setProvider] = useState<ApiProvider>(config.provider);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [baseUrl, setBaseUrl] = useState(() => resolveBaseUrl(config.provider, config.apiKey, config.baseUrl));

  useEffect(() => {
    if (isOpen) {
      setProvider(config.provider);
      setApiKey(config.apiKey);
      setBaseUrl(resolveBaseUrl(config.provider, config.apiKey, config.baseUrl));
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ 
      provider, 
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim() || undefined 
    });
    onClose();
  };

  const handleClearKey = () => {
    setApiKey('');
    setBaseUrl(resolveBaseUrl(provider, ''));
  };

  const handleProviderChange = (nextProvider: ApiProvider) => {
    setProvider(nextProvider);
    setBaseUrl(resolveBaseUrl(nextProvider, apiKey));
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    const trimmed = value.trim();
    setBaseUrl(resolveBaseUrl(provider, trimmed));
  };

  const getProviderLabel = (p: ApiProvider) => {
    switch(p) {
      case 'gemini': return 'Gemini';
      case 'openai': return 'OpenAI';
      case 'claude': return 'Claude';
      default: return '';
    }
  };

  const getEndpointPlaceholder = (p: ApiProvider) => {
    return PROVIDER_DEFAULT_BASE_URLS[p] || 'https://api.example.com';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all scale-100 opacity-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600" />
            API Settings
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">AI Provider</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleProviderChange('gemini')}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl border transition-all ${
                  provider === 'gemini'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="font-medium text-sm">Google Gemini</span>
              </button>
              <button
                onClick={() => handleProviderChange('openai')}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl border transition-all ${
                  provider === 'openai'
                    ? 'bg-teal-50 border-teal-200 text-teal-700 ring-1 ring-teal-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="font-medium text-sm">OpenAI</span>
              </button>
              <button
                onClick={() => handleProviderChange('claude')}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl border transition-all ${
                  provider === 'claude'
                    ? 'bg-orange-50 border-orange-200 text-orange-800 ring-1 ring-orange-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="font-medium text-sm">Claude</span>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 flex justify-between">
              <span>API Key</span>
              {provider === 'claude' && !apiKey && (
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Using System Key</span>
              )}
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder={`Enter your ${getProviderLabel(provider)} API Key`}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              
              {apiKey && (
                <button 
                  onClick={handleClearKey}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Clear API Key (Use Default)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {(!apiKey && provider === 'claude') 
                ? `Using system key and default endpoint (${SYSTEM_BASE_URL}). Leave blank to keep using the built-in credentials.` 
                : !apiKey
                  ? "No key provided. Enter your own API key for this provider."
                  : "Your API key is stored locally in your browser and sent directly to the chosen provider/endpoint."}
            </p>
          </div>

          {/* Base URL Input (Optional) */}
          <div className="space-y-3">
             <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>API Endpoint (Optional)</span>
             </label>
             <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={getEndpointPlaceholder(provider)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 text-sm font-mono"
             />
             <p className="text-xs text-slate-500">
                Override the default API URL. Useful for proxies or enterprise endpoints.
             </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 rounded-b-2xl border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
