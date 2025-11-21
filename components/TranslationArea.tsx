import React from 'react';
import { Copy, Check } from 'lucide-react';

interface TranslationAreaProps {
  value: string;
  onChange?: (val: string) => void;
  placeholder: string;
  readonly?: boolean;
  isLoading?: boolean;
  label?: string;
}

export const TranslationArea: React.FC<TranslationAreaProps> = ({
  value,
  onChange,
  placeholder,
  readonly = false,
  isLoading = false,
  label,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Use Intl.Segmenter if available for better word counting (works for CJK etc)
  const wordCount = React.useMemo(() => {
    if (!value.trim()) return 0;
    if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
      const segmenter = new (Intl as any).Segmenter([], { granularity: 'word' });
      const segments = [...segmenter.segment(value)];
      return segments.filter((s: any) => s.isWordLike).length;
    }
    return value.trim().split(/\s+/).length;
  }, [value]);

  return (
    <div className="relative flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        {/* Header / Label Area */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            {label}
        </span>
        {readonly && value && (
          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center backdrop-blur-sm rounded-b-2xl">
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-sm text-blue-600 font-medium animate-pulse">Translating...</span>
            </div>
          </div>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readonly}
          placeholder={placeholder}
          className={`w-full h-full p-4 bg-transparent resize-none focus:outline-none text-lg leading-relaxed text-slate-700 placeholder:text-slate-300 ${readonly ? 'cursor-text' : ''}`}
          spellCheck={!readonly}
        />
      </div>
      
      {/* Footer: Character/Word count */}
      {!readonly && (
        <div className="px-4 py-2 text-right text-xs text-slate-400 border-t border-slate-50">
          {value.length} chars &bull; {wordCount} words
        </div>
      )}
    </div>
  );
};