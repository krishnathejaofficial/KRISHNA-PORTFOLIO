import { useState } from 'react';

/* Collaboration Request Form — sends via Web3Forms */
const WEB3FORMS_KEY = '4e9cf101-22a3-4552-9b1f-dc1f86224eaa';

const COLLAB_TYPES = [
  { icon: 'fa-flask', label: 'Research Collaboration', color: '#D4AF37' },
  { icon: 'fa-handshake', label: 'Business Partnership', color: '#60a5fa' },
  { icon: 'fa-code', label: 'Technical Project', color: '#a78bfa' },
  { icon: 'fa-graduation-cap', label: 'Academic / Mentorship', color: '#34d399' },
  { icon: 'fa-bullhorn', label: 'Speaking / Media', color: '#f97316' },
  { icon: 'fa-briefcase', label: 'Job / Internship Offer', color: '#ec4899' },
];

export default function CollaborationForm({ isOpen, onClose }) {
  const [form, setForm] = useState({ type: '', name: '', org: '', email: '', detail: '', timeline: '' });
  const [status, setStatus] = useState('idle');

  function set(field, val) { setForm(p => ({ ...p, [field]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `[Portfolio] Collaboration Request: ${form.type}`,
          from_name: form.name,
          email: form.email,
          message: `Type: ${form.type}\nOrg: ${form.org}\nTimeline: ${form.timeline}\n\nDetails:\n${form.detail}`,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) { setStatus('success'); }
      else throw new Error();
    } catch { setStatus('error'); }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box collab-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <i className="fas fa-users" style={{ color: 'var(--gold)', fontSize: '1.3em' }} />
            <div>
              <strong>Collaboration Request</strong>
              <span>Let's build something great together</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><i className="fas fa-times" /></button>
        </div>

        <div className="modal-body">
          {status === 'success' ? (
            <div className="collab-success">
              <i className="fas fa-check-circle" style={{ fontSize: '3em', color: '#22c55e' }} />
              <h3>Request Sent!</h3>
              <p>Krishna will review your collaboration request and get back to you within 24–48 hours.</p>
              <button className="btn" onClick={onClose} style={{ marginTop: '16px' }}>Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ gap: '14px', margin: 0 }}>
              <div className="clg-field">
                <label>Collaboration Type *</label>
                <div className="collab-types">
                  {COLLAB_TYPES.map(t => (
                    <button type="button" key={t.label}
                      className={`collab-type-btn ${form.type === t.label ? 'active' : ''}`}
                      style={{ '--type-color': t.color }}
                      onClick={() => set('type', t.label)}>
                      <i className={`fas ${t.icon}`} />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="clg-field-row">
                <div className="clg-field">
                  <label>Your Name *</label>
                  <input type="text" placeholder="Full name" required value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="clg-field">
                  <label>Organization</label>
                  <input type="text" placeholder="Company / Institution" value={form.org} onChange={e => set('org', e.target.value)} />
                </div>
              </div>
              <div className="clg-field-row">
                <div className="clg-field">
                  <label>Email *</label>
                  <input type="email" placeholder="your@email.com" required value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div className="clg-field">
                  <label>Timeline</label>
                  <input type="text" placeholder="e.g. Jun–Aug 2025" value={form.timeline} onChange={e => set('timeline', e.target.value)} />
                </div>
              </div>
              <div className="clg-field">
                <label>Details *</label>
                <textarea rows={4} placeholder="Describe your collaboration idea, goals, and what you're looking for..." required
                  value={form.detail} onChange={e => set('detail', e.target.value)} />
              </div>
              <button type="submit" className="btn" style={{ width: '100%' }} disabled={status === 'sending' || !form.type}>
                {status === 'sending'
                  ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }} />Sending...</>
                  : <><i className="fas fa-paper-plane" style={{ marginRight: '8px' }} />Submit Request</>
                }
              </button>
              {status === 'error' && <p style={{ color: '#f87171', textAlign: 'center', fontSize: '0.85em' }}>Something went wrong. Please email directly at krishnatejareddy2003@gmail.com</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
