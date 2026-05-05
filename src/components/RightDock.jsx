import { useState, useEffect, useRef } from 'react';
import { THEMES, initTheme } from './ThemeSelector';
import { knowledgeChunks } from '../data/knowledgeBase';
import { getRelevantContext } from '../utils/ragUtils';
import '../right-dock.css';

/* ─── LANGUAGE DATA ─── */
const LANGS = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'te', flag: '🇮🇳', name: 'తెలుగు' },
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
  { code: 'ta', flag: '🇮🇳', name: 'தமிழ்' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'ja', flag: '🇯🇵', name: '日本語' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
];

const GTRANS_MAP = {
  en: '', te: 'te', hi: 'hi', ta: 'ta',
  de: 'de', fr: 'fr', zh: 'zh-CN', ja: 'ja', es: 'es', ar: 'ar',
};

function setGoogleTranslateLang(code) {
  const val = code ? `/en/${code}` : '';
  const expire = code ? '' : 'expires=Thu, 01 Jan 1970 00:00:00 UTC; ';
  document.cookie = `googtrans=${val}; ${expire}path=/`;
  document.cookie = `googtrans=${val}; ${expire}path=/; domain=${location.hostname}`;
}

/* ─── DOCK ITEM TOOLTIP ─── */
function DockItem({ id, icon, label, onClick, active, badge, children }) {
  return (
    <div className={`rd-item-wrap ${active ? 'rd-active' : ''}`}>
      <button
        id={id}
        className={`rd-btn ${active ? 'rd-btn-active' : ''}`}
        onClick={onClick}
        title={label}
        aria-label={label}
      >
        <i className={icon} />
        {badge && <span className="rd-badge">{badge}</span>}
      </button>
      {children}
    </div>
  );
}

