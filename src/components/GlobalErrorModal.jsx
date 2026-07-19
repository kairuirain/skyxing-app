import { useEffect, useState } from 'react';
import ErrorReportModal from './ErrorReportModal';
import { subscribeError, clearError } from '../lib/errorStore';

// 订阅全局错误仓库，渲染错误上报弹窗
export default function GlobalErrorModal() {
  const [error, setError] = useState(null);
  useEffect(() => subscribeError(setError), []);
  return <ErrorReportModal error={error} onClose={clearError} />;
}
