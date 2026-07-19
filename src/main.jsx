import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalErrorModal from './components/GlobalErrorModal';
import { reportError } from './lib/errorStore';
import './index.css';

console.log('[SKYXING] Frontend initializing...');
console.log('[SKYXING] User Agent:', navigator.userAgent);
console.log('[SKYXING] Window size:', window.innerWidth, 'x', window.innerHeight);

// 捕获全局未处理的 JS 错误（仅脚本错误，排除资源加载错误）
window.addEventListener('error', (event) => {
  if (event.error) {
    console.error('[SKYXING] Global error:', event.error);
    reportError(event.error);
  }
});

// 捕获全局未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  console.error('[SKYXING] Unhandled Promise rejection:', reason);
  reportError(reason instanceof Error ? reason : new Error(String(reason)));
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('[SKYXING] CRITICAL: #root element not found!');
  document.body.innerHTML = '<div style="padding:40px;color:red;font-family:monospace"><h1>SkyXing Error</h1><p>#root element not found in HTML</p></div>';
} else {
  console.log('[SKYXING] #root element found, rendering app...');

  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <SettingsProvider>
            <BrowserRouter>
              <AuthProvider>
                <App />
                <GlobalErrorModal />
              </AuthProvider>
            </BrowserRouter>
          </SettingsProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('[SKYXING] React render call completed');
  } catch (err) {
    console.error('[SKYXING] React render failed:', err);
    rootElement.innerHTML = `<div style="padding:40px;color:red;font-family:monospace"><h1>Render Failed</h1><pre>${err.message}</pre></div>`;
  }
}
