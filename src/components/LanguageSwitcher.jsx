import { useState, useEffect } from 'react';

const LANGS = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'te', flag: '🇮🇳', name: 'తెలుగు' },
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
  { code: 'ta', flag: '🇮🇳', name: 'தமிழ்' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'ja', flag: '🇯🇵', name: '日本語' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
];

const GTRANS = {
  en: '', te: 'te', hi: 'hi', ta: 'ta',
  de: 'de', fr: 'fr', zh: 'zh-CN', ja: 'ja', ar: 'ar', es: 'es',
};

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

function getCookie(name) {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

function getGoogleTranslateLang() {
  const cookieVal = decodeURIComponent(getCookie('googtrans') || '');
  if (!cookieVal) return 'en';
  const match = cookieVal.match(/\/en\/([^;]+)/);
  return match ? match[1] : 'en';
}

function setGoogleTranslateLang(code) {
  const val = code ? `/en/${code}` : '';
  const expire = code ? '' : 'expires=Thu, 01 Jan 1970 00:00:00 UTC; ';
  document.cookie = `googtrans=${val}; ${expire}path=/`;
  document.cookie = `googtrans=${val}; ${expire}path=/; domain=${location.hostname}`;
}


export function useTranslation() {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    const saved = getGoogleTranslateLang();
    if (saved) {
      const code = Object.keys(GTRANS).find(k => GTRANS[k] === saved) || 'en';
      setLangState(code);
    }
  }, []);

  const t = (k) => TRANSLATIONS[k] || k;
  return { lang, setLang: () => {}, t };
}

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => {
    const code = getGoogleTranslateLang();
    const foundCode = Object.keys(GTRANS).find(key => GTRANS[key] === code) || 'en';
    return LANGS.find(l => l.code === foundCode) || LANGS[0];
  });

  function selectLang(lang) {
    setSelected(lang);
    setOpen(false);
    const gtCode = GTRANS[lang.code] || '';
    setGoogleTranslateLang(gtCode);
    
    // Smooth transition before reloading
    document.body.style.transition = 'opacity 0.35s ease';
    document.body.style.opacity = '0';
    setTimeout(() => window.location.reload(), 380);
  }

  return (
    <div className="dock-lang-switcher" id="dock-lang-switcher">
      <button
        className="dock-lang-btn"
        onClick={() => setOpen(p => !p)}
        title="Change Language"
        aria-label="Language switcher"
      >
        <span className="dock-lang-flag">{selected.flag}</span>
        <span className="dock-lang-code">{selected.code.toUpperCase()}</span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'}`} />
      </button>

      {open && (
        <div className="dock-lang-dropdown" translate="no">
          <div className="dock-lang-dropdown-title">Select Language</div>
          {LANGS.map(l => (
            <button
              key={l.code}
              className={`dock-lang-option ${selected.code === l.code ? 'active' : ''}`}
              onClick={() => selectLang(l)}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
              {selected.code === l.code && <i className="fas fa-check dock-lang-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
