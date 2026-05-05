import { useEffect, useRef } from 'react';

export default function Internships() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), idx * 80); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="internships" ref={ref}>
      <div className="section-icon"><i className="fas fa-industry" /></div>
      <h2>Internship Experience</h2>
      <div className="section-divider" />
      <div className="grid-2">
        <div className="card" data-animate>
          <i className="fas fa-pills proj-icon" />
          <h3>Industrial Intern — Glory Pharma Chem India Pvt Ltd</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>Pharmaceutical Manufacturing | Jun–Jul 2025</p>
          <ul>
            <li>Assisted in GMP-based API intermediate manufacturing (reactor processing, filtration, centrifugation, drying).</li>
            <li>Performed QC analyses (moisture, pH, carbon testing; exposure to GC).</li>
            <li>Followed SOPs for equipment cleaning and batch documentation.</li>
            <li>Gained experience in QA, EHS, and pharmaceutical compliance systems.</li>
          </ul>
          <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
            <a href="https://drive.google.com/file/d/1_mGYxm8XGHMKVEL42TdYm6siZdXtcj2E/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', textDecoration: 'none' }}><i className="fas fa-file-alt" style={{ marginRight: '5px' }} />Internship Report</a>
            <a href="https://drive.google.com/file/d/1N4Q_junv58srhy40vKJRibICiJUsM_0E/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', textDecoration: 'none' }}><i className="fas fa-certificate" style={{ marginRight: '5px' }} />Certificate</a>
          </div>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-paper-plane proj-icon" />
          <h3>Industrial Intern — GSK Technologies Pvt Ltd</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>Industrial Biotech | May–Jun 2024</p>
          <ul>
            <li>Studied full-scale paper manufacturing (pulping → drying → rolling → packaging).</li>
            <li>Observed industrial equipment (pulper, boiler, heat exchanger, paper machine).</li>
            <li>Performed QC analysis (GSM, burst factor, pulp quality).</li>
            <li>Analyzed recycling and water reuse systems for sustainable production.</li>
          </ul>
          <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
            <a href="https://drive.google.com/file/d/1drIGDmz9P0_0Jr45Ti9BIvV-h2sytori/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', textDecoration: 'none' }}><i className="fas fa-file-alt" style={{ marginRight: '5px' }} />Internship Report</a>
            <a href="https://drive.google.com/file/d/13HT-oCZhkRE40P0Xaie-KjWmlaepJYsK/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', textDecoration: 'none' }}><i className="fas fa-certificate" style={{ marginRight: '5px' }} />Certificate</a>
          </div>
        </div>
      </div>

      {/* Additional Exposure */}
      <h3 style={{ textAlign: 'center', marginTop: '40px', fontSize: '1.3em' }}>
        <i className="fas fa-plus-circle" style={{ marginRight: '10px', opacity: 0.7 }} />
        Additional Exposure
      </h3>
      <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', margin: '10px auto 24px', borderRadius: '2px' }} />
      <div className="grid-2">
        <div className="card" data-animate>
          <i className="fas fa-clipboard-check proj-icon" />
          <h3>Clinical Data Management Program</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>VIT Vellore by BCRI</p>
          <ul>
            <li>Completed structured training in clinical data management principles, data handling workflows, and regulatory compliance frameworks (GCP, ICH guidelines).</li>
          </ul>
          <a href="https://drive.google.com/file/d/12W7ApoVJokFollVTmRmrdwrAF2WVF23x/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', display: 'inline-block', marginTop: '10px', textDecoration: 'none' }}><i className="fas fa-external-link-alt" style={{ marginRight: '5px' }} />View Certificate</a>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-flask proj-icon" />
          <h3>Industrial Visit — STHREE Chemicals Pvt Ltd</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>Chemical Manufacturing | 2024</p>
          <ul>
            <li>Acquired practical understanding of chemical manufacturing operations, warehouse management, and quality assurance protocols.</li>
          </ul>
          <a href="https://drive.google.com/file/d/14GNM2mWTy7VgPcyfnQZb3BGmjEtPb0mK/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', display: 'inline-block', marginTop: '10px', textDecoration: 'none' }}><i className="fas fa-external-link-alt" style={{ marginRight: '5px' }} />View Certificate</a>
        </div>
      </div>
    </section>
  );
}
