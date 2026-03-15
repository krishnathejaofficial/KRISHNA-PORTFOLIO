import { useEffect } from 'react';

export default function Preloader() {
  useEffect(() => {
    const pre = document.getElementById('preloader');
    if (!pre) return;
    const hide = () => { pre.style.opacity = '0'; setTimeout(() => pre.remove(), 600); };
    const timer = setTimeout(hide, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="preloader">
      <div className="loader-inner">
        <i className="fas fa-dna fa-spin" />
        <p>LOADING PORTFOLIO</p>
      </div>
    </div>
  );
}
