import { useState, useEffect, useRef } from 'react';
import { THEMES, initTheme, applyTheme } from './ThemeSelector';
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

/* ─── RIGHT DOCK (Theme + Language) ─── */
export default function RightDock() {
  const [panel, setPanel] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [selectedLang, setSelectedLang] = useState(LANGS[0]);
  const [showTop, setShowTop] = useState(false);
  const dockRef = useRef(null);

  useEffect(() => { const k = initTheme(); setCurrentTheme(k); }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) setPanel(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function selectTheme(key) {
    applyTheme(key);
    setCurrentTheme(key);
    setPanel(null);
  }

  function selectLang(lang) {
    setSelectedLang(lang);
    setPanel(null);
    const gtCode = GTRANS_MAP[lang.code];
    setGoogleTranslateLang(gtCode);
    setTimeout(() => window.location.reload(), 50);
  }

  const themeIcon = THEMES[currentTheme]?.icon || 'fa-moon';

  return (
    <>
      {/* ── RIGHT DOCK: Theme + Language + Back-to-top ── */}
      <div className="right-dock" id="right-dock" ref={dockRef}>
        <div id="google_translate_element" style={{ display: 'none' }} />

        {/* THEME */}
        <div className={`rd-item-wrap ${panel === 'theme' ? 'rd-active' : ''}`}>
          <button id="dock-theme-btn" className={`rd-btn ${panel === 'theme' ? 'rd-btn-active' : ''}`}
            onClick={() => setPanel(p => p === 'theme' ? null : 'theme')}
            title="Change Theme" aria-label="Change Theme">
            <i className={`fas ${themeIcon}`} />
          </button>
          <div className="rd-flyout">
            <div className="rd-flyout-title"><i className="fas fa-palette" /> Theme</div>
            {Object.entries(THEMES).map(([key, t]) => (
              <button key={key}
                className={`rd-flyout-item ${currentTheme === key ? 'rd-flyout-item-active' : ''}`}
                onClick={() => selectTheme(key)}>
                <i className={`fas ${t.icon}`} />
                <div><span>{t.label}</span><small>{t.desc}</small></div>
                {currentTheme === key && <i className="fas fa-check rd-check" />}
              </button>
            ))}
          </div>
        </div>

        {/* LANGUAGE */}
        <div className={`rd-item-wrap ${panel === 'lang' ? 'rd-active' : ''}`}>
          <button id="dock-lang-btn" className={`rd-btn ${panel === 'lang' ? 'rd-btn-active' : ''}`}
            onClick={() => setPanel(p => p === 'lang' ? null : 'lang')}
            title="Language" aria-label="Language">
            <span style={{ fontSize: '1.3em', lineHeight: 1 }}>{selectedLang.flag}</span>
          </button>
          <div className="rd-flyout rd-flyout-lang">
            <div className="rd-flyout-title"><i className="fas fa-language" /> Language</div>
            {LANGS.map(l => (
              <button key={l.code}
                className={`rd-flyout-item ${selectedLang.code === l.code ? 'rd-flyout-item-active' : ''}`}
                onClick={() => selectLang(l)}>
                <span className="rd-lang-flag">{l.flag}</span>
                <span>{l.name}</span>
                {selectedLang.code === l.code && <i className="fas fa-check rd-check" />}
              </button>
            ))}
          </div>
        </div>

        {/* SPACER */}
        <div className="rd-spacer" />

        {/* BACK TO TOP */}
        <button
          className={`rd-btn rd-top-btn ${showTop ? 'rd-top-visible' : ''}`}
          id="dock-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Back to top" aria-label="Back to top">
          <i className="fas fa-arrow-up" />
        </button>
      </div>

      {/* ── LEFT FLOATING: Voice Mic ── */}
      <VoiceFloating />

      {/* ── BOTTOM RIGHT FLOATING: AI Chat ── */}
      <AIChatFloating />
    </>
  );
}

/* ─── VOICE — LEFT SIDE FLOATING ─── */
function VoiceFloating() {
  const [listening, setListening] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('Click "Start Listening" and say a section name.');
  const [errorMsg, setErrorMsg] = useState('');
  const recRef = useRef(null);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  function stopListening() {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }

  function startListening() {
    if (!isSupported) {
      setErrorMsg('Your browser does not support voice recognition. Please use Chrome or Edge.');
      return;
    }
    setErrorMsg('');
    setStatus('Listening…');
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = 'en-IN';
    r.continuous = false;
    r.interimResults = false;

    r.onstart = () => setListening(true);

    r.onresult = async (e) => {
      const cmd = e.results[0][0].transcript.toLowerCase();
      setStatus(`Heard: "${cmd}"`);
      
      // Import the helpers dynamically or use the already imported voiceCommands logic
      import('../utils/voiceCommands.js').then(async ({ classifyIntent, parseCommand, navigateTo }) => {
        const intent = classifyIntent(cmd);
        
        if (intent === 'question') {
          setStatus('Thinking...');
          try {
            const ctx = getRelevantContext(cmd, knowledgeChunks);
            // Re-use SYSTEM_PROMPT from below
            const sys = `You are an interactive AI persona for G. Krishna Teja, an Integrated M.Sc. Biotechnology student at VIT Vellore. Speak in first person as Krishna. Be warm, confident, and very concise (1-2 sentences max) because this will be spoken out loud. Base answers on context below. If unknown, say "I'm not sure, please email me."\n\nCONTEXT:\n${ctx}`;
            
            const res = await fetch('/api/voice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: 'meta/llama-3.3-70b-instruct',
                messages: [
                  { role: 'system', content: sys },
                  { role: 'user', content: cmd }
                ],
                max_tokens: 150,
              }),
            });
            const d = await res.json();
            const replyText = d.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that.";
            
            setStatus(`AI: ${replyText}`);
            
            if (window.speechSynthesis) {
              const speech = new SpeechSynthesisUtterance(replyText);
              speech.lang = 'en-US';
              speech.rate = 1.0;
              window.speechSynthesis.speak(speech);
            }
          } catch (err) {
            setStatus('Connection error. Please try again.');
          }
        } else {
          const match = parseCommand(cmd);
          if (match && match.id) {
            setStatus(`↗ Navigating to ${match.id}...`);
            navigateTo(match.id);
            setTimeout(closePanel, 1500);
          } else if (match && match.reply) {
            setStatus(match.reply);
            if (window.speechSynthesis) {
              const speech = new SpeechSynthesisUtterance(match.reply);
              window.speechSynthesis.speak(speech);
            }
            setTimeout(closePanel, 1500);
          } else {
            setStatus(`No match for "${cmd}". Try saying a section name or ask a question.`);
          }
        }
      }).catch(() => {
        setStatus('Error loading voice commands.');
      });
    };

    r.onerror = (e) => {
      setListening(false);
      const msgs = {
        'not-allowed': 'Microphone access denied. Please allow mic in browser settings.',
        'no-speech': 'No speech detected. Please speak clearly.',
        'network': 'Network error. Check your connection.',
        'aborted': 'Listening stopped.',
      };
      setErrorMsg(msgs[e.error] || `Error: ${e.error}`);
      setStatus('Click "Start Listening" to try again.');
    };

    r.onend = () => setListening(false);
    r.start();
    recRef.current = r;
  }

  /* When closing the panel, always stop listening */
  function closePanel() {
    stopListening();
    setOpen(false);
    setStatus('Click "Start Listening" and say a section name.');
    setErrorMsg('');
  }

  return (
    <div className="voice-float-wrap" id="voice-float-wrap">
      {/* Main toggle button — ONLY opens/closes panel, never starts listening */}
      <button
        id="voice-float-btn"
        className={`voice-float-btn ${listening ? 'voice-float-listening' : ''}`}
        onClick={() => open ? closePanel() : setOpen(true)}
        title="Voice Navigation"
        aria-label="Voice Navigation">
        <i className={`fas fa-microphone${listening ? '-slash' : ''}`} />
        {listening && <span className="voice-float-ring" />}
      </button>

      {open && (
        <div className="voice-float-panel">
          <div className="voice-float-head">
            <span><i className="fas fa-microphone" style={{ color: 'var(--gold)', marginRight: 6 }} /> Voice Navigation</span>
            <button className="rd-close-btn" onClick={closePanel}>
              <i className="fas fa-times" />
            </button>
          </div>

          <div className={`voice-float-status ${listening ? 'active' : ''}`}>
            <span className="voice-float-dot" />
            <span>{status}</span>
          </div>

          {errorMsg && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 12px', fontSize: '0.78em', color: '#f87171', marginBottom: 8 }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: 6 }} />{errorMsg}
            </div>
          )}

          {/* Quick-nav chips */}
          <div className="voice-float-chips">
            {['Home', 'About', 'Research', 'Projects', 'Skills', 'Contact'].map(s => (
              <button key={s} className="voice-chip"
                onClick={() => {
                  document.getElementById(s.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                  setStatus(`↗ Navigated to ${s}`);
                }}>
                {s}
              </button>
            ))}
          </div>

          {/* Start / Stop listening */}
          <button
            className={`voice-float-main-btn ${listening ? 'stop' : ''}`}
            onClick={listening ? stopListening : startListening}>
            <i className={`fas fa-${listening ? 'stop-circle' : 'microphone'}`} />
            {listening ? 'Stop Listening' : 'Start Listening'}
          </button>
        </div>
      )}
    </div>
  );
}


