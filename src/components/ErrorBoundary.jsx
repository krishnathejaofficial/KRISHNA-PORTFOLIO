import { Component } from 'react';

/**
 * ErrorBoundary — catches React reconciliation errors caused by
 * Google Translate wrapping text nodes in <font> elements.
 * When caught, it re-mounts the app tree immediately (up to 3 times).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Only auto-recover for GT-related reconciliation errors
    const isGTError =
      error?.message?.includes('The node to be removed is not a child') ||
      error?.message?.includes('NotFoundError') ||
      error?.message?.includes('removeChild') ||
      error?.message?.includes('insertBefore') ||
      error?.message?.includes('Failed to execute');

    if (isGTError && this.state.retryCount < 3) {
      setTimeout(() => {
        this.setState(s => ({ hasError: false, retryCount: s.retryCount + 1 }));
      }, 50);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render nothing while waiting to re-mount
      return null;
    }
    return this.props.children;
  }
}
