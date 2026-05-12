import { useEffect, useRef, useState } from 'react';

const RADAR_DATA = [
  { label: 'Molecular Biology', value: 90, color: '#10b981' },
  { label: 'Bioinformatics', value: 85, color: '#3b82f6' },
  { label: 'Clinical Research', value: 80, color: '#6366f1' },
  { label: 'Business Ops', value: 88, color: '#D4AF37' },
  { label: 'AI & Dev', value: 82, color: '#f59e0b' },
  { label: 'Data Analysis', value: 87, color: '#ef4444' },
  { label: 'Leadership', value: 92, color: '#8b5cf6' },
  { label: 'Communication', value: 90, color: '#06b6d4' }
];

function polarToCartesian(cx, cy, r, angleInDeg) {
  const angleInRad = (angleInDeg - 90) * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(angleInRad),
    y: cy + r * Math.sin(angleInRad)
  };
}

export default function SkillsRadarChart() {
  const canvasRef = useRef(null);
  const [animated, setAnimated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(null);
  const wrapRef = useRef(null);

  const SIZE = 340;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const maxR = (SIZE / 2) - 50;
  const n = RADAR_DATA.length;
  const levels = 5;

  // Animate in on intersection
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !animated) {
        setAnimated(true);
        let start = null;
        const duration = 1200;
        const frame = (ts) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / duration, 1);
          setProgress(p);
          if (p < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      }
    }, { threshold: 0.3 });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, [animated]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = SIZE + 'px';
    canvas.style.height = SIZE + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Grid rings
    for (let l = 1; l <= levels; l++) {
      const r = (maxR / levels) * l;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const angle = (360 / n) * i;
        const pt = polarToCartesian(cx, cy, r, angle);
        i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.strokeStyle = l === levels ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = l === levels ? 1.5 : 1;
      ctx.stroke();
    }

    // Axis lines
    for (let i = 0; i < n; i++) {
      const angle = (360 / n) * i;
      const pt = polarToCartesian(cx, cy, maxR, angle);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(pt.x, pt.y);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Data polygon (animated)
    const eased = progress < 1 ? 1 - Math.pow(1 - progress, 3) : 1; // ease-out cubic
    ctx.beginPath();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    grad.addColorStop(0, 'rgba(212,175,55,0.3)');
    grad.addColorStop(1, 'rgba(212,175,55,0.05)');

    for (let i = 0; i < n; i++) {
      const angle = (360 / n) * i;
      const r = (RADAR_DATA[i].value / 100) * maxR * eased;
      const pt = polarToCartesian(cx, cy, r, angle);
      i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(212,175,55,0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Data points
    for (let i = 0; i < n; i++) {
      const angle = (360 / n) * i;
      const r = (RADAR_DATA[i].value / 100) * maxR * eased;
      const pt = polarToCartesian(cx, cy, r, angle);
      const isHov = hovered === i;

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isHov ? 7 : 5, 0, 2 * Math.PI);
      ctx.fillStyle = isHov ? RADAR_DATA[i].color : 'rgba(212,175,55,0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(10,10,15,0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Labels
    ctx.font = '600 11px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const angle = (360 / n) * i;
      const labelR = maxR + 30;
      const pt = polarToCartesian(cx, cy, labelR, angle);
      const isHov = hovered === i;
      ctx.fillStyle = isHov ? RADAR_DATA[i].color : 'rgba(255,255,255,0.75)';
      ctx.fillText(RADAR_DATA[i].label, pt.x, pt.y);

      if (isHov) {
        ctx.font = 'bold 12px DM Sans, sans-serif';
        ctx.fillStyle = RADAR_DATA[i].color;
        ctx.fillText(`${RADAR_DATA[i].value}%`, pt.x, pt.y + 14);
        ctx.font = '600 11px DM Sans, sans-serif';
      }
    }
  }, [progress, hovered]);

  // Mouse hover detection
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let closest = null;
    let closestDist = Infinity;
    for (let i = 0; i < n; i++) {
      const angle = (360 / n) * i;
      const r = (RADAR_DATA[i].value / 100) * maxR;
      const pt = polarToCartesian(cx, cy, r, angle);
      const dist = Math.hypot(mx - pt.x, my - pt.y);
      if (dist < closestDist && dist < 20) {
        closestDist = dist;
        closest = i;
      }
    }
    setHovered(closest);
  };

  return (
    <div ref={wrapRef} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px'
    }}>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}
          style={{ display: 'block', cursor: 'crosshair', maxWidth: '100%' }}
        />
        {/* Center label */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '0.7em', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Skill
          </div>
          <div style={{ fontSize: '1.4em', fontWeight: 700, color: 'var(--gold)' }}>
            {hovered !== null ? RADAR_DATA[hovered].value + '%' : ''}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '10px',
        justifyContent: 'center', maxWidth: '380px'
      }}>
        {RADAR_DATA.map((d, i) => (
          <div
            key={d.label}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '20px', cursor: 'pointer',
              background: hovered === i ? `${d.color}20` : 'var(--surface-2)',
              border: `1px solid ${hovered === i ? d.color : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.2s'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.75em', color: hovered === i ? d.color : 'rgba(255,255,255,0.6)' }}>
              {d.label}
            </span>
            <span style={{ fontSize: '0.72em', fontWeight: 700, color: d.color }}>
              {d.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
