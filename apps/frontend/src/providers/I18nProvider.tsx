'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import vi from '@/i18n/vi.json';
import en from '@/i18n/en.json';

type Lang = 'vi' | 'en';
type Translations = typeof vi;

const translations: Record<Lang, Translations> = { vi, en };

interface I18nContextType {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('vi');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    const defaultLang = (process.env.NEXT_PUBLIC_DEFAULT_LANG as Lang) || 'vi';
    const initial = stored || defaultLang;
    setLangState(initial);
    document.documentElement.lang = initial;
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.lang = newLang;
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
