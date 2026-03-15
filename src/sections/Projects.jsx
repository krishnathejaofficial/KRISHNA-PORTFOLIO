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
      <h2>Projects</h2>
      <div className="section-divider" />
      <div className="grid-2">
        <div className="card" data-animate>
          <i className="fas fa-heartbeat proj-icon" />
          <h3>NSS Blood Donation Camp Software</h3>
          <p style={{ fontSize: '0.83em', color: 'var(--gold)', marginBottom: '8px' }}>Google Apps Script · Sheets · Real-time Dashboard | 2023, 2024, 2025, 2026</p>
          <ul>
            <li>Built donor management software with real-time dashboard managing 3+ blood donation camps.</li>
            <li>Screened <strong>1105 donors</strong> with <strong>952 successful donations in 7 hours</strong> in one camp; another with 804 successful donors.</li>
            <li>Automated email responses, eligibility checks, data cleaning, PDF generation, and error logging.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-fish proj-icon" />
          <h3>Aquaculture Research</h3>
          <p style={{ fontSize: '0.83em', color: 'var(--gold)', marginBottom: '8px' }}>VIT SBST | Jun 2025 – Present</p>
          <ul>
            <li>Formulation of fruit-peel based antioxidant and protein-rich feed for tilapia aquaculture sustainability.</li>
            <li>Studying environmentally friendly methods to improve fish growth and reduce ecological impact.</li>
            <li>Experimental design, data collection, and analysis for publication.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-recycle proj-icon" />
          <h3>Biotechnological E-Waste Leaching Strategies</h3>
          <p style={{ fontSize: '0.83em', color: 'var(--gold)', marginBottom: '8px' }}>Presented at Engineer&apos;s Day 2025, VIT | Sept 2025</p>
          <ul>
            <li>Microbial leaching techniques for metal recovery from electronic waste.</li>
            <li>Bioleaching using bacteria and fungi for sustainable extraction.</li>
            <li>Recognized under guidance of Dr. Anand Prem Ranjan (SBST).</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-tint proj-icon" />
          <h3>Water Conservation Ideathon</h3>
          <p style={{ fontSize: '0.83em', color: 'var(--gold)', marginBottom: '8px' }}>🥉 3rd Place — World Water Conservation Week 2023, VIT</p>
          <ul>
            <li>Innovative water-saving strategies for urban and semi-urban environments.</li>
            <li>Community-level water reuse, rainwater harvesting, household conservation model.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-image proj-icon" />
          <h3>EntrepreNATION Poster Innovation</h3>
          <p style={{ fontSize: '0.83em', color: 'var(--gold)', marginBottom: '8px' }}>🥈 2nd Prize (₹3000) | 2025</p>
          <ul>
            <li>Scientific poster on microbial metal recovery using biotechnology-based approaches.</li>
            <li>Recognized for creativity, scientific accuracy, and presentation quality.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-bus proj-icon" />
          <h3>NSS Camp Bus Attendance Automation System</h3>
          <p style={{ fontSize: '0.83em', color: 'var(--gold)', marginBottom: '8px' }}>Google Sheets Automation | 2026</p>
          <ul>
            <li>Built a digital bus attendance tracking system using Google Sheets automation.</li>
            <li>Monitors NSS volunteer transportation and improves attendance accuracy during camps.</li>
            <li>Streamlined logistics tracking and reduced manual errors in camp operations.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-laptop-code proj-icon" />
          <h3>Personal Portfolio Website</h3>
          <p style={{ fontSize: '0.83em', color: 'var(--gold)', marginBottom: '8px' }}>React · Vite · Vercel | 2025</p>
          <ul>
            <li>Fully responsive portfolio with elegant UI, sidebar navigation, and resume integration.</li>
            <li>Vercel deployment, contact form, SplashCursor fluid animation, dark/light mode toggle.</li>
            <li>Live at: <a href="https://gkrishnateja.netlify.app/" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>gkrishnateja.netlify.app</a></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
