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

// ── TTS Helper (Indian Male Voice + Streaming Enqueue) ─────────────────────────
let currentUtterance = null;
let isSpeakingAborted = false;

// Strip markdown to make speech flow naturally
function cleanTextForSpeech(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#+\s/g, '')
    .replace(/!?\[.*?\]\(.*?\)/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .trim();
}

function speak(text, enqueue = false, onEnd = null) {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  
  if (!enqueue) {
    window.speechSynthesis.cancel();
    isSpeakingAborted = false;
  }
  
  if (isSpeakingAborted) return;
  
  const clean = cleanTextForSpeech(text);
  if (!clean) { onEnd?.(); return; }
  
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1;
  
  const loadVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    // Hunt for an Indian Male Voice (Ravi, Prabhat, Rishi, or en-IN Male)
    const preferred =
      voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('natural') && !v.name.toLowerCase().includes('neerja')) ||
      voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('online') && !v.name.toLowerCase().includes('neerja')) ||
      voices.find(v => v.lang === 'en-IN' && (v.name.toLowerCase().includes('rishi') || v.name.toLowerCase().includes('ravi') || v.name.toLowerCase().includes('prabhat'))) ||
      voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('male')) ||
      voices.find(v => v.lang === 'en-IN') ||
      voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('natural')) ||
      voices.find(v => v.lang.startsWith('en'));
      
    if (preferred) utterance.voice = preferred;
  };
  
  if (window.speechSynthesis.getVoices().length > 0) loadVoice();
  else window.speechSynthesis.onvoiceschanged = loadVoice;
  
  utterance.onend = () => { currentUtterance = null; onEnd?.(); };
  utterance.onerror = (e) => { console.warn("TTS error:", e); currentUtterance = null; onEnd?.(); };
  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  isSpeakingAborted = true;
  window.speechSynthesis?.cancel();
  currentUtterance = null;
}

// ── AI Q&A call (Sentence-by-Sentence Streaming) ───────────────────────────────
async function askAI(question, onSentence, onFullText) {
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
      max_tokens: 150,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let sentenceBuffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const data = JSON.parse(line.slice(6));
          const token = data.choices?.[0]?.delta?.content || '';
          if (token) {
            fullText += token;
            sentenceBuffer += token;
            onFullText(fullText); // update UI text instantly
            
            // Chunk by sentence ending punctuation
            const splitIndex = sentenceBuffer.search(/[.?!](\s|$)/);
            if (splitIndex !== -1 && splitIndex > 5) {
              const sentence = sentenceBuffer.substring(0, splitIndex + 1).trim();
              if (sentence) onSentence(sentence);
              sentenceBuffer = sentenceBuffer.substring(splitIndex + 1).trimStart();
            }
          }
        } catch (e) {
          // ignore partial JSON chunks
        }
      }
    }
  }
  
  if (sentenceBuffer.trim()) {
    onSentence(sentenceBuffer.trim());
  }
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
      let isFirstSentence = true;
      let sentencesSpoken = 0;
      let sentencesCompleted = 0;

      const checkEnd = () => {
        sentencesCompleted++;
        // If all sentences spoken and AI done generating, return to IDLE
        // For simplicity, we just keep it SPEAKING until they hit stop or we wait a few secs.
        // Web Speech onend is sometimes unreliable on mobile, so we use a fallback timeout.
        if (sentencesCompleted >= sentencesSpoken) {
           setTimeout(() => { if (sentencesCompleted >= sentencesSpoken) setStatus(S.IDLE); }, 1500);
        }
      };

      await askAI(text, 
        (sentence) => {
          sentencesSpoken++;
          if (isFirstSentence) {
            isFirstSentence = false;
            setMsg('');
            setStatus(S.SPEAKING);
            speak(sentence, false, checkEnd);
          } else {
            speak(sentence, true, checkEnd);
          }
        },
        (fullText) => {
          setAiAnswer(fullText);
        }
      );

      // If nav match also found, navigate after API stream completes
      if (navMatch?.id) setTimeout(() => navigateTo(navMatch.id), 800);

    } catch (err) {
      const fallback = `Sorry, I had trouble connecting. ${err.message}`;
      setAiAnswer(fallback);
      setMsg('');
      setStatus(S.SPEAKING);
      speak(fallback, false, () => setStatus(S.IDLE));
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

  const isListening = status === S.LISTENING;
  const isThinking = status === S.THINKING;
  const isSpeaking = status === S.SPEAKING;
  const isBusy = isThinking || isSpeaking;

  const statusLabel = {
    [S.IDLE]: 'Voice Assistant',
    [S.LISTENING]: 'Listening…',
    [S.THINKING]: 'Thinking…',
    [S.SPEAKING]: 'Speaking…',
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

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isSpeaking ? (
            <>
              <button
                className="voice-main-btn stop"
                onClick={() => { stopSpeaking(); setStatus(S.IDLE); }}
                style={{ backgroundColor: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.4)', color: '#f87171' }}
              >
                <i className="fas fa-volume-mute" /> Stop Audio / Mute
              </button>
              <button className="voice-main-btn" onClick={toggleListening}>
                <i className="fas fa-microphone" /> Ask Another Question
              </button>
            </>
          ) : (
            <button
              className={`voice-main-btn ${isListening ? 'stop' : ''}`}
              onClick={toggleListening}
              disabled={isThinking}
            >
              <i className={`fas ${isListening ? 'fa-stop-circle' : 'fa-microphone'}`} />
              {isListening ? ' Stop Listening' : ' Start Listening'}
            </button>
          )}
        </div>

        <div className="voice-powered-by">
          Powered by <strong>NVIDIA NIM</strong> &amp; <strong>Web Speech API</strong> · Free navigation + AI answers
        </div>
      </div>
    </>
  );
}
