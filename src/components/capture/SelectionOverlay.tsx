import React, { useState, useEffect, useCallback, useRef } from "react";

export type SelectionMode = "region" | "window" | "fullscreen";

interface SelectionOverlayProps {
  mode: SelectionMode;
  onCapture: (region: SelectionRegion) => void;
  onCancel: () => void;
  availableWindows?: WindowInfo[];
}

export interface SelectionRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  mode: SelectionMode;
  windowHwnd?: number;
}

interface WindowInfo {
  hwnd: number;
  title: string;
  className: string;
  bounds: { x: number; y: number; width: number; height: number };
}

interface Point {
  x: number;
  y: number;
}

export function SelectionOverlay({
  mode,
  onCapture,
  onCancel,
  availableWindows = [],
}: SelectionOverlayProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [showWindows, setShowWindows] = useState(false);
  const [cursorPos, setCursorPos] = useState<Point>({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Calculate selection rectangle
  const selectionRect = startPoint && endPoint
    ? {
        x: Math.min(startPoint.x, endPoint.x),
        y: Math.min(startPoint.y, endPoint.y),
        width: Math.abs(endPoint.x - startPoint.x),
        height: Math.abs(endPoint.y - startPoint.y),
      }
    : null;

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (mode !== "region") return;
    setIsSelecting(true);
    setStartPoint({ x: e.clientX, y: e.clientY });
    setEndPoint({ x: e.clientX, y: e.clientY });
  }, [mode]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
    
    if (isSelecting && mode === "region") {
      setEndPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isSelecting, mode]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (!isSelecting || mode !== "region") return;
    setIsSelecting(false);
    
    if (selectionRect && selectionRect.width > 10 && selectionRect.height > 10) {
      onCapture({
        x: Math.round(selectionRect.x),
        y: Math.round(selectionRect.y),
        width: Math.round(selectionRect.width),
        height: Math.round(selectionRect.height),
        mode: "region",
      });
    }
  }, [isSelecting, mode, selectionRect, onCapture]);

  // Handle key down
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "1") {
        // Switch to region mode
      } else if (e.key === "2") {
        // Switch to window mode
        setShowWindows(true);
      } else if (e.key === "3") {
        // Fullscreen
        onCapture({
          x: 0,
          y: 0,
          width: window.screen.width,
          height: window.screen.height,
          mode: "fullscreen",
        });
      } else if (e.key === "Enter" && selectionRect) {
        // Confirm selection
        onCapture({
          x: Math.round(selectionRect.x),
          y: Math.round(selectionRect.y),
          width: Math.round(selectionRect.width),
          height: Math.round(selectionRect.height),
          mode: "region",
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, onCapture, selectionRect]);

  // Handle window selection
  const handleWindowSelect = (window: WindowInfo) => {
    onCapture({
      x: window.bounds.x,
      y: window.bounds.y,
      width: window.bounds.width,
      height: window.bounds.height,
      mode: "window",
      windowHwnd: window.hwnd,
    });
  };

  // Fullscreen capture
  const handleFullscreen = () => {
    onCapture({
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      mode: "fullscreen",
    });
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 cursor-crosshair select-none"
      style={{ background: "rgba(0, 0, 0, 0.3)" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Darkened area with cutout */}
      {selectionRect && mode === "region" && (
        <>
          {/* Top */}
          <div
            className="absolute bg-black/50"
            style={{
              left: 0,
              top: 0,
              right: 0,
              height: selectionRect.y,
            }}
          />
          {/* Bottom */}
          <div
            className="absolute bg-black/50"
            style={{
              left: 0,
              top: selectionRect.y + selectionRect.height,
              right: 0,
              bottom: 0,
            }}
          />
          {/* Left */}
          <div
            className="absolute bg-black/50"
            style={{
              left: 0,
              top: selectionRect.y,
              width: selectionRect.x,
              height: selectionRect.height,
            }}
          />
          {/* Right */}
          <div
            className="absolute bg-black/50"
            style={{
              left: selectionRect.x + selectionRect.width,
              top: selectionRect.y,
              right: 0,
              height: selectionRect.height,
            }}
          />
        </>
      )}

      {/* Selection rectangle */}
      {selectionRect && selectionRect.width > 0 && selectionRect.height > 0 && (
        <div
          className="absolute border-2 border-blue-500 bg-transparent"
          style={{
            left: selectionRect.x,
            top: selectionRect.y,
            width: selectionRect.width,
            height: selectionRect.height,
          }}
        >
          {/* Size indicator */}
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
            style={{ display: mode === "region" ? "block" : "none" }}
          >
            {selectionRect.width} × {selectionRect.height}
          </div>

          {/* Corner handles */}
          {["nw", "ne", "sw", "se"].map((corner) => (
            <div
              key={corner}
              className="absolute w-3 h-3 bg-white border-2 border-blue-500"
              style={{
                ...(corner.includes("n") ? { top: -2, transform: "translateY(-50%)" } : { bottom: -2, transform: "translateY(50%)" }),
                ...(corner.includes("w") ? { left: -2, transform: "translateX(-50%)" } : { right: -2, transform: "translateX(50%)" }),
              }}
            />
          ))}
        </div>
      )}

      {/* Coordinate display */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1.5 rounded font-mono"
        style={{ display: mode === "region" ? "block" : "none" }}
      >
        X: {cursorPos.x} | Y: {cursorPos.y}
      </div>

      {/* Mode switcher */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/80 rounded-lg p-1">
        <button
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            mode === "region"
              ? "bg-blue-500 text-white"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
          onClick={() => {/* Switch to region mode */}}
        >
          Region (1)
        </button>
        <button
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            mode === "window"
              ? "bg-blue-500 text-white"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
          onClick={() => setShowWindows(!showWindows)}
        >
          Window (2)
        </button>
        <button
          className="px-4 py-2 rounded text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          onClick={handleFullscreen}
        >
          Fullscreen (3)
        </button>
      </div>

      {/* Cancel button */}
      <button
        className="fixed top-4 right-4 w-10 h-10 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
        onClick={onCancel}
        title="Cancel (Esc)"
      >
        ✕
      </button>

      {/* Window selection list */}
      {showWindows && mode === "window" && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-96 max-h-96 overflow-y-auto bg-black/90 rounded-lg shadow-xl">
          <div className="sticky top-0 bg-black/95 px-4 py-2 border-b border-white/10">
            <h3 className="text-white font-medium">Select Window</h3>
            <p className="text-gray-400 text-xs">Click to capture window</p>
          </div>
          <div className="p-2">
            {availableWindows.length === 0 ? (
              <p className="text-gray-400 text-sm p-4 text-center">No windows available</p>
            ) : (
              availableWindows.map((win) => (
                <button
                  key={win.hwnd}
                  className="w-full text-left p-3 rounded hover:bg-white/10 transition-colors group"
                  onClick={() => handleWindowSelect(win)}
                >
                  <div className="text-white text-sm font-medium truncate">
                    {win.title || "Untitled"}
                  </div>
                  <div className="text-gray-400 text-xs mt-0.5">
                    {win.bounds.width} × {win.bounds.height}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="fixed bottom-4 right-4 text-gray-400 text-xs">
        <span className="bg-black/60 px-2 py-1 rounded">Esc to cancel</span>
        {mode === "region" && (
          <>
            <span className="ml-2 bg-black/60 px-2 py-1 rounded">Enter to confirm</span>
          </>
        )}
      </div>
    </div>
  );
}

export default SelectionOverlay;
