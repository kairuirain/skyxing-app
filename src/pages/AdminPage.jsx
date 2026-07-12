import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Users, FileText, MessageSquare, Eye, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!user || user.role !== 'admin') { navigate('/'); return; } loadData(); }, [user, navigate]);

  const loadData = async () => {
    try { const [s, u, a] = await Promise.all([api.getStats(), api.getAdminUsers(), api.getAdminArticles()]); setStats(s.stats); setUsers(u.users||[]); setArticles(a.articles||[]); }
    catch(e) {}
    finally { setLoading(false); }
  };

  const handleRole = async (uid, role) => { try { await api.updateUserRole(uid, role); loadData(); } catch(e) { alert(e.message); } };
  const handleDelUser = async (uid) => { if (!confirm('删除用户？')) return; try { await api.deleteUser(uid); loadData(); } catch(e) { alert(e.message); } };
  const handleDelArticle = async (aid) => { if (!confirm('删除文章？')) return; try { await api.deleteArticle(aid); loadData(); } catch(e) { alert(e.message); } };

  if (loading) return <div className="animate-pulse space-y-3"><div className="h-6 bg-gray-200 rounded w-1/4"/><div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i=><div key={i} className="h-20 bg-gray-200 rounded"/>)}</div></div>;

  const roleColor = r => ({ user:'bg-gray-100 text-gray-700', author:'bg-blue-100 text-blue-700', admin:'bg-purple-100 text-purple-700' })[r]||'';

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">管理后台</h1>
      <div className="flex gap-1 mb-4 bg-gray-100 p-0.5 rounded-lg inline-flex text-sm">
        {['overview','users','articles'].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 rounded-md ${tab===t?'bg-white shadow font-medium':'text-gray-600'}`}>{t==='overview'?'概览':t==='users'?'用户':'文章'}</button>)}
      </div>

      {tab==='overview'&&stats&&<div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard icon={<Users size={18}/>} label="用户" value={stats.totalUsers} color="blue"/>
          <StatCard icon={<FileText size={18}/>} label="文章" value={stats.totalArticles} color="green"/>
          <StatCard icon={<MessageSquare size={18}/>} label="评论" value={stats.totalComments} color="orange"/>
          <StatCard icon={<Eye size={18}/>} label="阅读" value={stats.totalViews} color="purple"/>
        </div>
      </div>}

      {tab==='users'&&<div className="card overflow-hidden"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left p-3 text-gray-500">用户</th><th className="text-left p-3 text-gray-500">角色</th><th className="text-left p-3 text-gray-500">注册</th><th className="text-right p-3 text-gray-500">操作</th></tr></thead><tbody>{users.map(u=><tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50"><td className="p-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{u.displayName?.[0]}</div><div><p className="font-medium text-xs">{u.displayName}</p><p className="text-xs text-gray-400">@{u.username}</p></div></div></td><td className="p-3"><select value={u.role} onChange={e=>handleRole(u.id,e.target.value)} className={`text-xs px-2 py-0.5 rounded-full ${roleColor(u.role)} border-0`} disabled={u.id===user.id}><option value="user">用户</option><option value="author">作者</option><option value="admin">管理员</option></select></td><td className="p-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString('zh-CN')}</td><td className="p-3 text-right">{u.id!==user.id&&<button onClick={()=>handleDelUser(u.id)} className="text-red-500"><Trash2 size={14}/></button>}</td></tr>)}</tbody></table></div>}

      {tab==='articles'&&<div className="card overflow-hidden"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left p-3 text-gray-500">标题</th><th className="text-left p-3 text-gray-500">作者</th><th className="text-left p-3 text-gray-500">状态</th><th className="text-left p-3 text-gray-500">阅读</th><th className="text-right p-3 text-gray-500">操作</th></tr></thead><tbody>{articles.map(a=><tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50"><td className="p-3 text-xs font-medium truncate max-w-[200px]">{a.title}</td><td className="p-3 text-xs text-gray-500">{a.author?.displayName}</td><td className="p-3"><span className={`text-xs px-1.5 py-0.5 rounded-full ${a.status==='published'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{a.status==='published'?'发布':'草稿'}</span></td><td className="p-3 text-xs text-gray-500">{a.views||0}</td><td className="p-3 text-right"><button onClick={()=>handleDelArticle(a.id)} className="text-red-500"><Trash2 size={14}/></button></td></tr>)}</tbody></table></div>}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const cm = { blue:'bg-blue-50 text-blue-600', green:'bg-green-50 text-green-600', orange:'bg-orange-50 text-orange-600', purple:'bg-purple-50 text-purple-600' };
  return <div className="card p-4 flex items-center gap-3"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cm[color]}`}>{icon}</div><div><p className="text-xs text-gray-500">{label}</p><p className="text-lg font-bold">{value}</p></div></div>;
}
