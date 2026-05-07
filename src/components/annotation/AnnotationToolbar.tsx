import { useCanvas, ToolType } from "./CanvasContext";

export function AnnotationToolbar() {
  const { state, setTool, setStyle, undo, redo } = useCanvas();

  const tools: { type: ToolType; icon: string; label: string }[] = [
    { type: "select", icon: "↖", label: "选择" },
    { type: "rectangle", icon: "□", label: "矩形" },
    { type: "ellipse", icon: "○", label: "椭圆" },
    { type: "arrow", icon: "→", label: "箭头" },
    { type: "line", icon: "/", label: "直线" },
    { type: "pencil", icon: "✏", label: "画笔" },
    { type: "text", icon: "T", label: "文字" },
    { type: "mosaic", icon: "▦", label: "马赛克" },
    { type: "blur", icon: "◯", label: "模糊" },
    { type: "highlight", icon: "▬", label: "高亮" },
    { type: "numbering", icon: "①", label: "编号" },
  ];

  const colors = ["#FF0000", "#00AA00", "#0066FF", "#FF6600", "#FF00FF", "#00AAAA"];

  return (
    <div className="flex items-center justify-center gap-0.5 px-2 py-1 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      {/* Tools */}
      {tools.map((tool) => (
        <button
          key={tool.type}
          onClick={() => setTool(tool.type)}
          className={`w-8 h-7 flex items-center justify-center rounded text-xs transition-colors ${
            state.tool === tool.type
              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
              : "text-[var(--color-text-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)]"
          }`}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
      <div className="w-px h-4 bg-[var(--color-border)] mx-1" />
      {/* Colors */}
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => setStyle({ strokeColor: c })}
          className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${state.style.strokeColor === c ? "border-blue-500 scale-110" : "border-[var(--color-border)]"}`}
          style={{ backgroundColor: c }} title={c}
        />
      ))}
      <div className="w-px h-4 bg-[var(--color-border)] mx-1" />
      {/* Stroke */}
      {[2, 4, 6].map((w) => (
        <button
          key={w}
          onClick={() => setStyle({ strokeWidth: w })}
          className={`w-6 h-5 flex items-center justify-center rounded text-xs ${state.style.strokeWidth === w ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" : "text-[var(--color-text-muted)] hover:bg-[var(--color-background)]"}`}
          title={`${w}px`}
        >
          <span style={{ fontSize: Math.min(w * 3, 12) }}>●</span>
        </button>
      ))}
      <div className="w-px h-4 bg-[var(--color-border)] mx-1" />
      {/* Fill toggle */}
      <button onClick={() => setStyle({ fillColor: state.style.fillColor ? null : state.style.strokeColor + "30" })}
        className={`w-6 h-5 flex items-center justify-center rounded text-xs ${state.style.fillColor ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" : "text-[var(--color-text-muted)] hover:bg-[var(--color-background)]"}`}
        title="填充">⬛</button>
      {/* Undo/Redo */}
      <button onClick={undo} disabled={state.historyIndex < 0}
        className="w-6 h-5 flex items-center justify-center rounded text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-background)] disabled:opacity-30" title="撤销">↩</button>
      <button onClick={redo} disabled={state.historyIndex >= state.history.length - 1}
        className="w-6 h-5 flex items-center justify-center rounded text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-background)] disabled:opacity-30" title="重做">↪</button>
    </div>
  );
}

export default AnnotationToolbar;
