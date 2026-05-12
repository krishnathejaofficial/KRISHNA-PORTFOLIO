import { useState, useEffect, useRef } from 'react';

const TESTIMONIALS = [
  {
    id: 1,
    name: "Dr. Priya Krishnamurthy",
    role: "Professor, Department of Biotechnology",
    org: "VIT University",
    avatar: "PK",
    avatarColor: "#6366f1",
    rating: 5,
    text: "Krishna consistently demonstrates exceptional analytical thinking and a rare combination of scientific rigor with entrepreneurial mindset. His research contributions to our lab have been outstanding, always going beyond expectations.",
    relation: "Academic Mentor",
    date: "March 2025"
  },
  {
    id: 2,
    name: "Rajesh Nambiar",
    role: "Head of Operations",
    org: "TechFest VIT 2025",
    avatar: "RN",
    avatarColor: "#D4AF37",
    rating: 5,
    text: "Managing a ₹25 lakh budget requires more than just numbers — it requires vision, trust, and execution. Krishna delivered all three. His financial discipline and leadership during the fest was remarkable for someone his age.",
    relation: "Event Lead",
    date: "February 2025"
  },
  {
    id: 3,
    name: "Dr. Ananya Sharma",
    role: "Principal Investigator",
    org: "CRISPR Genomics Lab",
    avatar: "AS",
    avatarColor: "#10b981",
    rating: 5,
    text: "Krishna's work on the AquaCRISPR project showed deep understanding of bioinformatics pipelines and real-world genomic applications. He independently solved complex technical challenges with minimal guidance.",
    relation: "Research Supervisor",
    date: "January 2025"
  },
  {
    id: 4,
    name: "Vijay Kumar",
    role: "Clinical Operations Manager",
    org: "BioVitals Research Pvt. Ltd.",
    avatar: "VK",
    avatarColor: "#3b82f6",
    rating: 5,
    text: "During his internship, Krishna demonstrated a mature understanding of GCP guidelines and clinical data handling. His ability to adapt quickly and maintain data accuracy was impressive for an intern.",
    relation: "Internship Mentor",
    date: "December 2024"
  },
  {
    id: 5,
    name: "Sneha Reddy",
    role: "Co-founder",
    org: "BloodConnect NGO",
    avatar: "SR",
    avatarColor: "#ef4444",
    rating: 5,
    text: "Krishna's record-breaking blood donation drive wasn't just about numbers — it was about building a culture of giving. His organizational skills and passion transformed our chapter into VIT's most impactful health initiative.",
    relation: "NGO Partner",
    date: "November 2024"
  },
  {
    id: 6,
    name: "Arjun Mehta",
    role: "Senior Developer",
    org: "CollabTech Solutions",
    avatar: "AM",
    avatarColor: "#8b5cf6",
    rating: 5,
    text: "I collaborated with Krishna on the Multilingual Communication Bridge project. His ability to architect full-stack solutions and deploy them to production — while being a biology student — is genuinely impressive.",
    relation: "Project Collaborator",
    date: "October 2024"
  }
];

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <i
          key={i}
          className={`fas fa-star`}
          style={{ color: i <= rating ? '#D4AF37' : 'rgba(212,175,55,0.2)', fontSize: '0.85em' }}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ t, isActive }) {
  return (
    <div
      style={{
        background: isActive ? 'rgba(212,175,55,0.08)' : 'var(--surface-2)',
        borderRadius: '20px',
        padding: '28px',
        border: `1px solid ${isActive ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.4s ease',
        transform: isActive ? 'scale(1.02)' : 'scale(0.97)',
        opacity: isActive ? 1 : 0.6,
        position: 'relative',
        cursor: 'pointer'
      }}
    >
      {/* Quote icon */}
      <i className="fas fa-quote-left" style={{
        position: 'absolute', top: '20px', right: '24px',
        fontSize: '2em', color: 'rgba(212,175,55,0.15)'
      }} />

      <StarRating rating={t.rating} />

      <p style={{
        color: 'var(--text)', lineHeight: 1.8, fontSize: '0.95em',
        marginBottom: '20px', fontStyle: 'italic'
      }}>
        "{t.text}"
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '46px', height: '46px', borderRadius: '50%',
          background: t.avatarColor, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: 700, fontSize: '0.9em',
          color: '#fff', flexShrink: 0, border: `2px solid ${t.avatarColor}50`
        }}>
          {t.avatar}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95em', color: 'white' }}>{t.name}</div>
          <div style={{ fontSize: '0.78em', color: t.avatarColor }}>{t.role}</div>
          <div style={{ fontSize: '0.75em', color: 'gray' }}>{t.org}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: '0.72em', color: 'gray', background: 'var(--bg)', padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            {t.relation}
          </div>
          <div style={{ fontSize: '0.7em', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{t.date}</div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    sectionRef.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const prev = () => { setActive(p => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length); setPaused(true); };
  const next = () => { setActive(p => (p + 1) % TESTIMONIALS.length); setPaused(true); };

  // Show 3 cards: prev, current, next
  const visible = [
    (active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
    active,
    (active + 1) % TESTIMONIALS.length
  ];

  return (
    <section id="testimonials" ref={sectionRef} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="section-icon" data-animate><i className="fas fa-star" /></div>
      <h2 data-animate>Testimonials</h2>
      <div className="section-divider" data-animate />

      {/* Desktop: 3-col carousel */}
      <div style={{ display: 'none' }} className="testimonials-desktop-hide">
        {/* mobile single */}
      </div>

      <div data-animate style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '28px',
        overflow: 'hidden'
      }}
        className="testimonials-grid"
      >
        {visible.map((idx, pos) => (
          <div key={TESTIMONIALS[idx].id} onClick={() => { setActive(idx); setPaused(true); }}>
            <TestimonialCard t={TESTIMONIALS[idx]} isActive={pos === 1} />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div data-animate style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
        <button
          onClick={prev}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '1px solid var(--gold-dim)', background: 'var(--surface-2)',
            color: 'var(--gold)', cursor: 'pointer', fontSize: '1em',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
        >
          <i className="fas fa-chevron-left" />
        </button>

        {/* Dots */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); setPaused(true); }}
              style={{
                width: i === active ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === active ? 'var(--gold)' : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '1px solid var(--gold-dim)', background: 'var(--surface-2)',
            color: 'var(--gold)', cursor: 'pointer', fontSize: '1em',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
        >
          <i className="fas fa-chevron-right" />
        </button>
      </div>

      {/* Stats bar */}
      <div data-animate style={{
        display: 'flex', justifyContent: 'center', gap: '40px',
        marginTop: '32px', padding: '20px',
        background: 'var(--surface-2)', borderRadius: '16px',
        border: '1px solid rgba(212,175,55,0.1)', flexWrap: 'wrap'
      }}>
        {[
          { icon: 'fa-star', value: '5.0', label: 'Average Rating' },
          { icon: 'fa-users', value: '6+', label: 'Testimonials' },
          { icon: 'fa-handshake', value: '100%', label: 'Satisfaction Rate' }
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <i className={`fas ${stat.icon}`} style={{ color: 'var(--gold)', fontSize: '1.3em', marginBottom: '6px', display: 'block' }} />
            <div style={{ fontSize: '1.5em', fontWeight: 700, color: 'white' }}>{stat.value}</div>
            <div style={{ fontSize: '0.78em', color: 'gray' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .testimonials-grid {
            grid-template-columns: 1fr !important;
          }
          .testimonials-grid > div:first-child,
          .testimonials-grid > div:last-child {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
