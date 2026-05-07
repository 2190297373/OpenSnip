import { useEffect, useState, useCallback } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { listen } from "@tauri-apps/api/event";

export default function PinPage() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [opacity, setOpacity] = useState(0.9);
  const win = getCurrentWebviewWindow();

  // Listen for pin-data event from main window
  useEffect(() => {
    let unlistenFn: (() => void) | null = null;

    const setup = async () => {
      const unlisten = await listen<{ image: string }>("pin-data", (event) => {
        setImageData(event.payload.image);
      });
      unlistenFn = unlisten;
    };

    setup();
    return () => {
      if (unlistenFn) unlistenFn();
    };
  }, []);

  // Close window
  const handleClose = useCallback(async () => {
    await win.close();
  }, [win]);

  // Toggle lock (mouse-through / ignore cursor events)
  const handleToggleLock = useCallback(async () => {
    const next = !isLocked;
    setIsLocked(next);
    try {
      await win.setIgnoreCursorEvents(next);
    } catch (e) {
      console.error("Failed to set ignore cursor events:", e);
    }
  }, [isLocked, win]);

  if (!imageData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black/50 text-white text-sm">
        等待图片数据...
      </div>
    );
  }

  return (
    <div
      className="h-screen w-screen relative select-none overflow-hidden"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        setTimeout(() => setShowControls(false), 1000);
      }}
    >
      {/* Drag region — allows moving the window when unlocked */}
      {!isLocked && (
        <div
          className="absolute inset-0 z-10"
          data-tauri-drag-region
        />
      )}

      {/* Pinned image */}
      <img
        src={imageData}
        alt="Pinned"
        className="w-full h-full object-contain"
        draggable={false}
        onDoubleClick={handleClose}
        style={{ opacity }}
      />

      {/* Top control bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-2 py-1 bg-black/40 transition-opacity duration-200 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="text-white text-xs select-none">Pin</span>
        <div className="flex items-center gap-1">
          <input
            type="range" min="20" max="100" value={Math.round(opacity * 100)}
            onChange={(e) => setOpacity(+e.target.value / 100)}
            className="w-16 h-3 accent-blue-400"
            title="透明度"
          />
          <button
            onClick={async () => {
              const blob = await (await fetch(imageData!)).blob();
              await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
            }}
            className="px-2 py-0.5 text-white text-xs hover:bg-white/20 rounded transition-colors"
            title="复制图像"
          >
            📋
          </button>
          <button
            onClick={handleToggleLock}
            className="px-2 py-0.5 text-white text-xs hover:bg-white/20 rounded transition-colors"
            title={isLocked ? "解锁（恢复交互）" : "锁定（鼠标穿透）"}
          >
            {isLocked ? "🔒" : "🔓"}
          </button>
          <button
            onClick={handleClose}
            className="px-2 py-0.5 text-white text-xs hover:bg-red-500 rounded transition-colors"
            title="关闭窗口"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
