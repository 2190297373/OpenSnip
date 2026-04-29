use serde::{Deserialize, Serialize};
use thiserror::Error;

/// OpenSnip 统一错误类型
/// 
/// 设计原则：
/// 1. Rust 层只返回错误码 + 调试信息
/// 2. 前端通过 i18n 映射用户可见文案
/// 3. 所有错误包含 code + message + details，便于日志分析
#[derive(Error, Debug, Clone, Serialize, Deserialize)]
pub enum OpenSnipError {
    // ==================== Screenshot (S1xxx) ====================
    #[error("Failed to capture screen: {reason}")]
    CaptureFailed { code: String, reason: String },

    #[error("Invalid capture region: {x},{y} {width}x{height}")]
    InvalidRegion { code: String, x: i32, y: i32, width: u32, height: u32 },

    #[error("PNG encoding failed: {reason}")]
    EncodeFailed { code: String, reason: String },

    #[error("Failed to get device context")]
    GetDCFailed { code: String, reason: String },

    #[error("BitBlt operation failed: {reason}")]
    BitBltFailed { code: String, reason: String },

    #[error("Monitor not found: {index}")]
    MonitorNotFound { code: String, index: usize },

    #[error("Window not found: {hwnd}")]
    WindowNotFound { code: String, hwnd: isize },

    // ==================== File / IO (F2xxx) ====================
    #[error("Failed to save file: {path}")]
    SaveFailed { code: String, path: String, reason: String },

    #[error("Permission denied: {path}")]
    PermissionDenied { code: String, path: String },

    #[error("Directory not found: {path}")]
    DirectoryNotFound { code: String, path: String },

    #[error("Disk is full")]
    DiskFull { code: String },

    #[error("Invalid file path: {path}")]
    InvalidPath { code: String, path: String },

    // ==================== OCR (O3xxx) ====================
    #[error("OCR engine not available: {engine}")]
    OcrNotAvailable { code: String, engine: String },

    #[error("OCR language not supported: {lang}")]
    OcrLanguageNotSupported { code: String, lang: String },

    #[error("Invalid image for OCR: {reason}")]
    OcrImageInvalid { code: String, reason: String },

    #[error("Failed to load OCR engine: {reason}")]
    OcrEngineLoadFailed { code: String, reason: String },

    // ==================== Network (N4xxx) ====================
    #[error("Translation API request failed: {api} status={status}")]
    TranslationFailed { code: String, api: String, status: u16 },

    #[error("Network timeout: {url} after {timeout_ms}ms")]
    NetworkTimeout { code: String, url: String, timeout_ms: u64 },

    #[error("API rate limit exceeded: {api}")]
    ApiRateLimited { code: String, api: String },

    #[error("Invalid API response: {api}")]
    InvalidApiResponse { code: String, api: String },

    #[error("Service temporarily unavailable: {api}")]
    ServiceUnavailable { code: String, api: String },

    // ==================== Recording (R5xxx) ====================
    #[error("Recording feature not available")]
    RecordingNotAvailable { code: String },

    #[error("Video encoder not found: {encoder}")]
    EncoderNotFound { code: String, encoder: String },

    #[error("Recording already in progress")]
    RecordingInProgress { code: String },

    // ==================== Pin (P6xxx) ====================
    #[error("Failed to create pin window: {reason}")]
    PinCreateFailed { code: String, reason: String },

    #[error("Pin window not found: {id}")]
    PinNotFound { code: String, id: String },

    // ==================== Config (C7xxx) ====================
    #[error("Failed to read configuration: {reason}")]
    ConfigReadFailed { code: String, reason: String },

    #[error("Failed to write configuration: {reason}")]
    ConfigWriteFailed { code: String, reason: String },

    #[error("Invalid configuration format: {reason}")]
    InvalidConfig { code: String, reason: String },

    // ==================== Unknown (U9xxx) ====================
    #[error("Windows API call failed: {api}, last_error={last_error}")]
    WindowsApiError { code: String, api: String, last_error: u32 },

    #[error("An unknown error occurred: {message}")]
    Unknown { code: String, message: String },
}

impl OpenSnipError {
    /// 获取错误码
    pub fn code(&self) -> &str {
        match self {
            Self::CaptureFailed { code, .. } => code,
            Self::InvalidRegion { code, .. } => code,
            Self::EncodeFailed { code, .. } => code,
            Self::GetDCFailed { code, .. } => code,
            Self::BitBltFailed { code, .. } => code,
            Self::MonitorNotFound { code, .. } => code,
            Self::WindowNotFound { code, .. } => code,
            Self::SaveFailed { code, .. } => code,
            Self::PermissionDenied { code, .. } => code,
            Self::DirectoryNotFound { code, .. } => code,
            Self::DiskFull { code, .. } => code,
            Self::InvalidPath { code, .. } => code,
            Self::OcrNotAvailable { code, .. } => code,
            Self::OcrLanguageNotSupported { code, .. } => code,
            Self::OcrImageInvalid { code, .. } => code,
            Self::OcrEngineLoadFailed { code, .. } => code,
            Self::TranslationFailed { code, .. } => code,
            Self::NetworkTimeout { code, .. } => code,
            Self::ApiRateLimited { code, .. } => code,
            Self::InvalidApiResponse { code, .. } => code,
            Self::ServiceUnavailable { code, .. } => code,
            Self::RecordingNotAvailable { code, .. } => code,
            Self::EncoderNotFound { code, .. } => code,
            Self::RecordingInProgress { code, .. } => code,
            Self::PinCreateFailed { code, .. } => code,
            Self::PinNotFound { code, .. } => code,
            Self::ConfigReadFailed { code, .. } => code,
            Self::ConfigWriteFailed { code, .. } => code,
            Self::InvalidConfig { code, .. } => code,
            Self::WindowsApiError { code, .. } => code,
            Self::Unknown { code, .. } => code,
        }
    }

