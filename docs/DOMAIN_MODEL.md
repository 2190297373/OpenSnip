# OpenSnip Domain Model / 领域模型

> **Version**: 1.0.0  
> **Status**: Active  
> **Scope**: 前后端统一数据领域定义

---

## 设计原则

1. **轻量历史** — CaptureTask 只保留当前工作会话，不做审计系统
2. **前后端对齐** — 同一实体在 Rust 和 TypeScript 中语义一致
3. **状态显式** — 所有状态转换必须显式定义，禁止隐式契约
4. **undo/redo 隔离** — 标注层的 undoStack 独立管理，不混入领域状态

---

## 核心实体

### 1. CaptureTask（截图任务）

截图任务的完整生命周期，从触发到导出/丢弃。

```typescript
interface CaptureTask {
  /** 全局唯一标识 */
  id: string;

  /** 截图模式 */
  mode: 'fullscreen' | 'region' | 'window';

  /** 截图区域（仅 region/window 模式有效） */
  region: Region | null;

  /** 源图像数据（PNG Base64） */
  sourceImage: ImageData;

  /** 标注对象列表 */
  annotationObjects: AnnotationObject[];

  /** 标注层撤销栈（独立管理） */
  undoStack: AnnotationAction[];

  /** 标注层重做栈 */
  redoStack: AnnotationAction[];

  /** 当前任务状态 */
  state: 'capturing' | 'annotating' | 'pinned' | 'saved' | 'discarded';

  /** 导出状态 */
  exportState: ExportState | null;

  /** 创建时间戳 */
  createdAt: number;

  /** 最后修改时间戳 */
  modifiedAt: number;
}
```

**状态机**:

```
capturing ──(截图完成)──→ annotating
annotating ──(点击钉图)──→ pinned
annotating ──(点击保存)──→ saved
annotating ──(关闭/取消)──→ discarded
pinned ──(关闭贴图)──→ discarded
```

**注意**: `undoStack` 和 `redoStack` 仅存在于前端内存中，不序列化到磁盘，也不发送到 Rust 后端。

---

### 2. ImageData（图像数据）

前后端交换图像的统一格式。

```typescript
interface ImageData {
  /** PNG 格式的 Base64 编码（含 data:image/png;base64, 前缀） */
  dataUrl: string;

  /** 图像宽度（像素） */
  width: number;

  /** 图像高度（像素） */
  height: number;

  /** 文件大小（字节，可选） */
  size?: number;
}
```

**Rust 对应结构**:

```rust
pub struct ImageData {
    pub data_url: String,
    pub width: u32,
    pub height: u32,
    pub size: Option<usize>,
}
```

---

### 3. AnnotationObject（标注对象）

标注画布上的单个元素。

```typescript
interface AnnotationObject {
  /** 全局唯一标识 */
  id: string;

  /** 标注类型 */
  type: 'rectangle' | 'ellipse' | 'arrow' | 'line' | 'text' | 'pencil' | 'mosaic';

  /** 边界框（相对于源图像的坐标） */
  bounds: BoundingBox;

  /** 样式属性 */
  style: AnnotationStyle;

  /** 类型特定内容 */
  content: AnnotationContent;

  /** 变换矩阵（旋转/缩放） */
  transform: Transform;

  /** 是否被选中 */
  isSelected: boolean;

  /** 创建时间戳 */
  createdAt: number;
}
```

```typescript
interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AnnotationStyle {
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
  fontSize?: number;
  fontFamily?: string;
  opacity: number;
}

interface Transform {
  rotation: number;  // 角度，0-360
  scaleX: number;    // 默认 1
  scaleY: number;    // 默认 1
}

type AnnotationContent =
  | { kind: 'path'; data: string }           // SVG path for pencil/arrow/line
  | { kind: 'text'; text: string }           // Text content
  | { kind: 'mosaic'; blockSize: number };   // Mosaic pixel block size
```

---

### 4. PinSession（贴图会话）

贴图窗口的运行时状态。

```typescript
interface PinSession {
  /** 全局唯一标识 */
  id: string;

  /** 来源任务标识 */
  sourceTaskId: string;

  /** 窗口状态 */
  windowState: 'normal' | 'minimized' | 'locked';

  /** 屏幕位置 */
  position: Position;

  /** 窗口尺寸 */
  size: Size;

  /** 是否锁定（鼠标穿透） */
  isLocked: boolean;

  /** 是否最小化 */
  isMinimized: boolean;

  /** Z-Index 层级 */
  zIndex: number;

  /** 图像数据 */
  image: ImageData;

  /** 创建时间戳 */
  createdAt: number;
}
```

**注意**: `PinSession` 是运行时对象，应用重启后丢失。持久化由 `HistoryRecord` 负责。

