import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

console.log('[SKYXING] Frontend initializing...');
console.log('[SKYXING] User Agent:', navigator.userAgent);
console.log('[SKYXING] Window size:', window.innerWidth, 'x', window.innerHeight);

// 捕获全局未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', (event) => {
  console.error('[SKYXING] Unhandled Promise rejection:', event.reason);
});

// 捕获全局 JS 错误
window.addEventListener('error', (event) => {
  console.error('[SKYXING] Global error:', event.message, 'at', event.filename, ':', event.lineno);
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
