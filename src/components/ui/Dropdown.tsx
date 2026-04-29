import { useState, useRef, useEffect, type ReactNode } from "react";

interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  onSelect?: (id: string) => void;
}

export function Dropdown({ trigger, items, onSelect }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 min-w-[160px] animate-scale-in">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] overflow-hidden py-1">
            {items.map((item, i) =>
              item.divider ? (
                <div key={`div-${i}`} className="h-px bg-[var(--color-border)] my-1" />
              ) : (
                <button
                  key={item.id}
                  onClick={() => { onSelect?.(item.id); setOpen(false); }}
                  className={[
                    "w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left",
                    "hover:bg-[var(--color-background)] transition-colors",
                    item.danger ? "text-[var(--color-error)]" : "text-[var(--color-text)]",
                  ].join(" ")}
                >
                  {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
