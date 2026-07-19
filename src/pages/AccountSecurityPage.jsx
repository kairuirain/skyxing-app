import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import SubPageHeader from '../components/SubPageHeader';
import { KeyRound, ShieldCheck, Fingerprint, Trash2, AlertTriangle } from 'lucide-react';

export default function AccountSecurityPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(''); setSuccess('');
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (form.next.length < 6) { setError('新密码至少 6 位'); return; }
    if (form.next !== form.confirm) { setError('两次输入的新密码不一致'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      await api.changePassword(form.current, form.next);
      setSuccess('密码修改成功');
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setError(err.message || '修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('确定要注销账号吗？此操作不可恢复，你的账号、文章与私信将被永久删除。')) return;
    try {
      await api.deleteAccount();
      await logout();
      navigate('/');
    } catch (err) {
      window.alert(err.message || '注销失败');
    }
  };

  return (
    <div className="min-h-full flex flex-col animate-fadeIn">
      <SubPageHeader title="账号安全" subtitle="管理你的登录与账户安全" />

      <div className="flex-1 overflow-y-auto win-scroll px-4 py-4 space-y-5">
        {/* 修改密码 */}
        <section className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-2xl p-5 animate-fadeInUp">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-9 h-9 rounded-full bg-[var(--win-pane)] text-[var(--win-text-secondary)] flex items-center justify-center">
              <KeyRound size={18} strokeWidth={1.8} />
            </span>
            <h2 className="text-[15px] font-semibold text-[var(--win-text)]">修改密码</h2>
          </div>

          <form onSubmit={submitPassword} className="space-y-3">
            <input
              name="current" type="password" value={form.current} onChange={onChange}
              placeholder="当前密码" className="input"
              autoComplete="current-password"
            />
            <input
              name="next" type="password" value={form.next} onChange={onChange}
              placeholder="新密码（至少 6 位）" className="input"
              autoComplete="new-password"
            />
            <input
              name="confirm" type="password" value={form.confirm} onChange={onChange}
              placeholder="确认新密码" className="input"
              autoComplete="new-password"
            />

            {error && <p className="text-[12px] text-red-500">{error}</p>}
            {success && <p className="text-[12px] text-green-600">{success}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-[#fb7299] to-[#00a1d6] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存新密码'}
            </button>
          </form>
        </section>

        {/* 2FA 管理（敬请期待） */}
        <section className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-2xl p-5 animate-fadeInUp">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[var(--win-pane)] text-[var(--win-text-secondary)] flex items-center justify-center shrink-0">
              <Fingerprint size={18} strokeWidth={1.8} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-[var(--win-text)]">2FA 双重验证</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--win-pane)] text-[var(--win-text-tertiary)] font-medium">敬请期待</span>
              </div>
              <p className="text-[12px] text-[var(--win-text-tertiary)] mt-0.5">
                为账号增加一层登录保护，即将上线。
              </p>
            </div>
            <ShieldCheck size={18} className="text-[var(--win-text-tertiary)] shrink-0" />
          </div>
        </section>

        {/* 注销账号 */}
        <section className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-2xl p-5 animate-fadeInUp">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <Trash2 size={18} strokeWidth={1.8} />
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="text-[15px] font-semibold text-red-500">注销账号</h2>
              <p className="text-[12px] text-[var(--win-text-tertiary)] mt-0.5 mb-3 flex items-start gap-1">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                注销后账号、文章与私信将被永久删除，且不可恢复。
              </p>
              <button
                onClick={handleDelete}
                className="w-full py-2.5 rounded-xl text-red-500 font-medium text-sm bg-red-50 hover:bg-red-100 active:bg-red-200 transition-colors"
              >
                注销我的账号
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
