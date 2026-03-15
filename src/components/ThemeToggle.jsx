export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button id="theme-toggle" onClick={onToggle} aria-label="Toggle theme" title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