/* ─── AI CHAT — BOTTOM RIGHT FLOATING ─── */
const MODEL = 'meta/llama-3.3-70b-instruct';
const SYSTEM_PROMPT = (ctx) => `You are an interactive AI persona for G. Krishna Teja, an Integrated M.Sc. Biotechnology student at VIT Vellore (CGPA: 9.01). Speak in first person as Krishna. Be warm, confident, concise (2-4 sentences). Base answers on context below. If unknown, say to email krishnatejareddy2003@gmail.com.\n\nCONTEXT:\n${ctx}`;
const SUGGESTIONS = ['Tell me about your research 🔬', 'What are your top skills?', 'What projects have you built?', 'How can I contact you?'];

export function AIChatFloating() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Hi! I'm Krishna's AI assistant 🧬 Ask me anything about his research, skills, or projects!" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  // Use a ref to always access the latest state in the event listener
  const stateRef = useRef({ messages, loading });
  useEffect(() => { stateRef.current = { messages, loading }; }, [messages, loading]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(text) {
    const msg = (text || input).trim();
    if (!msg || stateRef.current.loading) return;
    
    setInput('');
    const newMsgs = [...stateRef.current.messages, { role: 'user', content: msg }];
    setMessages(newMsgs);
    setLoading(true);
    
    try {
      const ctx = getRelevantContext(msg, knowledgeChunks);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'system', content: SYSTEM_PROMPT(ctx) }, ...newMsgs.slice(-8)],
          max_tokens: 300,
        }),
      });
      const d = await res.json();
      const reply = d.choices?.[0]?.message?.content || "I'm not sure — please email krishnatejareddy2003@gmail.com!";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again!' }]);
    } finally { setLoading(false); }
  }

  return (
    <div className="ai-float-wrap" id="ai-float-wrap">
      {/* Chat Window */}
      {open && (
        <div className="ai-float-window">
          <div className="ai-float-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),#b8932a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1em', color: '#000' }}>
                  <i className="fas fa-dna" />
                </div>
                <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, background: '#22c55e', borderRadius: '50%', border: '2px solid var(--surface)' }} />
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-bright)', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.05em' }}>Chat with Krishna</strong>
                <span style={{ fontSize: '0.72em', color: 'var(--gold)' }}>AI Assistant · Always online</span>
              </div>
            </div>
            <button className="rd-close-btn" onClick={() => setOpen(false)}><i className="fas fa-times" /></button>
          </div>

          <div className="ai-float-messages">
            {messages.map((m, i) => (
              <div key={i} className={`rd-msg ${m.role}`}>
                {m.role === 'assistant' && (
                  <div className="rd-msg-avatar"><i className="fas fa-dna" /></div>
                )}
                <div className="rd-msg-bubble">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="rd-msg assistant">
                <div className="rd-msg-avatar"><i className="fas fa-dna" /></div>
                <div className="rd-msg-bubble"><span className="ai-typing-dots"><span /><span /><span /></span></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 2 && (
            <div className="ai-float-chips">
              {SUGGESTIONS.map(s => (
                <button key={s} className="ai-suggestion-chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          <div className="ai-float-input-row">
            <input
              className="ai-chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask about Krishna…"
              disabled={loading}
            />
            <button className="ai-chat-send" onClick={() => send()} disabled={loading || !input.trim()}>
              <i className="fas fa-paper-plane" />
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        id="ai-float-btn"
        className={`ai-float-btn ${open ? 'ai-float-open' : ''}`}
        onClick={() => setOpen(p => !p)}
        title="Chat with AI"
        aria-label="AI Assistant">
        <i className={`fas fa-${open ? 'times' : 'brain'}`} />
        {!open && <span className="ai-float-pulse" />}
      </button>
    </div>
  );
}
