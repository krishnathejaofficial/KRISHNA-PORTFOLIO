import { useEffect, useRef } from 'react';
import GitHubHeatmap from '../components/GitHubHeatmap';
import GitHubStats from '../components/GitHubStats';

export default function Projects() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), idx * 80); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const projects = [
    {
      icon: 'fa-heartbeat', title: 'Healthcare Campaign Management System',
      meta: '4 Camps | 2023 – 2025', status: 'Completed', color: '#ef4444',
      bullets: [
        'Managed 1,104+ registrations resulting in 952 successful donations in ~7 hours (86% conversion rate) — highest university record.',
        'Executed multi-channel digital outreach via social media, campus networks, and hospital partnerships; reduced manual coordination by ~60%, saving 120+ man-hours per camp.'
      ],
      link: 'https://script.google.com/macros/s/AKfycbxI4WpnQ9l0H2sDxxvESYR3J99xpgczwNWquQhBUZhTl8hZ5MvWKrsGF2YdcpD6ZImz/exec'
    },
    {
      icon: 'fa-bus', title: 'NSS Bus Attendance Automation System',
      meta: 'Automation | 2024 – 2025', status: 'Live', color: '#10b981',
      bullets: [
        'Automated attendance tracking for 400+ volunteers across NSS rural camp operations, improving logistics accuracy by 85% and reducing manual errors significantly.',
        'Streamlined data collection and reporting workflows, enabling real-time visibility into volunteer deployment and transport coordination.'
      ],
      link: 'https://script.google.com/macros/s/AKfycbwn6Hqel1xO8aTFXhhFItg2uLau7kdGsbs28diJVQbumvcRENQZ3F9nPTN7pXO1rx7t4A/exec'
    },
    {
      icon: 'fa-capsules', title: 'Drug Repurposing Tool',
      meta: 'Bioinformatics', status: 'In Progress', color: '#f59e0b',
      bullets: [
        'Integrated bioinformatics APIs to streamline drug repurposing workflows and improve candidate identification efficiency; created user-facing documentation and demo materials for stakeholder presentations.'
      ],
      link: 'https://rx-discover.vercel.app/'
    },
    {
      icon: 'fa-qrcode', title: 'Token Generation System',
      meta: 'Automation', status: 'Live', color: '#10b981',
      bullets: [
        'Built a customizable QR/barcode-based token generation platform supporting bulk automated operations for institutional events.'
      ],
      link: 'https://token-generator-kappa.vercel.app/'
    },
    {
      icon: 'fa-birthday-cake', title: 'Cake Ordering Platform',
      meta: 'E-Commerce & Marketing', status: 'Completed', color: '#3b82f6',
      bullets: [
        'Developed an end-to-end e-commerce platform with automated pricing algorithms, payment integration, and admin analytics dashboard — skills directly transferable to digital commerce operations.'
      ],
      link: 'https://shopofkakes.vercel.app/'
    },
    {
      icon: 'fa-user-secret', title: 'Dev-Vault — Secure Messaging Platform',
      meta: 'Full-Stack Development', status: 'Live', color: '#10b981',
      bullets: [
        'Built a secure, anonymous chatting platform with ephemeral messaging and vault-based access control for private developer communication.'
      ],
      link: 'https://dev-vault-henna.vercel.app/'
    },
    {
      icon: 'fa-wallet', title: 'Budget Tracker App',
      meta: 'Mobile App Development', status: 'Completed', color: '#3b82f6',
      bullets: [
        'Developed a personal finance tracking application enabling users to log income, expenses, and visualize spending patterns through a clean mobile interface.'
      ],
      link: 'https://drive.google.com/file/d/1hCiXQusxk5kJf9N-2s-LCA1J5t5vHkFv/view?usp=sharing'
    },
    {
      icon: 'fa-laptop-code', title: 'Personal Portfolio Website',
      meta: 'React · Vite · Vercel | 2025', status: 'Live', color: '#10b981',
      bullets: [
        'Fully responsive portfolio with elegant UI, sidebar navigation, and resume integration.',
        'Vercel deployment, contact form, SplashCursor fluid animation, dark/light mode toggle.'
      ],
      link: 'https://gkrishnateja.vercel.app'
    }
  ];

  return (
    <section id="projects" ref={ref}>
      <div className="section-icon"><i className="fas fa-project-diagram" /></div>
      <h2>Technical Projects</h2>
      <div className="section-divider" />
      <div className="grid-2">
        {projects.map((p, i) => (
          <div className="card project-card" data-animate key={i} style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Status Badge */}
            <div style={{
              position: 'absolute', top: '16px', right: '16px',
              background: `${p.color}20`, border: `1px solid ${p.color}50`,
              color: p.color, padding: '4px 10px', borderRadius: '20px',
              fontSize: '0.7em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.color, boxShadow: `0 0 5px ${p.color}` }} />
              {p.status}
            </div>

            <i className={`fas ${p.icon} proj-icon`} style={{ color: 'var(--gold)' }} />
            <h3 style={{ paddingRight: '80px' }}>{p.title}</h3>
            <p style={{ fontSize: '0.83em', color: 'var(--gold)', marginBottom: '12px' }}>{p.meta}</p>
            <ul>
              {p.bullets.map((b, j) => <li key={j}>{b}</li>)}
            </ul>
            <a href={p.link} target="_blank" rel="noreferrer" className="proj-link" style={{ 
              color: 'var(--gold)', fontSize: '0.85em', display: 'inline-flex', alignItems: 'center',
              marginTop: 'auto', textDecoration: 'none', fontWeight: 600, padding: '8px 16px',
              background: 'rgba(212,175,55,0.1)', borderRadius: '8px', transition: 'all 0.3s'
            }}>
              <i className="fas fa-external-link-alt" style={{ marginRight: '8px' }} /> View Project
            </a>
          </div>
        ))}
      </div>
      <div data-animate style={{ marginTop: '30px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.2em' }}><i className="fab fa-github" style={{ marginRight: '8px' }} /> GitHub Activity</h3>
        <GitHubHeatmap />
        <GitHubStats />
      </div>
    </section>
  );
}
