import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import { isAndroid } from '../lib/platform';
import api from '../lib/api';
import SubPageHeader from '../components/SubPageHeader';
import { Palette, Download, MessageSquare, Info, RefreshCw, Sun, Moon, ExternalLink, Check } from 'lucide-react';
import { openExternal } from '../lib/openExternal';

const APP_VERSION = __APP_VERSION__;
const ISSUES_URL = 'https://github.com/kairuirain/skyxing-app/issues/new';
const REPO_URL = 'https://github.com/kairuirain/skyxing-app';

function getPlatform() {
  return isAndroid() ? 'android' : 'app';
}

function SectionTitle({ icon: Icon, children, desc }) {
  return (
    <div className="flex items-center gap-2 px-1 mt-6 mb-2">
      <Icon size={16} className="text-[var(--win-text-tertiary)]" />
      <h3 className="text-[14px] font-semibold text-[var(--win-text)]">{children}</h3>
      {desc && <span className="text-[11px] text-[var(--win-text-tertiary)]">· {desc}</span>}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useSettings();

  const [update, setUpdate] = useState({ checking: false, error: null, hasUpdate: false, latest: null, checked: false });

  const checkUpdate = useCallback(async () => {
    setUpdate((u) => ({ ...u, checking: true, error: null }));
    try {
      const data = await api.checkUpdate(getPlatform(), APP_VERSION, 'stable');
      setUpdate((u) => ({ ...u, checking: false, checked: true, hasUpdate: data.hasUpdate, latest: data.release }));
    } catch (e) {
      setUpdate((u) => ({ ...u, checking: false, error: e.message || '检查失败' }));
    }
  }, []);

  useEffect(() => { checkUpdate(); }, [checkUpdate]);

  const handleDownload = () => {
    const url = update.latest?.download?.recommendedUrl || update.latest?.download?.url;
    if (url) openExternal(url);
  };

  return (
    <div className="min-h-full flex flex-col animate-fadeIn">
      <SubPageHeader title="设置" subtitle="个性化 · 更新 · 反馈 · 关于" />

      <div className="flex-1 overflow-y-auto win-scroll px-4 py-4 space-y-1">
        {/* 个性化 */}
        <SectionTitle icon={Palette} desc="外观主题">个性化</SectionTitle>
        <div className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-2xl p-2 animate-fadeInUp">
          <div className="flex gap-2 p-2">
            {[
              { key: 'light', label: '浅色', icon: Sun },
              { key: 'dark', label: '深色', icon: Moon },
            ].map((opt) => {
              const Icon = opt.icon;
              const active = theme === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setTheme(opt.key)}
                  className={
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors ' +
                    (active
                      ? 'border-[var(--win-accent)] bg-[var(--win-accent-soft)] text-[var(--win-accent)]'
                      : 'border-[var(--win-border)] text-[var(--win-text-secondary)] hover:bg-[var(--win-pane-hover)]')
                  }
                >
                  <Icon size={16} /> {opt.label}
                  {active && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 更新 */}
        <SectionTitle icon={Download} desc="检查新版本">更新</SectionTitle>
        <div className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-2xl p-4 animate-fadeInUp">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[13px] text-[var(--win-text-secondary)]">
              <Info size={15} /> <span>当前版本 v{APP_VERSION}</span>
            </div>
            <button
              onClick={checkUpdate} disabled={update.checking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--win-accent)] text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <RefreshCw size={12} className={update.checking ? 'animate-spin' : ''} />
              {update.checking ? '检查中...' : '检查更新'}
            </button>
          </div>
          {update.hasUpdate && update.latest && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-[#fb7299]/10 to-[#00a1d6]/10 border border-[#fb7299]/20 mb-2 animate-fadeInUp">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--win-text)]">新版本 v{update.latest.version} 可用</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#fb7299] text-white font-medium">OTA</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-1.5 rounded-lg text-white text-xs font-medium bg-gradient-to-r from-[#fb7299] to-[#00a1d6] hover:opacity-90 transition-opacity"
              >
                下载安装包
              </button>
            </div>
          )}
          {update.checked && !update.hasUpdate && !update.error && (
            <p className="text-[12px] text-green-600">已是最新版本</p>
          )}
          {update.error && <p className="text-[12px] text-red-500">{update.error}</p>}
        </div>

        {/* 反馈 */}
        <SectionTitle icon={MessageSquare} desc="问题反馈">反馈</SectionTitle>
        <div className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-2xl p-4 animate-fadeInUp">
          <p className="text-[12px] text-[var(--win-text-tertiary)] mb-3">遇到问题或有建议？欢迎到 GitHub 提交 Issue。</p>
          <button
            onClick={() => openExternal(ISSUES_URL)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[var(--win-text)] font-medium text-sm border border-[var(--win-border-strong)] hover:bg-[var(--win-pane-hover)] transition-colors"
          >
            <ExternalLink size={15} /> 前往 GitHub 提交反馈
          </button>
        </div>

        {/* 关于软件 */}
        <SectionTitle icon={Info} desc="版本与开源">关于软件</SectionTitle>
        <div className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-2xl p-4 animate-fadeInUp">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#fb7299] to-[#00a1d6] flex items-center justify-center text-white font-bold shadow-md">S</div>
            <div>
              <div className="text-[15px] font-bold text-[var(--win-text)]">SkyXing</div>
              <div className="text-[12px] text-[var(--win-text-tertiary)]">跨平台博客 · 全端同步</div>
            </div>
          </div>
          <button
            onClick={() => openExternal(REPO_URL)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[var(--win-text-secondary)] text-sm border border-[var(--win-border)] hover:bg-[var(--win-pane-hover)] transition-colors"
          >
            <ExternalLink size={14} /> 开源仓库
          </button>
          <p className="text-center text-[11px] text-[var(--win-text-tertiary)] mt-3">版本 v{APP_VERSION} · MIT License</p>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
