import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full px-3 py-1.5 rounded-[var(--radius-md)]",
            "bg-[var(--color-surface)] text-[var(--color-text)]",
            "border border-[var(--color-border)]",
            "placeholder:text-[var(--color-text-muted)]",
            "focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error ? "border-[var(--color-error)]" : "",
            className,
          ].join(" ")}
          {...props}
        />
        {error && <span className="text-xs text-[var(--color-error)]">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
