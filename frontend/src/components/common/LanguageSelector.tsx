import { useTranslation } from '../../contexts/TranslationContext';

import React from 'react';

export const LanguageSelector: React.FC = () => {
  const { lang, setLang } = useTranslation();
  return (
    <div className="">
      <select
        value={lang}
        onChange={e => setLang(e.target.value)}
        className="
          appearance-none
          bg-white 
          border border-gray-300 
          text-gray-700 
          px-3
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
        "
      >
        <option value="en">🇺🇸 EN</option>
        <option value="fr">🇫🇷 FR</option>
        <option value="es">🇪🇸 ES</option>
      </select>
    </div>
  );
};