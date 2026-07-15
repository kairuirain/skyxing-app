import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Save, X } from 'lucide-react';

export default function WritePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) { navigate('/login'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError('标题和内容不能为空'); return; }
    setLoading(true); setError('');
    try { const data = await api.createArticle({ title: title.trim(), content: content.trim(), excerpt: excerpt.trim()||undefined, tags: tags?tags.split(',').map(t=>t.trim()).filter(Boolean):[], coverImage: coverImage.trim()||undefined }); navigate(`/article/${data.article.id}`); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">写文章</h1>
      {error && <div className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.4)] text-[#f87171] px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="input font-semibold" placeholder="标题" required />
        <input type="text" value={coverImage} onChange={e=>setCoverImage(e.target.value)} className="input" placeholder="封面图片URL (可选)" />
        <input type="text" value={tags} onChange={e=>setTags(e.target.value)} className="input" placeholder="标签, 逗号分隔 (可选)" />
        <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} className="input resize-none" rows={2} placeholder="摘要 (可选)" />
        <textarea value={content} onChange={e=>setContent(e.target.value)} className="input resize-none font-mono text-sm" rows={16} placeholder="支持 Markdown + 内嵌 HTML..." required />
        <div className="text-xs text-gray-400 space-y-0.5">
          <p>Markdown: #标题 **加粗** *斜体* `代码` [链接](url) ![]()图片</p>
          <p>也支持直接写 HTML &lt;h2&gt;&lt;p&gt;&lt;img&gt; 等（安全过滤）</p>
          <p>外部链接会自动经过安全跳转页提醒</p>
        </div>
        <div className="flex gap-2"><button type="submit" disabled={loading} className="btn-primary btn-sm"><Save size={14} className="mr-1"/>{loading?'发布中':'发布'}</button><button type="button" onClick={()=>navigate(-1)} className="btn-outline btn-sm"><X size={14} className="mr-1"/>取消</button></div>
      </form>
    </div>
  );
}
