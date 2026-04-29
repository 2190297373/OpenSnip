import React from "react";
import { Tooltip } from "../ui";

interface ToolbarButton {
  id: string;
  icon: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
}

interface ToolbarProps {
  tools: ToolbarButton[];
  onToolClick?: (id: string) => void;
  title?: string;
  actions?: React.ReactNode;
}

const iconMap: Record<string, string> = {
  screenshot: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
  region: "M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2",
  window: "M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",
  scroll: "M4 6h16M4 12h16M4 18h16",
  record: "M12 2a3 3 0 00-3 3v4a3 3 0 006 0V5a3 3 0 00-3-3zM7 14a6 6 0 1012 0H7z",
  ocr: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1",
  pin: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
  rect: "M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z",
  ellipse: "M12 4a8 4 0 100 16 8 4 0 000-16z",
  arrow: "M17 8l4 4m0 0l-4 4m4-4H3",
  line: "M4 20L20 4",
  pencil: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
  text: "M4 6h16M4 12h16M4 18h10",
  mosaic: "M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4z",
  blur: "M12 4a8 8 0 100 16 8 8 0 000-16zM12 8v4l2 2",
  eraser: "M19.071 4.929a2 2 0 00-2.828 0L5.586 15.586a2 2 0 000 2.828l7.071 7.071a2 2 0 002.828 0l10.657-10.657a2 2 0 000-2.828l-7.071-7.071z",
  undo: "M3 10h10a5 5 0 015 5v2M3 10l6 6M3 10l6-6",
  redo: "M21 10H11a5 5 0 00-5 5v2m15-7l-6 6m6-6l-6-6",
  save: "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3M8 7a2 2 0 100-4 2 2 0 000 4zM8 7l4-4m4 4l-4 4",
  copy: "M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-3M18 5a2 2 0 100-4 2 2 0 000 4z",
};

export function Toolbar({ tools, onToolClick, title = "OpenSnip", actions }: ToolbarProps) {
  return (
    <div
      className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      data-tauri-drag-region
    >
      {/* Title */}
      <span className="text-sm font-medium text-[var(--color-text-muted)] mr-2">{title}</span>

      {/* Tool buttons */}
      <div className="flex items-center gap-0.5">
        {tools.map((tool) => (
          <Tooltip key={tool.id} content={tool.label} position="bottom">
            <button
              onClick={() => onToolClick?.(tool.id)}
              disabled={tool.disabled}
              title={tool.label}
              className={[
                "flex items-center justify-center w-8 h-8 rounded-[var(--radius-sm)]",
                "transition-colors duration-100",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                tool.active
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)]",
              ].join(" ")}
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={iconMap[tool.icon] || iconMap.rect} />
              </svg>
            </button>
          </Tooltip>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      {actions}
    </div>
  );
}
