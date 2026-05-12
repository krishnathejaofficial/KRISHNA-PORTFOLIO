import { useState } from 'react';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href.split('?')[0]; // clean url
    const shareData = {
      title: 'G. Krishna Teja | Portfolio',
      text: 'Check out the professional portfolio of G. Krishna Teja, Biotech Researcher & Full-Stack Developer.',
      url: url,
    };

    if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  return (
    <button 
      className="hero-action-chip" 
      onClick={handleShare}
      style={{ 
        background: copied ? '#10b981' : 'var(--surface-2)',
        color: copied ? 'white' : 'var(--text-bright)',
        transition: 'all 0.3s ease',
        border: copied ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)'
      }}
    >
      {copied ? (
        <><i className="fas fa-check" style={{ marginRight: '6px' }} /> Copied!</>
      ) : (
        <><i className="fas fa-share-alt" style={{ marginRight: '6px' }} /> Share Profile</>
      )}
    </button>
  );
}