/* ─── MAIN RIGHT DOCK ─── */
export default function RightDock({ onOpenHireMe }) {
  const [panel, setPanel] = useState(null); // 'theme' | 'lang' | 'hireme' | null
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [selectedLang, setSelectedLang] = useState(LANGS[0]);
  const [showTop, setShowTop] = useState(false);
  const [time, setTime] = useState('');
  const [weather, setWeather] = useState(null);

  /* Scroll for back-to-top */
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Init theme */
  useEffect(() => { setCurrentTheme(initTheme()); }, []);

  /* Live clock */
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* Weather */
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(async ({ coords }) => {
      try {
        const r = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true`
        );
        const d = await r.json();
        if (d.current_weather) {
          setWeather({ temp: Math.round(d.current_weather.temperature) });
        }
      } catch { /* silent */ }
    });
  }, []);

  /* Inject Google Translate Script Silently */
  useEffect(() => {
    if (!document.querySelector('#google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
      
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          autoDisplay: false
        }, 'google_translate_element');
      };
    }
  }, []);

  /* Close panel on outside click */
  const dockRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) setPanel(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function togglePanel(name) { setPanel(p => p === name ? null : name); }

  function selectTheme(key) {
    const theme = THEMES[key];
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    document.body.classList.remove('light', 'biotech');
    if (key === 'light') document.body.classList.add('light');
    if (key === 'biotech') document.body.classList.add('biotech');
    localStorage.setItem('portfolio-theme', key);
    setCurrentTheme(key);
    setPanel(null);
  }

  function selectLang(lang) {
    setSelectedLang(lang);
    setPanel(null);
    const gtCode = GTRANS_MAP[lang.code];
    setGoogleTranslateLang(gtCode);
    if (gtCode) {
      setTimeout(() => window.location.reload(), 50);
    } else {
      window.location.reload();
    }
  }

  const themeIcon = THEMES[currentTheme]?.icon || 'fa-moon';

  return (
    <div className="right-dock" id="right-dock" ref={dockRef}>
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      {/* ── THEME ── */}
      <DockItem id="dock-theme-btn" icon={`fas ${themeIcon}`} label="Theme" onClick={() => togglePanel('theme')} active={panel === 'theme'}>
        {panel === 'theme' && (
          <div className="rd-flyout rd-flyout-theme">
            <div className="rd-flyout-title"><i className="fas fa-palette" /> Theme</div>
            {Object.entries(THEMES).map(([key, t]) => (
              <button key={key} className={`rd-flyout-item ${currentTheme === key ? 'rd-flyout-item-active' : ''}`} onClick={() => selectTheme(key)}>
                <i className={`fas ${t.icon}`} />
                <div>
                  <span>{t.label}</span>
                  <small>{t.desc}</small>
                </div>
                {currentTheme === key && <i className="fas fa-check rd-check" />}
              </button>
            ))}
          </div>
        )}
      </DockItem>

      {/* ── LANGUAGE ── */}
      <DockItem id="dock-lang-btn" icon="fas fa-globe" label="Language" onClick={() => togglePanel('lang')} active={panel === 'lang'}>
        <span className="rd-lang-code">{selectedLang.code.toUpperCase()}</span>
        {panel === 'lang' && (
          <div className="rd-flyout rd-flyout-lang">
            <div className="rd-flyout-title"><i className="fas fa-language" /> Language</div>
            {LANGS.map(l => (
              <button key={l.code} className={`rd-flyout-item ${selectedLang.code === l.code ? 'rd-flyout-item-active' : ''}`} onClick={() => selectLang(l)}>
                <span className="rd-lang-flag">{l.flag}</span>
                <span>{l.name}</span>
                {selectedLang.code === l.code && <i className="fas fa-check rd-check" />}
              </button>
            ))}
          </div>
        )}
      </DockItem>

      {/* ── TIME / WEATHER ── */}
      <div className="rd-info-pill" title="Local Time &amp; Weather">
        <span className="rd-time"><i className="far fa-clock" /> {time}</span>
        {weather && <><span className="rd-divider" /><span className="rd-temp"><i className="fas fa-cloud-sun" /> {weather.temp}°C</span></>}
      </div>

      {/* ── SPACER ── */}
      <div className="rd-spacer" />

      {/* ── HIRE ME ── */}
      <DockItem id="dock-hire-btn" icon="fas fa-briefcase" label="Hire Me" onClick={() => togglePanel('hireme')} active={panel === 'hireme'}>
        <span className="rd-hire-label">Hire Me</span>
        {panel === 'hireme' && <HireMePanel onClose={() => setPanel(null)} />}
      </DockItem>

      {/* ── VOICE ── */}
      <VoiceDockItem />

      {/* ── AI CHAT ── */}
      <AIChatDockItem />

      {/* ── BACK TO TOP ── */}
      {showTop && (
        <button className="rd-btn rd-top-btn" id="dock-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Back to top" aria-label="Back to top">
          <i className="fas fa-arrow-up" />
        </button>
      )}
    </div>
  );
}

/* ─── HIRE ME PANEL ─── */
function HireMePanel({ onClose }) {
  const [role, setRole] = useState('');
  const [context, setContext] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const quickRoles = ['Research Intern', 'Biotech Analyst', 'Pharmaceutical QC', 'Business Development', 'Project Collaboration', 'Full-Stack Developer'];

  async function send() {
    if (!email) return alert('Please enter your email address.');
    setStatus('sending');
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_key: '4e9cf101-22a3-4552-9b1f-dc1f86224eaa', subject: `Hire Me: ${role || 'Inquiry'}`, email, message: `Role: ${role}\n\nContext: ${context}` }),
      });
      const d = await r.json();
      if (d.success) { setStatus('success'); setTimeout(() => { onClose(); setStatus('idle'); }, 2500); }
      else setStatus('error');
    } catch { setStatus('error'); }
  }

  return (
    <div className="rd-hire-panel">
      <div className="rd-hire-head">
        <strong><i className="fas fa-paper-plane" /> Quick Hire</strong>
        <button className="rd-close-btn" onClick={onClose}><i className="fas fa-times" /></button>
      </div>
      <div className="clg-field">
        <label>Role / Opportunity</label>
        <input type="text" placeholder="e.g. Research Intern at Biocon..." value={role} onChange={e => setRole(e.target.value)} />
      </div>
      <div className="rd-quick-roles">
        {quickRoles.map(r => (
          <button key={r} className={`voice-chip ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>{r}</button>
        ))}
      </div>
      <div className="clg-field" style={{ marginTop: '8px' }}>
        <label>Your Email</label>
        <input type="email" placeholder="recruiter@company.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="clg-field">
        <label>Context <span style={{ opacity: 0.5 }}>(optional)</span></label>
        <textarea rows={2} placeholder="Brief details..." value={context} onChange={e => setContext(e.target.value)} />
      </div>
      <button className="btn" onClick={send} disabled={status === 'sending'} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', padding: '11px', fontSize: '0.9em', borderRadius: '10px', marginTop: '4px' }}>
        {status === 'idle' && <><i className="fas fa-paper-plane" /> Send Inquiry</>}
        {status === 'sending' && <><i className="fas fa-spinner fa-spin" /> Sending…</>}
        {status === 'success' && <><i className="fas fa-check" /> Sent!</>}
        {status === 'error' && <><i className="fas fa-exclamation-triangle" /> Error — retry</>}
      </button>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <a href="/resume.pdf" target="_blank" rel="noreferrer" className="clg-action-btn" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}><i className="fas fa-file-pdf" /> Resume</a>
        <a href="https://linkedin.com/in/gkrishnateja" target="_blank" rel="noreferrer" className="clg-action-btn" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}><i className="fab fa-linkedin" /> LinkedIn</a>
      </div>
    </div>
  );
}

