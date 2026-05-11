import { useState } from 'react';

const ROLES = [
  { icon: 'fa-flask', label: 'Research Intern', color: '#D4AF37' },
  { icon: 'fa-code', label: 'Developer Intern', color: '#60a5fa' },
  { icon: 'fa-chart-line', label: 'Business Analyst', color: '#34d399' },
  { icon: 'fa-hands-helping', label: 'Project Assistant', color: '#a78bfa' },
  { icon: 'fa-plus', label: 'Other', color: '#f97316' },
];

export default function HireMeButton({ initialOpen = false, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '', customRole: '', experience: '', whyJoin: '', resumeLink: '' });
  const [status, setStatus] = useState('idle');
  const [trackingId, setTrackingId] = useState('');

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.role) return alert('Please select a role.');
    if (form.role === 'Other' && !form.customRole) return alert('Please type the custom role.');
    setStatus('sending');
    try {
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'hire',
          type: form.role === 'Other' ? form.customRole : form.role,
          name: form.name,
          email: form.email,
          phone: form.phone,
          timeline: form.experience ? `${form.experience} Yrs Exp` : '',
          detail: `Why join: ${form.whyJoin}\nResume Link: ${form.resumeLink}`
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) { 
        setTrackingId(result.trackingId);
        setStatus('success'); 
      }
      else throw new Error();
    } catch { setStatus('error'); }
  }

  // Fallback to initialOpen prop behavior but usually handled by App.jsx
  if (!initialOpen && status === 'idle') return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box collab-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div className="modal-header-left">
            <i className="fas fa-user-plus" style={{ color: 'var(--gold)', fontSize: '1.3em' }} />
            <div>
              <strong>Join My Team</strong>
              <span>Apply to work or intern with Krishna</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><i className="fas fa-times" /></button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
          {status === 'success' ? (
            <div className="success-state">
              <i className="fas fa-check-circle" style={{ fontSize: '3em', color: '#10b981', marginBottom: '15px' }} />
              <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>Application Sent Successfully!</h3>
              <p style={{ color: 'gray', fontSize: '0.9em', marginBottom: '20px' }}>Krishna will review your application and get back to you soon.</p>
              <div style={{ background: 'var(--bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--gold-dim)', display: 'inline-block' }}>
                <span style={{ fontSize: '0.8em', color: 'gray', display: 'block', marginBottom: '5px' }}>YOUR TRACKING ID</span>
                <strong style={{ fontSize: '1.2em', color: 'var(--gold)', letterSpacing: '2px' }}>{trackingId}</strong>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="clg-form">
              <div className="clg-field">
                <label>Select Role / Position <span style={{ color: '#ef4444' }}>*</span></label>
                <div className="collab-types-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  {ROLES.map(r => (
                    <div key={r.label} 
                      className={`collab-type-card ${form.role === r.label ? 'active' : ''}`}
                      onClick={() => set('role', r.label)}
                      style={{ borderColor: form.role === r.label ? r.color : 'var(--border)' }}>
                      <i className={`fas ${r.icon}`} style={{ color: r.color, marginBottom: '8px', fontSize: '1.2em' }} />
                      <div style={{ fontSize: '0.85em', fontWeight: 'bold' }}>{r.label}</div>
                    </div>
                  ))}
                </div>
                {form.role === 'Other' && (
                  <div style={{ marginTop: '10px' }}>
                    <input type="text" required placeholder="Type the role..." value={form.customRole} onChange={e => set('customRole', e.target.value)} />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <div className="clg-field">
                  <label>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. John Doe" />
                </div>
                <div className="clg-field">
                  <label>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="e.g. john@example.com" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="clg-field">
                  <label>Phone Number</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="e.g. +91 9876543210" />
                </div>
                <div className="clg-field">
                  <label>Experience (Years)</label>
                  <input type="number" min="0" step="0.5" value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="e.g. 1.5" />
                </div>
              </div>

              <div className="clg-field">
                <label>Resume / Portfolio Link <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="url" required value={form.resumeLink} onChange={e => set('resumeLink', e.target.value)} placeholder="Google Drive, LinkedIn, or Portfolio URL" />
              </div>

              <div className="clg-field">
                <label>Why do you want to join? <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea rows={4} required value={form.whyJoin} onChange={e => set('whyJoin', e.target.value)} placeholder="Briefly explain your skills and why you're a good fit..." />
              </div>

              <button type="submit" className="btn clg-submit-btn" disabled={status === 'sending'}>
                {status === 'idle' ? <><i className="fas fa-paper-plane" /> Submit Application</> : 
                 status === 'sending' ? <><i className="fas fa-spinner fa-spin" /> Submitting...</> : 
                 <><i className="fas fa-exclamation-triangle" /> Error, try again</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
