import { Component } from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production, this would send to an error tracking service
    console.error('Admin Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.handleReset,
        });
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'var(--admin-danger-light)',
                color: 'var(--admin-danger)',
              }}
            >
              <HiOutlineExclamationTriangle size={28} />
            </div>
            <h2
              className="text-xl font-bold mb-2"
              style={{
                fontFamily: 'var(--admin-font-display)',
                color: 'var(--admin-text)',
              }}
            >
              Something went wrong
            </h2>
            <p
              className="mb-6 text-sm leading-relaxed"
              style={{ color: 'var(--admin-text-secondary)' }}
            >
              An unexpected error occurred in this section. This won&apos;t affect other parts of
              the dashboard.
            </p>
            {this.state.error && (
              <div
                className="text-left mb-6 p-4 rounded-xl text-xs font-mono overflow-auto max-h-32"
                style={{
                  background: 'var(--admin-surface-secondary)',
                  border: '1px solid var(--admin-border-light)',
                  color: 'var(--admin-danger)',
                }}
              >
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'var(--admin-primary)',
                  color: 'var(--admin-text-inverse)',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'var(--admin-surface)',
                  border: '1px solid var(--admin-border)',
                  color: 'var(--admin-text)',
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
