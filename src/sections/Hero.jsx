import { useEffect, useRef } from 'react';
import { socialLogos } from '../data/socialLogos';
import { useTranslation } from '../components/LanguageSwitcher';

export default function Hero({ onOpenCoverLetter, onOpenMeeting, onOpenQR, onOpenCollab, onOpenHireMe, onOpenResumeAI, onOpenTrack }) {
  const nameRef = useRef(null);
  const particlesRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const el = nameRef.current;
    let typeInterval;
    if (el) {
      const text = 'G. Krishna Teja';
      el.textContent = '';
      let i = 0;
      typeInterval = setInterval(() => {
        if (i < text.length) { el.textContent += text[i++]; }
        else { clearInterval(typeInterval); }
      }, 120);
    }
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
    return () => { if (typeInterval) clearInterval(typeInterval); };
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
        <p className="hero-tagline">{t('hero_tagline')}</p>

        {/* ── Primary Action Buttons ── */}
        <div className="hero-btns">
          <a href="#resume" className="btn hero-btn-primary"
            onClick={e => { e.preventDefault(); document.querySelector('#resume')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <i className="fas fa-file-alt" /> View Resume
          </a>

          <button className="btn hero-btn-outline" onClick={onOpenMeeting}>
            <i className="fas fa-calendar-alt" /> Book Meeting
          </button>
        </div>

        {/* ── Secondary Action Row ── */}
        <div className="hero-actions-row" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="hero-action-chip hero-hire" onClick={onOpenHireMe}>
            <i className="fas fa-user-plus" /> Join Team
          </button>
          <button className="hero-action-chip" onClick={onOpenQR}>
            <i className="fas fa-id-card" /> Digital Card
          </button>
          <button className="hero-action-chip" onClick={onOpenCollab}>
            <i className="fas fa-handshake" /> Collaborate
          </button>
          <button className="hero-action-chip" onClick={onOpenTrack} style={{ background: 'var(--surface-2)', border: '1px solid var(--gold)' }}>
            <i className="fas fa-search-location" style={{ color: 'var(--gold)' }} /> Track Request
          </button>
        </div>

        {/* ── Contact Info ── */}
        <div className="hero-contact">
          <p><i className="fas fa-map-marker-alt" style={{ color: 'var(--gold)', marginRight: '8px' }} />Madharapakkam, Tiruvallur, Tamil Nadu - 601202</p>
          <p><i className="fas fa-envelope" style={{ color: 'var(--gold)', marginRight: '8px' }} /><a href="mailto:krishnatejareddy2003@gmail.com">krishnatejareddy2003@gmail.com</a></p>
          <p><i className="fas fa-phone" style={{ color: 'var(--gold)', marginRight: '8px' }} /><a href="tel:+919390850349">+91 93908 50349</a></p>
          <div className="hero-social-links">
            {socialLogos.map(s => (
              <a key={s.title} href={s.href} target="_blank" rel="noreferrer" title={s.title} className="social-icon-link">
                {s.node}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
