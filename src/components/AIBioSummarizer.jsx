import { useState } from 'react';

const ROLES = [
  { id: 'recruiter', label: 'Biotech Recruiter', icon: 'fa-user-tie' },
  { id: 'collaborator', label: 'Academic Collaborator', icon: 'fa-microscope' },
  { id: 'manager', label: 'Operations Manager', icon: 'fa-chart-line' },
];

export default function AIBioSummarizer() {
  const [activeRole, setActiveRole] = useState(null);
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const generateSummary = async (role) => {
    setActiveRole(role.id);
    setStatus('loading');
    setSummary('');

    try {
      const sys = `You are Krishna Teja's AI assistant. Summarize his portfolio in exactly 2-3 short, punchy sentences tailored specifically for a ${role.label}. Use a professional, confident tone. Focus on metrics, CGPA (9.01), leadership (Finance Manager, 7Cr+), and relevant biotech/clinical skills. No markdown, no fluff.`;
      const msg = `Provide the summary for a ${role.label}.`;

      const res = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta/llama-3.3-70b-instruct',
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: msg },
          ],
          max_tokens: 150,
          temperature: 0.7,
          stream: false
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'API Error');

      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) {
        setSummary(text);
        setStatus('success');
      } else {
        throw new Error('Empty response');
      }
    } catch (err) {
      console.error(err);
      setSummary('Failed to generate summary. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div style={{
      background: 'var(--surface-2)',
      borderRadius: '16px',
      padding: '24px',
      marginTop: '40px',
      border: '1px solid rgba(212,175,55,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: 'rgba(212,175,55,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
          <i className="fas fa-robot" style={{ color: 'var(--gold)' }} />
        </div>
        <h3 style={{ margin: 0, fontSize: '1.2em' }}>AI Bio Summarizer</h3>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9em', marginBottom: '20px' }}>
        Too long; didn't read? Have my AI assistant generate a custom pitch tailored to your profile.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {ROLES.map(r => (
          <button
            key={r.id}
            onClick={() => generateSummary(r)}
            disabled={status === 'loading'}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '24px', cursor: 'pointer',
              fontSize: '0.85em', fontWeight: 600,
              background: activeRole === r.id ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
              color: activeRole === r.id ? '#111' : 'rgba(255,255,255,0.8)',
              border: activeRole === r.id ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease',
              opacity: status === 'loading' && activeRole !== r.id ? 0.5 : 1
            }}
          >
            <i className={`fas ${r.icon}`} /> {r.label}
          </button>
        ))}
      </div>

      <div style={{
        minHeight: '80px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px',
        padding: '20px', border: '1px dashed rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative'
      }}>
        {status === 'idle' && (
          <span style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
            Select your role above to generate a summary...
          </span>
        )}
        {status === 'loading' && (
          <div style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-spinner fa-spin" /> <span>Crafting the perfect pitch...</span>
          </div>
        )}
        {(status === 'success' || status === 'error') && (
          <p style={{ margin: 0, lineHeight: 1.6, color: status === 'error' ? '#ef4444' : 'var(--text-bright)', fontSize: '0.95em' }}>
            {summary}
          </p>
        )}
      </div>
    </div>
  );
}
