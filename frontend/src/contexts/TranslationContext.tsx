import React, { createContext, useState, useContext, useMemo } from 'react';

interface TranslationContextValue {
  lang: string;
  setLang: (lang: string) => void;
  t: (text: string | string[]) => Promise<string | string[]>;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

export const TranslationProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [lang, setLang] = useState<string>('en');

  const t = useMemo(() => {
    return async (text: string | string[]) => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, to: lang }),
      });
      if (!resp.ok) throw new Error('Translation fetch failed');
      const { text: translated } = await resp.json();
      return translated;
    };
  }, [lang]);

  return (
    <TranslationContext.Provider value={{ lang, setLang, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error('useTranslation must be inside TranslationProvider');
  return ctx;
};