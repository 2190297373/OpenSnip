import { invoke } from "@tauri-apps/api/core";
import type { CaptureArgs, CapturedImage, ColorFormat, ColorHistoryEntry, DecorationConfig, HighlighterBounds, HighlighterConfig, HighlighterStroke, Monitor, MousePointerInfo, PickedColor, RegionMemory, ScrollCaptureConfig, ScrollCaptureProgress, UiElement, UiElementType, WindowInfo } from "@/types";

export async function captureScreenshot(args: CaptureArgs): Promise<string> {
  return invoke<string>("capture_screenshot", { args });
}

export async function captureAsPng(args: CaptureArgs): Promise<string> {
  return invoke<string>("capture_as_png", { args });
}

export async function captureAsJpeg(args: CaptureArgs, quality: number = 85): Promise<string> {
  return invoke<string>("capture_as_jpeg", { args, quality });
}

export async function getMonitors(): Promise<Monitor[]> {
  return invoke<Monitor[]>("get_monitors");
}

export async function getWindows(): Promise<WindowInfo[]> {
  return invoke<WindowInfo[]>("get_windows");
}

export async function quickCapture(): Promise<string> {
  return invoke<string>("quick_capture");
}

export async function saveScreenshot(data: string, filename: string): Promise<string> {
  return invoke<string>("save_screenshot", { data, filename });
}

export function buildCaptureArgs(
  mode: "region" | "window" | "fullscreen",
  region?: { x: number; y: number; width: number; height: number },
  windowHwnd?: number
): CaptureArgs {
  const args: CaptureArgs = { mode };
  
  if (mode === "region" && region) {
    args.region = {
      x: region.x,
      y: region.y,
      width: region.width,
      height: region.height,
      source: "region",
    };
  } else if (mode === "window" && windowHwnd) {
    args.window_hwnd = windowHwnd;
  }
  
  return args;
}

export function base64ToDataUrl(base64: string, mimeType: string = "image/png"): string {
  return `data:${mimeType};base64,${base64}`;
}

export function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.replace(/^data:image\/\w+;base64,/, "");
}

export function createCapturedImage(
  base64: string,
  width: number,
  height: number
): CapturedImage {
  return {
    id: `capture-${Date.now()}`,
    dataUrl: base64ToDataUrl(base64),
    width,
    height,
    timestamp: Date.now(),
  };
}

// ============================================
// History Functions
// ============================================

export interface CaptureHistoryItem {
  id: string;
  thumbnail?: string;
  width: number;
  height: number;
  timestamp: number;
  path?: string;
}

export async function getCaptureHistory(): Promise<CaptureHistoryItem[]> {
  return invoke<CaptureHistoryItem[]>("get_capture_history");
}

export async function addCaptureHistory(
  item: Partial<CaptureHistoryItem>,
  maxItems: number = 10
): Promise<CaptureHistoryItem> {
  return invoke<CaptureHistoryItem>("add_capture_history", { 
    item: { ...item, id: "" },
    maxItems,
  });
}

export async function getCaptureHistoryItem(id: string): Promise<CaptureHistoryItem | null> {
  return invoke<CaptureHistoryItem | null>("get_capture_history_item", { id });
}

export async function clearCaptureHistory(): Promise<void> {
  return invoke<void>("clear_capture_history");
}

export async function removeCaptureHistoryItem(id: string): Promise<boolean> {
  return invoke<boolean>("remove_capture_history_item", { id });
}

// ============================================
// Region Memory Functions
// ============================================

