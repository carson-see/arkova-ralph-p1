/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors in child components.
 */

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Navigate to home
    window.location.href = '#/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h1>Something Went Wrong</h1>
            <p>We encountered an unexpected error. Please try again.</p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="error-details">{this.state.error.message}</pre>
            )}
            <button className="btn-primary" onClick={this.handleReset}>
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
