import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';

interface LanguageSelectorProps {
  selected: Language;
  onChange: (lang: Language) => void;
  label?: string;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selected,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <div className="relative group">
      {label && (
        <span className="absolute -top-2.5 left-2 bg-white px-1 text-xs font-medium text-slate-500">
          {label}
        </span>
      )}
      <div className="relative">
        <select
          value={selected.code}
          onChange={(e) => {
            const lang = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
            if (lang) onChange(lang);
          }}
          disabled={disabled}
          className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 cursor-pointer hover:border-slate-300"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
};