/* ─── VOICE DOCK ITEM ─── */
function VoiceDockItem() {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const recognitionRef = useRef(null);

  function toggle() {
    if (!supported) return alert('Voice not supported in this browser.');
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = 'en-IN';
    r.onresult = (e) => {
      const cmd = e.results[0][0].transcript.toLowerCase();
      const sections = { home: 'hero', about: 'about', research: 'research', project: 'projects', skill: 'skills', contact: 'contact', certificate: 'certifications', education: 'education' };
      for (const [key, id] of Object.entries(sections)) {
        if (cmd.includes(key)) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); break; }
      }
    };
    r.onend = () => setListening(false);
    r.start();
    recognitionRef.current = r;
    setListening(true);
  }

  return (
    <button id="dock-voice-btn" className={`rd-btn ${listening ? 'rd-btn-listening' : ''}`} onClick={toggle} title="Voice Navigation" aria-label="Voice Navigation">
      <i className={`fas fa-microphone${listening ? '-slash' : ''}`} />
      {listening && <span className="rd-voice-ring" />}
    </button>
  );
}

/* ─── AI CHAT DOCK ITEM ─── */
const MODEL = 'meta/llama-3.1-70b-instruct';
const SYSTEM_PROMPT = (ctx) => `You are an interactive AI persona for G. Krishna Teja, an Integrated M.Sc. Biotechnology student at VIT Vellore (CGPA: 9.01). You speak in first person as Krishna. Be warm, confident, concise (2–4 sentences). Base answers on context. If unknown, say to email krishnatejareddy2003@gmail.com.\n\nCONTEXT:\n${ctx}`;
const SUGGESTIONS = ['Tell me about your research 🔬', 'What are your top skills?', 'What projects have you built?', 'How can I contact you?'];

function AIChatDockItem() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Hi! I'm Krishna's AI assistant. Ask me anything about his research, skills, or projects 🧬" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const newMsgs = [...messages, { role: 'user', content: msg }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const ctx = getRelevantContext(msg, knowledgeChunks);
      const r = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: SYSTEM_PROMPT(ctx) }, ...newMsgs.slice(-8)], max_tokens: 300 }),
      });
      const d = await r.json();
      const reply = d.choices?.[0]?.message?.content || "I'm not sure — please email krishnatejareddy2003@gmail.com!";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Try again!" }]); }
    finally { setLoading(false); }
  }

  return (
    <div className="rd-item-wrap">
      <button id="dock-ai-btn" className={`rd-btn ${open ? 'rd-btn-active' : ''}`} onClick={() => setOpen(p => !p)} title="Chat with AI" aria-label="AI Chat">
        <i className="fas fa-brain" />
        {!open && <span className="rd-ai-pulse" />}
      </button>

      {open && (
        <div className="rd-chat-window">
          <div className="rd-chat-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <img src="/profile.jpg" alt="Krishna" style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                <span style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, background: '#22c55e', borderRadius: '50%', border: '2px solid var(--surface)' }} />
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-bright)', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.05em' }}>Chat with Krishna</strong>
                <span style={{ fontSize: '0.72em', color: 'var(--gold)', opacity: 0.85 }}>AI · Always online</span>
              </div>
            </div>
            <button className="rd-close-btn" onClick={() => setOpen(false)}><i className="fas fa-times" /></button>
          </div>

          <div className="rd-chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`rd-msg ${m.role}`}>
                {m.role === 'assistant' && <div className="rd-msg-avatar"><i className="fas fa-dna" /></div>}
                <div className="rd-msg-bubble">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="rd-msg assistant">
                <div className="rd-msg-avatar"><i className="fas fa-dna" /></div>
                <div className="rd-msg-bubble"><span className="ai-typing-dots"><span /><span /><span /></span></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && (
            <div className="rd-chat-chips">
              {SUGGESTIONS.map(s => <button key={s} className="ai-suggestion-chip" onClick={() => send(s)}>{s}</button>)}
            </div>
          )}

          <div className="rd-chat-input-row">
            <input className="ai-chat-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about Krishna…" disabled={loading} />
            <button className="ai-chat-send" onClick={() => send()} disabled={loading || !input.trim()}><i className="fas fa-paper-plane" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
