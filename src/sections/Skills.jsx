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
    { icon: 'fa-dna', title: 'Molecular Biology', skills: [{ name: 'PCR', pct: 90 }, { name: 'Agarose Gel Electrophoresis', pct: 90 }, { name: 'SDS-PAGE', pct: 85 }, { name: 'Vector Ligation', pct: 80 }, { name: 'DNA Isolation & Quantification', pct: 90 }, { name: 'Restriction Enzyme Digestion', pct: 85 }] },
    { icon: 'fa-vial', title: 'Analytical Techniques', skills: [{ name: 'TLC', pct: 85 }, { name: 'UV-Vis Spectroscopy', pct: 85 }, { name: 'Bradford Protein Estimation', pct: 90 }, { name: 'Antioxidant Assay (DPPH, ABTS)', pct: 85 }, { name: 'Chromatography', pct: 80 }, { name: 'GLP', pct: 80 }] },
    { icon: 'fa-microscope', title: 'Microscopy & Cell Biology', skills: [{ name: 'Light Microscopy', pct: 90 }, { name: 'SEM / TEM', pct: 75 }, { name: 'Cell & Bacterial Culture', pct: 85 }, { name: 'Media Preparation', pct: 85 }, { name: 'Sterilization & Autoclaving', pct: 90 }, { name: 'Plant Tissue Culture', pct: 75 }] },
    { icon: 'fa-database', title: 'Bioinformatics', skills: [{ name: 'UniProt / NCBI BLAST', pct: 90 }, { name: 'PDB / KEGG', pct: 85 }, { name: 'Primer-BLAST', pct: 80 }, { name: 'REACTOME / STRING', pct: 80 }, { name: 'GEO2R / Ensembl', pct: 75 }, { name: 'Drug Repurposing APIs', pct: 75 }] },
    { icon: 'fa-briefcase', title: 'Business & Operations', skills: [{ name: 'Operations Execution', pct: 90 }, { name: 'Financial Planning & Budget Mgmt', pct: 85 }, { name: 'Business Development', pct: 80 }, { name: 'GST & TDS Compliance', pct: 80 }, { name: 'Vendor Negotiation & Procurement', pct: 85 }, { name: 'Leadership', pct: 90 }] },
    { icon: 'fa-robot', title: 'AI & Systems Development', skills: [{ name: 'AI Tool Development', pct: 80 }, { name: 'Prompt Engineering', pct: 85 }, { name: 'API Integration', pct: 80 }, { name: 'Google Apps Script Automation', pct: 90 }, { name: 'Workflow Design', pct: 85 }] },
    { icon: 'fa-clipboard-check', title: 'Clinical & Data Analysis', skills: [{ name: 'MS Excel (Advanced)', pct: 90 }, { name: 'Google Sheets Automation', pct: 90 }, { name: 'Real-time Data Visualization', pct: 85 }, { name: 'Clinical Data Handling', pct: 75 }, { name: 'GCP / ICH Guidelines', pct: 75 }] },
    { icon: 'fa-code', title: 'Web & Full-Stack Development', skills: [{ name: 'Supabase (Auth, DB, Storage)', pct: 80 }, { name: 'Vercel Deployment', pct: 85 }, { name: 'REST APIs', pct: 80 }, { name: 'QR Code Generation', pct: 85 }, { name: 'Payment Gateway Integration', pct: 75 }] },
    { icon: 'fa-tools', title: 'Programming & Tools', skills: [{ name: 'R', pct: 70 }, { name: 'HTML (Basic)', pct: 80 }, { name: 'VS Code / Figma', pct: 85 }, { name: 'MS Office Suite', pct: 90 }, { name: 'Google Workspace', pct: 90 }, { name: 'Canva / Video Editing', pct: 85 }] },
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
