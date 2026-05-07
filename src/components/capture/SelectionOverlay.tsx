import React, { useState, useEffect, useCallback, useRef } from "react";

export type SelectionMode = "region" | "window" | "fullscreen";

interface SelectionOverlayProps {
  mode: SelectionMode;
  onCapture: (region: SelectionRegion) => void;
  onCancel: () => void;
}

export interface SelectionRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  mode: SelectionMode;
  windowHwnd?: number;
}

interface Point { x: number; y: number; }

export function SelectionOverlay({ mode, onCapture, onCancel }: SelectionOverlayProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [cursorPos, setCursorPos] = useState<Point>({ x: 0, y: 0 });

  const rect = startPoint && endPoint
    ? { x: Math.min(startPoint.x, endPoint.x), y: Math.min(startPoint.y, endPoint.y), width: Math.abs(endPoint.x - startPoint.x), height: Math.abs(endPoint.y - startPoint.y) }
    : null;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (mode !== "region") return;
    setIsSelecting(true);
    setStartPoint({ x: e.clientX, y: e.clientY });
    setEndPoint({ x: e.clientX, y: e.clientY });
  }, [mode]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
    if (isSelecting && mode === "region") setEndPoint({ x: e.clientX, y: e.clientY });
  }, [isSelecting, mode]);

  const onMouseUp = useCallback(() => {
    if (!isSelecting || !rect || rect.width < 5 || rect.height < 5) return;
    setIsSelecting(false);
    onCapture({ x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), mode: "region" });
  }, [isSelecting, rect, onCapture]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if ((e.key === "Enter" || e.key === " ") && rect && rect.width > 5) onCapture({ x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), mode: "region" });
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onCancel, onCapture, rect]);

  return (
    <div ref={useRef<HTMLDivElement>(null)} className="fixed inset-0 z-50 cursor-crosshair select-none" style={{ background: "rgba(0,0,0,0.28)" }}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>

      {/* Selection cutout */}
      {rect && rect.width > 0 && mode === "region" && (<>
        <div className="absolute bg-black/40" style={{ left: 0, top: 0, right: 0, height: rect.y }} />
        <div className="absolute bg-black/40" style={{ left: 0, top: rect.y + rect.height, right: 0, bottom: 0 }} />
        <div className="absolute bg-black/40" style={{ left: 0, top: rect.y, width: rect.x, height: rect.height }} />
        <div className="absolute bg-black/40" style={{ left: rect.x + rect.width, top: rect.y, right: 0, height: rect.height }} />
      </>)}

      {/* Selection border + size label */}
      {rect && rect.width > 0 && rect.height > 0 && (
        <div className="absolute border-2 border-blue-400/80 rounded-sm" style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}>
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2.5 py-1 rounded-lg font-mono whitespace-nowrap shadow-lg">
            {rect.width} × {rect.height}
          </div>
          {/* Corner dots */}
          {["nw","ne","sw","se"].map(c => (
            <div key={c} className="absolute w-2.5 h-2.5 bg-blue-400 border-2 border-white rounded-full"
              style={{ ...(c[0]==="n"?{top:-4}:{bottom:-4}), ...(c[1]==="w"?{left:-4}:{right:-4}) }} />
          ))}
        </div>
      )}

      {/* Cursor crosshair — follows mouse during selection */}
      {(mode === "region" || isSelecting) && (
        <div className="fixed pointer-events-none z-50" style={{ left: cursorPos.x, top: cursorPos.y }}>
          <div className="absolute w-4 h-px bg-blue-400/60 -translate-x-1/2" />
          <div className="absolute h-4 w-px bg-blue-400/60 -translate-y-1/2" />
          <div className="absolute -top-10 left-4 bg-black/80 text-[10px] text-blue-300 font-mono px-1.5 py-0.5 rounded whitespace-nowrap shadow">
            {cursorPos.x}, {cursorPos.y}
          </div>
        </div>
      )}

      {/* Top mode bar — compact */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 flex bg-black/70 backdrop-blur-sm rounded-xl p-1 gap-0.5 shadow-xl">
        {(["region","fullscreen"] as SelectionMode[]).map(m => (
          <button key={m} onClick={() => m === "fullscreen" ? onCapture({x:0,y:0,width:window.screen.width,height:window.screen.height,mode:"fullscreen"}) : null}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === m ? "bg-blue-500/80 text-white" : "text-gray-300 hover:text-white hover:bg-white/10"}`}>
            {m === "region" ? "📐 区域" : "🖥 全屏"}
          </button>
        ))}
        <div className="w-px bg-white/10 mx-1" />
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-red-500/30 transition-colors">✕ 取消</button>
      </div>

      {/* Bottom help */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 text-[10px] text-gray-400">
        <span className="bg-black/50 px-2 py-1 rounded-full">拖拽框选</span>
        <span className="bg-black/50 px-2 py-1 rounded-full">Enter 确认</span>
        <span className="bg-black/50 px-2 py-1 rounded-full">Esc 取消</span>
      </div>
    </div>
  );
}

export default SelectionOverlay;
