import { useState, useEffect, useRef, useCallback } from 'react';
import { parseCommand, navigateTo } from '../utils/voiceCommands';

// Browser-native speech recognition — completely free
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const supported = !!SpeechRecognition;

// Speak a reply using browser TTS (also free)
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 1;
  utterance.volume = 1;
  // Prefer a natural English voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
  ) || voices.find(v => v.lang.startsWith('en'));
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}

const STATUS = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  UNSUPPORTED: 'unsupported',
};

const HELP_TEXT = `Say commands like:
• "Go to projects"
• "Show me research"
• "Contact" / "Resume"
• "About you"
• "Education"`;

export default function VoiceNav() {
  const [status, setStatus] = useState(supported ? STATUS.IDLE : STATUS.UNSUPPORTED);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const recognizerRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  const setFeedbackMsg = useCallback((msg, duration = 3500) => {
    setFeedback(msg);
    clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(''), duration);
  }, []);

  // Initialize speech recognizer
  useEffect(() => {
    if (!supported) return;
    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.continuous = false;
    recog.interimResults = true;
    recog.maxAlternatives = 3;

    recog.onstart = () => setStatus(STATUS.LISTENING);

    recog.onresult = (e) => {
      const interim = Array.from(e.results)
        .map(r => r[0].transcript)
        .join(' ');
      setTranscript(interim);

      // Final result
      if (e.results[e.results.length - 1].isFinal) {
        const final = e.results[e.results.length - 1][0].transcript;
        setTranscript(final);
        processCommand(final);
      }
    };

    recog.onerror = (e) => {
      setStatus(STATUS.IDLE);
      if (e.error === 'no-speech') {
        setFeedbackMsg("I didn't catch that. Try again!");
      } else if (e.error === 'not-allowed') {
        setFeedbackMsg("Microphone access denied. Please allow mic in browser settings.");
      } else {
        setFeedbackMsg(`Error: ${e.error}`);
      }
      setTranscript('');
    };

    recog.onend = () => {
      if (status === STATUS.LISTENING) setStatus(STATUS.IDLE);
    };

    recognizerRef.current = recog;
    return () => { recog.abort(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function processCommand(text) {
    setStatus(STATUS.PROCESSING);
    const match = parseCommand(text);

    if (!match) {
      setStatus(STATUS.SPEAKING);
      const reply = `I heard "${text}" but I'm not sure where to navigate. Try saying a section name like "projects", "research", or "contact".`;
      setFeedbackMsg(reply, 5000);
      speak(reply);
      setTimeout(() => setStatus(STATUS.IDLE), 500);
      return;
    }

    const { id, reply } = match;
    setStatus(STATUS.SPEAKING);
    setFeedbackMsg(reply, 4000);
    speak(reply);

    if (id) {
      // Small delay so the speech starts before scroll
      setTimeout(() => navigateTo(id), 600);
    }
    setTimeout(() => setStatus(STATUS.IDLE), 1000);
    setTranscript('');
  }

  function toggleListening() {
    if (!supported) return;
    const recog = recognizerRef.current;
    if (status === STATUS.LISTENING) {
      recog.stop();
      setStatus(STATUS.IDLE);
      setTranscript('');
    } else if (status === STATUS.IDLE) {
      setTranscript('');
      setFeedback('');
      try { recog.start(); } catch { /* already started */ }
    }
  }

  const isActive = status === STATUS.LISTENING;
  const isProcessing = status === STATUS.PROCESSING || status === STATUS.SPEAKING;

  const statusLabel = {
    [STATUS.IDLE]: 'Voice Nav',
    [STATUS.LISTENING]: 'Listening…',
    [STATUS.PROCESSING]: 'Processing…',
    [STATUS.SPEAKING]: 'Navigating…',
    [STATUS.UNSUPPORTED]: 'Not Supported',
  }[status];

  if (!supported) return null; // Hide entirely on unsupported browsers

  return (
    <>
      {/* Floating mic button */}
      <button
        id="voice-nav-btn"
        className={`voice-nav-trigger ${isActive ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
        onClick={toggleListening}
        onMouseEnter={() => setShowPanel(true)}
        onMouseLeave={() => { if (!isActive) setShowPanel(false); }}
        title={statusLabel}
        aria-label="Voice Navigation"
      >
        <i className={`fas ${isActive ? 'fa-stop' : 'fa-microphone'}`} />
        {isActive && <span className="voice-ring" />}
      </button>

      {/* Floating panel */}
      <div
        className={`voice-nav-panel ${(showPanel || isActive || feedback) ? 'visible' : ''}`}
        onMouseEnter={() => setShowPanel(true)}
        onMouseLeave={() => { if (!isActive) setShowPanel(false); }}
      >
        <div className="voice-nav-panel-header">
          <i className="fas fa-microphone-alt" style={{ color: 'var(--gold)', marginRight: 8 }} />
          <strong>Voice Navigation</strong>
          <span className="voice-badge">FREE</span>
          <button
            className="voice-help-btn"
            onClick={() => setShowHelp(p => !p)}
            title="Show commands"
          >
            <i className="fas fa-question-circle" />
          </button>
        </div>

        {showHelp && (
          <div className="voice-help-box">
            <pre>{HELP_TEXT}</pre>
          </div>
        )}

        {/* Transcript / feedback */}
        <div className="voice-status-row">
          <span className={`voice-dot ${isActive ? 'active' : ''}`} />
          <span className="voice-status-text">
            {transcript
              ? <em>"{transcript}"</em>
              : feedback
                ? feedback
                : isActive
                  ? 'Speak now…'
                  : 'Click mic to start'
            }
          </span>
        </div>

        {/* Quick command chips */}
        {!isActive && (
          <div className="voice-chips">
            {['Projects', 'Research', 'Skills', 'Contact', 'Resume'].map(cmd => (
              <button
                key={cmd}
                className="voice-chip"
                onClick={() => {
                  setTranscript(cmd);
                  processCommand(cmd);
                }}
              >
                {cmd}
              </button>
            ))}
          </div>
        )}

        <button
          className={`voice-main-btn ${isActive ? 'stop' : ''}`}
          onClick={toggleListening}
          disabled={isProcessing}
        >
          <i className={`fas ${isActive ? 'fa-stop-circle' : 'fa-microphone'}`} />
          {isActive ? ' Stop Listening' : ' Start Listening'}
        </button>
      </div>
    </>
  );
}
