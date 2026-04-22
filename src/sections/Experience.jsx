import { useEffect, useRef } from 'react';

export default function Experience() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), idx * 80); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="experience" ref={ref}>
      <div className="section-icon"><i className="fas fa-briefcase" /></div>
      <h2>Experience</h2>
      <div className="section-divider" />
      <div className="grid-3">
        <div className="card" data-animate>
          <i className="fas fa-chart-line proj-icon" />
          <h3>Finance Manager — Riviera&apos;25 &amp; Riviera&apos;26</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>VIT, Vellore | 2025 &amp; 2026</p>
          <ul>
            <li>Managed finances for VIT&apos;s flagship cultural fest ensuring budget compliance and optimal resource use.</li>
            <li>Coordinated vendor payments, invoice verification, and expense reconciliation across 15+ teams.</li>
            <li>Improved cost-efficiency through structured procurement workflows.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-shopping-cart proj-icon" />
          <h3>Purchase Coordinator — Gravitas&apos;24</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>VIT, Vellore | Aug 2024 – Oct 2024</p>
          <ul>
            <li>Handled procurement operations for the major technical festival.</li>
            <li>Negotiated with vendors, ensured timely delivery for all departments.</li>
            <li>Developed an inventory tracking system to reduce delays.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-users proj-icon" />
          <h3>Secretary Board Member — NSS, VIT</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>VIT, Vellore | Aug 2023 – Present</p>
          <ul>
            <li>Led NSS activities and blood donation camps for 500+ donors with software-based data automation.</li>
            <li>Coordinated volunteer activities, documentation, and field engagement across multiple programs.</li>
            <li>Key role in planning and execution of awareness programs and outreach events.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-campground proj-icon" />
          <h3>NSS Special Camps – VIT</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>NSS VIT | 2023, 2024, 2025, 2026</p>
          <ul>
            <li><strong>Advisory (2026)</strong> — Senior advisory role for camp planning and operations.</li>
            <li><strong>Student Organiser — Clean India Domain (2025)</strong> — Anaicut villages, 6–12 Feb 2025.</li>
            <li><strong>Student Coordinator — Clean India + Media (2024)</strong> — Vandranthangal, 19–25 Feb 2024.</li>
            <li><strong>Student Volunteer — Food Domain (2023)</strong> — Katpadi Block, 2–8 Mar 2023.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-microphone proj-icon" />
          <h3>Student Organizer — VIT Biosummit 2024</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>VIT, Vellore | Sept – Oct 2024</p>
          <ul>
            <li>Led Outreach Team: design, videography, photography, documentation.</li>
            <li>Achieved 800+ registrations — highest ever recorded for VIT Biosummit.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-microphone-alt proj-icon" />
          <h3>Student Organizer — VIT Biosummit 2023</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>VIT, Vellore | Sept – Oct 2023</p>
          <ul>
            <li>Logistics, participant coordination, documentation, hall management for 500+ participants.</li>
            <li>Supported speaker coordination and session execution.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-dna proj-icon" />
          <h3>Student Coordinator — DNA Day 2024</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>VIT, Vellore | Apr 2024</p>
          <ul>
            <li>Organized departmental academic celebrations on biotechnology awareness.</li>
            <li>Crowd management, event logistics, and media coverage.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-code proj-icon" />
          <h3>Software Developer — NSS Blood Donation System</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>NSS VIT | Mar 2023 – Present</p>
          <ul>
            <li>Designed donor data management system using Google Apps Script &amp; Sheets.</li>
            <li>Handled 1500+ donor entries across multiple blood donation camps.</li>
            <li>Automated eligibility checks, PDF generation, email alerts, and logging.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
