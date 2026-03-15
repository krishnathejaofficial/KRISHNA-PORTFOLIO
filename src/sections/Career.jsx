import { useEffect, useRef } from 'react';

export default function Career() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), idx * 80); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const interests = [
    { icon: 'fa-pills', title: 'Pharma & Biotech\nSales / Marketing' },
    { icon: 'fa-flask', title: 'Clinical Trials &\nOperations' },
    { icon: 'fa-handshake', title: 'Life Science Business\nDevelopment' },
    { icon: 'fa-microscope', title: 'Biotech & Medical\nInstruments' },
    { icon: 'fa-heartbeat', title: 'Digital Health &\nHealthcare Technology' },
  ];

  return (
    <section id="career" ref={ref}>
      <div className="section-icon"><i className="fas fa-bullseye" /></div>
      <h2>Career Interests</h2>
      <div className="section-divider" />
      <div className="grid-3" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {interests.map(item => (
          <div className="card" data-animate key={item.icon} style={{ textAlign: 'center', padding: '24px 18px' }}>
            <i className={`fas ${item.icon}`} style={{ fontSize: '2em', color: 'var(--gold)', marginBottom: '12px', display: 'block' }} />
            <h3 style={{ fontSize: '1.05em' }}>{item.title.split('\n').map((t, i) => <span key={i}>{t}{i === 0 && <br />}</span>)}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
