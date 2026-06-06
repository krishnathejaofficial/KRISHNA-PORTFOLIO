import { useState } from 'react';

const DOUBT_CATEGORIES = [
  { icon: 'fa-flask', label: 'Biotechnology & Research', color: '#10b981', rgb: '16,185,129' },
  { icon: 'fa-code', label: 'Programming & Tech', color: '#3b82f6', rgb: '59,130,246' },
  { icon: 'fa-briefcase', label: 'Business & Career', color: '#f59e0b', rgb: '245,158,11' },
  { icon: 'fa-graduation-cap', label: 'Academic Advice', color: '#a78bfa', rgb: '167,139,250' },
  { icon: 'fa-dna', label: 'Life Sciences & Pharma', color: '#D4AF37', rgb: '212,175,55' },
  { icon: 'fa-rocket', label: 'Projects & Collaboration', color: '#ec4899', rgb: '236,72,153' },
];

export default function DoubtsForm({ isOpen, onClose }) {
  const [form, setForm] = useState({
    category: '',
    name: '',
    email: '',
    subject: '',
    question: '',
    isPublic: false,
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [trackingId, setTrackingId] = useState('');

  function set(field, val) {
    setForm(p => ({ ...p, [field]: val }));
  }

  function handleOverlayClose() {
    if (form.name || form.email || form.subject || form.question) {
      if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.category) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          category: form.category,
          name: form.name,
          email: form.email,
          subject: form.subject,
          question: form.question,
          isPublic: form.isPublic,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setTrackingId(result.doubtId);
        setStatus('success');
      } else {
        throw new Error(result.error || 'Failed');
      }
    } catch {
      setStatus('error');
    }
  }

  function reset() {
    setForm({ category: '', name: '', email: '', subject: '', question: '', isPublic: false });
    setStatus('idle');
    setTrackingId('');
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClose}>
      <div
        className="modal-box doubt-modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '560px' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(212,175,55,0.08))' }}>
          <div className="modal-header-left">
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg,#8b5cf6,#D4AF37)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(139,92,246,0.4)'
            }}>
              <i className="fas fa-question-circle" style={{ color: '#fff', fontSize: '1.1em' }} />
            </div>
            <div>
              <strong style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.15em' }}>
                Ask Krishna a Question
              </strong>
              <span>Get personalised answers from Krishna himself</span>
            </div>
          </div>
          <button className="modal-close" onClick={handleOverlayClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              {/* Success Animation */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(212,175,55,0.15))',
                border: '2px solid #8b5cf6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: '2em',
                boxShadow: '0 0 30px rgba(139,92,246,0.3)',
                animation: 'doubt-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
              }}>
                <i className="fas fa-check" style={{ color: '#8b5cf6' }} />
              </div>
              <h3 style={{ color: 'var(--gold)', marginBottom: 10, fontFamily: "'Cormorant Garamond',serif", fontSize: '1.6em' }}>
                Question Submitted! 🎉
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9em', lineHeight: 1.6, marginBottom: 24 }}>
                Krishna will personally review your question and respond within <strong style={{ color: 'var(--gold)' }}>24–48 hours</strong>.<br />
                You'll receive the answer directly in your inbox.
              </p>
              {/* Doubt ID Card */}
              <div style={{
                background: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(212,175,55,0.08))',
                border: '1px dashed rgba(139,92,246,0.5)', borderRadius: 14,
                padding: '20px 24px', marginBottom: 24
              }}>
                <div style={{ fontSize: '0.75em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
                  Your Question ID
                </div>
                <div style={{ fontSize: '1.8em', fontWeight: 800, color: '#8b5cf6', letterSpacing: 4, fontFamily: 'monospace' }}>
                  {trackingId}
                </div>
                <div style={{ fontSize: '0.78em', color: 'rgba(255,255,255,0.45)', marginTop: 10 }}>
                  Save this ID — you can use it to track when Krishna replies
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn" onClick={reset} style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#a78bfa' }}>
                  <i className="fas fa-plus" style={{ marginRight: 6 }} /> Ask Another
                </button>
                <button className="btn" onClick={onClose} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'white' }}>
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ gap: 0, margin: 0 }}>
              {/* Category Selection */}
              <div className="clg-field" style={{ marginBottom: 18 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <i className="fas fa-tag" style={{ color: '#8b5cf6', fontSize: '0.9em' }} />
                  Question Category *
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DOUBT_CATEGORIES.map(cat => (
                    <button
                      type="button"
                      key={cat.label}
                      onClick={() => set('category', cat.label)}
                      style={{
                        background: form.category === cat.label
                          ? `rgba(${cat.rgb},0.18)`
                          : 'var(--surface-2)',
                        border: `1px solid ${form.category === cat.label ? cat.color : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: 20,
                        padding: '7px 14px',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 7,
                        color: form.category === cat.label ? cat.color : 'rgba(255,255,255,0.65)',
                        fontSize: '0.82em', fontWeight: 500,
                        transition: 'all 0.2s',
                        boxShadow: form.category === cat.label ? `0 0 12px ${cat.color}30` : 'none'
                      }}
                    >
                      <i className={`fas ${cat.icon}`} style={{ fontSize: '0.9em', color: cat.color }} />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name + Email */}
              <div className="clg-field-row" style={{ marginBottom: 14 }}>
                <div className="clg-field">
                  <label>
                    <i className="fas fa-user" style={{ color: '#8b5cf6', marginRight: 6, fontSize: '0.85em' }} />
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Full name"
                    required
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                  />
                </div>
                <div className="clg-field">
                  <label>
                    <i className="fas fa-envelope" style={{ color: '#8b5cf6', marginRight: 6, fontSize: '0.85em' }} />
                    Email *
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="clg-field" style={{ marginBottom: 14 }}>
                <label>
                  <i className="fas fa-heading" style={{ color: '#8b5cf6', marginRight: 6, fontSize: '0.85em' }} />
                  Question Subject *
                </label>
                <input
                  type="text"
                  placeholder="e.g. How do I get into biotech research?"
                  required
                  value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                />
              </div>

              {/* Question */}
              <div className="clg-field" style={{ marginBottom: 16 }}>
                <label>
                  <i className="fas fa-align-left" style={{ color: '#8b5cf6', marginRight: 6, fontSize: '0.85em' }} />
                  Detailed Question *
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe your question in detail. The more context you provide, the better Krishna can help you..."
                  required
                  value={form.question}
                  onChange={e => set('question', e.target.value)}
                  style={{ resize: 'vertical' }}
                />
                <div style={{ fontSize: '0.72em', color: 'rgba(255,255,255,0.35)', marginTop: 4, textAlign: 'right' }}>
                  {form.question.length} characters
                </div>
              </div>

              {/* Public toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 10, padding: '12px 16px', marginBottom: 18, cursor: 'pointer'
              }} onClick={() => set('isPublic', !form.isPublic)}>
                <div style={{
                  width: 38, height: 22, borderRadius: 11, position: 'relative',
                  background: form.isPublic ? '#8b5cf6' : 'rgba(255,255,255,0.12)',
                  transition: 'background 0.25s', flexShrink: 0,
                  border: `1px solid ${form.isPublic ? '#8b5cf6' : 'rgba(255,255,255,0.2)'}`
                }}>
                  <div style={{
                    position: 'absolute', top: 2, left: form.isPublic ? 17 : 2,
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88em', fontWeight: 600, color: form.isPublic ? '#a78bfa' : 'rgba(255,255,255,0.75)' }}>
                    <i className={`fas fa-${form.isPublic ? 'globe' : 'lock'}`} style={{ marginRight: 6 }} />
                    {form.isPublic ? 'Public Q&A' : 'Private Question'}
                  </div>
                  <div style={{ fontSize: '0.75em', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    {form.isPublic
                      ? 'Your Q&A may be featured on the portfolio (anonymously) to help others'
                      : 'Only you and Krishna will see this — completely private'}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn"
                disabled={status === 'sending' || !form.category || !form.name || !form.email || !form.subject || !form.question}
                style={{
                  width: '100%',
                  background: status === 'sending' ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
                  color: '#fff', border: 'none',
                  padding: '14px',
                  fontSize: '1em', fontWeight: 700,
                  boxShadow: '0 4px 20px rgba(139,92,246,0.35)',
                  letterSpacing: '0.03em'
                }}
              >
                {status === 'sending' ? (
                  <><i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} />Submitting Question…</>
                ) : (
                  <><i className="fas fa-paper-plane" style={{ marginRight: 8 }} />Submit My Question</>
                )}
              </button>
              {status === 'error' && (
                <p style={{ color: '#f87171', textAlign: 'center', fontSize: '0.85em', marginTop: 10 }}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: 5 }} />
                  Something went wrong. Please email directly at krishnatejareddy2003@gmail.com
                </p>
              )}
            </form>
          )}
        </div>

        <style>{`
          @keyframes doubt-pop {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .doubt-modal input, .doubt-modal textarea {
            border: 1px solid rgba(139, 92, 246, 0.35) !important;
            transition: all 0.25s ease;
          }
          .doubt-modal input:focus, .doubt-modal textarea:focus {
            border-color: #8b5cf6 !important;
            box-shadow: 0 0 12px rgba(139, 92, 246, 0.25) !important;
            outline: none;
          }
          @media (max-width: 520px) {
            .doubt-modal .clg-field-row {
              flex-direction: column !important;
              gap: 14px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
