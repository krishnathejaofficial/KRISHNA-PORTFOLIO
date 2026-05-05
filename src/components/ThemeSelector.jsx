/* ── ThemeSelector — 7 beautiful themes + random on load ── */

export const THEMES = {
  dark: {
    label: 'Dark Obsidian', icon: 'fa-moon', desc: 'Classic dark with gold',
    vars: {
      '--bg': '#080808', '--surface': 'rgba(18,18,18,0.92)', '--surface-2': 'rgba(28,28,28,0.85)',
      '--text': '#c8c8c8', '--text-bright': '#f0f0f0',
      '--gold': '#D4AF37', '--gold-light': '#f0c14b',
      '--gold-dim': 'rgba(212,175,55,0.25)', '--gold-glow': 'rgba(212,175,55,0.5)',
    },
  },
  biotech: {
    label: 'Biotech Lab', icon: 'fa-dna', desc: 'Bioluminescent green',
    vars: {
      '--bg': '#020b0a', '--surface': 'rgba(5,20,18,0.95)', '--surface-2': 'rgba(8,28,24,0.90)',
      '--text': '#a0d4c8', '--text-bright': '#d4f5ee',
      '--gold': '#00e5a0', '--gold-light': '#4dffc8',
      '--gold-dim': 'rgba(0,229,160,0.2)', '--gold-glow': 'rgba(0,229,160,0.4)',
    },
  },
  technical: {
    label: 'Tech Terminal', icon: 'fa-code', desc: 'Hacker matrix green',
    vars: {
      '--bg': '#030f03', '--surface': 'rgba(6,22,6,0.95)', '--surface-2': 'rgba(10,30,10,0.90)',
      '--text': '#8abb8a', '--text-bright': '#b8ffb8',
      '--gold': '#39ff14', '--gold-light': '#80ff60',
      '--gold-dim': 'rgba(57,255,20,0.2)', '--gold-glow': 'rgba(57,255,20,0.4)',
    },
  },
  business: {
    label: 'Business Elite', icon: 'fa-briefcase', desc: 'Corporate navy blue',
    vars: {
      '--bg': '#060914', '--surface': 'rgba(8,15,36,0.96)', '--surface-2': 'rgba(12,22,50,0.92)',
      '--text': '#a8b8d8', '--text-bright': '#dce8ff',
      '--gold': '#4fa8ff', '--gold-light': '#88c8ff',
      '--gold-dim': 'rgba(79,168,255,0.22)', '--gold-glow': 'rgba(79,168,255,0.45)',
    },
  },
  marketing: {
    label: 'Marketing Pulse', icon: 'fa-chart-line', desc: 'Vibrant coral energy',
    vars: {
      '--bg': '#0f0508', '--surface': 'rgba(28,8,16,0.96)', '--surface-2': 'rgba(40,12,24,0.92)',
      '--text': '#d8a8b8', '--text-bright': '#ffe0ec',
      '--gold': '#ff6b9d', '--gold-light': '#ff9ec0',
      '--gold-dim': 'rgba(255,107,157,0.22)', '--gold-glow': 'rgba(255,107,157,0.45)',
    },
  },
  admin: {
    label: 'Admin Command', icon: 'fa-shield-alt', desc: 'Deep violet authority',
    vars: {
      '--bg': '#08060f', '--surface': 'rgba(18,12,36,0.96)', '--surface-2': 'rgba(28,18,52,0.92)',
      '--text': '#b8a8d8', '--text-bright': '#e8deff',
      '--gold': '#a78bfa', '--gold-light': '#c4b5fd',
      '--gold-dim': 'rgba(167,139,250,0.22)', '--gold-glow': 'rgba(167,139,250,0.45)',
    },
  },
  solar: {
    label: 'Solar Flare', icon: 'fa-sun', desc: 'Warm amber & crimson',
    vars: {
      '--bg': '#0f0800', '--surface': 'rgba(28,16,0,0.96)', '--surface-2': 'rgba(40,22,4,0.92)',
      '--text': '#d4b896', '--text-bright': '#ffe8c8',
      '--gold': '#ff9500', '--gold-light': '#ffb940',
      '--gold-dim': 'rgba(255,149,0,0.22)', '--gold-glow': 'rgba(255,149,0,0.45)',
    },
  },
};

const THEME_KEYS = Object.keys(THEMES);

export function applyTheme(themeKey) {
  const theme = THEMES[themeKey];
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  document.body.classList.remove('light', 'biotech');
  localStorage.setItem('portfolio-theme', themeKey);
}

export function initTheme() {
  // Check if a saved preference exists — if not, pick a random theme
  let saved = localStorage.getItem('portfolio-theme');
  if (!saved || !THEMES[saved]) {
    saved = THEME_KEYS[Math.floor(Math.random() * THEME_KEYS.length)];
  } else {
    // Every page load: 40% chance to randomize even if there's a saved preference
    if (Math.random() < 0.4) {
      saved = THEME_KEYS[Math.floor(Math.random() * THEME_KEYS.length)];
    }
  }
  applyTheme(saved);
  return saved;
}

export default function ThemeSelector({ currentTheme, setCurrentTheme }) {
  // This component is now only used internally by RightDock — kept for exports
  return null;
}
