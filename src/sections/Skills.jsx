import { useEffect, useRef } from 'react';

function SkillCard({ icon, title, skills }) {
  const cardRef = useRef(null);
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        card.querySelectorAll('.progress-fill').forEach(fill => {
          fill.style.width = (parseInt(fill.dataset.width) || 0) + '%';
          const pct = fill.closest('.skill-item')?.querySelector('.skill-pct');
          if (pct) pct.classList.add('visible');
        });
        obs.unobserve(card);
      });
    }, { threshold: 0.3 });
    obs.observe(card);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="card" ref={cardRef} data-animate>
      <i className={`fas ${icon} cat-icon`} />
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>{title}</h3>
      {skills.map(s => (
        <div className="skill-item" key={s.name}>
          <div className="skill-header"><span>{s.name}</span><span className="skill-pct">{s.pct}%</span></div>
          <div className="progress-bar"><div className="progress-fill" data-width={s.pct} /></div>
        </div>
      ))}
    </div>
  );
}

export default function Skills() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), idx * 80); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const categories = [
    { icon: 'fa-users-cog', title: 'Management & Leadership', skills: [{ name: 'Communication', pct: 90 }, { name: 'Leadership', pct: 85 }, { name: 'Event & Finance Management', pct: 80 }, { name: 'Public Relations', pct: 75 }] },
    { icon: 'fa-code', title: 'Technical & Digital', skills: [{ name: 'Google Apps Script', pct: 80 }, { name: 'Excel & Google Sheets Automation', pct: 90 }, { name: 'HTML / CSS', pct: 90 }, { name: 'Dashboard Development', pct: 80 }, { name: 'Graphic Design (Canva Premium)', pct: 85 }, { name: 'Social Media Management', pct: 85 }, { name: 'Video Editing', pct: 75 }, { name: 'Data Analysis', pct: 75 }] },
    { icon: 'fa-vial', title: 'Biotechnology & Laboratory', skills: [{ name: 'PCR', pct: 90 }, { name: 'Gel Electrophoresis (Agarose & SDS)', pct: 90 }, { name: 'DNA Isolation', pct: 90 }, { name: 'Chromatography', pct: 85 }, { name: 'Molecular Biology Concepts', pct: 85 }, { name: 'UV-Vis Spectroscopy', pct: 80 }, { name: 'HPLC & GC', pct: 75 }, { name: 'GLP (Good Laboratory Practice)', pct: 80 }] },
    { icon: 'fa-database', title: 'Bioinformatics', skills: [{ name: 'NCBI', pct: 90 }, { name: 'UniProt', pct: 85 }, { name: 'PDB', pct: 80 }, { name: 'Sequence Alignment / BLAST', pct: 80 }, { name: 'Gene–Protein Networks (STRING)', pct: 75 }, { name: 'Drug–Target Mapping (DGIdb)', pct: 70 }, { name: 'Systems Biology Concepts', pct: 65 }] },
    { icon: 'fa-search', title: 'Research & Analytical', skills: [{ name: 'Research Methodology', pct: 85 }, { name: 'Literature Review', pct: 85 }, { name: 'Scientific Report Writing', pct: 80 }, { name: 'Data Cleaning & Structuring', pct: 80 }, { name: 'Case Study Development', pct: 75 }] },
    { icon: 'fa-lightbulb', title: 'Soft Skills', skills: [{ name: 'Problem Solving', pct: 90 }, { name: 'Quick Learning & Adaptability', pct: 90 }, { name: 'Communication & Presentation', pct: 85 }, { name: 'Time Management', pct: 85 }, { name: 'Attention to Detail', pct: 80 }] },
  ];

  return (
    <section id="skills" ref={ref}>
      <div className="section-icon"><i className="fas fa-chart-bar" /></div>
      <h2>Skills</h2>
      <div className="section-divider" />
      <div className="grid-2">
        {categories.map(cat => <SkillCard key={cat.title} icon={cat.icon} title={cat.title} skills={cat.skills} />)}
      </div>
    </section>
  );
}
