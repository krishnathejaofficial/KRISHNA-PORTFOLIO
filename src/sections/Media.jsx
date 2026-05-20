import { useEffect, useRef } from 'react';

export default function Media() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), idx * 80); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="media" ref={ref}>
      <div className="section-icon"><i className="fas fa-photo-video" /></div>
      <h2>Digital Media Leadership</h2>
      <div className="section-divider" />
      <div className="card about-content" data-animate>
        <p>As part of <strong style={{ color: 'var(--gold)' }}>TIRUPATI UPDATES</strong> — a YouTube channel with <strong style={{ color: 'var(--gold)' }}>1.4M+ subscribers</strong> and an Instagram page with <strong style={{ color: 'var(--gold)' }}>775K+ followers</strong> — I execute content strategy, audience analytics, and monetization workflows. I also manage end-to-end content creation for <strong style={{ color: 'var(--gold)' }}>NSS Camps</strong>, handling the Instagram page, designing posters, capturing photos/videos, and producing reels. I have contributed designs for <strong style={{ color: 'var(--gold)' }}>VIT Biosummit</strong> and multiple VIT clubs.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', marginTop: '28px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.8em', color: 'var(--gold)', fontWeight: 700, lineHeight: 1 }}>1.4M+</div>
            <div style={{ fontSize: '0.85em', marginTop: '6px', opacity: 0.8 }}><i className="fab fa-youtube" style={{ color: 'var(--gold)', marginRight: '6px' }} />YouTube Audience</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.8em', color: 'var(--gold)', fontWeight: 700, lineHeight: 1 }}>775K+</div>
            <div style={{ fontSize: '0.85em', marginTop: '6px', opacity: 0.8 }}><i className="fab fa-instagram" style={{ color: 'var(--gold)', marginRight: '6px' }} />Instagram Audience</div>
          </div>
        </div>
      </div>
    </section>
  );
}
