import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import useSync from '../hooks/useSync';
import { isAndroid } from '../lib/platform';
import {
  Calendar, Eye, Tag, User, Search as SearchIcon, PenSquare,
  Bell, MessageSquare, ArrowRight, Sparkles, AlertCircle, X, Pin,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const android = isAndroid();
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const [notices, setNotices] = useState([]);

  // 函数声明必须放在 hooks 之前，避免 const TDZ
  const loadArticles = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (selectedTag) params.tag = selectedTag;
      if (search) params.search = search;
      const data = await api.getArticles(params);
      setArticles(data.articles || []);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadTags = async () => {
    try { const data = await api.getTags(); setTags(data.tags || []); } catch (e) {}
  };

  useEffect(() => { loadArticles(); loadTags(); }, [page, selectedTag]);
  useSync(loadArticles, { enabled: !selectedTag && !search });

  useEffect(() => {
    if (user) {
      api.getUnreadCount().then((d) => setUnread(d.unreadCount || 0)).catch(() => {});
      api.request('/updates/notice?platform=app&current=1.2.1')
        .then((d) => setNotices(d.notices || [])).catch(() => {});
    }
  }, [user]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); loadArticles(); };
  const formatDate = (d) => new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  const openExternal = (url) => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isTauri) {
      import('@tauri-apps/plugin-shell').then((m) => m.open(url)).catch(() => window.open(url, '_blank'));
    } else {
      window.open(url, '_blank');
    }
  };

  const DismissNotice = (id) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-full">
      {/* ===== B站风格 Hero 区域 ===== */}
      <div className="bg-gradient-to-br from-[#fb7299]/10 via-white to-[#00a1d6]/10 border-b border-[var(--win-border)]">
        <div className="px-6 py-8 sm:py-12 max-w-[1100px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fb7299] to-[#00a1d6] flex items-center justify-center text-white font-bold text-lg shadow-md">
              S
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">SkyXing</h1>
              <p className="text-sm text-gray-500">跨平台博客 · 全端同步</p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
            记录思考，分享观点。支持文章发布、实时私信、多端同步，随时随地创作与阅读。
          </p>
          <div className="flex flex-wrap gap-2.5 mt-4">
            {user ? (
              <>
                <button onClick={() => navigate('/write')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#fb7299] to-[#00a1d6] text-white shadow-sm hover:shadow-md hover:opacity-90 transition-all">
                  <PenSquare size={15} /> 写文章
                </button>
                <Link to="/messages" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all">
                  <MessageSquare size={15} />
                  私信{unread > 0 ? ` (${unread})` : ''}
                </Link>
              </>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#fb7299] to-[#00a1d6] text-white shadow-sm hover:shadow-md hover:opacity-90 transition-all">
                立即加入 <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ===== 自定义通知提示条（OTA v3） ===== */}
      {notices.map((n) => (
        <div key={n.id} className={'mx-6 mt-4 max-w-[1100px] rounded-xl p-4 flex items-start gap-3 border ' +
          (n.type === 'warn' ? 'bg-amber-50 border-amber-200' : n.type === 'action' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200')}>
          <AlertCircle size={18} className={n.type === 'warn' ? 'text-amber-500 shrink-0 mt-0.5' : n.type === 'action' ? 'text-blue-500 shrink-0 mt-0.5' : 'text-gray-400 shrink-0 mt-0.5'} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 mb-0.5">{n.title}</p>
            <p className="text-sm text-gray-600">{n.body}</p>
            {n.actionUrl && (
              <button onClick={() => openExternal(n.actionUrl)} className="mt-2 text-sm font-medium text-blue-600 hover:underline">
                {n.actionLabel || '前往'} →
              </button>
            )}
          </div>
          {n.dismissible !== false && (
            <button onClick={() => DismissNotice(n.id)} className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
      ))}

      <div className="px-6 py-4 max-w-[1100px]">
        {/* Tag filter chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button onClick={() => { setSelectedTag(''); setPage(1); }}
            className={'h-7 px-3 rounded-full text-[12.5px] font-medium transition-colors ' +
              (!selectedTag ? 'bg-[var(--win-accent)] text-[var(--win-on-accent)]' : 'bg-[var(--win-pane)] text-[var(--win-text-secondary)] hover:bg-[var(--win-pane-hover)]')}>
            全部
          </button>
          {tags.map((tag) => (
            <button key={tag} onClick={() => { setSelectedTag(tag); setPage(1); }}
              className={'h-7 px-3 rounded-full text-[12.5px] font-medium transition-colors ' +
                (selectedTag === tag ? 'bg-[var(--win-accent)] text-[var(--win-on-accent)]' : 'bg-[var(--win-pane)] text-[var(--win-text-secondary)] hover:bg-[var(--win-pane-hover)]')}>
              {tag}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-[var(--win-pane-hover)] rounded w-2/3 mb-2" />
                <div className="h-3 bg-[var(--win-pane-hover)] rounded w-full" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 text-[var(--win-text-tertiary)]">
            <Sparkles size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-[14px]">还没有文章</p>
            {user && (
              <button onClick={() => navigate('/write')} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-[var(--win-accent)] text-white hover:opacity-90 transition-opacity">
                <PenSquare size={15} /> 写第一篇
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2.5">
              {articles.map((a) => (
                <Link key={a.id} to={`/article/${a.id}`}
                  className="group block bg-[var(--win-card)] border border-[var(--win-border)] rounded-lg p-4 hover:border-[var(--win-border-strong)] hover:bg-[var(--win-card-hover)] transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    {a.pinned && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-semibold">
                        <Pin size={9} /> 置顶
                      </span>
                    )}
                    <h2 className="text-[15px] font-semibold text-[var(--win-text)] group-hover:text-[var(--win-accent)] transition-colors">
                      {a.title}
                    </h2>
                  </div>
                  <p className="text-[13px] text-[var(--win-text-secondary)] mb-2.5 line-clamp-2 leading-relaxed">
                    {a.excerpt || a.content?.replace(/<[^>]*>/g, '').slice(0, 150)}
                  </p>
                  <div className="flex items-center gap-4 text-[12px] text-[var(--win-text-tertiary)] flex-wrap">
                    {a.author && (
                      <span className="flex items-center gap-1"><User size={12} />{a.author.displayName}</span>
                    )}
                    <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(a.createdAt)}</span>
                    <span className="flex items-center gap-1"><Eye size={12} />{a.views || 0}</span>
                    {a.tags?.map((t) => (
                      <span key={t} className="flex items-center gap-0.5 bg-[var(--win-pane)] px-1.5 py-0.5 rounded-full text-[11px] text-[var(--win-text-secondary)]">
                        <Tag size={9} />{t}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="h-8 px-3 rounded-md text-[13px] bg-[var(--win-pane)] text-[var(--win-text)] hover:bg-[var(--win-pane-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  上一页
                </button>
                <span className="text-[13px] text-[var(--win-text-secondary)]">{page} / {pagination.totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
                  className="h-8 px-3 rounded-md text-[13px] bg-[var(--win-pane)] text-[var(--win-text)] hover:bg-[var(--win-pane-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 写文章 FAB：安卓端底部 nav 遮挡，使用 bottom-20；桌面端 bottom-6 */}
      {user && (
        <button onClick={() => navigate('/write')}
          className={'fixed right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#fb7299] to-[#00a1d6] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center z-50 ' +
            (android ? 'bottom-20' : 'bottom-6')}
          title="写文章">
          <PenSquare size={24} />
        </button>
      )}
    </div>
  );
}
