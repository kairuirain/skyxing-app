import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, complete2FALogin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [code, setCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await login(username, password);
      if (res.requireTotp) {
        setTempToken(res.tempToken);
        setLoading(false);
        return;
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    if (code.length !== 6) { setError('请输入 6 位验证码'); return; }
    setError(''); setLoading(true);
    try {
      await complete2FALogin(tempToken, code);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  if (tempToken) {
    return (
      <div className="max-w-sm mx-auto mt-12">
        <div className="card p-6">
          <h1 className="text-xl font-bold text-center mb-2">双重验证</h1>
          <p className="text-sm text-gray-500 text-center mb-5">
            请输入身份验证器中的 6 位动态验证码
          </p>
          {error && <div className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.4)] text-[#f87171] px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>}
          <form onSubmit={handle2FA} className="space-y-3">
            <input
              type="text" inputMode="numeric" autoComplete="one-time-code"
              value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input text-center text-2xl tracking-[0.5em] font-mono"
              placeholder="000000"
              required
            />
            <button type="submit" disabled={loading || code.length < 6} className="btn-primary w-full">
              {loading ? '验证中...' : '验证'}
            </button>
          </form>
          <button onClick={() => setTempToken(null)} className="w-full text-sm text-gray-500 hover:text-gray-700 mt-3">
            返回上一步
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <div className="card p-6">
        <h1 className="text-xl font-bold text-center mb-5">登录 SkyXing</h1>
        {error && <div className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.4)] text-[#f87171] px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>}
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
