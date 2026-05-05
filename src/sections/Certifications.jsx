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
    { icon: 'fa-trophy', text: '100% Attendance Award — VIT Vellore (2023)', link: 'https://drive.google.com/file/d/13hdaMD5yXOPebf-0RGLRmaXKOJ-66eTz/view?usp=sharing' },
    { icon: 'fa-trophy', text: '100% Attendance Award — VIT Vellore (2025)', link: 'https://drive.google.com/file/d/13ksrArjo8xcIlWzYurlscTiYHj1Xx6FB/view?usp=sharing' },
    { icon: 'fa-medal', text: 'EntrepreNATION — 2nd Prize (Entrepreneurship Competition)', link: 'https://drive.google.com/file/d/1YpBVuZJjBDPGJlKpa15bsX9v6fv0g9cG/view?usp=drivesdk' },
    { icon: 'fa-award', text: 'Water Conservation Ideathon — 3rd Place', link: 'https://drive.google.com/file/d/13tSKgQVm_-2kLm6Hb_Zvaamy0gZKc6Gx/view?usp=sharing' },
  ];

  return (
    <section id="certifications" ref={ref}>
      <div className="section-icon"><i className="fas fa-trophy" /></div>
      <h2>Achievements</h2>
      <div className="section-divider" />
      <div className="cert-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {achievements.map((c, i) => (
          <a className="cert-card" data-animate key={i} href={c.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block', transition: 'all 0.3s ease' }}>
            <i className={`fas ${c.icon}`} />
            <p>{c.text}</p>
            <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginTop: '12px' }}><i className="fas fa-external-link-alt" style={{ marginRight: '5px' }} /> View Certificate</p>
          </a>
        ))}
      </div>
    </section>
  );
}
