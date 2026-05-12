import { useState, useEffect } from 'react';

export default function VisitorCounter() {
  const [visits, setVisits] = useState(null);

  useEffect(() => {
    // Fire tracking POST first
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        country: 'Auto' // Vercel adds headers in edge
      })
    })
    .then(() => {
      // Then fetch the latest count
      return fetch('/api/analytics?type=summary');
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data) {
        setVisits(data.data.totalVisits);
      }
    })
    .catch(console.error);
  }, []);

  if (visits === null) return null;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      fontSize: '0.85em', color: 'rgba(255,255,255,0.5)',
      background: 'rgba(255,255,255,0.03)', padding: '4px 12px',
      borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)',
      marginTop: '10px'
    }}>
      <i className="fas fa-globe-americas" style={{ color: 'var(--gold)' }} />
      <span>Visitor #{visits.toLocaleString()}</span>
    </div>
  );
}
