import { Component } from 'react';
import ErrorReportModal from './ErrorReportModal';

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
      // 渲染层致命错误：提示用户提交 Issue 并提供重新加载
      return (
        <ErrorReportModal
          error={this.state.error}
          fatal
          onClose={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
