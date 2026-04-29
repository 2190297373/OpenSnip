import { useCanvas, ToolType } from "./CanvasContext";

interface ToolButtonProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

function ToolButton({ icon, label, active, onClick }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
        active
          ? "bg-blue-500 text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
      title={label}
    >
      <span className="text-lg">{icon}</span>
    </button>
  );
}

interface ColorButtonProps {
  color: string;
  active: boolean;
  onClick: () => void;
}

function ColorButton({ color, active, onClick }: ColorButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-6 h-6 rounded-full border-2 transition-transform ${
        active ? "border-blue-500 scale-110" : "border-gray-300"
      }`}
      style={{ backgroundColor: color }}
      title={color}
    />
  );
}

export function AnnotationToolbar() {
  const { state, setTool, setStyle, undo, redo, clearAll } = useCanvas();

  const tools: { type: ToolType; icon: string; label: string }[] = [
    { type: "select", icon: "↖", label: "Select (V)" },
    { type: "rectangle", icon: "□", label: "Rectangle (R)" },
    { type: "ellipse", icon: "○", label: "Ellipse (E)" },
    { type: "line", icon: "/", label: "Line (L)" },
    { type: "arrow", icon: "→", label: "Arrow (A)" },
    { type: "pencil", icon: "✏", label: "Pencil (P)" },
    { type: "text", icon: "T", label: "Text (T)" },
    { type: "highlighter", icon: "▬", label: "Highlighter (H)" },
    { type: "mosaic", icon: "▦", label: "Mosaic (M)" },
    { type: "blur", icon: "◯", label: "Blur (B)" },
    { type: "spotlight", icon: "◎", label: "Spotlight (S)" },
    { type: "numbering", icon: "①", label: "Numbering (N)" },
  ];

  const colors = [
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#000000", // Black
    "#FFFFFF", // White
  ];

  const strokeWidths = [1, 2, 4, 6, 8];

  return (
    <div className="flex items-center gap-4 p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Tools */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => (
          <ToolButton
            key={tool.type}
            icon={tool.icon}
            label={tool.label}
            active={state.tool === tool.type}
            onClick={() => setTool(tool.type)}
          />
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />

      {/* Colors */}
      <div className="flex items-center gap-1">
        {colors.map((color) => (
          <ColorButton
            key={color}
            color={color}
            active={state.style.strokeColor === color}
            onClick={() => setStyle({ strokeColor: color })}
          />
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />

      {/* Stroke width */}
      <div className="flex items-center gap-1">
        {strokeWidths.map((width) => (
          <button
            key={width}
            onClick={() => setStyle({ strokeWidth: width })}
            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
              state.style.strokeWidth === width
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title={`${width}px`}
          >
            <div
              className="rounded-full bg-current"
              style={{
                width: Math.min(width * 2, 16),
                height: Math.min(width * 2, 16),
              }}
            />
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />

      {/* Dashed line toggle */}
      <button
        onClick={() => setStyle({ dashed: !state.style.dashed })}
        className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
          state.style.dashed
            ? "bg-blue-500 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Dashed Line"
      >
        <span className="text-lg">- -</span>
      </button>

      {/* Arrow head toggle */}
      <button
        onClick={() =>
          setStyle({
            arrowHead: state.style.arrowHead === "none" ? "triangle" : "none",
          })
        }
        className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
          state.style.arrowHead !== "none"
            ? "bg-blue-500 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Arrow Head"
      >
        <span className="text-lg">→</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={state.historyIndex < 0}
          className="w-10 h-10 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          title="Undo (Ctrl+Z)"
        >
          ↩
        </button>
        <button
          onClick={redo}
          disabled={state.historyIndex >= state.history.length - 1}
          className="w-10 h-10 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          title="Redo (Ctrl+Y)"
        >
          ↪
        </button>
      </div>

      {/* Clear */}
      <button
        onClick={clearAll}
        className="w-10 h-10 flex items-center justify-center rounded text-red-500 hover:bg-red-50"
        title="Clear All"
      >
        🗑
      </button>
    </div>
  );
}

export default AnnotationToolbar;
