import { useEffect, useRef } from 'react';
import PixelTransition from '../components/PixelTransition';
import LogoLoop from '../components/LogoLoop';
import { socialLogos } from '../data/socialLogos';
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
        <PixelTransition
          firstContent={
            <img
              src="/images/IMG_20250601_195837.jpg"
              alt="G. Krishna Teja"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.onerror = null; e.target.src = '/images/krishna teja profile.jpg'; }}
            />
          }
          secondContent={
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10, 10, 10, 0.95)' }}>
              <h2 style={{ margin: 0, color: '#ffffff', fontSize: '2.5rem', fontFamily: "'Cormorant Garamond', serif" }}>Teja</h2>
            </div>
          }
          gridSize={10}
          pixelColor="#ffffff"
          animationStepDuration={0.4}
          aspectRatio=""
          className="profile-photo"
          style={{ padding: 0 }}
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
          <div className="hero-social-links" style={{ width: '100%', overflow: 'hidden', justifyContent: 'center' }}>
            <LogoLoop
              logos={socialLogos}
              speed={60}
              direction="left"
              logoHeight={32}
              gap={28}
              hoverSpeed={0}
              scaleOnHover={true}
              fadeOut={true}
              fadeOutColor="rgba(18,18,18,0.92)"
              ariaLabel="Social Links"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
