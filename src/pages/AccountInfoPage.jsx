import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SubPageHeader from '../components/SubPageHeader';
import Avatar from '../components/Avatar';
import { fileToAvatarDataUrl } from '../lib/avatar';
import { IdCard, Mail, Check, ImagePlus } from 'lucide-react';

export default function AccountInfoPage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) return null;

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(''); setSuccess('');
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setError('图片过大，请选择 3MB 以内的图片'); return; }
    setError(''); setSuccess('');
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setForm((f) => ({ ...f, avatar: dataUrl }));
    } catch (err) {
      setError(err.message || '图片处理失败');
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.displayName.trim()) { setError('昵称不能为空'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      await updateProfile({
        displayName: form.displayName.trim(),
        bio: form.bio,
        avatar: form.avatar,
      });
      setSuccess('资料已保存');
    } catch (err) {
      setError(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      <SubPageHeader title="账号信息" subtitle="管理你的公开资料" />

      <form onSubmit={save} className="flex-1 overflow-y-auto win-scroll px-4 py-4 space-y-5 animate-fadeInUp">
        {/* 头像预览与上传 */}
        <div className="flex items-center gap-4 bg-[var(--win-card)] border border-[var(--win-border)] rounded-2xl p-5">
          <Avatar src={form.avatar} name={form.displayName || user.username} className="w-16 h-16 rounded-2xl text-2xl shadow-md" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <label className="btn-outline btn-sm inline-flex items-center gap-1.5 cursor-pointer">
                <ImagePlus size={14} /> 上传头像
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
              </label>
              {form.avatar && (
                <button type="button" onClick={() => setForm((f) => ({ ...f, avatar: '' }))} className="text-[12px] text-red-500 hover:underline">移除</button>
              )}
            </div>
            <input
              name="avatar" value={form.avatar} onChange={onChange}
              placeholder="或直接粘贴图片 URL（可选）" className="input mt-1.5"
            />
          </div>
        </div>

        <div className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-[13px] font-medium text-[var(--win-text)]">昵称</label>
            <input name="displayName" value={form.displayName} onChange={onChange} className="input mt-1.5" maxLength={40} />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--win-text)]">个人简介</label>
            <textarea name="bio" value={form.bio} onChange={onChange} rows={3} className="input mt-1.5 resize-none" maxLength={200} placeholder="介绍一下自己..." />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--win-text)] flex items-center gap-1.5">
              <Mail size={14} /> 邮箱
            </label>
            <input value={user.email || ''} disabled className="input mt-1.5 opacity-60 cursor-not-allowed" />
            <p className="text-[11px] text-[var(--win-text-tertiary)] mt-1">邮箱为登录凭证，暂不支持修改。</p>
          </div>
        </div>

        {error && <p className="text-[12px] text-red-500 px-1">{error}</p>}
        {success && (
          <p className="text-[12px] text-green-600 px-1 flex items-center gap-1">
            <Check size={13} /> {success}
          </p>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full py-2.5 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-[#fb7299] to-[#00a1d6] hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存修改'}
        </button>
      </form>
    </div>
  );
}
