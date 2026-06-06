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


/* ─── RIGHT DOCK (Theme + Language) ─── */
export default function RightDock({ onOpenDoubts }) {
  const [panel, setPanel] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [selectedLang, setSelectedLang] = useState(() => {
    const code = getGoogleTranslateLang();
    const foundCode = Object.keys(GTRANS_MAP).find(key => GTRANS_MAP[key] === code) || 'en';
    return LANGS.find(l => l.code === foundCode) || LANGS[0];
  });
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
    const gtCode = GTRANS_MAP[lang.code] || '';
    setGoogleTranslateLang(gtCode);
    
    // Smooth transition before reloading
    document.body.style.transition = 'opacity 0.35s ease';
    document.body.style.opacity = '0';
    setTimeout(() => window.location.reload(), 380);
  }

  const themeIcon = THEMES[currentTheme]?.icon || 'fa-moon';

  return (
    <>
      {/* ── RIGHT DOCK: Theme + Language + Back-to-top ── */}
      <div className="right-dock" id="right-dock" ref={dockRef}>

        {/* THEME */}
        <div className={`rd-item-wrap ${panel === 'theme' ? 'rd-active' : ''}`}>
          <button id="dock-theme-btn" className={`rd-btn ${panel === 'theme' ? 'rd-btn-active' : ''}`}
            onClick={() => setPanel(p => p === 'theme' ? null : 'theme')}
            title="Change Theme" aria-label="Change Theme">
            <i className={`fas ${themeIcon}`} />
          </button>
          <div className="rd-flyout" translate="no">
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
          <div className="rd-flyout rd-flyout-lang" translate="no">
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
      <VoiceFloating onOpenDoubts={onOpenDoubts} />

      {/* ── BOTTOM RIGHT FLOATING: AI Chat ── */}
      <AIChatFloating onOpenDoubts={onOpenDoubts} />
    </>
  );
}

/* ─── VOICE — LEFT SIDE FLOATING ─── */

function getBestIndianMaleVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  
  // Try to find premium Indian Male voices first
  return voices.find(v => v.name.includes('Prabhat') || v.name.includes('Ravi')) // Windows Indian Male
      || voices.find(v => v.lang === 'en-IN' && (v.name.includes('Male') || v.name.includes('male'))) // Generic Indian Male
      || voices.find(v => v.lang === 'en-IN') // Any Indian voice (often default is female though)
      || voices.find(v => v.name.includes('UK English Male') || v.name.includes('Great Britain')) // Fallback to British Male
      || voices.find(v => v.lang.startsWith('en') && v.name.includes('Male')) // Any English Male
      || voices[0]; // Absolute fallback
}

function VoiceFloating({ onOpenDoubts }) {
  const [listening, setListening] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('Click "Start Listening" and say a section name.');
  const [errorMsg, setErrorMsg] = useState('');
  const recRef = useRef(null);

  // Pre-load voices on mount so they are ready when getBestIndianMaleVoice is called
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

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
      
      if (cmd.includes('doubt') || cmd.includes('ask a question') || cmd.includes('submit a question')) {
        setStatus('Opening doubt form...');
        if (onOpenDoubts) {
          onOpenDoubts();
          if (window.speechSynthesis) {
            const speech = new SpeechSynthesisUtterance("Opening the doubt clarification form.");
            const bestVoice = getBestIndianMaleVoice();
            if (bestVoice) speech.voice = bestVoice;
            else speech.lang = 'en-IN';
            window.speechSynthesis.speak(speech);
          }
          setTimeout(closePanel, 1500);
        }
        return;
      }
      
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
                model: 'meta/llama-3.1-8b-instruct',
                messages: [
                  { role: 'system', content: sys },
                  { role: 'user', content: cmd }
                ],
                max_tokens: 150,
              }),
            });
            const d = await res.json();
            const replyText = d.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that.";
            
            setStatus(`KRISHNA: ${replyText}`);
            
            if (window.speechSynthesis) {
              const speech = new SpeechSynthesisUtterance(replyText);
              
              const bestVoice = getBestIndianMaleVoice();
              if (bestVoice) {
                speech.voice = bestVoice;
              } else {
                speech.lang = 'en-IN';
              }
              
              speech.rate = 1.05; // Slightly faster to feel more responsive
              speech.onend = () => {
                setTimeout(closePanel, 2000);
              };
              window.speechSynthesis.speak(speech);
            } else {
              setTimeout(closePanel, 4000);
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
              
              const bestVoice = getBestIndianMaleVoice();
              if (bestVoice) {
                speech.voice = bestVoice;
              } else {
                speech.lang = 'en-IN';
              }
              
              speech.rate = 1.05;
              speech.onend = () => {
                setTimeout(closePanel, 1500);
              };
              window.speechSynthesis.speak(speech);
            } else {
              setTimeout(closePanel, 1500);
            }
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
const SUGGESTIONS = ['Ask Krishna a Doubt 💡', 'Tell me about your research 🔬', 'What are your top skills?', 'What projects have you built?'];

