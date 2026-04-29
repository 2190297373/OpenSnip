/**
 * OpenSnip 领域模型（前端）
 *
 * 本模块定义前后端统一的核心数据结构。
 * 所有类型必须保持与 Rust `src-tauri/src/models/domain.rs` 语义一致。
 */

// ==================== 基础几何类型 ====================

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ==================== 图像数据 ====================

export interface ImageData {
  /** PNG 格式的 Base64 编码（含 data:image/png;base64, 前缀） */
  dataUrl: string;
  /** 图像宽度（像素） */
  width: number;
  /** 图像高度（像素） */
  height: number;
  /** 文件大小（字节，可选） */
  size?: number;
}

// ==================== 标注对象 ====================

export type AnnotationType =
  | "rectangle"
  | "ellipse"
  | "arrow"
  | "line"
  | "text"
  | "pencil"
  | "mosaic";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnnotationStyle {
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
  fontSize?: number;
  fontFamily?: string;
  opacity: number;
}

export interface Transform {
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export type AnnotationContent =
  | { kind: "path"; data: string }
  | { kind: "text"; text: string }
  | { kind: "mosaic"; blockSize: number };

export interface AnnotationObject {
  id: string;
  annotationType: AnnotationType;
  bounds: BoundingBox;
  style: AnnotationStyle;
  content: AnnotationContent;
  transform: Transform;
  isSelected: boolean;
  createdAt: number;
}

// ==================== 截图任务 ====================

// CaptureMode is defined in ./capture.ts to avoid duplicate export conflicts
import type { CaptureMode } from "./capture";

export type CaptureTaskState =
  | "capturing"
  | "annotating"
  | "pinned"
  | "saved"
  | "discarded";

export type ExportFormat = "png" | "jpg" | "clipboard";

export interface ExportState {
  format: ExportFormat;
  filePath: string | null;
  exportedAt: number;
  success: boolean;
  error?: string;
}

export interface CaptureTask {
  id: string;
  mode: CaptureMode;
  region: Region | null;
  sourceImage: ImageData;
  annotationObjects: AnnotationObject[];
  state: CaptureTaskState;
  exportState: ExportState | null;
  createdAt: number;
  modifiedAt: number;
}

// ==================== 贴图会话 ====================

export type PinWindowState = "normal" | "minimized" | "locked";

export interface PinSession {
  id: string;
  sourceTaskId: string;
  windowState: PinWindowState;
  position: Position;
  size: Size;
  isLocked: boolean;
  isMinimized: boolean;
  zIndex: number;
  image: ImageData;
  createdAt: number;
}

// ==================== 历史记录 ====================

export interface HistoryMetadata {
  width: number;
  height: number;
  mode: CaptureMode;
  hasAnnotations: boolean;
  fileSize: number;
}

export interface HistoryRecord {
  id: string;
  filePath: string;
  previewThumbnail?: string;
  metadata: HistoryMetadata;
  createdAt: number;
}

export interface HistoryConfig {
  maxRecords: number;
  thumbnailMaxSize: number;
  thumbnailDir: string;
}

// ==================== 工作流规则（v1.5+） ====================

export type WorkflowTrigger =
  | "after-capture"
  | "after-annotate"
  | "after-pin";

export type WorkflowCondition =
  | { type: "mode"; operator: "eq" | "ne"; value: string }
  | { type: "size"; operator: "gt" | "lt"; width?: number; height?: number }
  | { type: "has-annotation"; value: boolean };

export type WorkflowAction =
  | { type: "auto-ocr" }
  | { type: "auto-translate"; targetLang: string }
  | { type: "auto-save"; directory: string }
  | { type: "auto-upload"; provider: string }
  | { type: "copy-to-clipboard" }
  | { type: "open-pin" };

export interface WorkflowRule {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  enabled: boolean;
}

// ==================== 工具函数 ====================

/**
 * 获取当前时间戳（毫秒）
 */
export function currentTimestampMs(): number {
  return Date.now();
}

/**
 * 生成唯一标识符
 */
export function generateId(prefix: string): string {
  return `${prefix}-${currentTimestampMs()}`;
}

/**
 * 验证 Region 是否有效
 */
export function isValidRegion(region: Region): boolean {
  return region.width > 0 && region.height > 0;
}

/**
 * 创建新的截图任务
 */
export function createCaptureTask(
  mode: CaptureMode,
  sourceImage: ImageData
): CaptureTask {
  const now = currentTimestampMs();
  return {
    id: generateId("task"),
    mode,
    region: null,
    sourceImage,
    annotationObjects: [],
    state: "capturing",
    exportState: null,
    createdAt: now,
    modifiedAt: now,
  };
}

/**
 * 创建新的标注对象
 */
export function createAnnotationObject(
  type: AnnotationType,
  bounds: BoundingBox,
  style: Partial<AnnotationStyle>,
  content: AnnotationContent
): AnnotationObject {
  return {
    id: generateId("anno"),
    annotationType: type,
    bounds,
    style: {
      strokeColor: "#FF0000",
      strokeWidth: 2,
      opacity: 1,
      ...style,
    },
    content,
    transform: { rotation: 0, scaleX: 1, scaleY: 1 },
    isSelected: false,
    createdAt: currentTimestampMs(),
  };
}
