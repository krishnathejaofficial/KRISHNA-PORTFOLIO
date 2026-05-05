import { useState } from 'react';

/* Hire Me — one-click email with pre-filled mailto + optional message */
export default function HireMeButton({ initialOpen = false, onClose }) {
  const [showPanel, setShowPanel] = useState(initialOpen);
  const [context, setContext] = useState('');
  const [role, setRole] = useState('');

  const [status, setStatus] = useState('idle');

  async function handleSubmit() {
    setStatus('sending');
    const object = {
      access_key: '4e9cf101-22a3-4552-9b1f-dc1f86224eaa',
      subject: role ? `Opportunity: ${role} — Hire Me` : 'Hiring Inquiry — Hire Me',
      email: 'krishnatejareddy2003@gmail.com', // Sending to yourself, but we should collect their email
      message: `Role: ${role}\nContext: ${context}\n\n(Sent via Quick Hire Panel)`,
      from_name: 'Portfolio Quick Hire',
    };
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(object),
      });
      if (res.status === 200) {
        setStatus('success');
        setTimeout(() => { setStatus('idle'); setShowPanel(false); setContext(''); setRole(''); }, 2000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  }

  const quickRoles = [
    'Research Intern', 'Biotech Analyst', 'Pharmaceutical QC', 
    'Business Development', 'Project Collaboration', 'Full-Stack Developer',
  ];

  return (
    <>
      {/* Floating Hire Me button */}
      <button id="hire-me-btn" className="hire-me-trigger" onClick={() => setShowPanel(p => !p)}
        aria-label="Hire Krishna" title="Hire Me">
        <i className="fas fa-briefcase" />
        <span className="hire-me-label">Hire Me</span>
        <span className="hire-me-pulse" />
      </button>

      {showPanel && (
        <div className="hire-me-panel">
          <div className="hire-me-header">
            <strong><i className="fas fa-paper-plane" style={{ marginRight: '8px', color: 'var(--gold)' }} />Quick Hire Email</strong>
            <button className="modal-close-sm" onClick={() => setShowPanel(false)}><i className="fas fa-times" /></button>
          </div>
          <p style={{ fontSize: '0.8em', opacity: 0.7, marginBottom: '12px', lineHeight: 1.5 }}>
            Opens your email client with a pre-filled message to Krishna.
          </p>
          <div className="clg-field">
            <label style={{ fontSize: '0.8em' }}>Role / Opportunity</label>
            <input type="text" placeholder="e.g. Research Intern at Biocon..." value={role}
              onChange={e => setRole(e.target.value)} style={{ fontSize: '0.85em', padding: '9px 12px' }} />
          </div>
          <div className="hire-quick-roles">
            {quickRoles.map(r => (
              <button key={r} className={`voice-chip ${role === r ? 'active' : ''}`}
                onClick={() => setRole(r)}>{r}</button>
            ))}
          </div>
          <div className="clg-field" style={{ marginTop: '8px' }}>
            <label style={{ fontSize: '0.8em' }}>Additional Context <span style={{ opacity: 0.5 }}>(optional)</span></label>
            <textarea rows={3} placeholder="Brief description, company name, timeline..." value={context}
              onChange={e => setContext(e.target.value)} style={{ fontSize: '0.85em', padding: '9px 12px' }} />
          </div>
          <div className="clg-field">
            <label style={{ fontSize: '0.8em' }}>Their Contact Email (so you can reply)</label>
            <input type="email" placeholder="e.g. recruiter@company.com" id="hire-email-input" style={{ fontSize: '0.85em', padding: '9px 12px', marginBottom: '8px' }} />
          </div>
          <button className="btn" onClick={() => {
            const emailInput = document.getElementById('hire-email-input').value;
            if (!emailInput) return alert('Please enter an email address so Krishna can reply.');
            const obj = { access_key: '4e9cf101-22a3-4552-9b1f-dc1f86224eaa', subject: role ? `Hire Me: ${role}` : 'Hire Me Inquiry', email: emailInput, message: `Role: ${role}\n\nContext: ${context}` };
            setStatus('sending');
            fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) })
              .then(r => r.json()).then(r => { if(r.success) { setStatus('success'); setTimeout(() => {setShowPanel(false); setStatus('idle'); setRole(''); setContext(''); document.getElementById('hire-email-input').value='';}, 2000); } else setStatus('error'); })
              .catch(() => setStatus('error'));
          }} style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px', border: 'none', cursor: 'pointer', borderRadius: '10px', padding: '11px 20px', fontSize: '0.9em' }} disabled={status === 'sending'}>
            {status === 'idle' && <><i className="fas fa-paper-plane" /> Send Inquiry Directly</>}
            {status === 'sending' && <><i className="fas fa-spinner fa-spin" /> Sending...</>}
            {status === 'success' && <><i className="fas fa-check" /> Sent Successfully!</>}
            {status === 'error' && <><i className="fas fa-exclamation-triangle" /> Error, try again</>}
          </button>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <a href="/resume.pdf" target="_blank" rel="noreferrer" className="clg-action-btn" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
              <i className="fas fa-file-pdf" /> Resume PDF
            </a>
            <a href="https://linkedin.com/in/gkrishnateja" target="_blank" rel="noreferrer" className="clg-action-btn" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
              <i className="fab fa-linkedin" /> LinkedIn
            </a>
          </div>
        </div>
      )}
    </>
  );
}
