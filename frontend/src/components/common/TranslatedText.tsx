import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../contexts/TranslationContext';

export const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { t } = useTranslation();
  const [out, setOut] = useState<string>(text);

  useEffect(() => {
    let mounted = true;
    t(text)
      .then(translated => mounted && setOut(translated as string))
      .catch(() => mounted && setOut(text));
    return () => { mounted = false; };
  }, [text, t]);

  return <>{out}</>;
};