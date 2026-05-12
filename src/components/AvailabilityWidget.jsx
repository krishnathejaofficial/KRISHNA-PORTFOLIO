import { useState, useEffect } from 'react';

const STATUS_META = {
  available: { label: 'Available', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: 'fa-circle-check', pulse: true },
  busy: { label: 'Busy', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: 'fa-clock', pulse: false },
  away: { label: 'Away', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: 'fa-moon', pulse: false },
  dnd: { label: 'Do Not Disturb', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: 'fa-ban', pulse: false }
};

export default function AvailabilityWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch('/api/availability')
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return null;

  const meta = STATUS_META[data.status] || STATUS_META.available;

  return (
    <div
      className="availability-widget"
      onClick={() => setExpanded(prev => !prev)}
      style={{
        position: 'fixed',
        bottom: '90px',
        left: '20px',
        zIndex: 999,
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      {/* Compact pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${meta.color}40`,
        borderRadius: expanded ? '14px 14px 0 0' : '20px',
        padding: '8px 14px',
        boxShadow: `0 4px 24px ${meta.color}25`,
        transition: 'all 0.3s ease'
      }}>
        {/* Pulsing dot */}
        <span style={{ position: 'relative', width: '10px', height: '10px', flexShrink: 0 }}>
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: meta.color,
            animation: meta.pulse ? 'av-pulse 2s ease-in-out infinite' : 'none'
          }} />
          {meta.pulse && (
            <span style={{
              position: 'absolute', inset: '-4px', borderRadius: '50%',
              background: meta.color, opacity: 0.25,
              animation: 'av-ripple 2s ease-in-out infinite'
            }} />
          )}
        </span>
        <span style={{ fontSize: '0.8em', fontWeight: 600, color: meta.color, whiteSpace: 'nowrap' }}>
          {meta.label}
        </span>
        <i className={`fas fa-chevron-${expanded ? 'down' : 'up'}`}
          style={{ fontSize: '0.65em', color: 'rgba(255,255,255,0.4)', marginLeft: '2px' }} />
      </div>

      {/* Expanded tooltip */}
      {expanded && (
        <div style={{
          background: 'rgba(10,10,15,0.92)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${meta.color}40`,
          borderTop: 'none',
          borderRadius: '0 0 14px 14px',
          padding: '12px 16px',
          minWidth: '220px',
          boxShadow: `0 12px 32px rgba(0,0,0,0.4)`,
          animation: 'slideDown 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <i className={`fas ${meta.icon}`} style={{ color: meta.color, fontSize: '0.9em' }} />
            <span style={{ fontSize: '0.82em', fontWeight: 600, color: 'white' }}>Krishna's Status</span>
          </div>
          <p style={{
            margin: 0, fontSize: '0.78em', color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.5
          }}>
            {data.message || 'Open to opportunities!'}
          </p>
          {data.updatedAt && (
            <div style={{ marginTop: '8px', fontSize: '0.7em', color: 'rgba(255,255,255,0.3)' }}>
              Updated: {new Date(data.updatedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes av-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.9; }
        }
        @keyframes av-ripple {
          0% { transform: scale(0.8); opacity: 0.4; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
