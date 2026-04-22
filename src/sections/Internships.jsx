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
      <h2>Internship &amp; Industrial Training</h2>
      <div className="section-divider" />
      <div className="grid-3">
        <div className="card" data-animate>
          <i className="fas fa-pills proj-icon" />
          <h3>Industrial Intern — Glory Pharma Chem India Pvt Ltd</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>Pharmaceutical Manufacturing | 2 June – 4 July 2025</p>
          <ul>
            <li>Hands-on in pharmaceutical manufacturing operations, batch processing.</li>
            <li>API handling, formulation processes, equipment sanitation.</li>
            <li>Learned GMP, documentation standards, and regulatory compliance.</li>
            <li>Worked with QA/QC teams on testing, sampling, and deviation reporting.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-paper-plane proj-icon" />
          <h3>Industrial Intern — GSK Technologies Pvt Ltd</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>Paper Manufacturing Industry | July 2024</p>
          <ul>
            <li>Complete packaging paper production: pulping, bleaching, refining, sheet formation.</li>
            <li>QC: GSM analysis, moisture content, tensile strength, burst factor.</li>
            <li>Insights into industrial chemistry, sustainability, and wastewater treatment.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-flask proj-icon" />
          <h3>Industrial Training — Sthree Chemicals Pvt Ltd</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>Chemical Manufacturing | Nov 2024</p>
          <ul>
            <li>Chemical production processes, synthesis, purification, plant-level safety.</li>
            <li>Reactors, mixers, filtration units, QA/QC systems.</li>
            <li>Industrial safety, hazard management, environmental compliance.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
