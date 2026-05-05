import { useState } from 'react';

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

export function useTranslation() {
  return { lang: 'en', setLang: () => {}, t: (k) => TRANSLATIONS[k] || k };
}

function setGoogleTranslateCookie(langCode) {
  if (!langCode) {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + location.hostname;
    return;
  }
  const val = `/en/${langCode}`;
  document.cookie = `googtrans=${val}; path=/`;
  document.cookie = `googtrans=${val}; path=/; domain=${location.hostname}`;
}

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(LANGS[0]);

  function selectLang(lang) {
    setSelected(lang);
    setOpen(false);
    const gtCode = GTRANS[lang.code];
    if (gtCode) {
      setGoogleTranslateCookie(gtCode);
    } else {
      setGoogleTranslateCookie('');
    }
    window.location.reload();
  }

  return (
    <div className="dock-lang-switcher" id="dock-lang-switcher">
      {/* Hidden Google Translate element — will be initialized but hidden */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>

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
        <div className="dock-lang-dropdown">
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
