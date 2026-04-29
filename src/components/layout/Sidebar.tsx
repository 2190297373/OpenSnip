interface SidebarProps {
  items: { id: string; label: string; icon?: string }[];
  activeId?: string;
  onSelect?: (id: string) => void;
}

const iconMap: Record<string, string> = {
  capture: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5z",
  annotate: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l4.586-4.586z",
  pin: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
  recording: "M12 2a3 3 0 00-3 3v4a3 3 0 006 0V5a3 3 0 00-3-3z",
  ocr: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
};

export function Sidebar({ items, activeId, onSelect }: SidebarProps) {
  return (
    <div className="w-56 flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)] h-full">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect?.(item.id)}
          className={[
            "flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors",
            "hover:bg-[var(--color-background)]",
            item.id === activeId
              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-r-2 border-[var(--color-primary)]"
              : "text-[var(--color-text)]",
          ].join(" ")}
        >
          {item.icon && (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={iconMap[item.icon] || iconMap.capture} />
            </svg>
          )}
          {item.label}
        </button>
      ))}
    </div>
  );
}
