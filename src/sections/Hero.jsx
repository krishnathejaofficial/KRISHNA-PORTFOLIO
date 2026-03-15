import { useEffect, useRef } from 'react';

export default function Hero() {
  const nameRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    // Typing effect
    const el = nameRef.current;
    let typeInterval;
    if (el) {
      const text = 'G. Krishna Teja';
      el.textContent = '';
      let i = 0;
      typeInterval = setInterval(() => { 
        if (i < text.length) {
          el.textContent += text[i++]; 
        } else {
          clearInterval(typeInterval); 
        }
      }, 120);
    }
    // Particles
    const container = particlesRef.current;
    if (container) {
      for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const sz = Math.random() * 5 + 2;
        p.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;bottom:-10px;animation-duration:${Math.random()*6+5}s;animation-delay:${Math.random()*6}s;opacity:${Math.random()*0.5+0.2};`;
        container.appendChild(p);
      }
    }
    
    return () => {
      if (typeInterval) clearInterval(typeInterval);
    };
  }, []);

  return (
    <section id="home" className="hero">
      <div className="hero-bg" />
      <div className="particles" ref={particlesRef} />
      <div className="hero-content">
        <img
          src="/images/IMG_20250601_195837.jpg"
          alt="G. Krishna Teja"
          className="profile-photo"
          onError={e => { e.target.onerror = null; e.target.src = '/images/krishna teja profile.jpg'; }}
        />
        <h1 className="hero-name" ref={nameRef}>G. Krishna Teja</h1>
        <p className="hero-tagline">
          Integrated M.Sc. Biotechnology Student | VIT (CGPA 9.01) | Pharma &amp; Biotech Sales · Clinical Operations · Healthcare Business Development
        </p>
        <a href="#resume" className="btn" onClick={e => { e.preventDefault(); document.querySelector('#resume')?.scrollIntoView({ behavior: 'smooth' }); }}>View Resume</a>
        <div className="hero-contact">
          <p><i className="fas fa-map-marker-alt" style={{ color: 'var(--gold)', marginRight: '8px' }} />Madharapakkam, Tiruvallur, Tamil Nadu - 601202</p>
          <p><i className="fas fa-envelope" style={{ color: 'var(--gold)', marginRight: '8px' }} /><a href="mailto:krishnatejareddy2001@gmail.com">krishnatejareddy2001@gmail.com</a></p>
          <p><i className="fas fa-phone" style={{ color: 'var(--gold)', marginRight: '8px' }} /><a href="tel:+919390850349">+91 93908 50349</a></p>
          <div className="hero-social-links">
            {[
              { href: 'https://www.linkedin.com/in/gkrishnateja', src: '/images/LINKEDIN.png', alt: 'LinkedIn' },
              { href: 'https://www.instagram.com/krishna_theja_reddy', src: '/images/INSTA.png', alt: 'Instagram' },
              { href: 'https://www.facebook.com/share/16RTshSy8n/', src: '/images/FB.png', alt: 'Facebook' },
              { href: 'https://x.com/GKrishnaTeja10', src: '/images/X.png', alt: 'X' },
              { href: 'https://github.com/krishnathejaofficial', src: '/images/GITHUB.png', alt: 'GitHub' },
            ].map(s => (
              <a key={s.alt} href={s.href} target="_blank" rel="noreferrer" title={s.alt}>
                <img src={s.src} alt={s.alt} className="social-icon" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
