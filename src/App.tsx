import { useState, useEffect, useCallback, useRef } from "react";
import './i18n/i18n';
import { Button, Modal, Tooltip, ToastProvider } from "./components/ui";
import { Toolbar, Sidebar, Settings } from "./components/layout";
import { SelectionOverlay, type SelectionRegion } from "./components/capture";
import { CanvasProvider, useCanvas, AnnotationCanvas, AnnotationToolbar, LayerPanel } from "./components/annotation";
import { PinManager, createPinWindow, PinPage } from "./components/pin";
import { OcrPanel } from "./components/ocr";
import { TranslationPanel } from "./components/translation";
import { RecordingPanel } from "./components/recording";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

// ============================================
// 类型定义
// ============================================

type AppView = "home" | "settings";
type MainView = "capture" | "annotate" | "pin" | "ocr" | "translation" | "recording";

// 截图图片
interface CapturedImage {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  timestamp: number;
}

// 检测是否为独立贴图窗口模式（必须在组件外部，避免 Hooks 条件调用）
const urlParams = new URLSearchParams(window.location.search);
const isPinMode = urlParams.get("pin") === "true";

// ============================================
// 工具配置
// ============================================

const captureTools = [
  { id: "region", icon: "rect", label: "区域截图" },
  { id: "window", icon: "window", label: "窗口截图" },
  { id: "fullscreen", icon: "screenshot", label: "全屏截图" },
];

// ============================================
// 标注视图组件
// ============================================

