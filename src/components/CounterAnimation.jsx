import { useState, useEffect, useRef } from 'react';

export default function CounterAnimation({ value, suffix = '', duration = 1500 }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const end = parseInt(value.replace(/,/g, '')) || 0;
    if (end === 0) return;
    
    const incrementTime = Math.max(duration / end, 16);
    const step = Math.max(1, Math.ceil(end / (duration / 16)));
    
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, visible, duration]);

  // Format number back to string with commas if needed, though for small numbers it's fine.
  // We'll format it with localeString if it's large.
  const displayCount = count >= 1000 ? count.toLocaleString() : count;

  return <span ref={ref}>{displayCount}{suffix}</span>;
}
