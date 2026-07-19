import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTransition } from '../context/TransitionContext';

// 二级菜单路由路径前缀（使用 SlideOutlet 全屏滑入）
const SLIDE_ROUTES = ['/account/', '/settings', '/privacy', '/notifications', '/admin'];

// 子页面统一头部：返回按钮 + 标题
export default function SubPageHeader({ title, subtitle, onBack, right }) {
  const { goBack, slideBack } = useTransition();
  const location = useLocation();
  const isSlide = SLIDE_ROUTES.some(p => location.pathname.startsWith(p));
  const handleBack = onBack || (isSlide ? slideBack : goBack);

  return (
    <div className="sticky top-0 z-30 bg-[var(--win-bg)]/90 backdrop-blur border-b border-[var(--win-border)] px-3 h-14 flex items-center gap-1 animate-fadeIn">
      <button
        onClick={handleBack}
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
