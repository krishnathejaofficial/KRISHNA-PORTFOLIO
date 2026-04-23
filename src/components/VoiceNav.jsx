import { useState, useEffect, useRef, useCallback } from 'react';
import { parseCommand, navigateTo, classifyIntent } from '../utils/voiceCommands';
import { knowledgeChunks } from '../data/knowledgeBase';
import { getRelevantContext } from '../utils/ragUtils';

// ── Browser Speech API ──────────────────────────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const supported = !!SpeechRecognition;

const MODEL = 'meta/llama-3.1-70b-instruct';
const NVIDIA_API_KEY = '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';

const VOICE_SYSTEM_PROMPT = (context) =>
  `You are Krishna's AI voice assistant speaking on his behalf. Answer in first person, concisely (2–3 sentences max) in a warm, confident, conversational tone. Avoid markdown — use plain text only since your answer will be spoken aloud.

CONTEXT ABOUT KRISHNA:
${context}`;

// ── TTS Helper ───────────────────────────────────────────────────────────────
let currentUtterance = null;
function speak(text, onEnd) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.05;
  utterance.volume = 1;
  const loadVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('natural')) ||
      voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('google')) ||
      voices.find(v => v.lang === 'en-US' && !v.localService) ||
      voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
  };
  if (window.speechSynthesis.getVoices().length > 0) loadVoice();
  else window.speechSynthesis.onvoiceschanged = loadVoice;
  utterance.onend = () => { currentUtterance = null; onEnd?.(); };
  utterance.onerror = () => { currentUtterance = null; onEnd?.(); };
  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}
function stopSpeaking() {
  window.speechSynthesis?.cancel();
  currentUtterance = null;
}

// ── AI Q&A call ──────────────────────────────────────────────────────────────
async function askAI(question) {
  const context = getRelevantContext(question, knowledgeChunks, 5);
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: VOICE_SYSTEM_PROMPT(context) },
        { role: 'user', content: question },
      ],
      temperature: 0.7,
      max_tokens: 200,
      stream: false,
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "I couldn't generate a response right now.";
}

// ── Status enum ───────────────────────────────────────────────────────────────
const S = { IDLE: 'idle', LISTENING: 'listening', THINKING: 'thinking', SPEAKING: 'speaking', UNSUPPORTED: 'unsupported' };

const HELP_LINES = [
  '🧭 Navigation: "Go to projects"',
  '❓ Questions: "What is your CGPA?"',
  '💬 "Tell me about your research"',
  '🔬 "What skills do you have?"',
  '📞 "How can I contact you?"',
];

const QUICK_NAV = ['Projects', 'Research', 'Skills', 'Resume', 'Contact'];

