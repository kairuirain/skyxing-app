import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--win-bg)] p-8">
          <div className="max-w-lg w-full bg-[var(--win-card)] rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              SkyXing - Application Error
            </h1>
            <p className="text-gray-600 mb-4">
              An error occurred while rendering the application.
            </p>
            <details className="bg-gray-50 rounded-lg p-4 text-sm font-mono overflow-auto max-h-64">
              <summary className="cursor-pointer text-gray-700 font-sans font-medium mb-2">
                Error Details
              </summary>
              <p className="text-red-600 mb-2">
                {this.state.error?.toString()}
              </p>
              <pre className="text-gray-500 whitespace-pre-wrap">
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 btn-primary w-full"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
