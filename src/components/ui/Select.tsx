import { useState, useRef, useEffect } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function Select({ options, value, onChange, label, placeholder = "Select...", className = "" }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

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
    <div ref={ref} className={`relative flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={[
          "flex items-center justify-between",
          "w-full px-3 py-1.5 rounded-[var(--radius-md)]",
          "bg-[var(--color-surface)] text-[var(--color-text)]",
          "border border-[var(--color-border)]",
          "text-left text-sm",
          "hover:border-[var(--color-primary)] transition-colors",
        ].join(" ")}
      >
        <span className={selected ? "" : "text-[var(--color-text-muted)]"}>
          {selected?.label || placeholder}
        </span>
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 animate-scale-in">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange?.(opt.value); setOpen(false); }}
                className={[
                  "w-full px-3 py-2 text-left text-sm",
                  "hover:bg-[var(--color-background)]",
                  "transition-colors",
                  opt.value === value ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-text)]",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
