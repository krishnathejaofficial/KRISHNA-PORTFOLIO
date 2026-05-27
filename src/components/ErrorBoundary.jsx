import { Component } from 'react';

/**
 * ErrorBoundary — catches React reconciliation errors caused by
 * Google Translate wrapping text nodes in <font> elements.
 *
 * After recovering, it re-applies the saved language so the
 * translation persists rather than reverting to English.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    const isGTError =
      error?.message?.includes('The node to be removed is not a child') ||
      error?.message?.includes('NotFoundError') ||
      error?.message?.includes('removeChild') ||
      error?.message?.includes('insertBefore') ||
      error?.message?.includes('Failed to execute');

    if (isGTError && this.state.retryCount < 5) {
      setTimeout(() => {
        this.setState(s => ({ hasError: false, retryCount: s.retryCount + 1 }));

        // Re-apply saved language after React remounts
        const savedLang = localStorage.getItem('portfolioLang');
        if (savedLang && savedLang !== 'en') {
          setTimeout(() => {
            const combo = document.querySelector('.goog-te-combo');
            if (combo) {
              combo.value = savedLang;
              combo.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }, 600);
        }
      }, 80);
    }
  }

  render() {
    if (this.state.hasError) {
      // Show site background color while remounting — no jarring flash
      return (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'var(--bg, #080808)',
          zIndex: 99999
        }} />
      );
    }
    return this.props.children;
  }
}
