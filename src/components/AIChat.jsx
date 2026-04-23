import { useState, useRef, useEffect } from 'react';
import { knowledgeChunks } from '../data/knowledgeBase';
import { getRelevantContext } from '../utils/ragUtils';

const NVIDIA_API_KEY = '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';
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'meta/llama-3.1-70b-instruct';

const SYSTEM_PROMPT = (context) => `You are an interactive AI persona for G. Krishna Teja, an Integrated M.Sc. Biotechnology student at VIT Vellore (CGPA: 9.01). You speak in first person as Krishna, answering visitor questions about his skills, research, projects, internships, leadership, and career interests.

Be conversational, warm, and confident. Keep answers concise (2–4 sentences max unless more is needed). Always base your answers on the context below. If something is not in the context, say "I don't have that detail handy, but feel free to reach out at krishnatejareddy2003@gmail.com!".

CONTEXT ABOUT KRISHNA:
${context}`;

const SUGGESTIONS = [
  "Tell me about your research 🔬",
  "What are your top skills?",
  "What projects have you built?",
  "Where have you interned?",
  "How can I contact you?",
];

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi there! 👋 I'm Krishna's AI persona. Ask me anything about my research, projects, skills, or experience!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  async function sendMessage(text) {
    if (!text.trim() || isStreaming) return;
    setShowSuggestions(false);

    const userMsg = { role: 'user', content: text.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setIsStreaming(true);

    // RAG: get relevant context for this query
    const context = getRelevantContext(text, knowledgeChunks, 5);

    // Build message array for API (last 6 messages for context window)
    const recentHistory = history.slice(-6).map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch(NVIDIA_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT(context) },
            ...recentHistory,
          ],
          temperature: 0.7,
          max_tokens: 400,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Start streaming response
      const assistantMsg = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMsg]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + delta,
                };
                return updated;
              });
            }
          } catch { /* skip malformed JSON */ }
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting right now. Please try again in a moment!",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        id="ai-chat-btn"
        className={`ai-chat-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Chat with Krishna's AI"
        title="Chat with Krishna's AI"
      >
        {isOpen ? (
          <i className="fas fa-times" />
        ) : (
          <>
            <i className="fas fa-brain" />
            <span className="ai-chat-pulse" />
          </>
        )}
      </button>

      {/* Chat window */}
      <div className={`ai-chat-window ${isOpen ? 'open' : ''}`} role="dialog" aria-label="AI Chat">
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-avatar">
            <img
              src="/images/IMG_20250601_195837.jpg"
              alt="Krishna"
              onError={e => { e.target.onerror = null; e.target.src = '/images/krishna teja profile.jpg'; }}
            />
            <span className="ai-online-dot" />
          </div>
          <div className="ai-chat-header-info">
            <strong>Ask Krishna</strong>
            <span>AI Persona · Powered by NVIDIA NIM</span>
          </div>
          <button className="ai-chat-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
            <i className="fas fa-chevron-down" />
          </button>
        </div>

        {/* Messages */}
        <div className="ai-chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`ai-msg ${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="ai-msg-avatar">
                  <i className="fas fa-brain" />
                </div>
              )}
              <div className="ai-msg-bubble">
                {msg.content || (isStreaming && i === messages.length - 1
                  ? <span className="ai-typing-dots"><span /><span /><span /></span>
                  : ''
                )}
              </div>
            </div>
          ))}
          {isStreaming && messages[messages.length - 1]?.content === '' && (
            <div className="ai-msg assistant">
              <div className="ai-msg-avatar"><i className="fas fa-brain" /></div>
              <div className="ai-msg-bubble">
                <span className="ai-typing-dots"><span /><span /><span /></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div className="ai-suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s} className="ai-suggestion-chip" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="ai-chat-input-row">
          <input
            ref={inputRef}
            type="text"
            className="ai-chat-input"
            placeholder="Ask me anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            maxLength={300}
          />
          <button
            className="ai-chat-send"
            onClick={() => sendMessage(input)}
            disabled={isStreaming || !input.trim()}
            aria-label="Send"
          >
            {isStreaming
              ? <i className="fas fa-circle-notch fa-spin" />
              : <i className="fas fa-paper-plane" />
            }
          </button>
        </div>
      </div>
    </>
  );
}
