import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import SubPageHeader from '../components/SubPageHeader';
import { Bell, MessageSquare, UserPlus, CheckCheck } from 'lucide-react';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  return `${d} 天前`;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await api.getNotifications();
      setList(d.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id) => {
    setList((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try { await api.markNotificationRead(id); } catch { /* ignore */ }
  };

  const handleMarkAll = async () => {
    setList((l) => l.map((n) => ({ ...n, read: true })));
    try { await api.markAllNotificationsRead(); } catch { /* ignore */ }
  };

  const unread = list.filter((n) => !n.read).length;

  if (!user) {
    return (
      <div className="min-h-full flex flex-col animate-fadeIn">
        <SubPageHeader title="消息通知" />
        <div className="flex-1 flex items-center justify-center text-[var(--win-text-tertiary)] text-sm">请先登录后查看通知</div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col animate-fadeIn">
      <SubPageHeader
        title="消息通知"
        subtitle={unread > 0 ? `${unread} 条未读` : '全部已读'}
        right={
          unread > 0 ? (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1 px-2.5 h-8 rounded-lg text-[12px] font-medium text-[var(--win-accent)] hover:bg-[var(--win-pane-hover)] transition-colors"
            >
              <CheckCheck size={14} /> 全部已读
            </button>
          ) : null
        }
      />

      <div className="flex-1 overflow-y-auto win-scroll px-4 py-4 space-y-2">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 bg-[var(--win-pane)] rounded-xl" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 text-[var(--win-text-tertiary)]">
            <Bell size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">暂无系统通知</p>
          </div>
        ) : (
          list.map((n) => {
            const Icon = n.type === 'message' ? MessageSquare : n.type === 'follow' ? UserPlus : Bell;
            const actorName = n.actor?.displayName || n.actor?.username;
            return (
              <div
                key={n.id}
                onClick={() => {
                  if (n.link) {
                    handleMarkRead(n.id);
                    navigate(n.link);
                  }
                }}
                className={
                  'p-3 flex items-start gap-3 rounded-xl border transition-colors animate-fadeInUp ' +
                  (n.read ? 'bg-[var(--win-card)] border-[var(--win-border)]' : 'bg-[var(--win-accent-soft)] border-[var(--win-accent)] ') +
                  (n.link ? 'cursor-pointer active:bg-[var(--win-pane-pressed)]' : '')
                }
              >
                <div className="w-9 h-9 rounded-full bg-[var(--win-pane)] text-[var(--win-text-secondary)] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[var(--win-text)] leading-relaxed">
                    {n.actor && (
                      <Link
                        to={`/user/${n.actor.id}`}
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                        className="font-semibold text-[var(--win-accent)] hover:underline mr-1"
                      >
                        {actorName}
                      </Link>
                    )}
                    {n.text}
                  </p>
                  <p className="text-[11px] text-[var(--win-text-tertiary)] mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--win-accent)] mt-2 shrink-0" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
