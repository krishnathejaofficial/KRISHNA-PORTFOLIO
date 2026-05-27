import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './features.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('[PWA] Service Worker registered:', reg.scope);
      })
      .catch(err => {
        console.warn('[PWA] Service Worker registration failed:', err);
      });
  });
}

// Track page visit for analytics
fetch('/api/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    page: window.location.pathname,
    referrer: document.referrer,
    userAgent: navigator.userAgent
  })
}).catch(() => {}); // Silent fail — analytics should never break the app
