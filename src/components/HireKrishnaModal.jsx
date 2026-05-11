import { useState } from 'react';

export default function HireKrishnaModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ company: '', role: '', email: '', phone: '', description: '' });
  const [status, setStatus] = useState('idle');
  const [trackingId, setTrackingId] = useState('');

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'hire-krishna',
          type: form.role,
          name: form.company,
          email: form.email,
          phone: form.phone,
          detail: form.description
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box collab-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div className="modal-header-left">
            <i className="fas fa-briefcase" style={{ color: 'var(--gold)', fontSize: '1.3em' }} />
            <div>
              <strong>Hire Krishna</strong>
              <span>Send a recruitment or hiring offer to Krishna</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><i className="fas fa-times" /></button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
          {status === 'success' ? (
            <div className="success-state">
              <i className="fas fa-check-circle" style={{ fontSize: '3em', color: '#10b981', marginBottom: '15px' }} />
              <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>Offer Sent Successfully!</h3>
              <p style={{ color: 'gray', fontSize: '0.9em', marginBottom: '20px' }}>Krishna will review your offer and get back to you soon.</p>
              <div style={{ background: 'var(--bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--gold-dim)', display: 'inline-block' }}>
                <span style={{ fontSize: '0.8em', color: 'gray', display: 'block', marginBottom: '5px' }}>YOUR TRACKING ID</span>
                <strong style={{ fontSize: '1.2em', color: 'var(--gold)', letterSpacing: '2px' }}>{trackingId}</strong>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="clg-form">
              <div className="clg-field">
                <label>Company / Organization Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" required value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. Acme Corp" />
              </div>

              <div className="clg-field">
                <label>Role / Position <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" required value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Senior Biologist, Software Engineer..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="clg-field">
                  <label>Official Email <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="e.g. hr@company.com" />
                </div>
                <div className="clg-field">
                  <label>Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="tel" required value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="e.g. +91 9876543210" />
                </div>
              </div>

              <div className="clg-field">
                <label>Offer Description / Details <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea rows={5} required value={form.description} onChange={e => set('description', e.target.value)} placeholder="Please provide details about the role, package, and expectations..." />
              </div>

              <button type="submit" className="btn clg-submit-btn" disabled={status === 'sending'}>
                {status === 'idle' ? <><i className="fas fa-paper-plane" /> Send Hiring Offer</> : 
                 status === 'sending' ? <><i className="fas fa-spinner fa-spin" /> Sending...</> : 
                 <><i className="fas fa-exclamation-triangle" /> Error, try again</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
