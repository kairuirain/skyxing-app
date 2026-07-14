import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { isAndroid } from '../lib/platform';
import api from '../lib/api';
import {
  FileText, PenSquare, LogOut, LogIn, Shield, Terminal, Palette, Bug,
  Download, RefreshCw, Info, ExternalLink, Github, CheckCircle2, AlertCircle,
} from 'lucide-react';

const APP_VERSION = '1.1.3';
const PLATFORM = 'app';

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

function SectionTitle({ children }) {
  return (
    <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[var(--win-text-tertiary)] mt-6 mb-2 px-1">
      {children}
    </h3>
  );
}

function openExternal(url) {
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  if (isTauri) {
    import('@tauri-apps/plugin-shell').then((m) => m.open(url)).catch(() => window.open(url, '_blank'));
  } else {
    window.open(url, '_blank');
  }
}

export default function MinePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, terminalOpen, debugMode, updateChannel, setUpdateChannel, toggleTheme, toggleTerminal, toggleDebug } = useSettings();
  const android = isAndroid();

  const [update, setUpdate] = useState({ checking: false, error: null, hasUpdate: false, latest: null, checked: false });

  const checkUpdate = useCallback(async () => {
    setUpdate((u) => ({ ...u, checking: true, error: null }));
    try {
      const data = await api.checkUpdate(PLATFORM, APP_VERSION, updateChannel);
      setUpdate((u) => ({ ...u, checking: false, checked: true, hasUpdate: data.hasUpdate, latest: data.release }));
    } catch (e) {
      setUpdate((u) => ({ ...u, checking: false, error: e.message || '检查失败' }));
    }
  }, [updateChannel]);

  // 进入页面自动检测一次
  useEffect(() => { checkUpdate(); }, [checkUpdate]);

  const handleDownload = () => {
    const url = update.latest?.download?.recommendedUrl || update.latest?.download?.url;
    if (url) openExternal(url);
  };

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

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 bg-[var(--win-bg)] backdrop-blur px-6 py-3 border-b border-[var(--win-border)]">
        <h1 className="text-xl font-semibold text-[var(--win-text)] tracking-tight">设置</h1>
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

        {/* 调试 */}
        <SectionTitle>调试</SectionTitle>
        <div className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-xl divide-y divide-[var(--win-border)] overflow-hidden">
          <SettingsToggleRow label="终端界面显示" icon={Terminal} active={terminalOpen} onClick={toggleTerminal} />
          <SettingsToggleRow label="主题选择（明暗）" icon={Palette} active={theme === 'dark'} onClick={toggleTheme} />
          <SettingsToggleRow label="调试模式" icon={Bug} active={debugMode} onClick={toggleDebug} />
          <div className="flex items-center justify-between h-14 px-4">
            <span className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--win-pane)] text-[var(--win-text-secondary)]">
                <Download size={18} strokeWidth={1.8} />
              </span>
              <span className="text-[14px] font-medium text-[var(--win-text)]">更新通道</span>
            </span>
            <div className="flex gap-1">
              {['stable', 'beta'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setUpdateChannel(ch)}
                  className={
                    'px-3 py-1 rounded-md text-xs font-medium border transition-colors ' +
                    (updateChannel === ch
                      ? 'bg-[var(--win-accent)] border-[var(--win-accent)] text-[var(--win-on-accent)]'
                      : 'bg-[var(--win-card)] border-[var(--win-border)] text-[var(--win-text-secondary)]')
                  }
                >
                  {ch === 'stable' ? '稳定版' : '测试版'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 更新 */}
        <SectionTitle>更新</SectionTitle>
        <div className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-[13.5px]">
            <span className="text-[var(--win-text-secondary)]">当前版本</span>
            <span className="font-medium text-[var(--win-text)]">v{APP_VERSION} · {updateChannel === 'beta' ? '测试版' : '稳定版'}</span>
          </div>

          <button
            onClick={checkUpdate}
            disabled={update.checking}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-md bg-[var(--win-accent)] text-[var(--win-on-accent)] text-[13.5px] font-medium hover:bg-[var(--win-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={update.checking ? 'animate-spin' : ''} />
            {update.checking ? '检查中...' : '检查更新'}
          </button>

          {update.error && (
            <div className="flex items-start gap-2 text-[13px] text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>检查失败：{update.error}</span>
            </div>
          )}
          {update.checked && !update.error && !update.hasUpdate && (
            <div className="flex items-center gap-2 text-[13px] text-green-600 bg-green-50 rounded-lg p-3">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>已是最新版本</span>
            </div>
          )}
          {update.hasUpdate && update.latest && (
            <div className="border border-[var(--win-accent-soft)] rounded-lg p-4 bg-[var(--win-accent-soft)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-semibold text-[var(--win-text)]">发现新版本 v{update.latest.version}</div>
                {update.latest.prerelease && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">预发布</span>
                )}
              </div>
              <div className="text-[12px] text-[var(--win-text-secondary)] whitespace-pre-wrap max-h-40 overflow-y-auto">
                {update.latest.notes || '（无更新说明）'}
              </div>
              {update.latest.proxyApplied && (
                <div className="text-[12px] text-[var(--win-accent)]">已启用下载加速代理，下载将自动走代理地址。</div>
              )}
              <button
                onClick={handleDownload}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--win-accent)] text-[var(--win-on-accent)] rounded-md text-[13.5px] font-medium hover:bg-[var(--win-accent-hover)] transition-colors"
              >
                <Download size={16} /> 下载更新
              </button>
            </div>
          )}
        </div>

        {/* 关于软件 */}
        <SectionTitle>关于软件</SectionTitle>
        <div className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-xl divide-y divide-[var(--win-border)] overflow-hidden">
          <div className="flex items-center justify-between px-4 h-14">
            <div>
              <div className="text-[14px] font-medium text-[var(--win-text)]">SkyXing</div>
              <div className="text-[12px] text-[var(--win-text-tertiary)]">版本 v{APP_VERSION} · {android ? 'Android' : '桌面端'}</div>
            </div>
            <div className="flex gap-2">
              <a href="https://skyxing.dpdns.org" target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-[var(--win-pane-hover)] text-[var(--win-text-secondary)]" title="官网">
                <ExternalLink size={16} />
              </a>
              <a href="https://github.com/kairuirain/skyxing" target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-[var(--win-pane-hover)] text-[var(--win-text-secondary)]" title="GitHub">
                <Github size={16} />
              </a>
            </div>
          </div>
          <Link to={`/user/${user.id}`} className="flex items-center gap-3 h-14 px-4 hover:bg-[var(--win-pane-hover)] transition-colors">
            <FileText size={20} className="text-[var(--win-accent)] shrink-0" />
            <span className="text-[13.5px] font-medium text-[var(--win-text)]">我的文章</span>
          </Link>
          <Link to="/write" className="flex items-center gap-3 h-14 px-4 hover:bg-[var(--win-pane-hover)] transition-colors">
            <PenSquare size={20} className="text-[var(--win-accent)] shrink-0" />
            <span className="text-[13.5px] font-medium text-[var(--win-text)]">写文章</span>
          </Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-3 h-14 px-4 hover:bg-[var(--win-pane-hover)] transition-colors">
              <Shield size={20} className="text-[var(--win-accent)] shrink-0" />
              <span className="text-[13.5px] font-medium text-[var(--win-text)]">管理后台</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 h-14 px-4 hover:bg-[var(--win-pane-hover)] transition-colors"
          >
            <LogOut size={20} className="text-red-500 shrink-0" />
            <span className="text-[13.5px] font-medium text-red-600">退出登录</span>
          </button>
        </div>
      </div>
    </div>
  );
}
