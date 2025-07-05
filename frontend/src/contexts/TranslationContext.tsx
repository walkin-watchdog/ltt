import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { translateDOM, installObserver } from '../lib/autoTranslate';

interface TranslationContextValue {
  lang: string;
  setLang: (lang: string) => void;
  t: (text: string) => Promise<string>;
}
const TranslationContext = createContext<TranslationContextValue | null>(null);

export const TranslationProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [lang, setLangState] = useState<string>(() => localStorage.getItem('lang') ?? 'en');

  const setLang = (l: string) => {
    localStorage.setItem('lang', l);
    setLangState(l);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    translateDOM(document.body, lang, import.meta.env.VITE_API_URL)
      .then(() => installObserver(lang, import.meta.env.VITE_API_URL))
      .catch(console.error);
  }, [lang]);

  const t = useMemo(() => {
    type Job = { src: string; resolve: (s: string) => void; reject: (e: unknown) => void };
    let queue: Job[] = [];
    let timer: NodeJS.Timeout | null = null;

    const flush = async () => {
      const jobs = queue;
      queue = [];
      timer = null;

      const texts = jobs.map(j => j.src);

      if (lang === 'en') {
        jobs.forEach(j => j.resolve(j.src));
        return;
      }

      try {
        const resp = await fetch(`${import.meta.env.VITE_API_URL}/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: texts, to: lang }),
        });
        if (!resp.ok) throw new Error('Translation fetch failed');
        const { text: translated } = (await resp.json()) as { text: string[] };

        jobs.forEach((j, i) => j.resolve(translated?.[i] ?? j.src));
      } catch (err) {
        jobs.forEach(j => j.reject(err));
      }
    };

    return (text: string): Promise<string> =>
      new Promise((resolve, reject) => {
        if (lang === 'en') {
          resolve(text);
          return;
        }
        queue.push({ src: text, resolve, reject });
        if (!timer) timer = setTimeout(flush, 0);
      });
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