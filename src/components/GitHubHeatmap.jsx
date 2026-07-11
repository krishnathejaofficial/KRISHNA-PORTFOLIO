import { useState, useEffect } from 'react';

/* GitHub Activity Heatmap using GitHub's public API */
const GITHUB_USER = 'krishnathejaofficial';
const CONTRIBUTION_API = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`;

function getColor(count) {
  if (count === 0) return 'var(--hm-0)';
  if (count <= 2) return 'var(--hm-1)';
  if (count <= 5) return 'var(--hm-2)';
  if (count <= 10) return 'var(--hm-3)';
  return 'var(--hm-4)';
}

export default function GitHubHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);
  const [stats, setStats] = useState({ total: 0, streak: 0, peak: 0 });

  useEffect(() => {
    fetch(CONTRIBUTION_API)
      .then(r => r.json())
      .then(d => {
        setData(d.contributions || []);
        const contribs = d.contributions || [];
        const total = contribs.reduce((s, c) => s + c.count, 0);
        const peak = Math.max(...contribs.map(c => c.count));
        // streak: consecutive days from today
        let streak = 0;
        for (let i = contribs.length - 1; i >= 0; i--) {
          if (contribs[i].count > 0) streak++;
          else break;
        }
        setStats({ total, streak, peak });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Group by week for calendar layout
  function getWeeks(contributions) {
    if (!contributions) return [];
    const weeks = [];
    let week = [];
    contributions.forEach((day) => {
      week.push(day);
      if (week.length === 7) { weeks.push(week); week = []; }
    });
    if (week.length) weeks.push(week);
    return weeks;
  }

  const weeks = getWeeks(data);

  return (
    <div className="gh-heatmap-wrap">
      <div className="gh-heatmap-header">
        <div className="gh-heatmap-title">
          <i className="fab fa-github" style={{ color: 'var(--gold)' }} />
          <span>GitHub Activity</span>
          <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer" className="gh-profile-link">
            @{GITHUB_USER} <i className="fas fa-external-link-alt" style={{ fontSize: '0.8em' }} />
          </a>
        </div>
        <div className="gh-stats">
          <div className="gh-stat">
            <span className="gh-stat-num">{stats.total}</span>
            <span className="gh-stat-label">Contributions</span>
          </div>
          <div className="gh-stat">
            <span className="gh-stat-num">{stats.streak}</span>
            <span className="gh-stat-label">Day Streak</span>
          </div>
          <div className="gh-stat">
            <span className="gh-stat-num">{stats.peak}</span>
            <span className="gh-stat-label">Peak Day</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="gh-loading">
          <i className="fas fa-circle-notch fa-spin" style={{ color: 'var(--gold)' }} />
          <span>Loading activity...</span>
        </div>
      ) : !data ? (
        <div className="gh-loading"><span style={{ opacity: 0.6 }}>Could not load GitHub data</span></div>
      ) : (
        <div className="gh-grid-wrap" style={{ position: 'relative' }}>
          <div className="gh-grid">
            {weeks.map((week, wi) => (
              <div key={wi} className="gh-week">
                {week.map((day, di) => (
                  <div key={di}
                    className="gh-day"
                    style={{ background: getColor(day.count) }}
                    onMouseEnter={e => setTooltip({ ...day, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>
          {tooltip && (
            <div className="gh-tooltip" style={{ top: tooltip.y - 60, left: tooltip.x - 80 }}>
              <strong>{tooltip.count} contribution{tooltip.count !== 1 ? 's' : ''}</strong>
              <span>{tooltip.date}</span>
            </div>
          )}
          <div className="gh-legend">
            <span>Less</span>
            {['0', '1', '2', '3', '4'].map(n => (
              <div key={n} className="gh-day" style={{ background: `var(--hm-${n})`, width: '12px', height: '12px', borderRadius: '3px' }} />
            ))}
            <span>More</span>
          </div>
        </div>
      )}
    </div>
  );
}
