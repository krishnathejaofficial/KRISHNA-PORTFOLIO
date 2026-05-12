import { useEffect, useRef } from 'react';
import { useTranslation } from '../components/LanguageSwitcher';
import CounterAnimation from '../components/CounterAnimation';

export default function About() {
  const ref = useRef(null);
  const { t } = useTranslation();
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="about" ref={ref}>
      <div className="section-icon"><i className="fas fa-user-astronaut" /></div>
      <h2>{t('about_title')}</h2>
      <div className="section-divider" />
      <div className="about-content card" data-animate>
        <p>I am an <strong style={{ color: 'var(--gold)' }}>Integrated M.Sc. Biotechnology student at VIT Vellore (CGPA: 9.01)</strong> with a strong foundation in applied biotechnology, pharmaceutical operations, and system-driven execution. Demonstrated ability to deliver high-impact outcomes, including managing <strong style={{ color: 'var(--gold)' }}>Rs. 7 crore finances across 150+ events</strong> as Finance Manager for Riviera'25 &amp; '26, and executing <strong style={{ color: 'var(--gold)' }}>952 successful blood donations within ~7 hours</strong> — a university record.</p>
        <p>I have contributed to major university events as <strong style={{ color: 'var(--gold)' }}>Finance Manager (Riviera'25 &amp; '26)</strong>, <strong style={{ color: 'var(--gold)' }}>Purchase Coordinator (Gravitas'24)</strong>, and <strong style={{ color: 'var(--gold)' }}>NSS Secretary Board Member</strong>. Skilled in building scalable, automation-driven systems using AI tools, API integration, and data workflows — including a Blood Donation Management System and NSS Bus Attendance Automation for 400+ volunteers.</p>
        <p>Combining biotechnology expertise with leadership, financial management, and business development capabilities, I am seeking roles in <strong style={{ color: 'var(--gold)' }}>Pharmaceutical Operations</strong>, <strong style={{ color: 'var(--gold)' }}>Industrial Biotechnology</strong>, <strong style={{ color: 'var(--gold)' }}>Healthcare Systems</strong>, and <strong style={{ color: 'var(--gold)' }}>Business Development</strong> — with long-term interest in industry-integrated applied research.</p>
        
        {/* Animated Achievement Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '20px', marginTop: '30px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
          {[
            { value: "9.01", label: "CGPA", icon: "fa-graduation-cap" },
            { value: "952", suffix: "+", label: "Blood Donations", icon: "fa-heartbeat" },
            { value: "7", suffix: " Cr+", label: "Finances Managed", icon: "fa-rupee-sign" },
            { value: "150", suffix: "+", label: "Events Executed", icon: "fa-calendar-check" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '12px', background: 'rgba(212,175,55,0.05)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.1)' }}>
              <i className={`fas ${s.icon}`} style={{ fontSize: '1.2em', color: 'var(--gold)', marginBottom: '8px' }} />
              <div style={{ fontSize: '1.8em', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                {s.icon === 'fa-rupee-sign' && '₹'}
                <CounterAnimation value={s.value} suffix={s.suffix} duration={2000} />
              </div>
              <div style={{ fontSize: '0.8em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
