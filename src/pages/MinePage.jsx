import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, PenSquare, LogOut, LogIn, Shield } from 'lucide-react';

export default function MinePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-full flex items-center justify-center px-6">
        <div className="w-full max-w-sm bg-[var(--win-card)] border border-[var(--win-border)] rounded-xl p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[var(--win-pane)] flex items-center justify-center text-[var(--win-text-tertiary)] mb-4">
            <LogIn size={26} />
          </div>
          <h2 className="text-[17px] font-semibold text-[var(--win-text)] mb-1">尚未登录</h2>
          <p className="text-[13px] text-[var(--win-text-secondary)] mb-6">登录后即可管理你的文章与账户</p>
          <div className="flex flex-col gap-2.5">
            <Link to="/login" className="h-10 flex items-center justify-center rounded-md bg-[var(--win-accent)] text-white text-[13.5px] font-medium hover:bg-[var(--win-accent-hover)] transition-colors">
              登录
            </Link>
            <Link to="/register" className="h-10 flex items-center justify-center rounded-md bg-[var(--win-pane)] text-[var(--win-text)] text-[13.5px] font-medium hover:bg-[var(--win-pane-hover)] transition-colors">
              注册新账户
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initial = (user.displayName || user.username || '?').slice(0, 1).toUpperCase();
  const actions = [
    { to: `/user/${user.id}`, label: '我的文章', icon: FileText },
    { to: '/write', label: '写文章', icon: PenSquare },
  ];
  if (user.role === 'admin') {
    actions.push({ to: '/admin', label: '管理后台', icon: Shield });
  }

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 bg-[var(--win-bg)] backdrop-blur px-6 py-3 border-b border-[var(--win-border)]">
        <h1 className="text-xl font-semibold text-[var(--win-text)] tracking-tight">我的</h1>
      </header>

      <div className="px-6 py-5 max-w-[760px]">
        {/* Profile card */}
        <div className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--win-accent)] text-white flex items-center justify-center text-2xl font-semibold shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-semibold text-[var(--win-text)] truncate">
                {user.displayName || user.username}
              </h2>
              {user.role === 'admin' && (
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[var(--win-accent-soft)] text-[var(--win-accent)] font-medium">
                  管理员
                </span>
              )}
            </div>
            <p className="text-[13px] text-[var(--win-text-secondary)] truncate">{user.email}</p>
            <p className="text-[12px] text-[var(--win-text-tertiary)] mt-0.5">@{user.username}</p>
          </div>
        </div>

        {/* Quick actions */}
        <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[var(--win-text-tertiary)] mt-6 mb-2 px-1">
          快捷操作
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center gap-3 h-14 px-4 rounded-lg bg-[var(--win-card)] border border-[var(--win-border)] hover:border-[var(--win-border-strong)] hover:bg-[var(--win-card-hover)] transition-colors"
              >
                <Icon size={20} className="text-[var(--win-accent)] shrink-0" />
                <span className="text-[13.5px] font-medium text-[var(--win-text)]">{a.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="mt-5 w-full h-11 flex items-center justify-center gap-2 rounded-md bg-[var(--win-pane)] text-[var(--win-text)] text-[13.5px] font-medium hover:bg-[var(--win-pane-hover)] active:bg-[var(--win-pane-pressed)] transition-colors"
        >
          <LogOut size={16} /> 退出登录
        </button>
      </div>
    </div>
  );
}
