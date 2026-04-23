import { useEffect, useRef } from 'react';

export default function Projects() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), idx * 80); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="projects" ref={ref}>
      <div className="section-icon"><i className="fas fa-project-diagram" /></div>
      <h2>Technical Projects</h2>
      <div className="section-divider" />
      <div className="grid-2">
        <div className="card" data-animate>
          <i className="fas fa-heartbeat proj-icon" />
          <h3>Blood Donation Management System</h3>
          <p style={{ fontSize: '0.83em', color: 'var(--gold)', marginBottom: '8px' }}>4 Camps | 2023 – 2025</p>
          <ul>
            <li>Managed <strong>1,104+ registrations</strong> resulting in <strong>952 successful donations in ~7 hours</strong> — highest university record.</li>
            <li>Reduced manual coordination effort by ~60% through real-time tracking, digital registration, and automated reporting.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-bus proj-icon" />
          <h3>NSS Bus Attendance Automation System</h3>
          <p style={{ fontSize: '0.83em', color: 'var(--gold)', marginBottom: '8px' }}>Automation | 2024 – 2025</p>
          <ul>
            <li>Automated attendance tracking for <strong>400+ volunteers</strong> across NSS rural camp operations, reducing manual errors and improving logistics accuracy.</li>
            <li>Streamlined data collection and reporting workflows, enabling real-time visibility into volunteer deployment and transport coordination.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-capsules proj-icon" />
          <h3>Drug Repurposing Tool</h3>
          <p style={{ fontSize: '0.83em', color: 'var(--gold)', marginBottom: '8px' }}>Bioinformatics</p>
          <ul>
            <li>Integrated bioinformatics APIs to streamline drug repurposing workflows and improve candidate identification efficiency.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-qrcode proj-icon" />
          <h3>Token Generation System</h3>
          <p style={{ fontSize: '0.83em', color: 'var(--gold)', marginBottom: '8px' }}>Automation</p>
          <ul>
            <li>Built a customizable QR/barcode-based token generation platform supporting bulk automated operations for institutional events.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-birthday-cake proj-icon" />
          <h3>Cake Ordering Platform</h3>
          <p style={{ fontSize: '0.83em', color: 'var(--gold)', marginBottom: '8px' }}>Full-Stack Development</p>
          <ul>
            <li>Developed an end-to-end e-commerce platform featuring automated pricing, payment integration, and an admin management dashboard.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-laptop-code proj-icon" />
          <h3>Personal Portfolio Website</h3>
          <p style={{ fontSize: '0.83em', color: 'var(--gold)', marginBottom: '8px' }}>React · Vite · Vercel | 2025</p>
          <ul>
            <li>Fully responsive portfolio with elegant UI, sidebar navigation, and resume integration.</li>
            <li>Vercel deployment, contact form, SplashCursor fluid animation, dark/light mode toggle.</li>
            <li>Live at: <a href="https://gkrishnateja.vercel.app" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>gkrishnateja.vercel.app</a></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