function AnnotateView({
  capturedImage,
  onStartCapture,
  onSaveToFile,
  onPin,
}: {
  capturedImage: CapturedImage | null;
  onStartCapture: () => void;
  onSaveToFile: () => void;
  onPin: () => void;
}) {
  const { dispatch } = useCanvas();
  const initializedRef = useRef(false);

  // 当截图变化时，更新 CanvasContext 的 image
  useEffect(() => {
    if (capturedImage && !initializedRef.current) {
      dispatch({ type: "SET_IMAGE", payload: capturedImage.dataUrl });
      initializedRef.current = true;
    }
  }, [capturedImage, dispatch]);

  // 重置图像引用当截图变化时
  useEffect(() => {
    initializedRef.current = false;
  }, [capturedImage?.id]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 标注工具栏 - 使用 CanvasContext */}
      <AnnotationToolbar />
      
      {/* 标注画布 - 使用 CanvasContext */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto bg-[var(--color-surface)]">
          {capturedImage ? (
            <div className="flex items-center justify-center min-h-full">
              <AnnotationCanvas className="max-w-full max-h-full" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
              暂无截图，请先截图
            </div>
          )}
        </div>
        <LayerPanel />
      </div>
      
      {/* 底部操作栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="flex gap-2">
          <Button size="sm" onClick={onStartCapture}>重新截图</Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={onPin}>📌 钉图</Button>
          <Button size="sm" variant="secondary" onClick={onSaveToFile}>保存</Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// OCR 视图组件
// ============================================

function OcrView({
  capturedImage,
}: {
  capturedImage: CapturedImage | null;
}) {
  return (
    <div className="flex-1 overflow-auto p-4">
      <OcrPanel
        image={capturedImage?.dataUrl}
        width={capturedImage?.width}
        height={capturedImage?.height}
      />
    </div>
  );
}

// ============================================
// 翻译视图组件
// ============================================

function TranslationView({
  initialText,
}: {
  initialText?: string;
}) {
  return (
    <div className="h-full">
      <TranslationPanel initialText={initialText} />
    </div>
  );
}

// ============================================
// 主应用
// ============================================

function AppContent() {
  // 视图状态
  const [view, setView] = useState<AppView>("home");
  const [mainView, setMainView] = useState<MainView>("capture");
  
  // 截图状态
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMode, setCaptureMode] = useState<"region" | "window" | "fullscreen">("region");
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  
  // UI 状态
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showAbout, setShowAbout] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [translationText, setTranslationText] = useState<string | undefined>();

  // 主题切换
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  // 开始截图
  const startCapture = useCallback((mode: "region" | "window" | "fullscreen") => {
    setCaptureMode(mode);
    setIsCapturing(true);
  }, []);

  // 全局快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Alt+A - 截图
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        startCapture("region");
      }
      // Ctrl+Alt+S - 滚动截图 (暂时用区域截图代替)
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        startCapture("region");
      }
      // Ctrl+Alt+F - 全屏截图
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        startCapture("fullscreen");
      }
      // Escape - 取消截图
      if (e.key === "Escape" && isCapturing) {
        e.preventDefault();
        setIsCapturing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [startCapture, isCapturing]);

  // 处理截图完成
  const handleCapture = useCallback(async (region: SelectionRegion) => {
    setIsCapturing(false);
    
    try {
      // 构建 CaptureArgs
      const args: {
        mode: string;
        region?: { x: number; y: number; width: number; height: number; source: string };
        window_hwnd?: number;
      } = {
        mode: region.mode,
      };
      
      if (region.mode === "region") {
        args.region = {
          x: region.x,
          y: region.y,
          width: region.width,
          height: region.height,
          source: "region",
        };
      } else if (region.mode === "window" && region.windowHwnd) {
        args.window_hwnd = region.windowHwnd;
      }
      
      // 调用 Rust 后端进行截图
      const base64Data = await invoke<string>("capture_as_png", { args });
      
      const newCapture: CapturedImage = {
        id: `capture-${Date.now()}`,
        dataUrl: `data:image/png;base64,${base64Data}`,
        width: region.width,
        height: region.height,
        timestamp: Date.now(),
      };
      
      setCapturedImage(newCapture);
      setMainView("annotate");
    } catch (err) {
      console.error("截图失败:", err);
      // 降级：创建空白画布
      const canvas = document.createElement("canvas");
      canvas.width = region.width;
      canvas.height = region.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, region.width, region.height);
      }
      
      const newCapture: CapturedImage = {
        id: `capture-${Date.now()}`,
        dataUrl: canvas.toDataURL("image/png"),
        width: region.width,
        height: region.height,
        timestamp: Date.now(),
      };
      setCapturedImage(newCapture);
      setMainView("annotate");
    }
  }, []);

  // 取消截图
  const handleCancelCapture = useCallback(() => {
    setIsCapturing(false);
  }, []);

  // 保存到文件
  const handleSaveToFile = useCallback(async () => {
    if (!capturedImage) return;

    try {
      // 移除 data URL 前缀
      const base64Data = capturedImage.dataUrl.replace(/^data:image\/\w+;base64,/, "");

      await invoke<string>("save_screenshot", {
        data: base64Data,
        filename: `opensnip-${Date.now()}.png`,
      });

      // 保存成功
    } catch (err) {
      console.error("保存失败:", err);
      // 降级：使用浏览器下载
      const link = document.createElement("a");
      link.download = `opensnip-${Date.now()}.png`;
      link.href = capturedImage.dataUrl;
      link.click();
    }
  }, [capturedImage]);

  // 钉图为置顶窗口
  const handlePin = useCallback(async () => {
    if (!capturedImage) return;
    try {
      await createPinWindow({
        imageDataUrl: capturedImage.dataUrl,
        width: capturedImage.width,
        height: capturedImage.height,
      });
    } catch (err) {
      console.error("钉图失败:", err);
    }
  }, [capturedImage]);

  // 渲染主视图内容
  const renderMainContent = () => {
    switch (mainView) {
      case "capture":
        return (
          <div className="flex-1 flex items-center justify-center bg-[var(--color-background)]">
            <div className="text-center">
              <div className="text-6xl mb-4">📸</div>
              <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">OpenSnip</h1>
              <p className="text-[var(--color-text-muted)] mb-6">
                按下 <kbd className="px-2 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-xs font-mono">Ctrl+Alt+A</kbd> 截图
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button onClick={() => startCapture("region")}>区域截图</Button>
                <Button variant="secondary" onClick={() => startCapture("window")}>窗口截图</Button>
                <Button variant="secondary" onClick={() => startCapture("fullscreen")}>全屏截图</Button>
              </div>
            </div>
          </div>
        );
        
      case "annotate":
        return (
          <AnnotateView
            capturedImage={capturedImage}
            onStartCapture={() => startCapture("region")}
            onSaveToFile={handleSaveToFile}
            onPin={handlePin}
          />
        );
        
      case "pin":
        return (
          <div className="flex-1 overflow-auto p-4">
            <PinManager />
          </div>
        );
        
      case "ocr":
        return (
          <OcrView capturedImage={capturedImage} />
        );
        
      case "translation":
        return (
          <TranslationView initialText={translationText} />
        );
        
      case "recording":
        return (
          <div className="flex-1 overflow-auto p-4">
            <RecordingPanel />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--color-background)]">
      {/* 工具栏 */}
      <Toolbar
        title="OpenSnip"
        tools={captureTools.map((t) => ({ ...t, active: captureMode === t.id }))}
        onToolClick={(id) => {
          startCapture(id as "region" | "window" | "fullscreen");
        }}
        actions={
          <>
            <Tooltip content={theme === "light" ? "深色模式" : "浅色模式"}>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)]"
              >
                {theme === "light" ? "🌙" : "☀️"}
              </button>
            </Tooltip>
            <Tooltip content="设置">
              <button
                onClick={() => setView("settings")}
                className="p-2 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip content="关于">
              <button
                onClick={() => setShowAbout(true)}
                className="p-2 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </Tooltip>
          </>
        }
      />

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {view === "settings" ? (
          <Settings />
        ) : (
          <>
            {/* 侧边栏 */}
            <Sidebar
              items={[
                { id: "capture", label: "截图", icon: "capture" },
                { id: "annotate", label: "标注", icon: "annotate" },
                { id: "pin", label: "贴图", icon: "pin" },
                { id: "ocr", label: "文字识别", icon: "ocr" },
                { id: "translation", label: "翻译", icon: "translation" },
                { id: "recording", label: "录屏", icon: "recording" },
              ]}
              activeId={mainView}
              onSelect={(id) => setMainView(id as MainView)}
            />

            {/* 主视图 */}
            {renderMainContent()}
          </>
        )}
      </div>

      {/* 截图覆盖层 */}
      {isCapturing && (
        <SelectionOverlay
          mode={captureMode}
          onCapture={handleCapture}
          onCancel={handleCancelCapture}
        />
      )}

      {/* 翻译弹窗 */}
      {showTranslationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowTranslationModal(false)}>
          <div className="bg-[var(--color-background)] rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <TranslationPanel 
              initialText={translationText}
              onTranslationComplete={(text) => {
                setTranslationText(text);
              }}
            />
          </div>
        </div>
      )}

      {/* 关于弹窗 */}
      <Modal open={showAbout} onClose={() => setShowAbout(false)} title="关于" width="sm">
        <div className="text-center space-y-3">
          <div className="text-5xl">📸</div>
          <h2 className="text-xl font-bold">OpenSnip</h2>
          <p className="text-sm text-[var(--color-text-muted)]">版本 0.1.0</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            免费开源的 Windows 截图工具，使用 Tauri v2 + Rust 构建。
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            功能：截图、标注、贴图、OCR、翻译、录屏
          </p>
        </div>
      </Modal>
    </div>
  );
}

// ============================================
// 根组件 - 提供 CanvasProvider 和 ToastProvider
// ============================================

function App() {
  if (isPinMode) {
    return <PinPage />;
  }

  return (
    <ToastProvider>
      <CanvasProvider>
        <AppContent />
      </CanvasProvider>
    </ToastProvider>
  );
}

export default App;
