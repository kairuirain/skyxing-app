import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';

export default function useRealtime({ conversationId, userId, onNewMessage, onRefresh } = {}) {
  const [status, setStatus] = useState('connecting');
  const intervalRef = useRef(null);
  const retryRef = useRef(1000);
  const isActiveRef = useRef(true);
  const pendingRef = useRef([]);

  const connect = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); }
    setStatus('connecting');

    const poll = async () => {
      if (!isActiveRef.current) return;
      if (document && document.hidden) return;
      try {
        if (conversationId) {
          const data = await api.getConversationMessages(conversationId);
          if (data.messages) onNewMessage && onNewMessage(data.messages);
        } else {
          const data = await api.getConversations();
          if (data.conversations) onRefresh && onRefresh(data.conversations);
        }
        setStatus('connected');
        retryRef.current = 1000;
      } catch {
        retryRef.current = Math.min(retryRef.current * 2, 30000);
        setStatus('disconnected');
      }
    };

    poll();
    intervalRef.current = setInterval(poll, conversationId ? 3000 : 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [conversationId, onNewMessage, onRefresh]);

  useEffect(() => {
    isActiveRef.current = true;
    const c = connect();
    const h = () => { if (!document.hidden) connect(); };
    document.addEventListener('visibilitychange', h);
    return () => { isActiveRef.current = false; c && c(); document.removeEventListener('visibilitychange', h); };
  }, [connect]);

  const sendMessage = useCallback(async (convId, content) => {
    try {
      const data = await api.sendMessage(convId, content);
      return { ok: true, message: data.message };
    } catch (e) {
      const msg = { convId, content, timestamp: Date.now(), id: Date.now().toString(36) };
      pendingRef.current.push(msg);
      setTimeout(async () => {
        for (const m of pendingRef.current) {
          try { await api.sendMessage(m.convId, m.content); pendingRef.current = pendingRef.current.filter(p => p.id !== m.id); } catch {}
        }
      }, 5000);
      return { ok: false, error: e.message };
    }
  }, []);

  return { status, sendMessage, pendingCount: pendingRef.current.length };
}
