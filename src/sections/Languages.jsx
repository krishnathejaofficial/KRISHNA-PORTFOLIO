import { useEffect, useRef } from 'react';

export default function Languages() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), idx * 80); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const langs = [
    { name: 'Telugu', level: 'Native / Mother Tongue', reading: 'Excellent', writing: 'Excellent', speaking: 'Excellent' },
    { name: 'English', level: 'Professional Proficiency', reading: 'Excellent', writing: 'Excellent', speaking: 'Excellent' },
    { name: 'Tamil', level: 'Conversational', reading: 'Not proficient', writing: 'Not proficient', speaking: 'Very Good' },
    { name: 'Hindi', level: 'Working Knowledge', reading: 'Good', writing: 'Good', speaking: 'Limited' },
  ];

  return (
    <section id="languages" ref={ref}>
      <div className="section-icon"><i className="fas fa-globe-americas" /></div>
      <h2>Languages</h2>
      <div className="section-divider" />
      <div className="lang-grid">
        {langs.map(l => (
          <div className="card lang-card" data-animate key={l.name}>
            <i className="fas fa-language lang-icon" />
            <h3 style={{ textAlign: 'center' }}>{l.name}</h3>
            <p style={{ textAlign: 'center', fontSize: '0.8em', color: 'var(--gold)', marginBottom: '8px' }}>{l.level}</p>
            <ul>
              <li><i className="fas fa-book" /> Reading: {l.reading}</li>
              <li><i className="fas fa-pen" /> Writing: {l.writing}</li>
              <li><i className="fas fa-microphone" /> Speaking: {l.speaking}</li>
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
