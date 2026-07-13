import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const SettingsContext = createContext(null);

const STORAGE_KEY = 'skyxing_settings';

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [logs, setLogs] = useState([]);
  const logsRef = useRef([]);

  // 载入已保存的设置
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.theme) setTheme(saved.theme);
      if (typeof saved.terminalOpen === 'boolean') setTerminalOpen(saved.terminalOpen);
      if (typeof saved.debugMode === 'boolean') setDebugMode(saved.debugMode);
    } catch { /* ignore */ }
  }, []);

  // 持久化设置
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, terminalOpen, debugMode }));
  }, [theme, terminalOpen, debugMode]);

  // 应用主题到根节点
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 捕获 console 输出，供“终端界面显示”面板使用
  useEffect(() => {
    const push = (level, args) => {
      const text = args
        .map((a) => (typeof a === 'string' ? a : (() => { try { return JSON.stringify(a); } catch { return String(a); } })()))
        .join(' ');
      const entry = {
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        level,
        text,
      };
      logsRef.current = [...logsRef.current.slice(-199), entry];
      setLogs(logsRef.current);
    };
    const orig = { log: console.log, warn: console.warn, error: console.error, debug: console.debug };
    console.log = (...a) => { orig.log(...a); push('log', a); };
    console.warn = (...a) => { orig.warn(...a); push('warn', a); };
    console.error = (...a) => { orig.error(...a); push('error', a); };
    console.debug = (...a) => { orig.debug(...a); if (debugMode) push('debug', a); };
    return () => {
      console.log = orig.log;
      console.warn = orig.warn;
      console.error = orig.error;
      console.debug = orig.debug;
    };
  }, [debugMode]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), []);
  const toggleTerminal = useCallback(() => setTerminalOpen((v) => !v), []);
  const toggleDebug = useCallback(() => setDebugMode((v) => !v), []);
  const clearLogs = useCallback(() => { logsRef.current = []; setLogs([]); }, []);

  return (
    <SettingsContext.Provider
      value={{ theme, terminalOpen, debugMode, logs, toggleTheme, toggleTerminal, toggleDebug, clearLogs }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
