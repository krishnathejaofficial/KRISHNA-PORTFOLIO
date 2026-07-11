import { useState, useEffect } from 'react';

export const LANGS = [
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

export const GTRANS = {
  en: '', te: 'te', hi: 'hi', ta: 'ta',
  de: 'de', fr: 'fr', zh: 'zh-CN', ja: 'ja', ar: 'ar', es: 'es',
};

const TRANSLATIONS = {
  hero_greeting: "Hi, I'm",
  hero_tagline: "Integrated M.Sc. Biotechnology | VIT Vellore | CGPA 9.01",
  about_title: "About Me",
  contact_title: "Contact Me",
  download_resume: "Download Resume",
  hero_hire: "Hire Krishna",
  nav_home: "Home", nav_about: "About", nav_research: "Research",
  nav_projects: "Projects", nav_contact: "Contact",
};

export function getCookie(name) {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

export function getGoogleTranslateLang() {
  const cookieVal = decodeURIComponent(getCookie('googtrans') || '');
  if (!cookieVal) return 'en';
  const match = cookieVal.match(/\/en\/([^;]+)/);
  return match ? match[1] : 'en';
}

export function setGoogleTranslateLang(code) {
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
