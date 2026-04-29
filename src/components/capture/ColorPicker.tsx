import React, { useState, useEffect, useRef } from "react";

interface ColorPickerProps {
  position: { x: number; y: number };
  onColorSelect: (color: string) => void;
  onClose: () => void;
  initialColor?: string;
}

interface PixelColor {
  r: number;
  g: number;
  b: number;
  hex: string;
}

export function ColorPicker({ 
  position, 
  onColorSelect, 
  onClose,
  initialColor = "#000000",
}: ColorPickerProps) {
  const [color] = useState<PixelColor>(() => {
    // Parse initial color
    const hex = initialColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r: isNaN(r) ? 0 : r, g: isNaN(g) ? 0 : g, b: isNaN(b) ? 0 : b, hex: initialColor };
  });
  const previewRef = useRef<HTMLDivElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" || e.key === " ") {
        onColorSelect(color.hex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [color, onColorSelect, onClose]);

  // Position picker near cursor
  const pickerStyle: React.CSSProperties = {
    position: "fixed",
    left: Math.min(position.x + 10, window.innerWidth - 200),
    top: Math.min(position.y + 10, window.innerHeight - 150),
    zIndex: 10000,
  };

  return (
    <div
      style={pickerStyle}
      className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-3 min-w-[180px]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Color Picker
        </h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Color preview */}
      <div className="flex gap-3 mb-3">
        <div
          ref={previewRef}
          className="w-16 h-16 rounded-lg border-2 border-gray-200 dark:border-gray-700"
          style={{ backgroundColor: color.hex }}
        />
        <div className="flex-1 space-y-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-mono">#{color.hex.toUpperCase()}</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 font-mono">
            RGB({color.r}, {color.g}, {color.b})
          </div>
        </div>
      </div>

      {/* Quick colors */}
      <div className="grid grid-cols-6 gap-1 mb-3">
        {[
          "#FF0000", "#00FF00", "#0000FF",
          "#FFFF00", "#FF00FF", "#00FFFF",
          "#000000", "#FFFFFF", "#808080",
          "#800000", "#008000", "#000080",
        ].map((c) => (
          <button
            key={c}
            className="w-6 h-6 rounded border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform"
            style={{ backgroundColor: c }}
            onClick={() => onColorSelect(c)}
            title={c}
          />
        ))}
      </div>

      {/* Copy button */}
      <button
        className="w-full py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
        onClick={() => {
          navigator.clipboard.writeText(color.hex);
          onColorSelect(color.hex);
        }}
      >
        Copy Color ({color.hex})
      </button>

      {/* Help text */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        Click to copy • Esc to close
      </div>
    </div>
  );
}

export default ColorPicker;
