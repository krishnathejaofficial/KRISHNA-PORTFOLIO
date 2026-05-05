import { useEffect } from 'react';

export function useTranslation() {
  return { lang: 'en', setLang: () => {}, t: (k) => k };
}

export default function LanguageSwitcher() {
  useEffect(() => {
    // Check if script already exists
    if (!document.querySelector('#google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      };
    }
  }, []);

  return (
    <div id="google_translate_element" className="google-translate-container"></div>
  );
}
