import { useState, useEffect, useCallback, useRef } from "react";
import './i18n/i18n';
import { ToastProvider } from "./components/ui";
import { Settings } from "./components/layout";
import { SelectionOverlay, type SelectionRegion } from "./components/capture";
import { CanvasProvider, useCanvas, AnnotationCanvas, AnnotationToolbar, LayerPanel, BeautifyPanel } from "./components/annotation";
import { annotationsToSvg, downloadSvg } from "./components/annotation/svgExport";
import { createPinWindow, PinPage } from "./components/pin";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

type AppView = "home" | "settings";

interface CapturedImage {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  timestamp: number;
}

const urlParams = new URLSearchParams(window.location.search);
const isPinMode = urlParams.get("pin") === "true";

// ============================================
// 浮动底栏 — PixPin 风格操作按钮
// ============================================
function FloatingBar({
  capturedImage,
  onStartCapture,
  onSaveToFile,
  onPin,
  onSvgExport,
  showLayers,
  setShowLayers,
  showBeautify,
  setShowBeautify,
}: {
  capturedImage: CapturedImage | null;
  onStartCapture: () => void;
  onSaveToFile: () => void;
  onPin: () => void;
  onSvgExport: () => void;
  showLayers: boolean;
  setShowLayers: (v: boolean) => void;
  showBeautify: boolean;
  setShowBeautify: (v: boolean) => void;
}) {
  if (!capturedImage) return null;
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-30">
      <button onClick={onStartCapture} className="px-2.5 py-1 text-xs text-[var(--color-text)] hover:bg-[var(--color-background)] rounded-lg transition-colors" title="重截 (R)">🔄 重截</button>
      <div className="w-px h-4 bg-[var(--color-border)]" />
      <button onClick={onPin} className="px-2.5 py-1 text-xs text-[var(--color-text)] hover:bg-[var(--color-background)] rounded-lg transition-colors" title="钉到桌面">📌 钉图</button>
      <button onClick={onSvgExport} className="px-2.5 py-1 text-xs text-[var(--color-text)] hover:bg-[var(--color-background)] rounded-lg transition-colors" title="SVG 导出">SVG</button>
      <button onClick={onSaveToFile} className="px-2.5 py-1 text-xs text-[var(--color-text)] hover:bg-[var(--color-background)] rounded-lg transition-colors" title="保存为 PNG">💾 保存</button>
      <div className="w-px h-4 bg-[var(--color-border)]" />
      <button onClick={() => setShowLayers(!showLayers)}
        className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${showLayers ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : "text-[var(--color-text)] hover:bg-[var(--color-background)]"}`}
        title="图层">📐</button>
      <button onClick={() => setShowBeautify(!showBeautify)}
        className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${showBeautify ? "bg-green-500/20 text-green-600 dark:text-green-400" : "text-[var(--color-text)] hover:bg-[var(--color-background)]"}`}
        title="美化">✨</button>
    </div>
  );
}

// ============================================
// 标注视图
// ============================================
function AnnotateView({
  capturedImage,
  onStartCapture,
  onSaveToFile,
  onPin,
  onSvgExport,
}: {
  capturedImage: CapturedImage | null;
  onStartCapture: () => void;
  onSaveToFile: () => void;
  onPin: () => void;
  onSvgExport: () => void;
}) {
  const { dispatch } = useCanvas();
  const initializedRef = useRef(false);
  const [showLayers, setShowLayers] = useState(false);
  const [showBeautify, setShowBeautify] = useState(false);

  useEffect(() => {
    if (capturedImage && !initializedRef.current) {
      dispatch({ type: "SET_IMAGE", payload: capturedImage.dataUrl });
      initializedRef.current = true;
    }
  }, [capturedImage, dispatch]);

  useEffect(() => {
    initializedRef.current = false;
  }, [capturedImage?.id]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--color-surface)]">
      {/* 浮动工具栏 — 贴近画布 */}
      <AnnotationToolbar />
      
      {/* 画布区域 */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-auto flex items-center justify-center">
          {capturedImage ? (
            <AnnotationCanvas className="max-w-full max-h-full" />
          ) : (
            <div className="text-[var(--color-text-muted)]">Ctrl+Alt+A 截图</div>
          )}
        </div>

        {/* 滑出面板 */}
        {showLayers && (
          <div className="absolute right-0 top-0 bottom-0 z-20 shadow-xl">
            <LayerPanel />
          </div>
        )}
        {showBeautify && (
          <div className="absolute right-0 top-0 bottom-0 z-20 shadow-xl">
            <BeautifyPanel />
          </div>
        )}

        {/* 浮动底栏 */}
        <FloatingBar
          capturedImage={capturedImage}
          onStartCapture={onStartCapture}
          onSaveToFile={onSaveToFile}
          onPin={onPin}
          onSvgExport={onSvgExport}
          showLayers={showLayers}
          setShowLayers={setShowLayers}
          showBeautify={showBeautify}
          setShowBeautify={setShowBeautify}
        />
      </div>
    </div>
  );
}