export async function saveRegionMemory(
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> {
  return invoke<void>("save_region_memory", { x, y, width, height });
}

export async function getRecentRegion(): Promise<RegionMemory | null> {
  return invoke<RegionMemory | null>("get_recent_region");
}

export async function getAllRegionMemory(): Promise<RegionMemory[]> {
  return invoke<RegionMemory[]>("get_all_region_memory");
}

export async function getRegionMemoryAt(index: number): Promise<RegionMemory | null> {
  return invoke<RegionMemory | null>("get_region_memory_at", { index });
}

export async function clearRegionMemory(): Promise<void> {
  return invoke<void>("clear_region_memory");
}

export async function removeRegionMemoryAt(index: number): Promise<boolean> {
  return invoke<boolean>("remove_region_memory_at", { index });
}

// ============================================
// Color Picker Functions
// ============================================

export async function pickColorFromScreenshot(
  screenshot: { data: number[]; width: number; height: number; region: unknown },
  x: number,
  y: number
): Promise<PickedColor> {
  return invoke<PickedColor>("pick_color_from_screenshot", { screenshot, x, y });
}

export async function pickColorFromBase64(
  imageData: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<PickedColor> {
  return invoke<PickedColor>("pick_color_from_base64", { imageData, x, y, width, height });
}

export async function getColorHistory(): Promise<ColorHistoryEntry[]> {
  return invoke<ColorHistoryEntry[]>("get_color_history");
}

export async function clearColorHistory(): Promise<void> {
  return invoke<void>("clear_color_history");
}

export async function removeColorFromHistory(index: number): Promise<boolean> {
  return invoke<boolean>("remove_color_from_history", { index });
}

export async function setColorFormat(format: ColorFormat): Promise<ColorFormat> {
  return invoke<ColorFormat>("set_color_format", { format });
}

export async function getColorFormat(): Promise<ColorFormat> {
  return invoke<ColorFormat>("get_color_format");
}

export async function convertColor(r: number, g: number, b: number, format: ColorFormat): Promise<string> {
  return invoke<string>("convert_color", { r, g, b, format });
}

// ============================================
// Decoration Functions
// ============================================

export async function applyRoundedCorners(
  screenshot: { data: number[]; width: number; height: number },
  radius: number
): Promise<{ data: number[]; width: number; height: number }> {
  return invoke("apply_rounded_corners", { screenshot, radius });
}

export async function applyBorder(
  screenshot: { data: number[]; width: number; height: number },
  width: number,
  color: [number, number, number, number]
): Promise<{ data: number[]; width: number; height: number }> {
  return invoke("apply_border", { screenshot, width, color });
}

export async function applyShadow(
  screenshot: { data: number[]; width: number; height: number },
  config: { enabled: boolean; offset_x: number; offset_y: number; blur_radius: number; spread: number; color: [number, number, number, number] }
): Promise<{ data: number[]; width: number; height: number }> {
  return invoke("apply_shadow", { screenshot, config });
}

export async function applyScreenshotDecoration(
  screenshot: { data: number[]; width: number; height: number },
  config: DecorationConfig
): Promise<{ data: number[]; width: number; height: number }> {
  return invoke("apply_screenshot_decoration", { screenshot, config });
}

export async function getDefaultDecorationConfig(): Promise<DecorationConfig> {
  return invoke<DecorationConfig>("get_default_decoration_config");
}

// ============================================
// Mouse Pointer Functions
// ============================================

export async function getMousePosition(): Promise<MousePointerInfo> {
  return invoke<MousePointerInfo>("get_mouse_position");
}

export async function setMousePosition(x: number, y: number): Promise<void> {
  return invoke<void>("set_mouse_position", { x, y });
}

export async function moveMouseRelative(dx: number, dy: number): Promise<MousePointerInfo> {
  return invoke<MousePointerInfo>("move_mouse_relative", { dx, dy });
}

// ============================================
// Scroll Capture Functions
// ============================================

export async function getScrollCaptureConfig(): Promise<ScrollCaptureConfig> {
  return invoke<ScrollCaptureConfig>("get_scroll_capture_config");
}

export async function updateScrollCaptureConfig(config: ScrollCaptureConfig): Promise<void> {
  return invoke<void>("update_scroll_capture_config", { config });
}

export async function getScrollCaptureProgress(): Promise<ScrollCaptureProgress | null> {
  return invoke<ScrollCaptureProgress | null>("get_scroll_capture_progress");
}

export async function isScrollCapturing(): Promise<boolean> {
  return invoke<boolean>("is_scroll_capturing");
}

export async function stitchScreenshotsVertical(
  screenshots: Array<{ data: number[]; width: number; height: number }>
): Promise<{ data: number[]; width: number; height: number }> {
  return invoke("stitch_screenshots_vertical", { screenshots });
}

export async function stitchScreenshotsHorizontal(
  screenshots: Array<{ data: number[]; width: number; height: number }>
): Promise<{ data: number[]; width: number; height: number }> {
  return invoke("stitch_screenshots_horizontal", { screenshots });
}

// ============================================
// Highlighter Functions
// ============================================

export async function getDefaultHighlighterConfig(): Promise<HighlighterConfig> {
  return invoke<HighlighterConfig>("get_default_highlighter_config");
}

export async function createHighlighterStroke(
  points: Array<[number, number, number]>,
  config: HighlighterConfig
): Promise<HighlighterStroke> {
  return invoke<HighlighterStroke>("create_highlighter_stroke", { points, config });
}

export async function getHighlighterSvg(
  stroke: HighlighterStroke,
  id: string
): Promise<string> {
  return invoke<string>("get_highlighter_svg", { stroke, id });
}

export async function getHighlighterPath(stroke: HighlighterStroke): Promise<string> {
  return invoke<string>("get_highlighter_path", { stroke });
}

export async function getHighlighterBounds(stroke: HighlighterStroke): Promise<HighlighterBounds | null> {
  return invoke<HighlighterBounds | null>("get_highlighter_bounds", { stroke });
}

export async function getHighlighterColors(): Promise<Array<[string, string]>> {
  return invoke<Array<[string, string]>>("get_highlighter_colors");
}

// ============================================
// UI Element Detection Functions
// ============================================

export async function detectUiElements(
  screenshot: { data: number[]; width: number; height: number }
): Promise<UiElement[]> {
  return invoke<UiElement[]>("detect_ui_elements", { screenshot });
}

export async function detectUiElementAt(
  screenshot: { data: number[]; width: number; height: number },
  x: number,
  y: number
): Promise<UiElement | null> {
  return invoke<UiElement | null>("detect_ui_element_at", { screenshot, x, y });
}

export async function getUiElementTypeName(elementType: UiElementType): Promise<string> {
  return invoke<string>("get_ui_element_type_name", { elementType });
}
