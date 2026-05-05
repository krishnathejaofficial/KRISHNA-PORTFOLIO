import { useState } from 'react';

/* Hire Me — one-click email with pre-filled mailto + optional message */
export default function HireMeButton() {
  const [showPanel, setShowPanel] = useState(false);
  const [context, setContext] = useState('');
  const [role, setRole] = useState('');

  const email = 'krishnatejareddy2003@gmail.com';
  const resumeUrl = 'https://gkrishnateja.vercel.app/#resume';

  function buildMailto() {
    const subject = role ? `Opportunity: ${role} — G. Krishna Teja` : 'Hiring Inquiry — G. Krishna Teja';
    const body = `Hi Krishna,\n\nI came across your portfolio and I'm interested in discussing an opportunity with you.\n\n${context ? `Context:\n${context}\n\n` : ''}Resume: ${resumeUrl}\n\nLooking forward to connecting!\n\n[Your Name]\n[Your Company]`;
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
          <a href={buildMailto()} className="btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px', textDecoration: 'none', borderRadius: '10px', padding: '11px 20px', fontSize: '0.9em' }}>
            <i className="fas fa-envelope" />Open Email Client
          </a>
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
