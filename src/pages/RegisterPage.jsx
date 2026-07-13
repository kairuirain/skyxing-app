import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) { setError('两次密码不一致'); return; }
    if (form.password.length < 6) { setError('密码至少6位'); return; }
    setLoading(true);
    try { await register({ username: form.username, email: form.email, password: form.password, displayName: form.displayName || form.username }); navigate('/'); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-sm mx-auto mt-8">
      <div className="card p-6">
        <h1 className="text-xl font-bold text-center mb-5">注册 SkyXing</h1>
        {error && <div className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.4)] text-[#f87171] px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" name="username" value={form.username} onChange={handleChange} className="input" placeholder="用户名 (3-30字符)" required minLength={3} />
          <input type="email" name="email" value={form.email} onChange={handleChange} className="input" placeholder="邮箱" required />
          <input type="text" name="displayName" value={form.displayName} onChange={handleChange} className="input" placeholder="显示名称 (可选)" />
          <input type="password" name="password" value={form.password} onChange={handleChange} className="input" placeholder="密码 (至少6位)" required minLength={6} />
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input" placeholder="确认密码" required />
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading?'注册中...':'注册'}</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-3">已有账号？<Link to="/login" className="text-primary-600">登录</Link></p>
      </div>
    </div>
  );
}
