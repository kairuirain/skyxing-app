import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { isAndroid } from '../lib/platform';
import { FileText, PenSquare, LogOut, LogIn, Shield, Terminal, Palette, Bug } from 'lucide-react';

function SettingsToggleRow({ label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 h-14 px-4 active:bg-[var(--win-pane-pressed)] transition-colors outline-none"
    >
      <span
        className={
          'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ' +
          (active ? 'bg-[var(--win-accent-soft)] text-[var(--win-accent)]' : 'bg-[var(--win-pane)] text-[var(--win-text-secondary)]')
        }
      >
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <span className="flex-1 text-left text-[14px] font-medium text-[var(--win-text)]">{label}</span>
      {/* Material 风格开关 */}
      <span
        className={
          'relative w-11 h-6 rounded-full transition-colors duration-150 shrink-0 ' +
          (active ? 'bg-[var(--win-accent)]' : 'bg-[var(--win-border-strong)]')
        }
      >
        <span
          className={
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-150 ' +
            (active ? 'translate-x-5' : 'translate-x-0')
          }
        />
      </span>
    </button>
  );
}

export default function MinePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, terminalOpen, debugMode, toggleTheme, toggleTerminal, toggleDebug } = useSettings();
  const android = isAndroid();

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
            <Link to="/login" className="h-10 flex items-center justify-center rounded-md bg-[var(--win-accent)] text-[var(--win-on-accent)] text-[13.5px] font-medium hover:bg-[var(--win-accent-hover)] transition-colors">
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
          <div className="w-16 h-16 rounded-full bg-[var(--win-accent)] text-[var(--win-on-accent)] flex items-center justify-center text-2xl font-semibold shrink-0">
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

        {/* 设置（Android 端：因无侧边栏，设置入口置于此处） */}
        {android && (
          <>
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[var(--win-text-tertiary)] mt-6 mb-2 px-1">
              设置
            </h3>
            <div className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-xl divide-y divide-[var(--win-border)] overflow-hidden">
              <SettingsToggleRow label="终端界面显示" icon={Terminal} active={terminalOpen} onClick={toggleTerminal} />
              <SettingsToggleRow label="主题选择（明暗）" icon={Palette} active={theme === 'dark'} onClick={toggleTheme} />
              <SettingsToggleRow label="调试模式" icon={Bug} active={debugMode} onClick={toggleDebug} />
            </div>
          </>
        )}

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
