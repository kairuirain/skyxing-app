import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Home, Podcast, User, LogOut, PenSquare, Terminal, Palette, Bug, MessageSquare, RefreshCw } from 'lucide-react';
import { isAndroid } from '../lib/platform';
import api from '../lib/api';
import AnimatedOutlet from './AnimatedOutlet';

const NAV_ITEMS = [
  { to: '/', label: '主页', icon: Home, end: true },
  { to: '/podcast', label: '播客', icon: Podcast },
  { to: '/mine', label: '我的', icon: User },
  { to: '/messages', label: '私信', icon: MessageSquare, badgeKey: 'messages' },
];

/* ===================== 桌面 / Web 端（WinUI 侧边栏） ===================== */

function NavItem({ item, badge = 0 }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        'group relative flex items-center gap-3 h-10 pl-3 pr-3 mx-2 rounded-md text-[13.5px] font-medium outline-none transition-colors duration-100 ease-out ' +
        'focus-visible:ring-2 focus-visible:ring-[var(--win-accent)] ' +
        (isActive ? 'bg-[var(--win-accent-soft)] ' : 'hover:bg-[var(--win-pane-hover)] active:bg-[var(--win-pane-pressed)] ')
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={
              'absolute left-0 top-1/2 -translate-y-1/2 h-[18px] w-[3px] rounded-r-[2px] bg-[var(--win-accent)] transition-opacity duration-100 ' +
              (isActive ? 'opacity-100' : 'opacity-0')
            }
          />
          <span className="relative">
            <Icon
              size={20}
              strokeWidth={1.6}
              className={
                'shrink-0 transition-colors duration-100 ' +
                (isActive
                  ? 'text-[var(--win-accent)]'
                  : 'text-[var(--win-text-secondary)] group-hover:text-[var(--win-text)]')
              }
            />
            {badge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </span>
          <span
            className={
              'truncate transition-colors duration-100 ' +
              (isActive
                ? 'text-[var(--win-accent)]'
                : 'text-[var(--win-text-secondary)] group-hover:text-[var(--win-text)]')
            }
          >
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

function SettingsButton({ label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        'w-full flex items-center gap-3 h-9 pl-3 pr-3 rounded-md text-[13px] font-medium outline-none transition-colors duration-100 ' +
        'focus-visible:ring-2 focus-visible:ring-[var(--win-accent)] ' +
        (active
          ? 'bg-[var(--win-accent-soft)] text-[var(--win-accent)]'
          : 'text-[var(--win-text-secondary)] hover:bg-[var(--win-pane-hover)] active:bg-[var(--win-pane-pressed)]')
      }
    >
      <Icon size={18} strokeWidth={1.6} className="shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-[var(--win-accent)]" />}
    </button>
  );
}

function TerminalPanel({ logs, onClose, onClear }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);

  return (
    <div className="h-56 shrink-0 flex flex-col bg-[#0c0c0c] text-[12px] font-mono border-t border-[var(--win-border)]">
      <div className="flex items-center justify-between h-8 px-3 bg-[#161616] text-gray-300 border-b border-white/10">
        <span className="select-none">终端 · 日志输出</span>
        <div className="flex items-center gap-1">
          <button onClick={onClear} className="px-2 py-0.5 rounded hover:bg-white/10 text-[11px] transition-colors">清空</button>
          <button onClick={onClose} className="px-2 py-0.5 rounded hover:bg-white/10 text-[11px] transition-colors">关闭</button>
        </div>
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 win-scroll">
        {logs.length === 0 ? (
          <div className="text-gray-600 select-none">（暂无日志）</div>
        ) : (
          logs.map((l, i) => (
            <div
              key={i}
              className={
                l.level === 'error' ? 'text-red-400' : l.level === 'warn' ? 'text-yellow-400' : l.level === 'debug' ? 'text-purple-400' : 'text-gray-300'
              }
            >
              <span className="text-gray-600 mr-2 select-none">{l.time}</span>
              {l.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DesktopLayout({ unread = 0 }) {
  const { user, logout } = useAuth();
  const { theme, terminalOpen, debugMode, logs, toggleTheme, toggleTerminal, toggleDebug, clearLogs } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initial = (user?.displayName || user?.username || '?').slice(0, 1).toUpperCase();

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[var(--win-bg)] text-[var(--win-text)] font-win">
      {/* ===== Left navigation pane (WinUI NavigationView) ===== */}
      <nav className="w-[260px] shrink-0 bg-[var(--win-pane)] border-r border-[var(--win-border)] flex flex-col select-none">
        {/* Pane header / brand */}
        <div className="h-12 flex items-center gap-2.5 px-4">
          <div className="w-7 h-7 rounded-md bg-[var(--win-accent)] flex items-center justify-center text-[var(--win-on-accent)] text-[13px] font-bold shadow-sm">
            S
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--win-text)]">SkyXing</span>
        </div>

        {/* Primary navigation */}
        <div className="px-2 pt-2 pb-1 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} badge={item.badgeKey === 'messages' ? unread : 0} />
          ))}
        </div>

        {/* Compose action (only when signed in) */}
        {user && (
          <div className="px-2 pb-1">
            <NavLink
              to="/write"
              className="flex items-center gap-3 h-10 pl-3 pr-3 mx-2 rounded-md text-[13.5px] font-medium text-[var(--win-text-secondary)] hover:bg-[var(--win-pane-hover)] active:bg-[var(--win-pane-pressed)] transition-colors duration-100"
            >
              <PenSquare size={20} strokeWidth={1.6} className="shrink-0" />
              <span>写文章</span>
            </NavLink>
          </div>
        )}

        {/* Bottom group: settings panel + account */}
        <div className="mt-auto">
          {/* Settings panel */}
          <div className="px-2 pt-2 pb-1 border-t border-[var(--win-border)]">
            <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--win-text-tertiary)] select-none">
              设置
            </div>
            <div className="space-y-0.5">
              <SettingsButton label="终端界面显示" icon={Terminal} active={terminalOpen} onClick={toggleTerminal} />
              <SettingsButton label="主题选择" icon={Palette} active={theme === 'dark'} onClick={toggleTheme} />
              <SettingsButton label="调试模式" icon={Bug} active={debugMode} onClick={toggleDebug} />
            </div>
          </div>

          {/* Account area */}
          <div className="px-2 pt-2 pb-3 border-t border-[var(--win-border)]">
            {user ? (
              <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-[var(--win-pane-hover)] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[var(--win-accent)] text-[var(--win-on-accent)] flex items-center justify-center text-xs font-semibold shrink-0">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-[var(--win-text)] truncate">
                    {user.displayName || user.username}
                  </div>
                  <div className="text-[11px] text-[var(--win-text-tertiary)] truncate">
                    {user.role === 'admin' ? '管理员' : '已登录'}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="退出登录"
                  className="p-1.5 rounded-md text-[var(--win-text-tertiary)] hover:bg-[var(--win-pane-pressed)] hover:text-[var(--win-text)] transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[var(--win-text-secondary)] hover:bg-[var(--win-pane-hover)] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--win-accent)] text-[var(--win-on-accent)] flex items-center justify-center">
                  <User size={16} />
                </div>
                <span className="text-[13px] font-medium">登录 / 注册</span>
              </NavLink>
            )}
          </div>
        </div>
      </nav>

      {/* ===== Content region ===== */}
      <main className="flex-1 min-w-0 flex flex-col bg-[var(--win-bg)] relative">
        {/* 右上角刷新按钮（所有页面通用） */}
        <button
          onClick={() => window.location.reload()}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-lg bg-white/80 backdrop-blur border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-white hover:shadow-md transition-all"
          title="刷新页面"
        >
          <RefreshCw size={15} />
        </button>
        <div className="flex-1 overflow-y-auto win-scroll">
          <AnimatedOutlet />
        </div>
        {terminalOpen && (
          <TerminalPanel logs={logs} onClose={toggleTerminal} onClear={clearLogs} />
        )}
      </main>
    </div>
  );
}

