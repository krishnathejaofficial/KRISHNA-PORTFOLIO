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
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>Pharmaceutical Manufacturing | 2025</p>
          <ul>
            <li>Gained hands-on exposure to GMP manufacturing workflows, quality control (QC) procedures, and regulatory documentation standards in an active pharmaceutical facility.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-paper-plane proj-icon" />
          <h3>Industrial Intern — GSK Technologies Pvt Ltd</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>Industrial Biotech | 2024</p>
          <ul>
            <li>Observed industrial biotech process optimization and scale-up strategies, gaining insight into plant operations and production system efficiency.</li>
          </ul>
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
        </div>
        <div className="card" data-animate>
          <i className="fas fa-flask proj-icon" />
          <h3>Industrial Visit — STHREE Chemicals Pvt Ltd</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>Chemical Manufacturing | 2024</p>
          <ul>
            <li>Acquired practical understanding of chemical manufacturing operations, warehouse management, and quality assurance protocols.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
