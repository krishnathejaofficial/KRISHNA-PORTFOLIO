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
            <li>Developed sustainable, antioxidant-rich aquafeed formulations using agro-industrial fruit peel waste, reducing reliance on commercial feed inputs.</li>
            <li>Conducted proximate analysis and biochemical assays including <strong>protein estimation (Bradford, BCA, Lowry), lipid, carbohydrate, and antioxidant evaluation (DPPH, ABTS)</strong> for nutritional profiling.</li>
            <li>Translated laboratory findings into scalable aquaculture feed applications with potential for industrial adoption.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-recycle proj-icon" />
          <h3>Biotechnological E-Waste Leaching Strategies</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '4px' }}>VIT Vellore | Sept 2025</p>
          <p style={{ fontSize: '0.83em', opacity: 0.7, marginBottom: '10px', fontStyle: 'italic' }}>Supervisor: Dr. Anand Prem Rajan</p>
          <ul>
            <li>Designed a microbial bioleaching approach for heavy metal recovery from electronic waste streams.</li>
            <li>Applied biotechnology principles to industrial sustainability, circular economy frameworks, and resource recovery.</li>
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
