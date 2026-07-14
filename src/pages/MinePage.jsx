import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { isAndroid } from '../lib/platform';
import api from '../lib/api';
import {
  FileText, PenSquare, LogOut, LogIn, Shield, Terminal, Palette, Bug,
  Download, RefreshCw, Info, ExternalLink, Github, CheckCircle2, AlertCircle,
  X, User as UserIcon,
} from 'lucide-react';

const APP_VERSION = '1.2.0';
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

  // ———— Tauri 内置 Updater 状态 ————
  const [tauriUpdate, setTauriUpdate] = useState({
    checking: false,
    available: false,
    info: null,
    downloadProgress: 0,
    downloading: false,
    error: null,
  });

  // 启动时自动检查更新（使用 Tauri 内置 Updater）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { check } = await import('@tauri-apps/plugin-updater');
        if (cancelled) return;
        setTauriUpdate((u) => ({ ...u, checking: true }));
        const update = await check();
        if (cancelled) return;
        if (update?.available) {
          setTauriUpdate((u) => ({
            ...u, checking: false, available: true, info: update,
          }));
        } else {
          setTauriUpdate((u) => ({ ...u, checking: false }));
        }
      } catch (e) {
        if (!cancelled) setTauriUpdate((u) => ({ ...u, checking: false, error: e.message }));
      }
    })();
    return () => { cancelled = true; };
  }, [updateChannel]);

  // Tauri Updater：开始下载
  const handleTauriDownload = async () => {
    if (!tauriUpdate.available || !tauriUpdate.info) return;
    setTauriUpdate((u) => ({ ...u, downloading: true, downloadProgress: 0, error: null }));
    try {
      await tauriUpdate.info.download((event) => {
        if (event.event === 'Started') {
          setTauriUpdate((u) => ({ ...u, downloadProgress: 0 }));
        } else if (event.event === 'Progress') {
          const pct = Math.round((event.data.chunkLength / event.data.contentLength) * 100);
          setTauriUpdate((u) => ({ ...u, downloadProgress: Math.min(pct, 99) }));
        } else if (event.event === 'Finished') {
          setTauriUpdate((u) => ({ ...u, downloadProgress: 100 }));
        }
      });
      // 下载完成，执行安装
      await tauriUpdate.info.install();
    } catch (e) {
      setTauriUpdate((u) => ({ ...u, downloading: false, error: e.message }));
    }
  };

  const closeUpdateModal = () => {
    setTauriUpdate((u) => ({ ...u, available: false }));
  };

  // ———— 传统 OTA Check（后备） ————
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

  useEffect(() => { checkUpdate(); }, [checkUpdate]);

  const handleDownload = () => {
    const url = update.latest?.download?.recommendedUrl || update.latest?.download?.url;
    if (url) openExternal(url);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ———— Bilibili 风格更新弹窗 ————
  const UpdateModal = () => {
    if (!tauriUpdate.available) return null;
    const version = tauriUpdate.info?.version || '';
    const body = tauriUpdate.info?.body || '';
    const downloading = tauriUpdate.downloading;
    const progress = tauriUpdate.downloadProgress;

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
        <div className="w-[380px] rounded-2xl overflow-hidden shadow-2xl animate-scaleIn bg-white">
          {/* Gradient header */}
          <div className="bg-gradient-to-br from-[#fb7299] via-[#fc8bab] to-[#00a1d6] px-6 pt-8 pb-10 text-center relative">
            <div className="absolute top-3 right-3">
              <button onClick={closeUpdateModal} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Download size={26} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">发现新版本</h2>
            <p className="text-white/80 text-sm">SkyXing v{version}</p>
          </div>

          {/* Body */}
          <div className="p-5 bg-white">
            {body && (
              <div className="mb-4 max-h-28 overflow-y-auto text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3">
                {body}
              </div>
            )}

            {downloading ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">下载中</span>
                  <span className="text-[#fb7299] font-bold">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#fb7299] to-[#00a1d6] rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-center">下载完成后将自动安装并重启</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleTauriDownload}
                  className="w-full py-2.5 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-[#fb7299] to-[#00a1d6] hover:opacity-90 transition-opacity"
                >
                  立即更新
                </button>
                <button
                  onClick={closeUpdateModal}
                  className="w-full py-2.5 rounded-xl text-gray-600 font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  稍后再说
                </button>
              </div>
            )}

            {tauriUpdate.error && (
              <div className="mt-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg p-3">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>更新出错：{tauriUpdate.error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );

  };

  if (!user) {
    return (
      <div className="min-h-full flex items-center justify-center px-6">
        <div className="w-full max-w-sm bg-[var(--win-card)] border border-[var(--win-border)] rounded-xl p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[var(--win-pane)] flex items-center justify-center text-[var(--win-text-tertiary)] mb-4">
            <LogIn size={26} />
          </div>
          <p className="text-[var(--win-text)] text-sm mb-5">请先登录后查看个人设置</p>
          <Link to="/login" className="inline-block w-full py-2 rounded-lg bg-[var(--win-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            前往登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col px-6 py-6">
      {/* ======== B站风格更新弹窗 ======== */}
      <UpdateModal />

      {/* Profile card */}
      <div className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#fb7299] to-[#00a1d6] text-white text-xl font-bold flex items-center justify-center">
            {(user?.displayName || user?.username || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[16px] font-bold text-[var(--win-text)] truncate">
              {user?.displayName || user?.username}
            </h1>
            <p className="text-[12px] text-[var(--win-text-tertiary)]">@{user?.username}</p>
            {user?.role === 'admin' && (
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-[var(--win-accent)] font-semibold">
                <Shield size={12} /> 管理员
              </span>
            )}
          </div>
        </div>
        {user?.bio && (
          <p className="text-[13px] text-[var(--win-text-secondary)] mt-4 pt-4 border-t border-[var(--win-border)]">{user.bio}</p>
        )}
      </div>

      {/* ======== 调试 ======== */}
      <SectionTitle>调试</SectionTitle>
      <div className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-xl overflow-hidden mb-1">
        <SettingsToggleRow label="终端" icon={Terminal} active={terminalOpen} onClick={toggleTerminal} />
        <div className="h-px bg-[var(--win-border)] mx-4" />
        <SettingsToggleRow label="深色主题" icon={Palette} active={theme === 'dark'} onClick={toggleTheme} />
        <div className="h-px bg-[var(--win-border)] mx-4" />
        <SettingsToggleRow label="调试模式" icon={Bug} active={debugMode} onClick={toggleDebug} />

        <div className="flex items-center justify-between h-14 px-4">
          <span className="text-[14px] font-medium text-[var(--win-text)]">更新通道</span>
          <div className="flex gap-1">
            {['stable', 'beta'].map((ch) => (
              <button
                key={ch}
                onClick={() => setUpdateChannel(ch)}
                className={
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors ' +
                  (updateChannel === ch
                    ? 'bg-[var(--win-accent)] text-white'
                    : 'bg-[var(--win-pane)] text-[var(--win-text-secondary)] hover:bg-[var(--win-border-strong)]')
                }
              >
                {ch === 'stable' ? '稳定版' : '测试版'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ======== 更新 ======== */}
      <SectionTitle>更新</SectionTitle>
      <div className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-xl overflow-hidden mb-1">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] text-[var(--win-text-secondary)]">
            <Info size={15} />
            <span>当前版本 v{APP_VERSION}</span>
          </div>
          <div className="flex items-center gap-2">
            {tauriUpdate.checking && (
              <span className="text-xs text-[var(--win-text-tertiary)]">检查中...</span>
            )}
            <button
              onClick={checkUpdate}
              disabled={update.checking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--win-accent)] text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <RefreshCw size={12} className={update.checking || tauriUpdate.checking ? 'animate-spin' : ''} />
              检查更新
            </button>
          </div>
        </div>

        {/* Tauri 自带更新提示 */}
        {tauriUpdate.available && !tauriUpdate.downloading && (
          <div className="mx-4 mb-3 p-3 rounded-lg bg-gradient-to-r from-[#fb7299]/10 to-[#00a1d6]/10 border border-[#fb7299]/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[var(--win-text)]">
                新版本 v{tauriUpdate.info?.version || ''} 可用
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#fb7299] text-white font-medium">自动更新</span>
            </div>
            <button
              onClick={handleTauriDownload}
              className="w-full py-1.5 rounded-lg text-white text-xs font-medium bg-gradient-to-r from-[#fb7299] to-[#00a1d6] hover:opacity-90 transition-opacity"
            >
              立即安装
            </button>
          </div>
        )}

        {/* 传统下载备用 */}
        {update.hasUpdate && update.latest && (
          <div className="mx-4 mb-3 p-3 rounded-lg bg-[var(--win-pane)] border border-[var(--win-border)]">
            <div className="text-sm font-semibold text-[var(--win-text)] mb-1">
              手动下载 v{update.latest.version}
            </div>
            <div className="text-xs text-[var(--win-text-tertiary)] mb-2 max-h-16 overflow-y-auto">
              {update.latest.notes || ''}
            </div>
            <button onClick={handleDownload} className="w-full py-1.5 rounded-lg bg-[var(--win-accent)] text-white text-xs font-medium hover:opacity-90">
              <Download size={12} className="inline mr-1" />下载安装包
            </button>
          </div>
        )}
      </div>

      {/* ======== 关于软件 ======== */}
      <SectionTitle>关于软件</SectionTitle>
      <div className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-xl overflow-hidden mb-1">
        <Link to={`/user/${user.id}`} className="flex items-center gap-3 h-14 px-4 hover:bg-[var(--win-pane)] transition-colors">
          <span className="w-9 h-9 rounded-full bg-[var(--win-pane)] flex items-center justify-center text-[var(--win-text-secondary)]">
            <UserIcon size={18} />
          </span>
          <span className="flex-1 text-left text-[14px] font-medium text-[var(--win-text)]">我的主页</span>
        </Link>
        <div className="h-px bg-[var(--win-border)] mx-4" />

        <Link to={`/user/${user.id}?tab=articles`} className="flex items-center gap-3 h-14 px-4 hover:bg-[var(--win-pane)] transition-colors">
          <span className="w-9 h-9 rounded-full bg-[var(--win-pane)] flex items-center justify-center text-[var(--win-text-secondary)]">
            <FileText size={18} />
          </span>
          <span className="flex-1 text-left text-[14px] font-medium text-[var(--win-text)]">我的文章</span>
        </Link>
        <div className="h-px bg-[var(--win-border)] mx-4" />

        {user.role === 'admin' && (
          <>
            <Link to="/admin" className="flex items-center gap-3 h-14 px-4 hover:bg-[var(--win-pane)] transition-colors">
              <span className="w-9 h-9 rounded-full bg-[var(--win-pane)] flex items-center justify-center text-[var(--win-text-secondary)]">
                <Shield size={18} />
              </span>
              <span className="flex-1 text-left text-[14px] font-medium text-[var(--win-text)]">管理后台</span>
            </Link>
            <div className="h-px bg-[var(--win-border)] mx-4" />
          </>
        )}

        <button onClick={handleLogout} className="w-full flex items-center gap-3 h-14 px-4 hover:bg-red-50 transition-colors">
          <span className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <LogOut size={18} />
          </span>
          <span className="flex-1 text-left text-[14px] font-medium text-red-500">退出登录</span>
        </button>
      </div>

      <div className="flex-1" />

      {/* Footer */}
      <div className="pt-6 pb-2 text-center">
        <p className="text-[11px] text-[var(--win-text-tertiary)]">
          SkyXing v{APP_VERSION}
        </p>
      </div>
    </div>
  );
}