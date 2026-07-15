import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Calendar, Eye, Tag, User, Send, Trash2, Edit3, Pin, PinOff } from 'lucide-react';
import { prepareArticleContent } from '../lib/markdown.js';

export default function ArticlePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadArticle = useCallback(async () => {
    try { const data = await api.getArticle(id); setArticle(data.article); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [id]);

  const loadComments = useCallback(async () => {
    try { const data = await api.getComments(id); setComments(data.comments||[]); }
    catch (e) {}
  }, [id]);

  useEffect(() => { loadArticle(); loadComments(); }, [loadArticle, loadComments]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try { await api.createComment({ articleId: id, content: newComment, parentId: replyTo }); setNewComment(''); setReplyTo(null); loadComments(); }
    catch (e) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const handleDeleteComment = async (cid) => { if (!confirm('删除评论？')) return; try { await api.deleteComment(cid); loadComments(); } catch(e) { alert(e.message); } };
  const handleDeleteArticle = async () => { if (!confirm('删除文章？')) return; try { await api.deleteArticle(id); navigate('/'); } catch(e) { alert(e.message); } };
  const handlePinArticle = async () => {
    try { const data = await api.pinArticle(id); setArticle(prev => ({ ...prev, pinned: data.article.pinned })); } catch(e) { alert(e.message); }
  };
  const handlePinComment = async (cid) => {
    try { await api.pinComment(cid); loadComments(); } catch(e) { alert(e.message); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });

  if (loading) return <div className="max-w-3xl mx-auto animate-pulse space-y-3"><div className="h-7 bg-gray-200 rounded w-3/4"/><div className="h-4 bg-gray-200 rounded w-1/2"/><div className="h-4 bg-gray-200 rounded w-full"/></div>;
  if (!article) return <div className="text-center py-12"><p className="text-gray-500">文章不存在</p><Link to="/" className="btn-primary mt-3 inline-block">返回首页</Link></div>;

  const isOwner = user && (user.id === article.authorId || user.role === 'admin');
  const isArticleAuthor = user && user.id === article.authorId;
  const topComments = comments.filter(c => !c.parentId);
  const getReplies = (cid) => comments.filter(c => c.parentId === cid);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{article.title}</h1>
      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap mb-2">
        {article.author && <Link to={`/user/${article.author.id}`} className="flex items-center gap-1 text-primary-600"><User size={12}/>{article.author.displayName}</Link>}
        <span className="flex items-center gap-1"><Calendar size={12}/>{formatDate(article.createdAt)}</span>
        <span className="flex items-center gap-1"><Eye size={12}/>{article.views||0}</span>
        {article.tags?.map(t => <span key={t} className="bg-gray-100 px-1.5 py-0.5 rounded-full"><Tag size={9} className="inline mr-0.5"/>{t}</span>)}
      </div>
      {isOwner && <div className="flex gap-2 mb-4 flex-wrap">
        <Link to={`/edit/${article.id}`} className="btn-outline btn-sm"><Edit3 size={13} className="mr-1"/>编辑</Link>
        {user?.role === 'admin' && (
          <button onClick={handlePinArticle} className="btn-outline btn-sm">
            {article.pinned ? <PinOff size={13} className="mr-1"/> : <Pin size={13} className="mr-1"/>}
            {article.pinned ? '取消置顶' : '置顶'}
          </button>
        )}
        <button onClick={handleDeleteArticle} className="btn-danger btn-sm"><Trash2 size={13} className="mr-1"/>删除</button>
      </div>}
      {article.coverImage && <img src={article.coverImage} alt="" className="w-full rounded-lg mb-5 max-h-80 object-cover"/>}
      <div className="article-content mb-8" dangerouslySetInnerHTML={{__html:prepareArticleContent(article.content)}}/>

      {article.author && <div className="card p-4 mb-6 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">{article.author.displayName?.[0]}</div><div><Link to={`/user/${article.author.id}`} className="font-semibold text-sm hover:text-primary-600">{article.author.displayName}</Link>{article.author.bio&&<p className="text-xs text-gray-500">{article.author.bio}</p>}</div></div>}

      <div className="border-t pt-5">
        <h3 className="font-bold mb-4">评论 ({comments.length})</h3>
        {user ? <form onSubmit={handleComment} className="mb-5">
          {replyTo && <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">回复中... <button type="button" onClick={()=>setReplyTo(null)} className="text-primary-600">取消</button></div>}
          <div className="flex gap-2"><textarea value={newComment} onChange={e=>setNewComment(e.target.value)} className="input flex-1 resize-none" rows={2} placeholder="写评论..."/><button type="submit" disabled={submitting||!newComment.trim()} className="btn-primary btn-sm self-end"><Send size={14}/></button></div>
        </form> : <div className="bg-gray-50 rounded p-3 text-center text-sm mb-5"><Link to="/login" className="text-primary-600">登录</Link> 后评论</div>}
        <div className="space-y-3">
          {topComments.map(c => <CommentItem key={c.id} comment={c} replies={getReplies(c.id)} currentUser={user} onReply={setReplyTo} onDelete={handleDeleteComment} onPin={handlePinComment} isArticleAuthor={isArticleAuthor} formatDate={formatDate} />)}
          {comments.length===0 && <p className="text-center text-gray-400 text-sm py-6">暂无评论</p>}
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment, replies, currentUser, onReply, onDelete, onPin, isArticleAuthor, formatDate }) {
  const canDelete = currentUser && (currentUser.id === comment.userId || currentUser.role === 'admin');
  return (
    <div className={'border-l-2 pl-3 ' + (comment.pinned ? 'border-primary-300 bg-primary-50/30 -ml-2 pl-5 pr-2 py-1.5 rounded-r-lg' : 'border-gray-100')}>
      <div className="flex gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold flex-shrink-0">{comment.user?.displayName?.[0]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium text-xs">{comment.user?.displayName}</span>
            {comment.pinned && <span className="inline-flex items-center gap-0.5 text-[10px] text-primary-600 font-medium"><Pin size={9}/> 置顶</span>}
            <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 mb-1">{comment.content}</p>
          <div className="flex gap-2 text-xs">
            {currentUser && <button onClick={()=>onReply(comment.id)} className="text-gray-400 hover:text-primary-600">回复</button>}
            {isArticleAuthor && <button onClick={()=>onPin(comment.id)} className="text-gray-400 hover:text-primary-600">{comment.pinned ? '取消置顶' : '置顶'}</button>}
            {canDelete && <button onClick={()=>onDelete(comment.id)} className="text-gray-400 hover:text-red-600">删除</button>}
          </div>
          {replies.length > 0 && <div className="mt-2 space-y-2">{replies.map(r => <CommentItem key={r.id} comment={r} replies={[]} currentUser={currentUser} onReply={onReply} onDelete={onDelete} onPin={onPin} isArticleAuthor={isArticleAuthor} formatDate={formatDate}/>)}</div>}
        </div>
      </div>
    </div>
  );
}
