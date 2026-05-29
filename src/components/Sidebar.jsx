import { useEffect, useRef } from 'react';
import { socialLogos } from '../data/socialLogos';
import { useTranslation } from '../components/LanguageSwitcher';

export default function Sidebar({ isOpen, onClose, onOpenQR, onOpenTrack, onOpenTools }) {
  const { t } = useTranslation();
  
  const navLinks = [
    { href: '#home', icon: 'fa-home', label: t('nav_home') },
    { href: '#about', icon: 'fa-user', label: t('nav_about') },
    { href: '#career', icon: 'fa-bullseye', label: 'Career Interests' },
    { href: '#education', icon: 'fa-graduation-cap', label: 'Education' },
    { href: '#research', icon: 'fa-microscope', label: t('nav_research') },
    { href: '#internships', icon: 'fa-industry', label: 'Internships' },
    { href: '#projects', icon: 'fa-project-diagram', label: t('nav_projects') },
    { href: '#skills', icon: 'fa-chart-bar', label: 'Skills' },
    { href: '#experience', icon: 'fa-briefcase', label: 'Leadership' },
    { href: '#certifications', icon: 'fa-trophy', label: 'Achievements' },
    { href: '#languages', icon: 'fa-globe', label: 'Languages' },
    { href: '#testimonials', icon: 'fa-star', label: 'Testimonials' },
    { href: '#media', icon: 'fa-photo-video', label: 'Media' },
    { href: '#resume', icon: 'fa-file-pdf', label: 'Resume' },
    { href: '#contact', icon: 'fa-envelope', label: t('nav_contact') },
  ];

  const activeLinkRef = useRef(null);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.sidebar-nav a');
    function setActive() {
      let current = '';
      sections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 120) current = sec.id; });
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
    }
    window.addEventListener('scroll', setActive);
    return () => window.removeEventListener('scroll', setActive);
  }, []);

  function handleNavClick(e, href) {
    e.preventDefault();
    onClose();
    const target = document.querySelector(href);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
  }

  return (
    <>
      <div id="sidebar-overlay" className={isOpen ? 'visible' : ''} onClick={onClose} />
      <aside id="sidebar" className={isOpen ? 'open' : ''}>
        <div className="sidebar-header">
          <img
            src="/images/IMG_20250601_195837.jpg"
            alt="G. Krishna Teja"
            className="sidebar-avatar"
            onError={e => { e.target.onerror = null; e.target.src = '/images/krishna teja profile.jpg'; }}
          />
          <div className="sidebar-name">G. Krishna Teja</div>
          <div className="sidebar-sub">Integrated M.Sc. Biotechnology<br />VIT, Vellore</div>
        </div>
        <ul className="sidebar-nav">
          {navLinks.map(link => (
            <li key={link.href}>
              <a href={link.href} onClick={e => handleNavClick(e, link.href)}>
                <i className={`fas ${link.icon}`} />{link.label}
              </a>
            </li>
          ))}
        </ul>
        <div style={{ padding: '0 24px 16px' }}>
          <button className="btn" onClick={() => { onClose(); onOpenQR(); }} style={{ width: '100%', background: 'var(--surface-2)', color: 'var(--text-bright)', border: '1px solid var(--gold-dim)', fontSize: '0.85em', padding: '10px' }}>
            <i className="fas fa-qrcode" style={{ marginRight: '8px' }} /> QR Business Card
          </button>
          <button className="btn" onClick={() => { onClose(); onOpenTrack(); }} style={{ width: '100%', background: 'var(--surface-2)', color: 'var(--text-bright)', border: '1px solid var(--gold-dim)', fontSize: '0.85em', padding: '10px', marginTop: '10px' }}>
            <i className="fas fa-search-location" style={{ marginRight: '8px' }} /> Track Request
          </button>
          <button className="btn" onClick={() => { onClose(); onOpenTools(); }} style={{ width: '100%', background: 'var(--surface-2)', color: 'var(--text-bright)', border: '1px solid var(--gold-dim)', fontSize: '0.85em', padding: '10px', marginTop: '10px' }}>
            <i className="fas fa-tools" style={{ marginRight: '8px' }} /> Super Tools
          </button>
        </div>
        <div className="sidebar-footer">
          {socialLogos.map(s => (
            <a key={s.title} href={s.href} target="_blank" rel="noreferrer" title={s.title} className="social-icon-link" style={{ fontSize: '1.3em' }}>
              {s.node}
            </a>
          ))}
        </div>
      </aside>
    </>
  );
}
