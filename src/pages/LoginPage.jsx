import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(username, password); navigate('/'); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-sm mx-auto mt-12">
      <div className="card p-6">
        <h1 className="text-xl font-bold text-center mb-5">登录 SkyXing</h1>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" value={username} onChange={e=>setUsername(e.target.value)} className="input" placeholder="用户名" required />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input" placeholder="密码" required />
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading?'登录中...':'登录'}</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-3">没有账号？<Link to="/register" className="text-primary-600">注册</Link></p>
      </div>
    </div>
  );
}
