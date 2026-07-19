import { useState } from 'react';
import { AlertTriangle, ExternalLink, Copy, RefreshCw, X } from 'lucide-react';
import { openExternal } from '../lib/openExternal';

const ISSUES_URL = 'https://github.com/kairuirain/skyxing-app/issues/new';

function buildIssueUrl(error) {
  const msg = (error?.message || '未知错误').toString().slice(0, 60);
  const title = encodeURIComponent(`[Bug] 应用异常：${msg}`);
  const body = encodeURIComponent(
    `### 问题描述\n应用运行时出现异常，请描述复现步骤：\n\n### 错误信息\n\`\`\`\n${(error?.stack || error?.message || error || '').toString()}\n\`\`\`\n\n### 环境\n- 版本：${__APP_VERSION__}\n- 平台：${__APP_PLATFORM__}\n- User Agent：${typeof navigator !== 'undefined' ? navigator.userAgent : ''}\n`
  );
  return `${ISSUES_URL}?title=${title}&body=${body}`;
}

// 全局错误弹窗：提示用户前往 GitHub 仓库提交 Issue
export default function ErrorReportModal({ error, onClose, fatal = false }) {
  const [copied, setCopied] = useState(false);
  if (!error) return null;

  const text = (error.stack || error.message || String(error)).toString();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
      <div className="w-[400px] max-w-full rounded-2xl overflow-hidden shadow-2xl bg-[var(--win-card)] animate-scaleIn border border-[var(--win-border)]">
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 bg-gradient-to-br from-red-500/10 to-amber-500/5">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[16px] font-bold text-[var(--win-text)]">软件运行出现异常</h2>
            <p className="text-[12px] text-[var(--win-text-secondary)] mt-0.5">
              可将此问题提交到 GitHub 仓库，方便开发者定位并修复。
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--win-text-tertiary)] hover:bg-[var(--win-pane-hover)] transition-colors shrink-0"
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pb-4">
          <div className="max-h-32 overflow-y-auto win-scroll rounded-lg bg-[var(--win-pane)] p-3 text-[11px] font-mono text-[var(--win-text-secondary)] whitespace-pre-wrap break-words">
            {text.slice(0, 800)}
          </div>

          <div className="mt-4 space-y-2">
            <button
              onClick={() => openExternal(buildIssueUrl(error))}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-[#fb7299] to-[#00a1d6] hover:opacity-90 transition-opacity"
            >
              <ExternalLink size={15} /> 在 GitHub 提交 Issue
            </button>
            <div className="flex gap-2">
              <button
                onClick={copy}
                className="flex-1 py-2 rounded-xl text-[var(--win-text)] text-sm font-medium border border-[var(--win-border-strong)] hover:bg-[var(--win-pane-hover)] transition-colors"
              >
                {copied ? '已复制' : '复制错误信息'}
              </button>
              {fatal && (
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border border-[var(--win-border-strong)] hover:bg-[var(--win-pane-hover)] transition-colors text-[var(--win-text)]"
                >
                  <RefreshCw size={14} /> 重新加载
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
