import { useEffect, useRef } from 'react';
import { socialLogos } from '../data/socialLogos';
import { useTranslation } from '../components/LanguageSwitcher';
import AvailabilityWidget from '../components/AvailabilityWidget';
import ShareButton from '../components/ShareButton';

const ROLES = [
  "Integrated M.Sc. Biotechnology",
  "Pharma Business Dev",
  "Clinical Operations",
  "Full-Stack Developer",
  "AI Systems Enthusiast"
];

export default function Hero({ onOpenCoverLetter, onOpenMeeting, onOpenQR, onOpenCollab, onOpenHireMe, onOpenHireKrishna, onOpenResumeAI, onOpenTrack }) {
  const nameRef = useRef(null);
  const particlesRef = useRef(null);
  const { t } = useTranslation();
  const [roleIndex, setRoleIndex] = useState(0);
  const [roleText, setRoleText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
      }, 100);
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

  // Typing Roles Effect
  useEffect(() => {
    const currentRole = ROLES[roleIndex];
    let typeSpeed = isDeleting ? 50 : 100;
    
    if (!isDeleting && roleText === currentRole) {
      typeSpeed = 2000; // Pause at end of word
      setTimeout(() => setIsDeleting(true), typeSpeed);
      return;
    } else if (isDeleting && roleText === '') {
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
      typeSpeed = 500; // Pause before new word
      return;
    }

    const timer = setTimeout(() => {
      setRoleText(prev => 
        isDeleting 
          ? currentRole.substring(0, prev.length - 1)
          : currentRole.substring(0, prev.length + 1)
      );
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [roleText, isDeleting, roleIndex]);

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
        <p className="hero-tagline" style={{ height: '30px', margin: '0 0 20px 0', fontSize: '1.2em', color: 'var(--gold)', fontWeight: 500 }}>
          {roleText}<span className="cursor-blink">|</span>
        </p>

        {/* ── Availability Status ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <AvailabilityWidget />
        </div>

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
          <button className="hero-action-chip hero-hire" onClick={onOpenHireKrishna} style={{ background: 'var(--gold)', color: '#111' }}>
            <i className="fas fa-hand-holding-usd" style={{ color: '#111' }} /> Hire Krishna
          </button>
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
          <ShareButton />
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
      <style>{`
        .cursor-blink {
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