// ============================================
// 主应用
// ============================================
function AppContent() {
  const [view, setView] = useState<AppView>("home");
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMode, setCaptureMode] = useState<"region" | "window" | "fullscreen">("region");
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const startCapture = useCallback((mode: "region" | "window" | "fullscreen") => {
    setCaptureMode(mode);
    setIsCapturing(true);
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    listen("global-shortcut", () => {
      startCapture("region");
    }).then((fn) => { unlisten = fn; });
    return () => { unlisten?.(); };
  }, [startCapture]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCapturing) {
        e.preventDefault();
        setIsCapturing(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCapturing]);

  const handleCapture = useCallback(async (region: SelectionRegion) => {
    setIsCapturing(false);
    try {
      const args: Record<string, unknown> = { mode: region.mode };
      if (region.mode === "region") {
        args.region = { x: region.x, y: region.y, width: region.width, height: region.height, source: "region" };
      } else if (region.mode === "window" && region.windowHwnd) {
        args.window_hwnd = region.windowHwnd;
      }
      const base64Data = await invoke<string>("capture_as_png", { args });
      const newCapture: CapturedImage = {
        id: `capture-${Date.now()}`,
        dataUrl: `data:image/png;base64,${base64Data}`,
        width: region.width,
        height: region.height,
        timestamp: Date.now(),
      };
      setCapturedImage(newCapture);
      try {
        const blob = await (await fetch(newCapture.dataUrl)).blob();
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      } catch { /* silent */ }
    } catch {
      const canvas = document.createElement("canvas");
      canvas.width = region.width;
      canvas.height = region.height;
      canvas.getContext("2d")!.fillStyle = "#fff";
      canvas.getContext("2d")!.fillRect(0, 0, region.width, region.height);
      setCapturedImage({ id: `capture-${Date.now()}`, dataUrl: canvas.toDataURL("image/png"), width: region.width, height: region.height, timestamp: Date.now() });
    }
  }, []);

  const handleCancelCapture = useCallback(() => setIsCapturing(false), []);

  const handleSaveToFile = useCallback(async () => {
    if (!capturedImage) return;
    try {
      await invoke<string>("save_screenshot", { data: capturedImage.dataUrl.replace(/^data:image\/\w+;base64,/, ""), filename: `opensnip-${Date.now()}.png` });
    } catch {
      const a = document.createElement("a");
      a.download = `opensnip-${Date.now()}.png`;
      a.href = capturedImage.dataUrl;
      a.click();
    }
  }, [capturedImage]);

  const handlePin = useCallback(async () => {
    if (!capturedImage) return;
    try { await createPinWindow({ imageDataUrl: capturedImage.dataUrl, width: capturedImage.width, height: capturedImage.height }); }
    catch { /* silent */ }
  }, [capturedImage]);

  const { state } = useCanvas();
  const handleSvgExport = useCallback(() => {
    const layers = (state as any).layers;
    let allAnnotations: any[] = [];
    if (layers?.length) { for (const l of layers) { if (l.visible) allAnnotations = allAnnotations.concat(l.annotations); } }
    else { allAnnotations = state.annotations; }
    downloadSvg(annotationsToSvg(allAnnotations, { backgroundImage: capturedImage?.dataUrl, width: state.canvasWidth, height: state.canvasHeight }));
  }, [state, capturedImage]);

  return (
    <div className="h-screen flex flex-col bg-[var(--color-background)]">
      {/* 极简顶栏 */}
      <header className="flex items-center justify-between h-9 px-3 border-b border-[var(--color-border)] bg-[var(--color-background)] shrink-0">
        <span className="text-xs font-medium text-[var(--color-text-muted)] select-none">OpenSnip</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} className="px-2 py-0.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded transition-colors" title="主题">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button onClick={() => setView(v => v === "settings" ? "home" : "settings")} className="px-2 py-0.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded transition-colors" title="设置">
            {view === "settings" ? "← 返回" : "⚙️"}
          </button>
        </div>
      </header>

      {/* 主内容 */}
      <div className="flex-1 flex overflow-hidden">
        {view === "settings" ? (
          <Settings />
        ) : capturedImage ? (
          <AnnotateView capturedImage={capturedImage} onStartCapture={() => startCapture("region")} onSaveToFile={handleSaveToFile} onPin={handlePin} onSvgExport={handleSvgExport} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[var(--color-surface)]">
            <div className="text-center">
              <div className="text-5xl mb-3">📸</div>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                <kbd className="px-2 py-0.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded text-xs font-mono">Ctrl+Alt+A</kbd> 截图
              </p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => startCapture("region")} className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">区域截图</button>
                <button onClick={() => startCapture("fullscreen")} className="px-4 py-1.5 border border-[var(--color-border)] hover:bg-[var(--color-background)] text-sm rounded-lg transition-colors text-[var(--color-text)]">全屏截图</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 截图覆盖层 */}
      {isCapturing && (
        <SelectionOverlay mode={captureMode} onCapture={handleCapture} onCancel={handleCancelCapture} />
      )}
    </div>
  );
}

// ============================================
// 根组件
// ============================================
function App() {
  if (isPinMode) return <PinPage />;
  return (
    <ToastProvider>
      <CanvasProvider>
        <AppContent />
      </CanvasProvider>
    </ToastProvider>
  );
}

export default App;
