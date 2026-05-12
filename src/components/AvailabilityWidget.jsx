import { useState, useEffect } from 'react';

const STATUS_META = {
  available: { label: 'Available for Opportunities', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: 'fa-circle-check', pulse: true },
  busy:      { label: 'Currently Busy',              color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: 'fa-clock',        pulse: false },
  away:      { label: 'Away',                        color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: 'fa-moon',         pulse: false },
  dnd:       { label: 'Do Not Disturb',              color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: 'fa-ban',          pulse: false }
};

export default function AvailabilityWidget() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [istTime, setIstTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setIstTime(new Date().toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true
      }));
    };
    updateTime();
    const t = setInterval(updateTime, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch('/api/availability')
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Show a subtle placeholder while loading so layout doesn't shift
  if (loading) return (
    <div style={{ height: '34px', width: '180px', borderRadius: '20px',
      background: 'rgba(255,255,255,0.04)', margin: '0 auto' }} />
  );

  // Fallback when API isn't reachable (local dev)
  const status = data?.status || 'available';
  const meta   = STATUS_META[status] || STATUS_META.available;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* ── Pill button ── */}
      <button
        onClick={() => setExpanded(p => !p)}
        aria-expanded={expanded}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: meta.bg,
          border: `1.5px solid ${meta.color}60`,
          borderRadius: expanded ? '18px 18px 0 0' : '20px',
          padding: '7px 18px 7px 12px',
          cursor: 'pointer',
          boxShadow: `0 0 18px ${meta.color}30`,
          transition: 'all 0.25s ease',
          userSelect: 'none'
        }}
      >
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

        <i className={`fas ${meta.icon}`} style={{ color: meta.color, fontSize: '0.78em' }} />
        <span style={{ fontSize: '0.82em', fontWeight: 700, color: meta.color, whiteSpace: 'nowrap' }}>
          {meta.label}
        </span>
        <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}
          style={{ fontSize: '0.6em', color: 'rgba(255,255,255,0.35)', marginLeft: '2px' }} />
      </button>

      {/* ── Expanded detail card ── */}
      {expanded && (
        <div style={{
          background: 'rgba(10,10,15,0.92)',
          backdropFilter: 'blur(16px)',
          border: `1.5px solid ${meta.color}50`,
          borderTop: 'none',
          borderRadius: '0 0 14px 14px',
          padding: '12px 18px',
          minWidth: '240px',
          textAlign: 'left',
          boxShadow: `0 16px 40px rgba(0,0,0,0.45)`,
          animation: 'av-slide 0.2s ease'
        }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.8em', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            {data?.message || 'Open to new opportunities — feel free to reach out!'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.75em', color: 'var(--gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-clock" /> {istTime} (IST)
            </div>
            {data?.updatedAt && (
              <div style={{ fontSize: '0.68em', color: 'rgba(255,255,255,0.28)' }}>
                Updated: {new Date(data.updatedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes av-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.25); opacity: 0.85; }
        }
        @keyframes av-ripple {
          0%   { transform: scale(0.8); opacity: 0.4; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes av-slide {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
