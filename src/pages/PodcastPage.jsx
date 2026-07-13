import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Calendar, Eye, Tag, User } from 'lucide-react';

// “播客”即文章栏目：连接后端 /articles 展示文章列表
export default function PodcastPage() {
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadArticles(); loadTags(); }, [page, selectedTag]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (selectedTag) params.tag = selectedTag;
      const data = await api.getArticles(params);
      setArticles(data.articles || []);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadTags = async () => {
    try { const data = await api.getTags(); setTags(data.tags || []); } catch (e) {}
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 bg-[var(--win-bg)] backdrop-blur px-6 py-3 border-b border-[var(--win-border)]">
        <h1 className="text-xl font-semibold text-[var(--win-text)] tracking-tight">播客</h1>
        <p className="text-[12.5px] text-[var(--win-text-tertiary)] mt-0.5">文章与播客内容</p>
      </header>

      <div className="px-6 py-4 max-w-[1100px]">
        {/* Tag filter chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => { setSelectedTag(''); setPage(1); }}
            className={'h-7 px-3 rounded-full text-[12.5px] font-medium transition-colors ' +
              (!selectedTag ? 'bg-[var(--win-accent)] text-[var(--win-on-accent)]' : 'bg-[var(--win-pane)] text-[var(--win-text-secondary)] hover:bg-[var(--win-pane-hover)]')}
          >
            全部
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => { setSelectedTag(tag); setPage(1); }}
              className={'h-7 px-3 rounded-full text-[12.5px] font-medium transition-colors ' +
                (selectedTag === tag ? 'bg-[var(--win-accent)] text-[var(--win-on-accent)]' : 'bg-[var(--win-pane)] text-[var(--win-text-secondary)] hover:bg-[var(--win-pane-hover)]')}
            >
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
            <p className="text-[14px]">暂无内容</p>
          </div>
        ) : (
          <>
            <div className="space-y-2.5">
              {articles.map((a) => (
                <Link
                  key={a.id}
                  to={`/article/${a.id}`}
                  className="group block bg-[var(--win-card)] border border-[var(--win-border)] rounded-lg p-4 hover:border-[var(--win-border-strong)] hover:bg-[var(--win-card-hover)] transition-colors"
                >
                  <h2 className="text-[15px] font-semibold text-[var(--win-text)] mb-1 group-hover:text-[var(--win-accent)] transition-colors">
                    {a.title}
                  </h2>
                  <p className="text-[13px] text-[var(--win-text-secondary)] mb-2.5 line-clamp-2 leading-relaxed">
                    {a.excerpt || a.content?.replace(/<[^>]*>/g, '').slice(0, 150)}
                  </p>
                  <div className="flex items-center gap-4 text-[12px] text-[var(--win-text-tertiary)] flex-wrap">
                    {a.author && (
                      <span className="flex items-center gap-1">
                        <User size={12} />{a.author.displayName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />{formatDate(a.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} />{a.views || 0}
                    </span>
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
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-8 px-3 rounded-md text-[13px] bg-[var(--win-pane)] text-[var(--win-text)] hover:bg-[var(--win-pane-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  上一页
                </button>
                <span className="text-[13px] text-[var(--win-text-secondary)]">{page} / {pagination.totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="h-8 px-3 rounded-md text-[13px] bg-[var(--win-pane)] text-[var(--win-text)] hover:bg-[var(--win-pane-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
