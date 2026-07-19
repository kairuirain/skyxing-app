import { ChevronRight } from 'lucide-react';

// 统一列表容器
export function MenuList({ children, className = '' }) {
  return (
    <div className={'bg-[var(--win-card)] border border-[var(--win-border)] rounded-xl overflow-hidden ' + className}>
      {children}
    </div>
  );
}

// 统一列表行：图标 + 标题/描述 + 右侧值或箭头
export function MenuRow({ icon: Icon, label, desc, value, onClick, danger, trailing, showChevron = true }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={
        'w-full flex items-center gap-3 px-4 h-14 text-left outline-none transition-colors duration-100 ' +
        (onClick ? 'active:bg-[var(--win-pane-pressed)] cursor-pointer ' : '') +
        (danger ? 'hover:bg-red-50 ' : 'hover:bg-[var(--win-pane-hover)] ')
      }
    >
      {Icon && (
        <span
          className={
            'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ' +
            (danger ? 'bg-red-50 text-red-500' : 'bg-[var(--win-pane)] text-[var(--win-text-secondary)]')
          }
        >
          <Icon size={18} strokeWidth={1.8} />
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className={'block text-[14px] font-medium ' + (danger ? 'text-red-500' : 'text-[var(--win-text)]')}>{label}</span>
        {desc && <span className="block text-[11px] text-[var(--win-text-tertiary)] truncate">{desc}</span>}
      </span>
      {value && <span className="text-[13px] text-[var(--win-text-tertiary)] truncate max-w-[45%]">{value}</span>}
      {trailing}
      {onClick && !trailing && showChevron && <ChevronRight size={18} className="text-[var(--win-text-tertiary)] shrink-0" />}
    </Wrapper>
  );
}

export function MenuDivider() {
  return <div className="h-px bg-[var(--win-border)] mx-4" />;
}

export function MenuSectionTitle({ children }) {
  return (
    <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[var(--win-text-tertiary)] mt-6 mb-2 px-1">
      {children}
    </h3>
  );
}
