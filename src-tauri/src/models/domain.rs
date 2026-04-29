//! OpenSnip 领域模型
//!
//! 本模块定义前后端统一的核心数据结构。
//! 所有类型必须保持与前端 `src/types/domain.ts` 语义一致。

use serde::{Deserialize, Serialize};

// ==================== 基础几何类型 ====================

/// 二维坐标
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

impl Position {
    pub fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }
}

/// 尺寸
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct Size {
    pub width: f64,
    pub height: f64,
}

impl Size {
    pub fn new(width: f64, height: f64) -> Self {
        Self { width, height }
    }
}

/// 矩形区域
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct Region {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

impl Region {
    pub fn new(x: i32, y: i32, width: u32, height: u32) -> Self {
        Self { x, y, width, height }
    }

    /// 验证区域是否有效（宽高大于0）
    pub fn is_valid(&self) -> bool {
        self.width > 0 && self.height > 0
    }
}

// ==================== 图像数据 ====================

/// 前后端交换的图像数据
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageData {
    /// PNG 格式的 Base64 编码（含 data:image/png;base64, 前缀）
    pub data_url: String,
    /// 图像宽度（像素）
    pub width: u32,
    /// 图像高度（像素）
    pub height: u32,
    /// 文件大小（字节，可选）
    #[serde(skip_serializing_if = "Option::is_none")]
    pub size: Option<usize>,
}

impl ImageData {
    pub fn new(data_url: String, width: u32, height: u32) -> Self {
        Self {
            data_url,
            width,
            height,
            size: None,
        }
    }

    /// 从 base64 数据估算文件大小
    pub fn estimate_size(&self) -> usize {
        // data:image/png;base64, 前缀约 22 字节
        let base64_len = self.data_url.len().saturating_sub(22);
        // base64 → 原始大小：每 4 个字符 → 3 字节
        base64_len * 3 / 4
    }
}

// ==================== 标注对象 ====================

/// 标注类型
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum AnnotationType {
    Rectangle,
    Ellipse,
    Arrow,
    Line,
    Text,
    Pencil,
    Mosaic,
}

/// 边界框
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct BoundingBox {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

impl BoundingBox {
    pub fn new(x: f64, y: f64, width: f64, height: f64) -> Self {
        Self { x, y, width, height }
    }
}

/// 标注样式
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AnnotationStyle {
    pub stroke_color: String,
    pub stroke_width: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fill_color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub font_size: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub font_family: Option<String>,
    pub opacity: f64,
}

impl Default for AnnotationStyle {
    fn default() -> Self {
        Self {
            stroke_color: "#FF0000".to_string(),
            stroke_width: 2.0,
            fill_color: None,
            font_size: Some(16.0),
            font_family: Some("Arial".to_string()),
            opacity: 1.0,
        }
    }
}

/// 变换矩阵
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct Transform {
    /// 旋转角度（0-360）
    pub rotation: f64,
    /// X 轴缩放
    pub scale_x: f64,
    /// Y 轴缩放
    pub scale_y: f64,
}

impl Default for Transform {
    fn default() -> Self {
        Self {
            rotation: 0.0,
            scale_x: 1.0,
            scale_y: 1.0,
        }
    }
}

/// 标注内容（类型特定）
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum AnnotationContent {
    /// SVG path（铅笔/箭头/线条）
    Path { data: String },
    /// 文字内容
    Text { text: String },
    /// 马赛克
    Mosaic { block_size: u32 },
}

/// 标注对象（单个元素）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnnotationObject {
    pub id: String,
    pub annotation_type: AnnotationType,
    pub bounds: BoundingBox,
    pub style: AnnotationStyle,
    pub content: AnnotationContent,
    pub transform: Transform,
    pub is_selected: bool,
    pub created_at: i64,
}

// ==================== 截图任务 ====================

/// 截图模式
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum CaptureMode {
    Fullscreen,
    Region,
    Window,
}

/// 截图任务状态
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum CaptureTaskState {
    /// 正在截图（选择区域中）
    Capturing,
    /// 正在标注
    Annotating,
    /// 已钉图
    Pinned,
    /// 已保存
    Saved,
    /// 已丢弃
    Discarded,
}

/// 导出状态
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportState {
    pub format: ExportFormat,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file_path: Option<String>,
    pub exported_at: i64,
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

/// 导出格式
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ExportFormat {
    Png,
    Jpg,
    Clipboard,
}

/// 截图任务（核心领域对象）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaptureTask {
    pub id: String,
    pub mode: CaptureMode,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub region: Option<Region>,
    pub source_image: ImageData,
    pub annotation_objects: Vec<AnnotationObject>,
    pub state: CaptureTaskState,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub export_state: Option<ExportState>,
    pub created_at: i64,
    pub modified_at: i64,
}

impl CaptureTask {
    pub fn new(id: String, mode: CaptureMode, source_image: ImageData) -> Self {
        let now = current_timestamp_ms();
        Self {
            id,
            mode,
            region: None,
            source_image,
            annotation_objects: Vec::new(),
            state: CaptureTaskState::Capturing,
            export_state: None,
            created_at: now,
            modified_at: now,
        }
    }

    /// 更新状态
    pub fn set_state(&mut self, state: CaptureTaskState) {
        self.state = state;
        self.modified_at = current_timestamp_ms();
    }

    /// 添加标注对象
    pub fn add_annotation(&mut self, obj: AnnotationObject) {
        self.annotation_objects.push(obj);
        self.modified_at = current_timestamp_ms();
    }

    /// 设置导出状态
    pub fn set_export_state(&mut self, export_state: ExportState) {
        self.export_state = Some(export_state);
        self.modified_at = current_timestamp_ms();
    }
}

// ==================== 贴图会话 ====================

/// 贴图窗口状态
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum PinWindowState {
    Normal,
    Minimized,
    Locked,
}

/// 贴图会话（运行时对象）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PinSession {
    pub id: String,
    pub source_task_id: String,
    pub window_state: PinWindowState,
    pub position: Position,
    pub size: Size,
    pub is_locked: bool,
    pub is_minimized: bool,
    pub z_index: i32,
    pub image: ImageData,
    pub created_at: i64,
}

