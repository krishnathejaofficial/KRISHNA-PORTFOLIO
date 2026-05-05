import { useEffect, useRef } from 'react';

export default function Research() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), idx * 80); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="research" ref={ref}>
      <div className="section-icon"><i className="fas fa-microscope" /></div>
      <h2>Research Experience</h2>
      <div className="section-divider" />
      <div className="grid-2">
        <div className="card" data-animate>
          <i className="fas fa-fish proj-icon" />
          <h3>Aquaculture Feed Formulation Research</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '4px' }}>VIT Vellore (SBST) | Jun 2025 – May 2026</p>
          <p style={{ fontSize: '0.83em', opacity: 0.7, marginBottom: '10px', fontStyle: 'italic' }}>Supervisor: Dr. R. Sudhakaran, Department of Integrative Biology</p>
          <ul>
            <li>Developed antioxidant-rich aquafeed using orange &amp; pomegranate peel waste.</li>
            <li>Conducted biochemical assays (Bradford, BCA, Lowry, Anthrone, DPPH, lipid extraction).</li>
            <li>Identified Bradford assay interference due to polyphenols.</li>
            <li>Evaluated feed stability, palatability, and floatability.</li>
            <li>Demonstrated scalable, eco-friendly alternative to fishmeal-based feed.</li>
          </ul>
          <a href="https://drive.google.com/file/d/1x5JwIGPe2DdukwbQDjz7zqYHEZAIdvlC/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', display: 'inline-block', marginTop: '10px', textDecoration: 'none' }}><i className="fas fa-external-link-alt" style={{ marginRight: '5px' }} />View Thesis</a>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-recycle proj-icon" />
          <h3>Biotechnological E-Waste Leaching Strategies</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '4px' }}>VIT Vellore | Sept 2025</p>
          <p style={{ fontSize: '0.83em', opacity: 0.7, marginBottom: '10px', fontStyle: 'italic' }}>Supervisor: Dr. Anand Prem Rajan</p>
          <ul>
            <li>Designed a microbial bioleaching system for metal recovery from e-waste.</li>
            <li>Integrated bioreactor processing, electrolysis, and material recovery workflows.</li>
            <li>Proposed real-time monitoring and plastic upcycling for circular economy applications.</li>
            <li>Presented at National Entrepreneurship Day (EntreprenaTION).</li>
          </ul>
        </div>
      </div>

      {/* Manuscripts */}
      <h3 style={{ textAlign: 'center', marginTop: '40px', fontSize: '1.3em' }}>
        <i className="fas fa-file-alt" style={{ marginRight: '10px', opacity: 0.7 }} />
        Manuscripts
      </h3>
      <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', margin: '10px auto 24px', borderRadius: '2px' }} />
      <div className="grid-2">
        <div className="card" data-animate style={{ textAlign: 'center' }}>
          <i className="fas fa-scroll proj-icon" />
          <p style={{ fontStyle: 'italic', lineHeight: 1.7 }}>Transcriptomic &amp; Immunological Impact of Synthetic Food Colorants and Additives on the Human Gut.</p>
          <p style={{ color: 'var(--gold)', fontSize: '0.83em', marginTop: '8px' }}>2026 · Under Preparation</p>
        </div>
        <div className="card" data-animate style={{ textAlign: 'center' }}>
          <i className="fas fa-scroll proj-icon" />
          <p style={{ fontStyle: 'italic', lineHeight: 1.7 }}>Organic, Innovative, and Eco-friendly Feeds for Aquaculture.</p>
          <p style={{ color: 'var(--gold)', fontSize: '0.83em', marginTop: '8px' }}>2026 · Under Preparation</p>
        </div>
      </div>
    </section>
  );
}