/* ===================== Android 端（Material 底部导航栏） ===================== */

function AndroidBottomNav({ unread = 0 }) {
  return (
    <nav className="android-bottom-nav shrink-0 flex bg-[var(--win-bg)] border-t border-[var(--win-border)] shadow-[0_-1px_3px_rgba(0,0,0,0.06)] select-none">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const badge = item.badgeKey === 'messages' ? unread : 0;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              'relative flex-1 flex items-center justify-center h-14 active:bg-[var(--win-pane-pressed)] transition-colors duration-100 outline-none ' +
              (isActive ? 'text-[var(--win-accent)]' : 'text-[var(--win-text-tertiary)]')
            }
          >
            {({ isActive }) => (
              <span className="flex flex-col items-center justify-center gap-1">
                {/* Material 3 选中指示胶囊 */}
                <span
                  className={
                    'relative flex items-center justify-center w-[56px] h-8 rounded-full transition-colors duration-150 ' +
                    (isActive ? 'bg-[var(--win-accent-soft)]' : '')
                  }
                >
                  <Icon size={24} strokeWidth={isActive ? 2.2 : 1.8} className="transition-all duration-150" />
                  {badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-medium leading-none">{item.label}</span>
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

function AndroidLayout({ unread = 0 }) {
  const { terminalOpen, logs, toggleTerminal, clearLogs } = useSettings();

  return (
    <div className="android-app flex flex-col h-[100dvh] w-full overflow-hidden bg-[var(--win-bg)] text-[var(--win-text)] font-win">
      {/* 主内容区域（可滚动，内部页面自带顶部应用栏） */}
      <main className="flex-1 min-h-0 overflow-y-auto win-scroll relative">
        {/* 右上角刷新按钮 */}
        <button
          onClick={() => window.location.reload()}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-lg bg-white/80 backdrop-blur border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-white hover:shadow-md transition-all"
          title="刷新页面"
        >
          <RefreshCw size={15} />
        </button>
        <AnimatedOutlet />
      </main>

      {/* 终端日志面板：以底部抽屉形式覆盖，调试时临时显示 */}
      {terminalOpen && (
        <div className="android-terminal-sheet">
          <TerminalPanel logs={logs} onClose={toggleTerminal} onClear={clearLogs} />
        </div>
      )}

      {/* 底部导航栏（Material Bottom Navigation） */}
      <AndroidBottomNav unread={unread} />
    </div>
  );
}

/* ===================== 入口：按平台选择布局 ===================== */

export default function Layout() {
  const { user } = useAuth();
  const android = useMemo(() => isAndroid(), []);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    if (user) {
      api.getUnreadCount()
        .then((d) => { if (active) setUnread(d.unreadCount || 0); })
        .catch(() => {});
    } else {
      setUnread(0);
    }
    return () => { active = false; };
  }, [user]);

  return android ? <AndroidLayout unread={unread} /> : <DesktopLayout unread={unread} />;
}