// ==================== 历史记录 ====================

/// 历史记录元数据
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryMetadata {
    pub width: u32,
    pub height: u32,
    pub mode: CaptureMode,
    pub has_annotations: bool,
    pub file_size: u64,
}

/// 历史记录（轻量级，只保存元数据）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryRecord {
    pub id: String,
    pub file_path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub preview_thumbnail: Option<String>,
    pub metadata: HistoryMetadata,
    pub created_at: i64,
}

/// 历史记录管理配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryConfig {
    /// 最大保留数量
    pub max_records: usize,
    /// 缩略图最大尺寸
    pub thumbnail_max_size: u32,
    /// 缩略图缓存目录
    pub thumbnail_dir: String,
}

impl Default for HistoryConfig {
    fn default() -> Self {
        Self {
            max_records: 100,
            thumbnail_max_size: 128,
            thumbnail_dir: String::from("thumbnails"),
        }
    }
}

// ==================== 工作流规则（v1.5+） ====================

/// 工作流触发时机
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum WorkflowTrigger {
    AfterCapture,
    AfterAnnotate,
    AfterPin,
}

/// 工作流条件
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "kebab-case")]
pub enum WorkflowCondition {
    Mode { operator: String, value: String },
    Size { operator: String, width: Option<u32>, height: Option<u32> },
    HasAnnotation { value: bool },
}

/// 工作流动作
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "kebab-case")]
pub enum WorkflowAction {
    AutoOcr,
    AutoTranslate { target_lang: String },
    AutoSave { directory: String },
    AutoUpload { provider: String },
    CopyToClipboard,
    OpenPin,
}

/// 工作流规则
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowRule {
    pub id: String,
    pub name: String,
    pub trigger: WorkflowTrigger,
    pub conditions: Vec<WorkflowCondition>,
    pub actions: Vec<WorkflowAction>,
    pub enabled: bool,
}

// ==================== 工具函数 ====================

/// 获取当前时间戳（毫秒）
pub fn current_timestamp_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as i64
}

/// 生成唯一标识符
pub fn generate_id(prefix: &str) -> String {
    format!("{}-{}", prefix, current_timestamp_ms())
}
