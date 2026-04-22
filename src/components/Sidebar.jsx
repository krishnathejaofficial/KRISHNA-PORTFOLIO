import { useEffect, useRef } from 'react';
import LogoLoop from './LogoLoop';
import { socialLogos } from '../data/socialLogos';

export default function Sidebar({ isOpen, onClose }) {
  const navLinks = [
    { href: '#home', icon: 'fa-home', label: 'Home' },
    { href: '#about', icon: 'fa-user', label: 'About' },
    { href: '#education', icon: 'fa-graduation-cap', label: 'Education' },
    { href: '#experience', icon: 'fa-briefcase', label: 'Experience' },
    { href: '#internships', icon: 'fa-industry', label: 'Internships' },
    { href: '#projects', icon: 'fa-project-diagram', label: 'Projects' },
    { href: '#skills', icon: 'fa-chart-line', label: 'Skills' },
    { href: '#certifications', icon: 'fa-award', label: 'Certifications' },
    { href: '#languages', icon: 'fa-globe', label: 'Languages' },
    { href: '#resume', icon: 'fa-file-pdf', label: 'Resume' },
    { href: '#contact', icon: 'fa-envelope', label: 'Contact' },
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
        <div className="sidebar-footer" style={{ overflow: 'hidden', padding: '20px 0', borderTop: '1px solid var(--gold-dim)' }}>
          <LogoLoop
            logos={socialLogos}
            speed={50}
            direction="left"
            logoHeight={28}
            gap={24}
            hoverSpeed={0}
            scaleOnHover={true}
            fadeOut={true}
            fadeOutColor="rgba(10,10,10,0.97)"
            ariaLabel="Social Links"
          />
        </div>
      </aside>
    </>
  );
}