    /// 获取用户友好的建议（英文）
    pub fn suggestion(&self) -> Option<String> {
        match self {
            Self::CaptureFailed { .. } => Some(
                "Check if another app is using screen capture. Try running as administrator.".to_string(),
            ),
            Self::PermissionDenied { .. } => Some(
                "Run the application as administrator or choose a different save location.".to_string(),
            ),
            Self::DiskFull { .. } => Some(
                "Free up disk space and try again.".to_string(),
            ),
            Self::OcrNotAvailable { .. } => Some(
                "OCR feature is not yet implemented. It will be available in a future update.".to_string(),
            ),
            Self::NetworkTimeout { .. } => Some(
                "Check your internet connection and try again.".to_string(),
            ),
            Self::ApiRateLimited { .. } => Some(
                "Too many requests. Please wait a moment and try again.".to_string(),
            ),
            Self::RecordingNotAvailable { .. } => Some(
                "Recording feature is not yet implemented. It will be available in a future update.".to_string(),
            ),
            Self::ConfigReadFailed { .. } => Some(
                "Try resetting settings to default.".to_string(),
            ),
            Self::WindowsApiError { .. } => Some(
                "A system error occurred. Try restarting the application.".to_string(),
            ),
            _ => None,
        }
    }
}

/// 统一 Result 类型
pub type OpenSnipResult<T> = Result<T, OpenSnipError>;

// ==================== 便捷构造函数 ====================

/// 截图失败
pub fn capture_failed(reason: impl Into<String>) -> OpenSnipError {
    OpenSnipError::CaptureFailed {
        code: "S1001".to_string(),
        reason: reason.into(),
    }
}

/// 无效截图区域
pub fn invalid_region(x: i32, y: i32, width: u32, height: u32) -> OpenSnipError {
    OpenSnipError::InvalidRegion {
        code: "S1002".to_string(),
        x,
        y,
        width,
        height,
    }
}

/// 编码失败
pub fn encode_failed(reason: impl Into<String>) -> OpenSnipError {
    OpenSnipError::EncodeFailed {
        code: "S1003".to_string(),
        reason: reason.into(),
    }
}

/// 保存失败
pub fn save_failed(path: impl Into<String>, reason: impl Into<String>) -> OpenSnipError {
    OpenSnipError::SaveFailed {
        code: "F2001".to_string(),
        path: path.into(),
        reason: reason.into(),
    }
}

/// 权限拒绝
pub fn permission_denied(path: impl Into<String>) -> OpenSnipError {
    OpenSnipError::PermissionDenied {
        code: "F2002".to_string(),
        path: path.into(),
    }
}

/// OCR 不可用
pub fn ocr_not_available(engine: impl Into<String>) -> OpenSnipError {
    OpenSnipError::OcrNotAvailable {
        code: "O3001".to_string(),
        engine: engine.into(),
    }
}

/// 翻译失败
pub fn translation_failed(api: impl Into<String>, status: u16) -> OpenSnipError {
    OpenSnipError::TranslationFailed {
        code: "N4001".to_string(),
        api: api.into(),
        status,
    }
}

/// 网络超时
pub fn network_timeout(url: impl Into<String>, timeout_ms: u64) -> OpenSnipError {
    OpenSnipError::NetworkTimeout {
        code: "N4002".to_string(),
        url: url.into(),
        timeout_ms,
    }
}

/// Windows API 错误
pub fn windows_api_error(api: impl Into<String>, last_error: u32) -> OpenSnipError {
    OpenSnipError::WindowsApiError {
        code: "U9001".to_string(),
        api: api.into(),
        last_error,
    }
}

/// 未知错误
pub fn unknown_error(message: impl Into<String>) -> OpenSnipError {
    OpenSnipError::Unknown {
        code: "U9999".to_string(),
        message: message.into(),
    }
}

// ==================== 从标准错误转换 ====================

impl From<std::io::Error> for OpenSnipError {
    fn from(err: std::io::Error) -> Self {
        let reason = err.to_string();
        match err.kind() {
            std::io::ErrorKind::PermissionDenied => OpenSnipError::PermissionDenied {
                code: "F2002".to_string(),
                path: String::new(),
            },
            std::io::ErrorKind::NotFound => OpenSnipError::DirectoryNotFound {
                code: "F2003".to_string(),
                path: String::new(),
            },
            std::io::ErrorKind::WriteZero | std::io::ErrorKind::Other => {
                // 检查是否是磁盘满
                if reason.contains("disk") || reason.contains("space") {
                    OpenSnipError::DiskFull {
                        code: "F2004".to_string(),
                    }
                } else {
                    OpenSnipError::SaveFailed {
                        code: "F2001".to_string(),
                        path: String::new(),
                        reason,
                    }
                }
            }
            _ => OpenSnipError::SaveFailed {
                code: "F2001".to_string(),
                path: String::new(),
                reason,
            },
        }
    }
}