export default function VoiceNav() {
  const [status, setStatus] = useState(supported ? S.IDLE : S.UNSUPPORTED);
  const [transcript, setTranscript] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mode, setMode] = useState('nav'); // 'nav' | 'ai'

  const recognizerRef = useRef(null);
  const feedbackTimer = useRef(null);

  const setMsg = useCallback((msg, ms = 4000) => {
    setFeedback(msg);
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(''), ms);
  }, []);

  // Init recognizer
  useEffect(() => {
    if (!supported) return;
    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.continuous = false;
    recog.interimResults = true;
    recog.maxAlternatives = 3;

    recog.onstart = () => setStatus(S.LISTENING);

    recog.onresult = (e) => {
      const interim = Array.from(e.results).map(r => r[0].transcript).join(' ');
      setTranscript(interim);
      if (e.results[e.results.length - 1].isFinal) {
        const final = e.results[e.results.length - 1][0].transcript;
        setTranscript(final);
        handleFinalTranscript(final);
      }
    };

    recog.onerror = (e) => {
      setStatus(S.IDLE);
      if (e.error === 'no-speech') setMsg("Didn't catch that — try again.");
      else if (e.error === 'not-allowed') setMsg("Microphone access denied.");
      else setMsg(`Error: ${e.error}`);
      setTranscript('');
    };

    recog.onend = () => setStatus(prev => prev === S.LISTENING ? S.IDLE : prev);

    recognizerRef.current = recog;
    return () => recog.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFinalTranscript(text) {
    const lower = text.toLowerCase().trim();

    // Stop command
    if (['stop', 'cancel', 'close', 'quiet', 'never mind'].some(w => lower.includes(w))) {
      stopSpeaking();
      setStatus(S.IDLE);
      setTranscript('');
      return;
    }

    const intent = classifyIntent(text);
    const navMatch = parseCommand(text);

    // NAVIGATION: strong nav intent AND section matched
    if (intent === 'navigate' && navMatch?.id) {
      setMode('nav');
      setStatus(S.SPEAKING);
      setMsg(navMatch.reply, 3000);
      setAiAnswer('');
      speak(navMatch.reply, () => setStatus(S.IDLE));
      setTimeout(() => navigateTo(navMatch.id), 600);
      setTranscript('');
      return;
    }

    // QUESTION → AI answer + TTS
    setMode('ai');
    setStatus(S.THINKING);
    setAiAnswer('');
    setMsg('Thinking…', 30000);

    try {
      const answer = await askAI(text);
      setAiAnswer(answer);
      setMsg('');
      setStatus(S.SPEAKING);

      // If nav match also found, navigate after speaking
      if (navMatch?.id) setTimeout(() => navigateTo(navMatch.id), 800);

      speak(answer, () => setStatus(S.IDLE));
    } catch (err) {
      const fallback = `Sorry, I had trouble connecting. ${err.message}`;
      setAiAnswer(fallback);
      setMsg('');
      setStatus(S.SPEAKING);
      speak(fallback, () => setStatus(S.IDLE));
    }
    setTranscript('');
  }

  function toggleListening() {
    if (!supported) return;
    const recog = recognizerRef.current;
    if (status === S.LISTENING) {
      recog.stop();
      setStatus(S.IDLE);
      setTranscript('');
    } else if (status === S.IDLE) {
      stopSpeaking();
      setTranscript('');
      setFeedback('');
      setAiAnswer('');
      try { recog.start(); } catch { /* already started */ }
    }
  }

  function handleQuickNav(cmd) {
    setTranscript(cmd);
    handleFinalTranscript(cmd);
  }

  const isListening  = status === S.LISTENING;
  const isThinking   = status === S.THINKING;
  const isSpeaking   = status === S.SPEAKING;
  const isBusy       = isThinking || isSpeaking;

  const statusLabel = {
    [S.IDLE]:        'Voice Assistant',
    [S.LISTENING]:   'Listening…',
    [S.THINKING]:    'Thinking…',
    [S.SPEAKING]:    'Speaking…',
    [S.UNSUPPORTED]: 'Not Supported',
  }[status];

  const micIcon = isListening ? 'fa-stop' : isBusy ? 'fa-circle-notch fa-spin' : 'fa-microphone';

  if (!supported) return null;

  return (
    <>
      {/* ── Floating mic button ─────────────────────────── */}
      <button
        id="voice-nav-btn"
        className={`voice-nav-trigger ${isListening ? 'listening' : ''} ${isBusy ? 'processing' : ''}`}
        onClick={toggleListening}
        onMouseEnter={() => setShowPanel(true)}
        onMouseLeave={() => { if (!isListening && !isBusy) setShowPanel(false); }}
        title={statusLabel}
        aria-label="Voice Assistant"
      >
        <i className={`fas ${micIcon}`} />
        {isListening && <span className="voice-ring" />}
      </button>

      {/* ── Panel ─────────────────────────────────────────── */}
      <div
        className={`voice-nav-panel ${(showPanel || isListening || isBusy || aiAnswer) ? 'visible' : ''}`}
        onMouseEnter={() => setShowPanel(true)}
        onMouseLeave={() => { if (!isListening && !isBusy) setShowPanel(false); }}
      >
        {/* Header */}
        <div className="voice-nav-panel-header">
          <i className="fas fa-microphone-alt" style={{ color: 'var(--gold)', marginRight: 8 }} />
          <strong>Voice Assistant</strong>
          <span className="voice-badge voice-badge-ai">AI + NAV</span>
          <button className="voice-help-btn" onClick={() => setShowHelp(p => !p)} title="Commands">
            <i className="fas fa-question-circle" />
          </button>
        </div>

        {/* Help */}
        {showHelp && (
          <div className="voice-help-box">
            {HELP_LINES.map((l, i) => <div key={i} style={{ fontSize: '0.78em', padding: '2px 0', color: 'var(--text)' }}>{l}</div>)}
          </div>
        )}

        {/* Status row */}
        <div className="voice-status-row">
          <span className={`voice-dot ${isListening ? 'active' : ''} ${isThinking ? 'thinking' : ''} ${isSpeaking ? 'speaking' : ''}`} />
          <span className="voice-status-text">
            {transcript
              ? <><em>"{transcript}"</em></>
              : feedback
                ? feedback
                : isListening
                  ? 'Speak now — navigate or ask anything…'
                  : isThinking
                    ? <span style={{ color: 'var(--gold)' }}>Asking AI…</span>
                    : isSpeaking
                      ? <span style={{ color: '#22c55e' }}>Speaking response…</span>
                      : 'Click mic — I navigate and answer questions!'}
          </span>
        </div>

        {/* AI Answer display */}
        {aiAnswer && (
          <div className="voice-ai-answer">
            <i className="fas fa-brain" style={{ color: 'var(--gold)', marginRight: 6, fontSize: '0.8em' }} />
            <span>{aiAnswer}</span>
            {isSpeaking && (
              <button className="voice-stop-speak-btn" onClick={stopSpeaking} title="Stop speaking">
                <i className="fas fa-volume-mute" />
              </button>
            )}
          </div>
        )}

        {/* Quick nav chips */}
        {!isListening && !isThinking && (
          <div className="voice-chips">
            {QUICK_NAV.map(cmd => (
              <button key={cmd} className="voice-chip" onClick={() => handleQuickNav(cmd)} disabled={isBusy}>
                {cmd}
              </button>
            ))}
          </div>
        )}

        {/* Main button */}
        <button
          className={`voice-main-btn ${isListening ? 'stop' : ''}`}
          onClick={toggleListening}
          disabled={isThinking}
        >
          <i className={`fas ${isListening ? 'fa-stop-circle' : isSpeaking ? 'fa-microphone' : 'fa-microphone'}`} />
          {isListening ? ' Stop Listening' : isSpeaking ? ' Interrupt & Listen Again' : ' Start Listening'}
        </button>

        <div className="voice-powered-by">
          Powered by <strong>NVIDIA NIM</strong> &amp; <strong>Web Speech API</strong> · Free navigation + AI answers
        </div>
      </div>
    </>
  );
}
