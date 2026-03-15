import { useEffect, useRef } from 'react';

export default function About() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="about" ref={ref}>
      <div className="section-icon"><i className="fas fa-user-tie" /></div>
      <h2>About Me</h2>
      <div className="section-divider" />
      <div className="about-content card" data-animate>
        <p>I am a <strong style={{ color: 'var(--gold)' }}>Motivated Integrated M.Sc. Biotechnology student at VIT</strong> (CGPA 9.01) with two 100% attendance awards. Experienced in event finance, operations (Riviera, Gravitas), and healthcare software development, including an NSS blood donor management system that successfully screened 1105+ donors across multiple camps.</p>
        <p>I have contributed to major university events as <strong style={{ color: 'var(--gold)' }}>Finance Manager (Riviera&apos;25 &amp; &apos;26)</strong>, <strong style={{ color: 'var(--gold)' }}>Purchase Coordinator (Gravitas&apos;24)</strong>, and <strong style={{ color: 'var(--gold)' }}>NSS Secretary Board Member</strong>, along with organizing and supporting multiple NSS Special Camps across Tamil Nadu villages. I also lead digital media efforts managing 1.4M+ YouTube and 700K+ Instagram audiences as Media Team Head for NSS Camps.</p>
        <p>Driven, disciplined, and community-focused, I am interested in <strong style={{ color: 'var(--gold)' }}>Pharmaceutical Sales &amp; Marketing</strong>, <strong style={{ color: 'var(--gold)' }}>Clinical Operations</strong>, and <strong style={{ color: 'var(--gold)' }}>Healthcare Business Development</strong> — applying biotechnology and data-driven tools to create impactful solutions in health, research, and sustainable development.</p>
      </div>
    </section>
  );
}
