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
          <h3>Fruit Peel-Based Sustainable Aquafeed Development</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '4px' }}>VIT Vellore (SBST) | Jun 2025 – Apr 2026</p>
          <p style={{ fontSize: '0.83em', opacity: 0.7, marginBottom: '10px', fontStyle: 'italic' }}>Supervisor: Dr. R. Sudhakaran</p>
          <ul>
            <li>Designed and optimized aquafeed formulations utilizing orange and pomegranate agro-industrial waste as sustainable alternatives to fishmeal.</li>
            <li>Performed comprehensive biochemical characterization including protein (Bradford, BCA, Lowry), carbohydrates, lipids, and antioxidant activity (DPPH).</li>
            <li>Critically analyzed polyphenol interference in Bradford protein assay, proposing alternative quantification strategies for phenol-rich samples.</li>
            <li>Developed formulations (F0–F6/F9) evaluating water stability (tapioca starch showed &gt;24h integrity), palatability (crab model), and floatability (hot-air puffing, CMC).</li>
            <li>Established a circular bioeconomy framework by converting fruit waste into cost-effective, antioxidant-rich aquafeed.</li>
          </ul>
          <a href="https://drive.google.com/file/d/1x5JwIGPe2DdukwbQDjz7zqYHEZAIdvlC/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', display: 'inline-block', marginTop: '10px', textDecoration: 'none' }}><i className="fas fa-external-link-alt" style={{ marginRight: '5px' }} />View Thesis</a>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-recycle proj-icon" />
          <h3>Multidisciplinary Biotechnological E-Waste Leaching System</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '4px' }}>EntreprenaTION, VIT Vellore | Sept 2025</p>
          <p style={{ fontSize: '0.83em', opacity: 0.7, marginBottom: '10px', fontStyle: 'italic' }}>Supervisor: Dr. Anand Prem Rajan</p>
          <ul>
            <li>Designed a closed-loop, microbe-driven bioleaching system for recovery of valuable metals (Au, Ag, Cu, Al) from e-waste (PCBs, cables).</li>
            <li>Developed an integrated process workflow including dismantling, microbial leaching, electrolysis, and downstream material segregation.</li>
            <li>Incorporated real-time monitoring using inline sensing (refractometer concept) to track leaching efficiency.</li>
            <li>Engineered plastic upcycling pathways, converting shredded plastics into functional products (e.g., plant pots).</li>
            <li>Designed eco-friendly alternatives to smelting, featuring a scalability model with modular bioreactors and community sourcing.</li>
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
