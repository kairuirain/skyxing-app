import { useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';

const POLL_INTERVAL = 30000;

export default function useSync(onRefresh, options = {}) {
  const { interval = POLL_INTERVAL, enabled = true } = options;
  const lastVersion = useRef(0);
  const intervalRef = useRef(null);

  const checkVersion = useCallback(async () => {
    try {
      const data = await api.getStateVersion();
      const newVersion = data.version;
      if (lastVersion.current > 0 && newVersion !== lastVersion.current) {
        onRefresh();
      }
      lastVersion.current = newVersion;
    } catch { /* ignore */ }
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) return;
    checkVersion();
    intervalRef.current = setInterval(checkVersion, interval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, interval, checkVersion]);

  useEffect(() => {
    if (!enabled) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkVersion();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled, checkVersion]);

  return { forceCheck: checkVersion };
}
