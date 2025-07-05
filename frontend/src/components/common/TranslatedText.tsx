import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from '../../contexts/TranslationContext';

export const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { t } = useTranslation();
  const [out, setOut] = useState<string>(text);
  const attemptedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    if (attemptedRef.current) {
      if (mounted) setOut(text);
      return;
    }
    attemptedRef.current = true;

    t(text)
      .then(translated => {
        if (mounted) setOut(translated as string);
      })
      .catch(() => {
        if (mounted) {
          toast.error('Translation failed');
          setOut(text);
        }
      });

    return () => { mounted = false; };
  }, [text, t]);

  return <>{out}</>;
};