import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google: any;
  }
}

export const GoogleTranslateWidget = () => {
  const initialized = useRef(false);
  
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    // Add the Google Translate script
    const script = document.createElement('script');
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
    
    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google-translate-element'
      );
    };
    
    return () => {
      // Clean up
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window.googleTranslateElementInit;
    };
  }, []);
  
  return <div id="google-translate-element" className="inline-block" />;
};