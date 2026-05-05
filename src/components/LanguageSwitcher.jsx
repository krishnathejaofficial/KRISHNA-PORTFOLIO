import { useState } from 'react';

/* Multi-Language Support — i18n for key portfolio text */
export const LANGUAGES = {
  en: { label: 'English', flag: '🇬🇧', native: 'English' },
  te: { label: 'Telugu', flag: '🇮🇳', native: 'తెలుగు' },
  hi: { label: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  ta: { label: 'Tamil', flag: '🇮🇳', native: 'தமிழ்' },
  de: { label: 'German', flag: '🇩🇪', native: 'Deutsch' },
  ja: { label: 'Japanese', flag: '🇯🇵', native: '日本語' },
};

export const TRANSLATIONS = {
  en: {
    hero_greeting: "Hi, I'm",
    hero_tagline: "Integrated M.Sc. Biotechnology | VIT Vellore | CGPA 9.01",
    about_title: "About Me",
    contact_title: "Contact Me",
    download_resume: "Download Resume",
    hire_me: "Hire Me",
    nav_home: "Home", nav_about: "About", nav_research: "Research",
    nav_projects: "Projects", nav_contact: "Contact",
  },
  te: {
    hero_greeting: "నమస్కారం, నేను",
    hero_tagline: "సమీకృత M.Sc. బయోటెక్నాలజీ | VIT వెల్లూర్ | CGPA 9.01",
    about_title: "నా గురించి",
    contact_title: "నన్ను సంప్రదించండి",
    download_resume: "రెజ్యూమే డౌన్‌లోడ్",
    hire_me: "నన్ను నియమించుకోండి",
    nav_home: "హోమ్", nav_about: "గురించి", nav_research: "పరిశోధన",
    nav_projects: "ప్రాజెక్టులు", nav_contact: "సంప్రదింపు",
  },
  hi: {
    hero_greeting: "नमस्ते, मैं हूँ",
    hero_tagline: "इंटीग्रेटेड M.Sc. बायोटेक्नोलॉजी | VIT वेल्लोर | CGPA 9.01",
    about_title: "मेरे बारे में",
    contact_title: "मुझसे संपर्क करें",
    download_resume: "रिज्यूमे डाउनलोड करें",
    hire_me: "मुझे काम पर रखें",
    nav_home: "होम", nav_about: "परिचय", nav_research: "अनुसंधान",
    nav_projects: "प्रोजेक्ट", nav_contact: "संपर्क",
  },
  ta: {
    hero_greeting: "வணக்கம், நான்",
    hero_tagline: "ஒருங்கிணைந்த M.Sc. உயிர்தொழில்நுட்பவியல் | VIT வேலூர் | CGPA 9.01",
    about_title: "என்னைப் பற்றி",
    contact_title: "என்னை தொடர்பு கொள்ளுங்கள்",
    download_resume: "ரெஸ்யூமே பதிவிறக்கவும்",
    hire_me: "என்னை பணியமர்த்துங்கள்",
    nav_home: "முகப்பு", nav_about: "பற்றி", nav_research: "ஆராய்ச்சி",
    nav_projects: "திட்டங்கள்", nav_contact: "தொடர்பு",
  },
  de: {
    hero_greeting: "Hallo, ich bin",
    hero_tagline: "Integrierter M.Sc. Biotechnologie | VIT Vellore | CGPA 9.01",
    about_title: "Über mich",
    contact_title: "Kontakt",
    download_resume: "Lebenslauf herunterladen",
    hire_me: "Mich einstellen",
    nav_home: "Start", nav_about: "Über", nav_research: "Forschung",
    nav_projects: "Projekte", nav_contact: "Kontakt",
  },
  ja: {
    hero_greeting: "はじめまして、私は",
    hero_tagline: "統合理学修士・バイオテクノロジー | VIT Vellore | CGPA 9.01",
    about_title: "私について",
    contact_title: "お問い合わせ",
    download_resume: "履歴書をダウンロード",
    hire_me: "採用する",
    nav_home: "ホーム", nav_about: "紹介", nav_research: "研究",
    nav_projects: "プロジェクト", nav_contact: "連絡先",
  },
};

export function useTranslation() {
  const stored = localStorage.getItem('portfolio-lang') || 'en';
  const [lang, setLangState] = useState(stored);

  function setLang(l) {
    localStorage.setItem('portfolio-lang', l);
    setLangState(l);
  }

  function t(key) {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
  }

  return { lang, setLang, t };
}

export default function LanguageSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lang-switcher" id="lang-switcher">
      <button className="lang-trigger" onClick={() => setOpen(p => !p)} aria-label="Change Language">
        <span>{LANGUAGES[lang]?.flag}</span>
        <span className="lang-code">{lang.toUpperCase()}</span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '0.7em' }} />
      </button>
      {open && (
        <div className="lang-dropdown">
          {Object.entries(LANGUAGES).map(([code, info]) => (
            <button key={code}
              className={`lang-option ${lang === code ? 'active' : ''}`}
              onClick={() => { setLang(code); setOpen(false); }}>
              <span>{info.flag}</span>
              <span>{info.native}</span>
              {lang === code && <i className="fas fa-check" style={{ color: 'var(--gold)', fontSize: '0.8em', marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
