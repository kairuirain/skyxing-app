import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// 子页面统一头部：返回按钮 + 标题（可选副标题/右侧操作）
export default function SubPageHeader({ title, subtitle, onBack, right }) {
  const navigate = useNavigate();
  const goBack = onBack || (() => navigate(-1));

  return (
    <div className="sticky top-0 z-30 bg-[var(--win-bg)]/90 backdrop-blur border-b border-[var(--win-border)] px-3 h-14 flex items-center gap-1 animate-fadeIn">
      <button
        onClick={goBack}
        className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-[var(--win-text-secondary)] hover:bg-[var(--win-pane-hover)] active:bg-[var(--win-pane-pressed)] transition-colors outline-none"
        aria-label="返回"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-[16px] font-semibold text-[var(--win-text)] truncate">{title}</h1>
        {subtitle && <p className="text-[11px] text-[var(--win-text-tertiary)] truncate">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
