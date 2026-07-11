import { useState } from 'react';
import { LANGS, GTRANS, getGoogleTranslateLang, setGoogleTranslateLang } from '../utils/translation';

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
