import { useState } from 'react';

/* Theme Selector: Dark (default) | Light | Biotech */
export const THEMES = {
  dark: {
    label: 'Dark', icon: 'fa-moon', desc: 'Classic dark mode',
    vars: {
      '--bg': '#080808', '--surface': 'rgba(18,18,18,0.92)', '--surface-2': 'rgba(28,28,28,0.85)',
      '--text': '#c8c8c8', '--text-bright': '#f0f0f0', '--gold': '#D4AF37', '--gold-light': '#f0c14b',
    },
  },
  light: {
    label: 'Light', icon: 'fa-sun', desc: 'Clean & minimal',
    vars: {
      '--bg': '#f5f5f0', '--surface': 'rgba(240,238,230,0.95)', '--surface-2': 'rgba(230,228,220,0.92)',
      '--text': '#444', '--text-bright': '#111', '--gold': '#B8860B', '--gold-light': '#DAA520',
    },
  },
  biotech: {
    label: 'Biotech', icon: 'fa-dna', desc: 'Bioluminescent green',
    vars: {
      '--bg': '#020b0a', '--surface': 'rgba(5,20,18,0.95)', '--surface-2': 'rgba(8,28,24,0.90)',
      '--text': '#a0d4c8', '--text-bright': '#d4f5ee', '--gold': '#00e5a0', '--gold-light': '#4dffc8',
      '--gold-dim': 'rgba(0,229,160,0.2)', '--gold-glow': 'rgba(0,229,160,0.4)',
    },
  },
};

function applyTheme(themeKey) {
  const theme = THEMES[themeKey];
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  // body class for light mode compat
  document.body.classList.remove('light', 'biotech');
  if (themeKey === 'light') document.body.classList.add('light');
  if (themeKey === 'biotech') document.body.classList.add('biotech');
  localStorage.setItem('portfolio-theme', themeKey);
}

export function initTheme() {
  const saved = localStorage.getItem('portfolio-theme') || 'dark';
  applyTheme(saved);
  return saved;
}

export default function ThemeSelector({ currentTheme, setCurrentTheme }) {
  const [open, setOpen] = useState(false);

  function select(key) {
    applyTheme(key);
    setCurrentTheme(key);
    setOpen(false);
  }

  const theme = THEMES[currentTheme] || THEMES.dark;

  return (
    <div className="theme-selector" id="theme-selector">
      <button className="theme-trigger" onClick={() => setOpen(p => !p)}
        title={`Theme: ${theme.label}`} aria-label="Select Theme">
        <i className={`fas ${theme.icon}`} />
      </button>
      {open && (
        <div className="theme-dropdown">
          <p className="theme-dropdown-title">Choose Theme</p>
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} className={`theme-option ${currentTheme === key ? 'active' : ''}`}
              onClick={() => select(key)}>
              <i className={`fas ${t.icon}`} />
              <div>
                <span>{t.label}</span>
                <small>{t.desc}</small>
              </div>
              {currentTheme === key && <i className="fas fa-check" style={{ marginLeft: 'auto', color: 'var(--gold)' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
