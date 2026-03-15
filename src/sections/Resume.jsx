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
        <p style={{ marginBottom: '28px', opacity: 0.8 }}>Download my complete resume with all details, academic records, and project information.</p>
        <a href="/assets/resume.pdf" download className="btn">
          <i className="fas fa-download" style={{ marginRight: '8px' }} />Download Resume PDF
        </a>
      </div>
    </section>
  );
}
