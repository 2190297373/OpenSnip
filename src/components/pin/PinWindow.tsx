import React, { useState, useRef, useEffect, useCallback } from "react";

export type PinType = "image" | "text" | "mixed" | "ocr" | "translation";

export interface PinStyle {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  shadowEnabled: boolean;
  shadowOffset: number;
  shadowBlur: number;
  alwaysOnTop: boolean;
  opacity: number;
  showTitleBar: boolean;
}

export interface PinContent {
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  text?: string;
  ocrText?: string;
  translation?: string;
}

export interface Pin {
  id: string;
  pinType: PinType;
  content: PinContent;
  x: number;
  y: number;
  width: number;
  height: number;
  style: PinStyle;
  zIndex: number;
  isPinned: boolean;
  isMinimized: boolean;
  isLocked: boolean;
}

interface PinWindowProps {
  pin: Pin;
  onClose: () => void;
  onUpdatePosition: (x: number, y: number) => void;
  onUpdateSize: (width: number, height: number) => void;
  onBringToFront: () => void;
  onToggleLock: () => void;
  onToggleMinimize: () => void;
  children?: React.ReactNode;
}

export function PinWindow({
  pin,
  onClose,
  onUpdatePosition,
  onUpdateSize,
  onBringToFront,
  onToggleLock,
  onToggleMinimize,
  children,
}: PinWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Handle dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (pin.isLocked || pin.isMinimized) return;
      if ((e.target as HTMLElement).closest(".pin-toolbar")) return;
      
      e.preventDefault();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - pin.x,
        y: e.clientY - pin.y,
      });
      onBringToFront();
    },
    [pin.isLocked, pin.isMinimized, pin.x, pin.y, onBringToFront]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      onUpdatePosition(
        Math.max(0, Math.min(newX, window.innerWidth - 100)),
        Math.max(0, Math.min(newY, window.innerHeight - 100))
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, onUpdatePosition]);

  // Handle resizing
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (pin.isLocked || pin.isMinimized) return;
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: pin.width,
        height: pin.height,
      });
      onBringToFront();
    },
    [pin.isLocked, pin.isMinimized, pin.width, pin.height, onBringToFront]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      onUpdateSize(
        Math.max(100, resizeStart.width + deltaX),
        Math.max(50, resizeStart.height + deltaY)
      );
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizeStart, onUpdateSize]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (!pin.isLocked) {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, pin.isLocked]);

  const windowStyle: React.CSSProperties = {
    position: "fixed",
    left: pin.x,
    top: pin.y,
    width: pin.isMinimized ? 200 : pin.width,
    height: pin.isMinimized ? 40 : pin.height,
    zIndex: pin.zIndex,
    opacity: pin.style.opacity,
    borderRadius: pin.style.borderRadius,
    boxShadow: pin.style.shadowEnabled
      ? `${pin.style.shadowOffset}px ${pin.style.shadowOffset}px ${pin.style.shadowBlur}px rgba(0, 0, 0, 0.3)`
      : "none",
    border: `${pin.style.borderWidth}px solid ${pin.style.borderColor}`,
    backgroundColor: pin.style.backgroundColor,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    cursor: pin.isLocked ? "default" : isDragging ? "grabbing" : "grab",
  };

  return (
    <div
      ref={windowRef}
      style={windowStyle}
      onMouseDown={() => onBringToFront()}
    >
      {/* Title bar */}
      {pin.style.showTitleBar && !pin.isMinimized && (
        <div
          className="pin-toolbar flex items-center justify-between px-2 py-1 select-none"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
          onMouseDown={handleMouseDown}
        >
          {/* Toolbar buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMinimize();
              }}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 text-xs"
              title={pin.isMinimized ? "Expand" : "Minimize"}
            >
              {pin.isMinimized ? "□" : "−"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500 hover:text-white text-xs"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Lock button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock();
            }}
            className={`w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 text-xs ${
              pin.isLocked ? "text-red-500" : ""
            }`}
            title={pin.isLocked ? "Unlock" : "Lock"}
          >
            {pin.isLocked ? "🔒" : "🔓"}
          </button>
        </div>
      )}

      {/* Content */}
      {!pin.isMinimized && (
        <div className="flex-1 overflow-auto p-2">
          {children}
        </div>
      )}

      {/* Resize handle */}
      {!pin.isLocked && !pin.isMinimized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
        >
          <div className="absolute bottom-1 right-1 text-gray-400 text-xs">⋰</div>
        </div>
      )}
    </div>
  );
}

export default PinWindow;
