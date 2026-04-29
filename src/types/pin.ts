export interface PinStyle {
  background_color: string;
  border_color: string;
  border_width: number;
  border_radius: number;
  opacity: number;
}

export interface PinPosition {
  x: number;
  y: number;
}

export interface PinSize {
  width: number;
  height: number;
}

export interface Pin {
  id: string;
  pin_type: "image" | "text";
  content: string;
  position: PinPosition;
  size: PinSize;
  style: PinStyle;
  is_locked: boolean;
  is_minimized: boolean;
  z_index: number;
  created_at: number;
}

export interface CreatePinOptions {
  type: "image" | "text";
  content: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

// Pin Group types
export interface PinGroup {
  id: string;
  name: string;
  description?: string;
  pin_ids: string[];
  color: string;
  is_expanded: boolean;
  created_at: number;
  updated_at: number;
}

export interface PinGroupState {
  groups: PinGroup[];
  default_group_id?: string;
}

// File Pin types
export type FilePreviewType = "Text" | "Code" | "Image" | "Pdf" | "Markdown" | "Unknown";

export interface FilePin {
  id: string;
  file_path: string;
  file_name: string;
  file_extension: string;
  preview_type: FilePreviewType;
  content_preview?: string;
  line_numbers: boolean;
  syntax_theme: string;
  created_at: number;
}

// Color Pin types
export type ColorDisplayFormat = "Swatch" | "Compact" | "Detailed";

export interface PinColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ColorPin {
  id: string;
  color: PinColor;
  name?: string;
  display_format: ColorDisplayFormat;
  show_hex: boolean;
  show_rgb: boolean;
  show_hsl: boolean;
  show_cmyk: boolean;
  created_at: number;
}

// LaTeX Pin types
export type LatexDisplayMode = "Inline" | "Display" | "Block";

export interface LatexPin {
  id: string;
  latex: string;
  display_mode: LatexDisplayMode;
  font_size: number;
  color: string;
  background_color?: string;
  padding: number;
  rendered_svg?: string;
  created_at: number;
}
