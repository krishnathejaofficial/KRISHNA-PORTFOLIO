import { useState, useEffect, useRef } from 'react';

// Fallback stats in case GitHub API is rate-limited
const FALLBACK_STATS = { stars: 12, repos: 18, followers: 24 };

export default function GitHubStats({ username = 'krishnathejaofficial' }) {
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [loading, setLoading] = useState(true);
  const [rateLimited, setRateLimited] = useState(false);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`https://api.github.com/users/${username}`);
        if (res.status === 403 || res.status === 429) {
          setRateLimited(true);
          setLoading(false);
          return;
        }
        const user = await res.json();
        if (user.message) { // GitHub API error (e.g. "Not Found")
          setLoading(false);
          return;
        }
        
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
        const repos = await reposRes.json();
        const repoList = Array.isArray(repos) ? repos : [];
        
        const totalStars = repoList.reduce((acc, curr) => acc + (curr.stargazers_count || 0), 0);
        
        setStats({
          stars: totalStars,
          repos: user.public_repos || repoList.length,
          followers: user.followers || 0
        });
        setRateLimited(false);
      } catch (err) {
        console.error('Failed to fetch GitHub stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [username]);

  if (loading) return null;

  if (rateLimited) return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px', padding: '14px 20px', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <i className="fas fa-clock" style={{ color: '#f59e0b', fontSize: '1em' }} />
      <span style={{ fontSize: '0.82em', color: 'gray' }}>GitHub stats temporarily unavailable (API rate limit). <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'none' }}>View on GitHub →</a></span>
    </div>
  );

  return (
    <div ref={ref} style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '12px', marginTop: '24px', opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.6s ease-out'
    }}>
      {[
        { label: 'Public Repos', value: stats.repos, icon: 'fa-book-open', color: '#10b981' },
        { label: 'Total Stars', value: stats.stars, icon: 'fa-star', color: '#f59e0b' },
        { label: 'Followers', value: stats.followers, icon: 'fa-users', color: '#3b82f6' }
      ].map(s => (
        <a key={s.label} href={`https://github.com/${username}`} target="_blank" rel="noreferrer"
          style={{
            background: 'var(--surface-2)', padding: '16px', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center',
            textDecoration: 'none', color: 'var(--text)', transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = `rgba(${s.color === '#10b981' ? '16,185,129' : s.color === '#f59e0b' ? '245,158,11' : '59,130,246'}, 0.4)`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
          }}
        >
          <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: '1.2em', marginBottom: '8px', display: 'block' }} />
          <div style={{ fontSize: '1.5em', fontWeight: 700, color: 'white', marginBottom: '2px' }}>
            <Counter value={s.value} trigger={visible} />
          </div>
          <div style={{ fontSize: '0.75em', color: 'gray' }}>{s.label}</div>
        </a>
      ))}
    </div>
  );
}

// Simple counter animation component
function Counter({ value, trigger }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const end = parseInt(value) || 0;
    if (end === 0) return;
    
    const duration = 1500;
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
  }, [value, trigger]);

  return <span>{count}</span>;
}