const CHAT_SESSION_KEY = 'krishna_chat_history';
const DEFAULT_MSG = { role: 'assistant', content: "Hi! I'm Krishna's AI assistant 🧬 Ask me anything about his research, skills, or projects!" };

export function AIChatFloating({ onOpenDoubts }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(CHAT_SESSION_KEY);
      return saved ? JSON.parse(saved) : [DEFAULT_MSG];
    } catch { return [DEFAULT_MSG]; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  // Use a ref to always access the latest state in the event listener
  const stateRef = useRef({ messages, loading });
  useEffect(() => { stateRef.current = { messages, loading }; }, [messages, loading]);

  // Persist chat history to sessionStorage
  useEffect(() => {
    try { sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function clearHistory() {
    const fresh = [DEFAULT_MSG];
    setMessages(fresh);
    try { sessionStorage.removeItem(CHAT_SESSION_KEY); } catch {}
  }

  async function send(text) {
    const msg = (text || input).trim();
    if (!msg || stateRef.current.loading) return;
    
    setInput('');
    const newMsgs = [...stateRef.current.messages, { role: 'user', content: msg }];
    setMessages(newMsgs);
    
    if (msg.includes('Ask Krishna a Doubt')) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sure! You can submit your question directly to me using the doubt clarification form. I will receive an email and reply to your inbox within 24-48 hours.",
        showDoubtBtn: true
      }]);
      return;
    }
    
    setLoading(true);
    
    try {
      const ctx = getRelevantContext(msg, knowledgeChunks);
      const isAskingDoubt = msg.toLowerCase().includes('doubt') || msg.toLowerCase().includes('ask a question') || msg.toLowerCase().includes('submit a question');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'system', content: SYSTEM_PROMPT(ctx) }, ...newMsgs.slice(-10)],
          max_tokens: 300,
        }),
      });
      const d = await res.json();
      const reply = d.choices?.[0]?.message?.content || "I'm not sure — please email krishnatejareddy2003@gmail.com!";
      setMessages(prev => [...prev, { role: 'assistant', content: reply, showDoubtBtn: isAskingDoubt }]);
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={clearHistory} title="Clear chat history" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.78em', padding: '4px 8px', borderRadius: '6px' }} onMouseEnter={e => e.currentTarget.style.color='#ef4444'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
                <i className="fas fa-trash-alt" style={{ marginRight: '3px' }}/> Clear
              </button>
              <button className="rd-close-btn" onClick={() => setOpen(false)}><i className="fas fa-times" /></button>
            </div>
          </div>

          <div className="ai-float-messages">
            {messages.map((m, i) => (
              <div key={i} className={`rd-msg ${m.role}`}>
                {m.role === 'assistant' && (
                  <div className="rd-msg-avatar"><i className="fas fa-dna" /></div>
                )}
                <div className="rd-msg-bubble">
                  {m.content}
                  {m.showDoubtBtn && onOpenDoubts && (
                    <button
                      onClick={onOpenDoubts}
                      className="btn"
                      style={{
                        marginTop: '10px',
                        background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.85em',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        width: 'fit-content',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
                      }}
                    >
                      <i className="fas fa-lightbulb" /> Open Doubt Form
                    </button>
                  )}
                </div>
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
