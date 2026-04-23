import { useEffect, useRef } from 'react';

export default function Certifications() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), idx * 80); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const achievements = [
    { icon: 'fa-trophy', text: '100% Attendance Award — VIT Vellore (2023 and 2025)' },
    { icon: 'fa-medal', text: 'EntrepreNATION — 2nd Prize (Entrepreneurship Competition)' },
    { icon: 'fa-award', text: 'Water Conservation Ideathon — 3rd Place' },
  ];

  return (
    <section id="certifications" ref={ref}>
      <div className="section-icon"><i className="fas fa-trophy" /></div>
      <h2>Achievements</h2>
      <div className="section-divider" />
      <div className="cert-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {achievements.map((c, i) => (
          <div className="cert-card" data-animate key={i}>
            <i className={`fas ${c.icon}`} />
            <p>{c.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
