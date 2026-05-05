import { useEffect } from 'react';

const TRANSLATIONS = {
  hero_greeting: "Hi, I'm",
  hero_tagline: "Integrated M.Sc. Biotechnology | VIT Vellore | CGPA 9.01",
  about_title: "About Me",
  contact_title: "Contact Me",
  download_resume: "Download Resume",
  hire_me: "Hire Me",
  nav_home: "Home", nav_about: "About", nav_research: "Research",
  nav_projects: "Projects", nav_contact: "Contact",
};

export function useTranslation() {
  return { lang: 'en', setLang: () => {}, t: (k) => TRANSLATIONS[k] || k };
}

export default function LanguageSwitcher() {
  useEffect(() => {
    // Inject Google Translate script safely
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
    <div id="google_translate_element" className="google-translate-pill" style={{
      position: 'fixed', top: '80px', right: '24px', zIndex: 1100, 
      background: 'var(--surface-2)', border: '1px solid var(--gold-dim)', 
      borderRadius: '20px', padding: '6px 12px', overflow: 'hidden', height: '36px'
    }}></div>
  );
}
