import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Send, Trash2, ArrowLeft, RefreshCw, Wifi, WifiOff, Loader, AlertCircle } from 'lucide-react';
import useRealtime from '../hooks/useRealtime';

export default function ConversationPage() {
  const { convId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    try { const d = await api.getConversationMessages(convId); setMessages(d.messages||[]); if (d.otherUser) setOtherUser(d.otherUser); }
    catch (e) { if (!silent) console.error(e); }
    finally { if (!silent) setLoading(false); }
  }, [convId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const onNewMessage = useCallback((msgs) => setMessages(msgs), []);
  const { status, sendMessage, pendingCount } = useRealtime({ conversationId: convId, userId: user?.id, onNewMessage });

  const handleSend = async (e) => {
    e.preventDefault(); if (!newMsg.trim()) return;
    setSubmitting(true);
    const r = await sendMessage(convId, newMsg.trim());
    if (r.ok) { setNewMsg(''); if (r.message) setMessages(l => [...l, r.message]); }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirm('删除该会话？')) return;
    try { await api.deleteConversation(convId); navigate('/messages'); } catch (e) { alert(e.message); }
  };

  const fmt = (ts) => {
    const d = new Date(ts);
    return d.toDateString() === new Date().toDateString()
      ? d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const StatusIcon = () => {
    if (status === 'connecting') return <Loader size={14} className="animate-spin text-amber-500" />;
    if (status === 'disconnected') return <WifiOff size={14} className="text-red-500" />;
    return <Wifi size={14} className="text-green-500" />;
  };

  if (loading) return <div className="max-w-3xl mx-auto animate-pulse h-32 bg-gray-200 rounded-lg"/>;
  const peer = otherUser?.displayName || otherUser?.username || '会话';

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[72vh]">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/messages" className="p-1 rounded-md hover:bg-gray-100"><ArrowLeft size={18}/></Link>
        <h1 className="text-lg font-bold truncate flex-1">{peer}</h1>
        <span className="flex items-center gap-1 text-[10px] text-gray-400"><StatusIcon/></span>
        {pendingCount > 0 && <span className="text-[10px] text-amber-600"><AlertCircle size={12}/>{pendingCount}</span>}
        <button onClick={() => load(true)} className="p-1 text-gray-400 hover:text-primary-600"><RefreshCw size={16}/></button>
        <button onClick={handleDelete} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 mb-2 pr-1">
        {messages.length === 0 && <p className="text-center text-gray-400 text-sm py-10">还没有消息</p>}
        {messages.map(m => {
          const mine = m.fromId === user?.id;
          return (
            <div key={m.id} className={`flex ${mine?'justify-end':'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-1.5 text-sm ${mine?'bg-primary-600 text-white rounded-br-sm':'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                <div className={mine?'prose-sm prose-invert':'prose-sm'} dangerouslySetInnerHTML={{__html:m.content}}/>
                <div className={`text-[10px] mt-0.5 ${mine?'text-primary-200':'text-gray-400'}`}>
                  {fmt(m.createdAt)}{mine&&m.read&&' ✓✓'}{mine&&!m.read&&' ✓'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="输入消息..." className="input flex-1"/>
        <button type="submit" disabled={submitting||!newMsg.trim()} className="btn-primary btn-sm self-end"><Send size={14}/></button>
      </form>
    </div>
  );
}
