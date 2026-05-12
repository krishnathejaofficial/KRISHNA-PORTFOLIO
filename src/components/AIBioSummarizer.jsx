import { useState } from 'react';

const PRESET_ROLES = [
  { id: 'recruiter', label: 'Biotech Recruiter', icon: 'fa-user-tie' },
  { id: 'collaborator', label: 'Academic Collaborator', icon: 'fa-microscope' },
  { id: 'manager', label: 'Operations Manager', icon: 'fa-chart-line' },
];

export default function AIBioSummarizer() {
  const [activeRole, setActiveRole] = useState(null);
  const [customRole, setCustomRole] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const generateSummary = async (roleLabel) => {
    if (!roleLabel?.trim()) return;
    setActiveRole(roleLabel);
    setStatus('loading');
    setSummary('');

    try {
      const sys = `You are Krishna Teja's AI assistant. Summarize his professional profile in exactly 2-3 short, punchy sentences tailored specifically for a ${roleLabel}. Use a professional, confident tone. Focus on metrics, CGPA (9.01), leadership (Finance Manager managing Rs.7 Cr+ across 150+ events), biotech/clinical skills, and technical abilities. No markdown formatting, no bullet points, just clean plain text.`;
      const msg = `Provide the summary for a ${roleLabel}.`;

      const res = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta/llama-3.3-70b-instruct',
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: msg },
          ],
          max_tokens: 180,
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

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customRole.trim()) {
      generateSummary(customRole.trim());
    }
  };

  return (
    <div style={{
      background: 'rgba(212,175,55,0.03)',
      borderRadius: '16px',
      padding: '24px',
      marginTop: '32px',
      border: '1px solid rgba(212,175,55,0.12)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div style={{
          background: 'rgba(212,175,55,0.12)', padding: '8px 12px',
          borderRadius: '10px', fontSize: '1.1em'
        }}>
          <i className="fas fa-robot" style={{ color: 'var(--gold)' }} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1em', fontWeight: 700 }}>AI Bio Summarizer</h3>
          <p style={{ margin: 0, fontSize: '0.8em', color: 'rgba(255,255,255,0.5)' }}>
            Get a custom pitch tailored to your profile
          </p>
        </div>
      </div>

      {/* Preset role buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '18px 0 12px' }}>
        {PRESET_ROLES.map(r => (
          <button
            key={r.id}
            onClick={() => generateSummary(r.label)}
            disabled={status === 'loading'}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '7px 15px', borderRadius: '24px', cursor: 'pointer',
              fontSize: '0.83em', fontWeight: 600,
              background: activeRole === r.label ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
              color: activeRole === r.label ? '#111' : 'rgba(255,255,255,0.8)',
              border: activeRole === r.label ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.12)',
              transition: 'all 0.2s ease',
              opacity: status === 'loading' && activeRole !== r.label ? 0.5 : 1
            }}
          >
            <i className={`fas ${r.icon}`} /> {r.label}
          </button>
        ))}
      </div>

      {/* Custom role input */}
      <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        <input
          type="text"
          value={customRole}
          onChange={e => setCustomRole(e.target.value)}
          placeholder="Type a custom role… e.g. VC Investor, HR Manager"
          disabled={status === 'loading'}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '10px',
            padding: '9px 14px',
            color: 'white',
            fontSize: '0.85em',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
        />
        <button
          type="submit"
          disabled={!customRole.trim() || status === 'loading'}
          style={{
            padding: '9px 18px', borderRadius: '10px', cursor: 'pointer',
            background: 'var(--gold)', color: '#111', fontWeight: 700,
            fontSize: '0.85em', border: 'none', transition: 'opacity 0.2s',
            opacity: !customRole.trim() || status === 'loading' ? 0.5 : 1,
            whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          {status === 'loading' && activeRole === customRole.trim()
            ? <><i className="fas fa-spinner fa-spin" /> Generating…</>
            : <><i className="fas fa-magic" /> Generate</>
          }
        </button>
      </form>

      {/* Output box */}
      <div style={{
        minHeight: '80px', background: 'rgba(0,0,0,0.25)', borderRadius: '12px',
        padding: '18px 20px', border: '1px dashed rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {status === 'idle' && (
          <span style={{ color: 'rgba(255,255,255,0.28)', fontStyle: 'italic', fontSize: '0.9em' }}>
            Select a preset role or type your own above to generate a tailored summary…
          </span>
        )}
        {status === 'loading' && (
          <div style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9em' }}>
            <i className="fas fa-spinner fa-spin" />
            <span>Crafting a pitch for <strong>{activeRole}</strong>…</span>
          </div>
        )}
        {(status === 'success' || status === 'error') && (
          <div style={{ width: '100%' }}>
            <div style={{
              fontSize: '0.7em', color: 'var(--gold)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px',
              opacity: 0.8
            }}>
              <i className="fas fa-sparkles" /> Pitch for: {activeRole}
            </div>
            <p style={{
              margin: 0, lineHeight: 1.7, fontSize: '0.93em',
              color: status === 'error' ? '#ef4444' : 'rgba(255,255,255,0.9)'
            }}>
              {summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
