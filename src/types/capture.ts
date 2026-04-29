export interface CaptureRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  source: string;
}

export interface CaptureArgs {
  mode: "region" | "window" | "fullscreen";
  region?: CaptureRegion;
  window_hwnd?: number;
}

export interface CapturedImage {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  timestamp: number;
}

export interface Monitor {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  is_primary: boolean;
}

export interface WindowInfo {
  hwnd: number;
  title: string;
  class_name: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type CaptureMode = "region" | "window" | "fullscreen";

export interface RegionMemory {
  x: number;
  y: number;
  width: number;
  height: number;
  valid: boolean;
}

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export interface PickedColor {
  rgb: RgbColor;
  hex: string;
  rgb_string: string;
  hsl: HslColor;
  x: number;
  y: number;
}

export interface ColorHistoryEntry {
  color: PickedColor;
  timestamp: number;
}

export type ColorFormat = "hex" | "rgb" | "rgba" | "hsl";

export interface ShadowConfig {
  enabled: boolean;
  offset_x: number;
  offset_y: number;
  blur_radius: number;
  spread: number;
  color: [number, number, number, number];
}

export interface BorderConfig {
  enabled: boolean;
  width: number;
  color: [number, number, number, number];
}

export interface RoundedCornersConfig {
  enabled: boolean;
  radius: number;
}

export interface DecorationConfig {
  shadow: ShadowConfig;
  border: BorderConfig;
  rounded_corners: RoundedCornersConfig;
  background_color: [number, number, number, number];
}

export type CursorType =
  | "Default"
  | "Text"
  | "Crosshair"
  | "Hand"
  | "Move"
  | "ResizeNS"
  | "ResizeEW"
  | "ResizeNESW"
  | "ResizeNWSE"
  | "Wait"
  | "Help"
  | "Custom";

export interface MousePointerInfo {
  x: number;
  y: number;
  cursor_type: CursorType;
}

export type ScrollDirection = "Up" | "Down" | "Left" | "Right";

export interface ScrollCaptureConfig {
  auto_scroll: boolean;
  scroll_step: number;
  scroll_delay_ms: number;
  max_height: number;
  capture_direction: ScrollDirection;
}

export interface ScrollCaptureProgress {
  current_y: number;
  total_y: number;
  progress: number;
  is_complete: boolean;
}

export type HighlighterColorName = "Yellow" | "Green" | "Blue" | "Pink" | "Orange";

export interface HighlighterConfig {
  color: HighlighterColorName | { Custom: [number, number, number] };
  opacity: number;
  thickness: number;
}

export interface HighlighterPoint {
  x: number;
  y: number;
  pressure: number;
}

export interface HighlighterStroke {
  points: HighlighterPoint[];
  config: HighlighterConfig;
}

export interface HighlighterBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// UI Element types
export type UiElementType =
  | "Button" | "TextField" | "Checkbox" | "RadioButton" | "Dropdown"
  | "Menu" | "MenuItem" | "Tab" | "Table" | "TableRow" | "TableCell"
  | "Tree" | "TreeNode" | "List" | "ListItem" | "ScrollBar" | "Slider"
  | "Dialog" | "Window" | "Icon" | "Image" | "Link" | "Label" | "Text" | "Unknown";

export interface UiBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UiElement {
  id: string;
  element_type: UiElementType;
  bounds: UiBounds;
  text?: string;
  confidence: number;
  children: UiElement[];
}

// Serial Number types
export type FontWeight = "Normal" | "Medium" | "Bold";
export type SerialNumberShape = "Circle" | "Square" | "RoundedSquare" | "None";
export type ArrangeDirection = "Left" | "Right" | "Up" | "Down";

export interface SerialNumberStyle {
  font_size: number;
  font_weight: FontWeight;
  color: string;
  background_color?: string;
  shape: SerialNumberShape;
  padding: number;
}

export interface SerialNumber {
  id: string;
  number: number;
  x: number;
  y: number;
  style: SerialNumberStyle;
}

export interface SerialNumberSequence {
  id: string;
  numbers: SerialNumber[];
  style: SerialNumberStyle;
  auto_arrange: boolean;
  arrange_direction: ArrangeDirection;
}

// Spotlight types
export interface SpotlightConfig {
  enabled: boolean;
  x: number;
  y: number;
  radius: number;
  blur_radius: number;
  brightness: number;
  invert: boolean;
  show_border: boolean;
  border_color: string;
  border_width: number;
}

export interface MagnifierConfig {
  enabled: boolean;
  x: number;
  y: number;
  radius: number;
  zoom: number;
  show_border: boolean;
  border_color: string;
  border_width: number;
}

export interface SpotlightRegion {
  id: string;
  config: SpotlightConfig;
  is_active: boolean;
}

// Watermark types
export type WatermarkPosition =
  | "TopLeft" | "TopCenter" | "TopRight"
  | "MiddleLeft" | "MiddleCenter" | "MiddleRight"
  | "BottomLeft" | "BottomCenter" | "BottomRight" | "Tile";

export type WatermarkType = { Text: string } | { Image: { data: string; width: number; height: number } };

export interface WatermarkConfig {
  enabled: boolean;
  watermark_type: WatermarkType;
  position: WatermarkPosition;
  offset_x: number;
  offset_y: number;
  opacity: number;
  rotation: number;
  tile: boolean;
  tile_spacing_x: number;
  tile_spacing_y: number;
}

// Toolbar types
export type ToolbarPosition = "Top" | "Bottom" | "Left" | "Right" | "Floating";
export type ToolType =
  | "Select" | "Rectangle" | "Ellipse" | "Arrow" | "Line"
  | "Pen" | "Highlighter" | "Text" | "Blur" | "Mosaic"
  | "Number" | "Crop" | "Ruler" | "Magnifier";
export type ToolbarItemType =
  | { Tool: ToolType }
  | "Separator"
  | "Spacer"
  | { Group: string }
  | { Custom: string };

export interface ToolbarItem {
  id: string;
  item_type: ToolbarItemType;
  label?: string;
  icon: string;
  shortcut?: string;
  tooltip?: string;
  is_enabled: boolean;
  is_visible: boolean;
}

export interface Toolbar {
  id: string;
  name: string;
  position: ToolbarPosition;
  items: ToolbarItem[];
  is_visible: boolean;
  icon_size: number;
  spacing: number;
  auto_hide: boolean;
}

// Shortcuts types
export type ModifierKey = "Ctrl" | "Alt" | "Shift" | "Meta";
export type ShortcutScope = "Global" | "InApp" | "InCapture" | "InEditor";
export type ConflictResolution = "Replace" | "KeepExisting" | "KeepNew" | "Prompt";
export type ShortcutAction =
  | "Capture" | "CaptureRegion" | "CaptureWindow" | "CaptureFullscreen" | "CaptureScroll"
  | "Copy" | "Paste" | "Save" | "Undo" | "Redo" | "Delete"
  | "ToolSelect" | "ToolRectangle" | "ToolEllipse" | "ToolArrow" | "ToolLine"
  | "ToolPen" | "ToolHighlighter" | "ToolText" | "ToolBlur" | "ToolMosaic"
  | "ToolNumber" | "ToolCrop" | "OpenSettings" | "OpenHistory" | "Exit"
  | { Custom: string };

export interface Shortcut {
  id: string;
  action: ShortcutAction;
  keys: ModifierKey[];
  key: string;
  description: string;
  is_global: boolean;
  is_enabled: boolean;
  scope: ShortcutScope;
}

export interface ShortcutsConfig {
  shortcuts: Record<string, Shortcut>;
  enabled: boolean;
  conflict_resolution: ConflictResolution;
}
