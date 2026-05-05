import { useEffect, useRef } from 'react';

export default function Resume() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.08 });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="resume" ref={ref}>
      <div className="section-icon"><i className="fas fa-file-alt" /></div>
      <h2>Resume</h2>
      <div className="section-divider" />
      <div className="card resume-box" data-animate>
        <p style={{ marginBottom: '28px', opacity: 0.8 }}>Download or view my complete resume with all details, academic records, and project information. (Auto-generated from LaTeX)</p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={`/resume.pdf?v=${Date.now()}`} target="_blank" rel="noreferrer" className="btn" style={{ background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)' }}>
            <i className="fas fa-eye" style={{ marginRight: '8px' }} />View Resume PDF
          </a>
          <a href={`/resume.pdf?v=${Date.now()}`} download="G_Krishna_Teja_Resume.pdf" className="btn">
            <i className="fas fa-download" style={{ marginRight: '8px' }} />Download Resume PDF
          </a>
        </div>
      </div>
    </section>
  );
}
