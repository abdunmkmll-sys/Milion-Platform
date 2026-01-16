
import React from 'react';
import { Language } from '../types';
import { Languages } from 'lucide-react';

interface Props {
  lang: Language;
  setLang: (lang: Language) => void;
}

export const LanguageToggle: React.FC<Props> = ({ lang, setLang }) => {
  return (
    <button
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      className="glass px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white/10 active:scale-95 transition-all flex items-center gap-3 border border-white/10 group shadow-lg shadow-black/20"
    >
      <Languages size={18} className="text-indigo-400 group-hover:text-white transition-colors" />
      <span className="opacity-80 group-hover:opacity-100 tracking-tight">
        {lang === 'ar' ? 'English' : 'العربية'}
      </span>
    </button>
  );
};