---

### 5. HistoryRecord（历史记录）

已保存截图的轻量级元数据，用于历史列表展示。

```typescript
interface HistoryRecord {
  /** 全局唯一标识 */
  id: string;

  /** 文件系统路径 */
  filePath: string;

  /** 缩略图 Base64（可选，延迟加载） */
  previewThumbnail?: string;

  /** 图像元数据 */
  metadata: HistoryMetadata;

  /** 创建时间戳 */
  createdAt: number;
}

interface HistoryMetadata {
  width: number;
  height: number;
  mode: 'fullscreen' | 'region' | 'window';
  hasAnnotations: boolean;
  fileSize: number;
}
```

**设计约束**:
- 历史记录只保存元数据和文件路径，不保存完整图像数据
- 缩略图按需生成，最大 128×128，缓存到 `%APPDATA%/OpenSnip/thumbnails/`
- 最多保留最近 100 条历史记录，超出时按 FIFO 清理

---

### 6. Region（区域）

屏幕上的一个矩形区域。

```typescript
interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

**验证规则**:
- `width > 0` 且 `height > 0`
- 坐标可为负（多显示器场景）

---

### 7. Position / Size（几何基础）

```typescript
interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}
```

---

### 8. ExportState（导出状态）

```typescript
interface ExportState {
  /** 导出格式 */
  format: 'png' | 'jpg' | 'clipboard';

  /** 导出路径（clipboard 为 null） */
  filePath: string | null;

  /** 导出时间戳 */
  exportedAt: number;

  /** 是否成功 */
  success: boolean;

  /** 错误信息（失败时） */
  error?: string;
}
```

---

### 9. WorkflowRule（工作流规则）【v1.5+】

用户自定义的截图后自动处理规则。

```typescript
interface WorkflowRule {
  /** 全局唯一标识 */
  id: string;

  /** 规则名称 */
  name: string;

  /** 触发时机 */
  trigger: 'after-capture' | 'after-annotate' | 'after-pin';

  /** 匹配条件 */
  conditions: WorkflowCondition[];

  /** 执行动作 */
  actions: WorkflowAction[];

  /** 是否启用 */
  enabled: boolean;
}

type WorkflowCondition =
  | { type: 'mode'; operator: 'eq' | 'ne'; value: string }
  | { type: 'size'; operator: 'gt' | 'lt'; width?: number; height?: number }
  | { type: 'has-annotation'; value: boolean };

type WorkflowAction =
  | { type: 'auto-ocr' }
  | { type: 'auto-translate'; targetLang: string }
  | { type: 'auto-save'; directory: string }
  | { type: 'auto-upload'; provider: string }
  | { type: 'copy-to-clipboard' }
  | { type: 'open-pin' };
```

**状态**: 设计中，v1.5+ 实现。

---

## 数据流规范

### 截图 → 标注 流程

```
[User] 触发截图热键
  ↓
[Frontend] SelectionOverlay 捕获区域
  ↓
[IPC] invoke("capture_as_png", { mode, region })
  ↓
[Rust] ScreenshotService::capture_region()
  ↓
[Rust] models::Screenshot::to_png_base64()
  ↓
[IPC] 返回 base64 字符串
  ↓
[Frontend] 创建 CaptureTask
  ↓
[Frontend] 渲染 AnnotationCanvas
  ↓
[Frontend] 用户标注 → 更新 annotationObjects / undoStack
```

### 标注 → 钉图 流程

```
[User] 点击"钉图"按钮
  ↓
[Frontend] 合并 sourceImage + annotationObjects 为最终图像
  ↓
[IPC] invoke("create_image_pin", { imageDataUrl, width, height })
  ↓
[Rust] PinService::create_image_pin()
  ↓
[Rust] 创建独立 WebviewWindow
  ↓
[Frontend] 打开 ?pin=true 路由，渲染 PinPage
  ↓
[Frontend] 更新 CaptureTask.state = 'pinned'
```

---

## 文件映射

| 实体 | TypeScript 路径 | Rust 路径 |
|------|-----------------|-----------|
| CaptureTask | `src/types/domain.ts` | `src-tauri/src/models/domain.rs` |
| ImageData | `src/types/domain.ts` | `src-tauri/src/models/domain.rs` |
| AnnotationObject | `src/types/domain.ts` | — (纯前端) |
| PinSession | `src/types/domain.ts` | `src-tauri/src/models/domain.rs` |
| HistoryRecord | `src/types/domain.ts` | `src-tauri/src/models/domain.rs` |
| WorkflowRule | `src/types/domain.ts` | — (v1.5+) |

---

## 变更记录

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-04-24 | 初始版本，确立六大核心实体 |
