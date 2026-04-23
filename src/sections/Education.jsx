import { useEffect, useRef } from 'react';

export default function Education() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), idx * 80); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="education" ref={ref}>
      <div className="section-icon"><i className="fas fa-graduation-cap" /></div>
      <h2>Education</h2>
      <div className="section-divider" />
      <div className="grid-3">
        <div className="card" data-animate>
          <i className="fas fa-university edu-icon" />
          <h3>Integrated M.Sc. Biotechnology</h3>
          <p><strong>Vellore Institute of Technology (VIT)</strong> | 2022 – 2027</p>
          <p style={{ color: 'var(--gold)', margin: '6px 0', fontWeight: 600 }}>CGPA: 9.01</p>
          <ul>
            <li>100% Attendance Awards for 2022–23 and 2024–25.</li>
            <li>Research in Aquaculture sustainability, Biotechnological e-waste leaching, and bioinformatics.</li>
            <li>NSS Secretary Board Member, Biosummit &amp; DNA Day coordination.</li>
            <li>Coursework: molecular biology, genetics, bioinformatics, systems biology, bioprocess engineering.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-school edu-icon" />
          <h3>Intermediate – BiPC</h3>
          <p><strong>Sri Chaitanya Junior College, Vijayawada</strong> | 2019 – 2021</p>
          <p style={{ color: 'var(--gold)', margin: '6px 0', fontWeight: 600 }}>Score: 954 / 1000 (96%)</p>
          <ul>
            <li>Studied Sanskrit, English, Botany, Zoology, Physics, and Chemistry.</li>
            <li>Strong foundational knowledge in life sciences and physical sciences.</li>
            <li>Built interest in biotechnology through biology practicals.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-home edu-icon" />
          <h3>SSC – 10th Standard</h3>
          <p><strong>Masters EM High School</strong> | 2018 – 2019</p>
          <p style={{ color: 'var(--gold)', margin: '6px 0', fontWeight: 600 }}>GPA: 10 / 10</p>
          <ul>
            <li>Full marks across all subjects — science, language, and mathematics.</li>
            <li>Represented school in Kabaddi; regularly played Chess.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
