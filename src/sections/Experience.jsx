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
      <h2>Leadership Experience</h2>
      <div className="section-divider" />
      <div className="grid-2">
        <div className="card" data-animate>
          <i className="fas fa-chart-line proj-icon" />
          <h3>Finance Manager — Riviera&apos;25 &amp; Riviera&apos;26</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>VIT Cultural Fest | 2025 &amp; 2026</p>
          <ul>
            <li>Managed end-to-end finances for <strong>150+ events over 4 days</strong>, overseeing a total budget of <strong>Rs. 7 crore</strong>.</li>
            <li>Handled vendor and artist payments; performed <strong>GST, TDS, and profit/loss analysis</strong> using structured Google Sheets financial systems.</li>
            <li>Ensured transparency, cost control, and efficient resource allocation across all fest operations.</li>
          </ul>
          <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
            <a href="https://drive.google.com/file/d/105dvzQLrqjc5R0gqat4RoE0UaWKLDS8_/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', textDecoration: 'none' }}><i className="fas fa-certificate" style={{ marginRight: '5px' }} />Riviera&apos;25 Cert</a>
            <a href="https://drive.google.com/file/d/159EJQLYjJXA7spIEIw-ZPYe1tM9Xellc/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', textDecoration: 'none' }}><i className="fas fa-certificate" style={{ marginRight: '5px' }} />Riviera&apos;26 Cert</a>
          </div>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-heartbeat proj-icon" />
          <h3>Blood Donation Camp In-Charge — NSS VIT</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>4 Camps | 2023 – 2025</p>
          <ul>
            <li>Executed healthcare camps with <strong>1,104+ registrations and 952 successful donations</strong>, delivering record-breaking performance under strict time constraints.</li>
            <li>Coordinated with hospitals and 950+ donors to ensure smooth end-to-end operations.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-campground proj-icon" />
          <h3>NSS Special Rural Camps — 4 Villages</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>7 Days Each, 400+ Volunteers | 2022 – 2025</p>
          <ul>
            <li>Progressed through NSS roles: Volunteer → Coordinator → Organizer → Advisory, demonstrating consistent leadership growth.</li>
            <li>Managed logistics, team coordination, and field operations across 4 rural camps, overseeing <strong>400+ volunteers per camp</strong>.</li>
            <li>Designed and executed community development programs with measurable social impact across all village sites.</li>
          </ul>
          <div style={{ marginTop: '10px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <a href="https://drive.google.com/file/d/13_4x3JMNtPtUulgp1ZAJB5clVbOgFmPs/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', textDecoration: 'none' }}><i className="fas fa-certificate" style={{ marginRight: '5px' }} />Volunteer (Thiruvallam)</a>
            <a href="https://drive.google.com/file/d/13VtTA_-B_5-ayLEPOsn2vwrATXAS3lrH/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', textDecoration: 'none' }}><i className="fas fa-certificate" style={{ marginRight: '5px' }} />Coordinator (Vandranthangal)</a>
            <a href="https://drive.google.com/file/d/13RI6Hox2c5HpU-Qo5WOvDUNUdHpwx-6F/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', textDecoration: 'none' }}><i className="fas fa-certificate" style={{ marginRight: '5px' }} />Organizer (Anaicut)</a>
          </div>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-users proj-icon" />
          <h3>Secretary, Board Member — NSS VIT</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>2024 – 2025</p>
          <ul>
            <li>Led multiple social initiatives, events, and operational programs with measurable community impact at the institutional level.</li>
          </ul>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-shopping-cart proj-icon" />
          <h3>Purchase Coordinator &amp; Broadcasting Volunteer — Gravitas&apos;24</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>VIT, Vellore | 2024</p>
          <ul>
            <li>Handled procurement, vendor negotiations, and logistics for the university&apos;s annual technical fest.</li>
            <li>Assisted in broadcasting operations to ensure seamless event coverage.</li>
          </ul>
          <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
            <a href="https://drive.google.com/file/d/14N6cQ_Awc2vVhdgSZfxe_yM3ejStLzao/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', textDecoration: 'none' }}><i className="fas fa-certificate" style={{ marginRight: '5px' }} />Purchase Cert</a>
            <a href="https://drive.google.com/file/d/14WswTjmyprX1QEedfTjmGNNkH2UIwvdk/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', textDecoration: 'none' }}><i className="fas fa-certificate" style={{ marginRight: '5px' }} />Broadcasting Cert</a>
          </div>
        </div>
        <div className="card" data-animate>
          <i className="fas fa-microphone proj-icon" />
          <h3>Student Organiser — VIT Biosummit</h3>
          <p style={{ color: 'var(--gold)', fontSize: '0.85em', marginBottom: '10px' }}>SBST Flagship Event | 2023 &amp; 2024</p>
          <ul>
            <li>Led cross-functional execution across outreach, documentation, design, technical, and social media teams, ensuring coordinated and efficient event operations.</li>
          </ul>
          <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
            <a href="https://drive.google.com/file/d/13f9gM8je48poaUKMgv3KCLjKEBbdi4SH/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', textDecoration: 'none' }}><i className="fas fa-certificate" style={{ marginRight: '5px' }} />2023 Cert</a>
            <a href="https://drive.google.com/file/d/13hO9CsMEPwr-KmgqKWvAfaNxqzz5rEro/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: '0.85em', textDecoration: 'none' }}><i className="fas fa-certificate" style={{ marginRight: '5px' }} />2024 Cert</a>
          </div>
        </div>
      </div>
    </section>
  );
}
