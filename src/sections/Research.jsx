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
            <li>Developed antioxidant-rich aquafeed formulations using <strong>orange and pomegranate peel waste</strong> as sustainable agro-industrial inputs, reducing reliance on fishmeal-based commercial feed.</li>
            <li>Conducted comprehensive biochemical assays including <strong>protein estimation (Bradford, BCA, Lowry), carbohydrate estimation (Anthrone), lipid extraction, and antioxidant evaluation (DPPH)</strong> for nutritional profiling.</li>
            <li>Identified Bradford assay interference due to polyphenol content; evaluated feed stability, palatability, and floatability under experimental conditions.</li>
            <li>Evaluated <strong>binder performance (tapioca starch vs alginate) and water stability (&gt;24h retention)</strong>.</li>
            <li>Demonstrated functional feed performance and scalability potential for industrial aquaculture applications; identified <strong>3 viable commercialization pathways</strong> through market landscape analysis.</li>
          </ul>
          <a href="https://drive.google.com/file/d/1x5JwIGPe2DdukwbQDjz7zqYHEZAIdvlC/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', display: 'inline-block', marginTop: '10px', textDecoration: 'none' }}><i className="fas fa-external-link-alt" style={{ marginRight: '5px' }} />View Thesis</a>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-recycle proj-icon" />
          <h3>Biotechnological E-Waste Leaching System</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '4px' }}>VIT Vellore | Sept 2025</p>
          <p style={{ fontSize: '0.83em', opacity: 0.7, marginBottom: '10px', fontStyle: 'italic' }}>Supervisor: Dr. Anand Prem Rajan</p>
          <ul>
            <li>Designed a microbial bioleaching system for heavy metal recovery from electronic waste streams (PCBs, cables), integrating bioreactor processing, electrolysis, and material recovery workflows.</li>
            <li>Proposed real-time monitoring and plastic upcycling modules for circular economy applications.</li>
            <li>Presented findings at <strong>National Entrepreneurship Day (EntrepreNATION)</strong> — won <strong>2nd Prize</strong> at the innovation showcase.</li>
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
