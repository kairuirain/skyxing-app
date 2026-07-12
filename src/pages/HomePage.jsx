import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Calendar, Eye, Tag, User, Search as SearchIcon } from 'lucide-react';

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadArticles(); loadTags(); }, [page, selectedTag]);

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

  const handleSearch = (e) => { e.preventDefault(); setPage(1); loadArticles(); };

  const formatDate = (d) => new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SkyXing</h1>
        <p className="text-gray-600">自由创作，分享你的想法</p>
      </div>

      <form onSubmit={handleSearch} className="mb-5 flex gap-2">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input flex-1" placeholder="搜索文章..." />
        <button type="submit" className="btn-primary btn-sm"><SearchIcon size={16} /></button>
      </form>

      {/* Tags filter */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <button onClick={() => { setSelectedTag(''); setPage(1); }}
          className={`px-2.5 py-1 rounded-full text-xs ${!selectedTag ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
          全部
        </button>
        {tags.map(tag => (
          <button key={tag} onClick={() => { setSelectedTag(tag); setPage(1); }}
            className={`px-2.5 py-1 rounded-full text-xs ${selectedTag === tag ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card p-5 animate-pulse"><div className="h-5 bg-gray-200 rounded w-3/4 mb-2"/><div className="h-4 bg-gray-200 rounded w-full"/></div>)}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12"><p className="text-gray-500">还没有文章</p></div>
      ) : (
        <>
          <div className="space-y-3">
            {articles.map(a => (
              <Link key={a.id} to={`/article/${a.id}`} className="card p-5 block hover:shadow transition-shadow">
                <h2 className="font-semibold text-gray-900 mb-1.5 hover:text-primary-600">{a.title}</h2>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{a.excerpt || a.content?.replace(/<[^>]*>/g,'').slice(0,150)}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                  {a.author && <span className="flex items-center gap-1"><User size={12}/>{a.author.displayName}</span>}
                  <span className="flex items-center gap-1"><Calendar size={12}/>{formatDate(a.createdAt)}</span>
                  <span className="flex items-center gap-1"><Eye size={12}/>{a.views||0}</span>
                  {a.tags?.map(t => <span key={t} className="bg-gray-100 px-1.5 py-0.5 rounded-full text-xs"><Tag size={9} className="inline mr-0.5"/>{t}</span>)}
                </div>
              </Link>
            ))}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page<=1} className="btn-outline btn-sm">上一页</button>
              <span className="flex items-center px-3 text-sm text-gray-500">{page}/{pagination.totalPages}</span>
              <button onClick={() => setPage(p=>Math.min(pagination.totalPages,p+1))} disabled={page>=pagination.totalPages} className="btn-outline btn-sm">下一页</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
