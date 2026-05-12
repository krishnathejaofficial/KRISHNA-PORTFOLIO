import { useState } from 'react';

export default function CopyEmail({ email = 'krishnatejareddy2003@gmail.com' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <a href={`mailto:${email}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {email}
      </a>
      <button 
        onClick={handleCopy}
        title="Copy email to clipboard"
        style={{
          background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
          border: 'none',
          color: copied ? '#10b981' : 'var(--gold)',
          borderRadius: '4px',
          padding: '4px 6px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.85em'
        }}
      >
        <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`} />
      </button>
    </span>
  );
}
