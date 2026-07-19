import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import SubPageHeader from '../components/SubPageHeader';
import { KeyRound, ShieldCheck, Fingerprint, Trash2, AlertTriangle, Copy, Check } from 'lucide-react';

export default function AccountSecurityPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [totpEnabled, setTotpEnabled] = useState(user?.totpEnabled || false);

  // 密码修改
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // 2FA 设置
  const [setupData, setSetupData] = useState(null); // { secret, uri }
  const [verifyCode, setVerifyCode] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [copied, setCopied] = useState(false);

  // 删除账号
  const [delLoading, setDelLoading] = useState(false);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setPwError(''); setPwSuccess('');
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (form.next.length < 6) { setPwError('新密码至少 6 位'); return; }
    if (form.next !== form.confirm) { setPwError('两次输入的新密码不一致'); return; }
    setPwLoading(true); setPwError(''); setPwSuccess('');
    try {
      await api.changePassword(form.current, form.next);
      setPwSuccess('密码修改成功');
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwError(err.message || '修改失败');
    } finally { setPwLoading(false); }
  };

  // 开始 2FA 设置
  const startSetup = async () => {
    setSetupLoading(true); setSetupError('');
    try {
      const data = await api.setup2FA();
      setSetupData(data);
      setVerifyCode('');
    } catch (err) {
      setSetupError(err.message);
    } finally { setSetupLoading(false); }
  };

  // 验证并启用 2FA
  const submitSetup = async () => {
    if (verifyCode.length !== 6) { setSetupError('请输入 6 位验证码'); return; }
    setSetupLoading(true); setSetupError('');
    try {
      const res = await api.verifySetup2FA(setupData.secret, verifyCode);
      setTotpEnabled(true);
      setSetupData(null);
      setVerifyCode('');
    } catch (err) {
      setSetupError(err.message);
    } finally { setSetupLoading(false); }
  };

  // 关闭 2FA
  const disable2FA = async () => {
    if (!window.confirm('确定要关闭双重验证吗？')) return;
    setSetupLoading(true);
    try {
      await api.disable2FA();
      setTotpEnabled(false);
    } catch (err) {
      window.alert(err.message);
    } finally { setSetupLoading(false); }
  };

  const copySecret = () => {
    navigator.clipboard?.writeText(setupData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="min-h-full flex flex-col">
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
            <input name="current" type="password" value={form.current} onChange={onChange} placeholder="当前密码" className="input" autoComplete="current-password" />
            <input name="next" type="password" value={form.next} onChange={onChange} placeholder="新密码（至少 6 位）" className="input" autoComplete="new-password" />
            <input name="confirm" type="password" value={form.confirm} onChange={onChange} placeholder="确认新密码" className="input" autoComplete="new-password" />
            {pwError && <p className="text-[12px] text-red-500">{pwError}</p>}
            {pwSuccess && <p className="text-[12px] text-green-600">{pwSuccess}</p>}
            <button type="submit" disabled={pwLoading} className="w-full py-2.5 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-[#fb7299] to-[#00a1d6] hover:opacity-90 transition-opacity disabled:opacity-50">
              {pwLoading ? '保存中...' : '保存新密码'}
            </button>
          </form>
        </section>

        {/* 2FA 双重验证 */}
        <section className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-2xl p-5 animate-fadeInUp">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-9 h-9 rounded-full bg-[var(--win-pane)] text-[var(--win-text-secondary)] flex items-center justify-center shrink-0">
              <Fingerprint size={18} strokeWidth={1.8} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-[var(--win-text)]">2FA 双重验证</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  totpEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {totpEnabled ? '已启用' : '未启用'}
                </span>
              </div>
              <p className="text-[12px] text-[var(--win-text-tertiary)] mt-0.5">
                登录时需额外输入动态验证码，为账号增加一层保护。
              </p>
            </div>
          </div>

          {!totpEnabled && !setupData && (
            <button onClick={startSetup} disabled={setupLoading}
              className="w-full py-2.5 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-[#fb7299] to-[#00a1d6] hover:opacity-90 transition-opacity disabled:opacity-50">
              {setupLoading ? '准备中...' : '开启双重验证'}
            </button>
          )}

          {!totpEnabled && setupData && (
            <div className="space-y-3">
              <p className="text-[12px] text-[var(--win-text-secondary)] leading-relaxed">
                请使用 Google Authenticator / Authy 等应用扫描下方二维码，或手动输入密钥。
              </p>

              {/* 二维码图片（通过 api.qrserver.com 在线生成） */}
              <div className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 border border-gray-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.uri)}`}
                  alt="2FA QR Code"
                  className="w-48 h-48"
                  referrerPolicy="no-referrer"
                />
                <p className="text-[10px] text-gray-400 text-center leading-tight break-all">
                  {setupData.uri}
                </p>
              </div>

              {/* 密钥 + 复制 */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <code className="text-[13px] font-mono flex-1 break-all select-all">{setupData.secret}</code>
                <button onClick={copySecret} className="shrink-0 text-gray-400 hover:text-gray-600 p-1" title="复制密钥">
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>

              <input
                type="text" inputMode="numeric"
                value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input text-center text-xl tracking-[0.4em] font-mono"
                placeholder="输入 6 位验证码"
              />

              {setupError && <p className="text-[12px] text-red-500">{setupError}</p>}

              <div className="flex gap-2">
                <button onClick={() => setSetupData(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  取消
                </button>
                <button onClick={submitSetup} disabled={setupLoading || verifyCode.length < 6} className="flex-1 py-2.5 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-[#fb7299] to-[#00a1d6] hover:opacity-90 transition-opacity disabled:opacity-50">
                  {setupLoading ? '验证中...' : '确认并启用'}
                </button>
              </div>
            </div>
          )}

          {totpEnabled && (
            <button onClick={disable2FA} disabled={setupLoading}
              className="w-full py-2.5 rounded-xl text-red-500 font-medium text-sm bg-red-50 hover:bg-red-100 active:bg-red-200 transition-colors disabled:opacity-50">
              关闭双重验证
            </button>
          )}
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
              <button onClick={handleDelete} className="w-full py-2.5 rounded-xl text-red-500 font-medium text-sm bg-red-50 hover:bg-red-100 active:bg-red-200 transition-colors">
                注销我的账号
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
