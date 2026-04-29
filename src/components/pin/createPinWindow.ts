import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { emitTo } from "@tauri-apps/api/event";

export interface PinWindowOptions {
  imageDataUrl: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/**
 * 创建一个真正的置顶贴图窗口（独立 WebviewWindow）
 * @param options - 窗口配置
 * @returns 创建的 WebviewWindow 实例
 */
export async function createPinWindow(options: PinWindowOptions) {
  const {
    imageDataUrl,
    x = 100 + Math.floor(Math.random() * 200),
    y = 100 + Math.floor(Math.random() * 200),
    width = 400,
    height = 300,
  } = options;

  const label = `pin-${Date.now()}`;

  const webview = new WebviewWindow(label, {
    url: `/?pin=true&label=${encodeURIComponent(label)}`,
    title: "OpenSnip Pin",
    width,
    height,
    x,
    y,
    resizable: true,
    minimizable: false,
    maximizable: false,
    decorations: false,
    transparent: true,
    visible: false,
  });

  webview.once("tauri://created", async () => {
    setTimeout(async () => {
      try {
        await webview.setAlwaysOnTop(true);
        await emitTo(label, "pin-data", { image: imageDataUrl });
        await webview.show();
        await webview.setFocus();
      } catch (e) {
        console.error("Failed to setup pin window:", e);
      }
    }, 300);
  });

  webview.once("tauri://error", (e) => {
    console.error("Failed to create pin window:", e);
  });

  return webview;
}
