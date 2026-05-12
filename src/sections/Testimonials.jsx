import { useState, useEffect, useRef } from 'react';

function StarRating({ rating, interactive = false, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '3px', marginBottom: interactive ? '0' : '12px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <i
          key={i}
          className="fas fa-star"
          onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          style={{
            color: i <= (hovered || rating) ? '#D4AF37' : 'rgba(212,175,55,0.2)',
            fontSize: interactive ? '1.1em' : '0.85em',
            cursor: interactive ? 'pointer' : 'default',
            transition: 'color 0.15s'
          }}
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
        cursor: 'pointer',
        height: '100%',
        boxSizing: 'border-box'
      }}
    >
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
          background: t.avatarColor || '#D4AF37',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '0.9em', color: '#fff', flexShrink: 0,
          border: `2px solid ${t.avatarColor || '#D4AF37'}50`
        }}>
          {t.avatar || t.name?.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95em', color: 'white' }}>{t.name}</div>
          <div style={{ fontSize: '0.78em', color: t.avatarColor || '#D4AF37' }}>{t.role}</div>
          <div style={{ fontSize: '0.75em', color: 'gray' }}>{t.org}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          {t.relation && (
            <div style={{ fontSize: '0.72em', color: 'gray', background: 'var(--bg)', padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
              {t.relation}
            </div>
          )}
          {t.date && (
            <div style={{ fontSize: '0.7em', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{t.date}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [active, setActive]             = useState(0);
  const [paused, setPaused]             = useState(false);
  const sectionRef = useRef(null);

  // Fetch from API
  const fetchTestimonials = () => {
    setLoading(true);
    fetch('/api/testimonials')
      .then(r => r.json())
      .then(d => { if (d.success) setTestimonials(d.testimonials || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTestimonials(); }, []);

  // Auto-rotate
  useEffect(() => {
    if (paused || testimonials.length < 2) return;
    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [paused, testimonials.length]);

  // Intersection animate
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    sectionRef.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [loading]);

  const prev = () => { setActive(p => (p - 1 + testimonials.length) % testimonials.length); setPaused(true); };
  const next = () => { setActive(p => (p + 1) % testimonials.length); setPaused(true); };

  // Compute visible cards (3-up carousel or 1 on mobile)
  const n = testimonials.length;
  const visible = n >= 3
    ? [(active - 1 + n) % n, active, (active + 1) % n]
    : n === 2 ? [active, (active + 1) % n]
    : n === 1 ? [0]
    : [];

  // Stats
  const avgRating = testimonials.length
    ? (testimonials.reduce((s, t) => s + (t.rating || 5), 0) / testimonials.length).toFixed(1)
    : '—';

  if (loading) return (
    <section id="testimonials">
      <div className="section-icon"><i className="fas fa-star" /></div>
      <h2>Testimonials</h2>
      <div className="section-divider" />
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gold)' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2em' }} />
      </div>
    </section>
  );

  if (!loading && testimonials.length === 0) return (
    <section id="testimonials">
      <div className="section-icon"><i className="fas fa-star" /></div>
      <h2>Testimonials</h2>
      <div className="section-divider" />
      <div style={{ textAlign: 'center', padding: '60px', color: 'gray' }}>
        <i className="fas fa-comment-slash" style={{ fontSize: '2em', marginBottom: '12px', display: 'block' }} />
        No testimonials yet. Check back soon!
      </div>
    </section>
  );

  return (
    <section id="testimonials" ref={sectionRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="section-icon" data-animate><i className="fas fa-star" /></div>
      <h2 data-animate>Testimonials</h2>
      <div className="section-divider" data-animate />

      {/* Carousel grid */}
      <div
        data-animate
        className="testimonials-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${visible.length}, 1fr)`,
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        {visible.map((idx, pos) => (
          <div key={testimonials[idx]._id || idx}
            onClick={() => { setActive(idx); setPaused(true); }}>
            <TestimonialCard t={testimonials[idx]} isActive={pos === Math.floor(visible.length / 2)} />
          </div>
        ))}
      </div>

      {/* Controls */}
      {n > 1 && (
        <div data-animate style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
          <button onClick={prev} style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '1px solid var(--gold-dim)', background: 'var(--surface-2)',
            color: 'var(--gold)', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
          ><i className="fas fa-chevron-left" /></button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => { setActive(i); setPaused(true); }}
                style={{
                  width: i === active ? '24px' : '8px', height: '8px',
                  borderRadius: '4px', border: 'none', cursor: 'pointer',
                  background: i === active ? 'var(--gold)' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease', padding: 0
                }}
              />
            ))}
          </div>

          <button onClick={next} style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '1px solid var(--gold-dim)', background: 'var(--surface-2)',
            color: 'var(--gold)', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
          ><i className="fas fa-chevron-right" /></button>
        </div>
      )}

      {/* Stats bar */}
      <div data-animate style={{
        display: 'flex', justifyContent: 'center', gap: '40px',
        marginTop: '32px', padding: '20px',
        background: 'var(--surface-2)', borderRadius: '16px',
        border: '1px solid rgba(212,175,55,0.1)', flexWrap: 'wrap'
      }}>
        {[
          { icon: 'fa-star',      value: avgRating,          label: 'Average Rating' },
          { icon: 'fa-users',     value: `${n}+`,            label: 'Testimonials' },
          { icon: 'fa-handshake', value: '100%',             label: 'Satisfaction Rate' }
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
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid > div:first-child:not(:last-child),
          .testimonials-grid > div:last-child:not(:first-child) { display: none; }
        }
      `}</style>
    </section>
  );
}
