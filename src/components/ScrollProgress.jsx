import { useState, useEffect } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (scrollY / docHeight) * 100;
      setProgress(scrolled);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '3px',
      zIndex: 9999,
      background: 'rgba(255,255,255,0.05)',
      pointerEvents: 'none',
      opacity: progress > 1 ? 1 : 0,
      transition: 'opacity 0.3s ease'
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))',
        boxShadow: '0 0 10px var(--gold-dim)',
        transition: 'width 0.1s ease-out'
      }} />
    </div>
  );
}
