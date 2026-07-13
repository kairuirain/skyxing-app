import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Save, X } from 'lucide-react';

export default function EditPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.getArticle(id).then(data => {
      const a = data.article;
      if (a.authorId !== user.id && user.role !== 'admin') { navigate(`/article/${id}`); return; }
      setTitle(a.title); setContent(a.content); setTags((a.tags||[]).join(', ')); setCoverImage(a.coverImage||''); setExcerpt(a.excerpt||'');
    }).catch(()=>navigate('/')).finally(()=>setFetching(false));
  }, [id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()||!content.trim()) { setError('标题和内容不能为空'); return; }
    setLoading(true); setError('');
    try { await api.updateArticle(id, { title:title.trim(), content:content.trim(), excerpt:excerpt.trim()||undefined, tags:tags?tags.split(',').map(t=>t.trim()).filter(Boolean):[], coverImage:coverImage.trim()||undefined }); navigate(`/article/${id}`); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="max-w-3xl mx-auto animate-pulse space-y-3"><div className="h-7 bg-gray-200 rounded w-1/4"/><div className="h-10 bg-gray-200 rounded"/><div className="h-60 bg-gray-200 rounded"/></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">编辑文章</h1>
      {error && <div className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.4)] text-[#f87171] px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="input font-semibold" placeholder="标题" required />
        <input type="text" value={coverImage} onChange={e=>setCoverImage(e.target.value)} className="input" placeholder="封面图片URL" />
        <input type="text" value={tags} onChange={e=>setTags(e.target.value)} className="input" placeholder="标签, 逗号分隔" />
        <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} className="input resize-none" rows={2} placeholder="摘要" />
        <textarea value={content} onChange={e=>setContent(e.target.value)} className="input resize-none font-mono text-sm" rows={16} placeholder="内容 (支持HTML)" required />
        <div className="flex gap-2"><button type="submit" disabled={loading} className="btn-primary btn-sm"><Save size={14} className="mr-1"/>{loading?'保存中':'保存'}</button><button type="button" onClick={()=>navigate(`/article/${id}`)} className="btn-outline btn-sm"><X size={14} className="mr-1"/>取消</button></div>
      </form>
    </div>
  );
}
