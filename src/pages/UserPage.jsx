import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import Loading from '../components/Loading';
import { Calendar, Edit3, FileText } from 'lucide-react';

export default function UserPage() {
  const { id } = useParams();
  const { user: currentUser, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', bio: '' });
  const isOwn = currentUser?.id === id;

  useEffect(() => { loadProfile(); loadArticles(); }, [id]);

  const loadProfile = async () => {
    try { const data = await api.getUser(id); setProfile(data.user); setForm({ displayName: data.user.displayName||'', bio: data.user.bio||'' }); }
    catch(e) {}
    finally { setLoading(false); }
  };

  const loadArticles = async () => {
    try { const data = await api.getArticles({ authorId: id, limit: 50 }); setArticles(data.articles||[]); }
    catch(e) {}
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try { await updateProfile(form); setProfile({...profile, ...form}); setEditing(false); }
    catch(err) { alert(err.message); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric' });

  if (loading) return <Loading />;
  if (!profile) return <div className="text-center py-12"><p className="text-gray-500">用户不存在</p><Link to="/" className="btn-primary mt-3 inline-block">返回首页</Link></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-5 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">{profile.displayName?.[0]}</div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{profile.displayName}</h1>
            <p className="text-sm text-gray-500">@{profile.username}</p>
            {profile.bio && <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>}
            <p className="text-xs text-gray-400 mt-1"><Calendar size={12} className="inline mr-1"/>{formatDate(profile.createdAt)} · <FileText size={12} className="inline mr-1"/>{profile.articleCount||0}篇</p>
            {isOwn && !editing && <button onClick={()=>setEditing(true)} className="btn-outline btn-sm mt-2"><Edit3 size={12} className="mr-1"/>编辑资料</button>}
          </div>
        </div>
        {isOwn && editing && (
          <form onSubmit={handleUpdate} className="mt-4 pt-4 border-t space-y-2">
            <input type="text" value={form.displayName} onChange={e=>setForm({...form,displayName:e.target.value})} className="input" placeholder="显示名称"/>
            <textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} className="input resize-none" rows={2} placeholder="简介"/>
            <div className="flex gap-2"><button type="submit" className="btn-primary btn-sm">保存</button><button type="button" onClick={()=>setEditing(false)} className="btn-outline btn-sm">取消</button></div>
          </form>
        )}
      </div>

      <h3 className="font-bold mb-3">发布的文章</h3>
      {articles.length===0 ? <p className="text-gray-400 text-center py-6">暂无文章</p> :
        <div className="space-y-2">{articles.map(a => <Link key={a.id} to={`/article/${a.id}`} className="card p-3 block hover:shadow"><h4 className="font-medium text-sm hover:text-primary-600">{a.title}</h4><p className="text-xs text-gray-400 mt-0.5">{formatDate(a.createdAt)} · {a.views||0}阅读</p></Link>)}</div>
      }
    </div>
  );
}
