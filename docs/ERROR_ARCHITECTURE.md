# OpenSnip Error Architecture / 错误体系

> **Version**: 1.0.0  
> **Status**: Active  
> **Scope**: 统一错误码、前后端映射、日志体系

---

## 设计原则

1. **Rust 层返回错误码** — 系统层只关心错误分类和调试信息
2. **前端负责用户文案** — 产品层文案通过 i18n 映射，支持多语言扩展
3. **结构化错误** — 所有错误包含 code + message + details，便于日志分析和调试
4. **用户友好建议** — 错误响应可包含 suggestion，指导用户解决问题

---

## 错误码体系

### 错误码格式

```
CATEGORY_NUMBER
  │       │
  │       └─ 三位数字，同一类别内递增
  └───────── 一位字母，标识错误类别
```

### 错误类别

| 前缀 | 类别 | 范围 | 说明 |
|------|------|------|------|
| `S` | Screenshot | 1000-1999 | 截图相关 |
| `F` | File / IO | 2000-2999 | 文件读写、权限 |
| `O` | OCR | 3000-3999 | 文字识别 |
| `N` | Network | 4000-4999 | 网络请求、API |
| `R` | Recording | 5000-5999 | 屏幕录制 |
| `P` | Pin | 6000-6999 | 贴图窗口 |
| `C` | Config | 7000-7999 | 配置、设置 |
| `U` | Unknown | 9000-9999 | 未知错误、系统错误 |

---

## 错误码定义

### Screenshot (S1xxx)

| 错误码 | 标识符 | Rust Message | 前端中文文案 | 前端英文文案 |
|--------|--------|--------------|--------------|--------------|
| `S1001` | `CaptureFailed` | Failed to capture screen | 截图失败，无法获取屏幕内容 | Failed to capture screen |
| `S1002` | `InvalidRegion` | Invalid capture region | 截图区域无效（宽高必须大于0） | Invalid capture region |
| `S1003` | `EncodeFailed` | PNG encoding failed | 图像编码失败 | Image encoding failed |
| `S1004` | `GetDCFailed` | Failed to get device context | 无法获取屏幕设备上下文 | Failed to get screen context |
| `S1005` | `BitBltFailed` | BitBlt operation failed | 屏幕复制操作失败 | Screen copy operation failed |
| `S1006` | `MonitorNotFound` | Monitor not found | 未找到指定显示器 | Monitor not found |
| `S1007` | `WindowNotFound` | Window not found | 未找到指定窗口 | Window not found |

### File / IO (F2xxx)

| 错误码 | 标识符 | Rust Message | 前端中文文案 | 前端英文文案 |
|--------|--------|--------------|--------------|--------------|
| `F2001` | `SaveFailed` | Failed to save file | 保存文件失败 | Failed to save file |
| `F2002` | `PermissionDenied` | Permission denied | 没有权限访问该路径 | Permission denied |
| `F2003` | `DirectoryNotFound` | Directory not found | 目录不存在 | Directory not found |
| `F2004` | `DiskFull` | Disk is full | 磁盘空间不足 | Disk is full |
| `F2005` | `InvalidPath` | Invalid file path | 文件路径无效 | Invalid file path |

### OCR (O3xxx)

| 错误码 | 标识符 | Rust Message | 前端中文文案 | 前端英文文案 |
|--------|--------|--------------|--------------|--------------|
| `O3001` | `OcrNotAvailable` | OCR engine not available | OCR 引擎不可用 | OCR engine not available |
| `O3002` | `OcrLanguageNotSupported` | Language not supported | 不支持该语言的 OCR 识别 | Language not supported for OCR |
| `O3003` | `OcrImageInvalid` | Invalid image for OCR | 图像格式无效，无法识别 | Invalid image for OCR |
| `O3004` | `OcrEngineLoadFailed` | Failed to load OCR engine | OCR 引擎加载失败 | Failed to load OCR engine |

### Network (N4xxx)

| 错误码 | 标识符 | Rust Message | 前端中文文案 | 前端英文文案 |
|--------|--------|--------------|--------------|--------------|
| `N4001` | `TranslationFailed` | Translation API request failed | 翻译请求失败 | Translation request failed |
| `N4002` | `NetworkTimeout` | Network request timeout | 网络请求超时，请检查网络连接 | Network timeout, please check connection |
| `N4003` | `ApiRateLimited` | API rate limit exceeded | API 请求频率超限，请稍后再试 | API rate limit exceeded |
| `N4004` | `InvalidApiResponse` | Invalid API response | API 返回数据格式无效 | Invalid API response |
| `N4005` | `ServiceUnavailable` | Service temporarily unavailable | 翻译服务暂时不可用 | Service temporarily unavailable |

### Recording (R5xxx)

| 错误码 | 标识符 | Rust Message | 前端中文文案 | 前端英文文案 |
|--------|--------|--------------|--------------|--------------|
| `R5001` | `RecordingNotAvailable` | Recording not available | 录屏功能尚未实现 | Recording feature not available |
| `R5002` | `EncoderNotFound` | Video encoder not found | 未找到视频编码器 | Video encoder not found |
| `R5003` | `RecordingInProgress` | Recording already in progress | 当前正在录制中 | Recording already in progress |

### Pin (P6xxx)

| 错误码 | 标识符 | Rust Message | 前端中文文案 | 前端英文文案 |
|--------|--------|--------------|--------------|--------------|
| `P6001` | `PinCreateFailed` | Failed to create pin window | 创建贴图窗口失败 | Failed to create pin window |
| `P6002` | `PinNotFound` | Pin window not found | 贴图窗口不存在 | Pin window not found |

### Config (C7xxx)

| 错误码 | 标识符 | Rust Message | 前端中文文案 | 前端英文文案 |
|--------|--------|--------------|--------------|--------------|
| `C7001` | `ConfigReadFailed` | Failed to read configuration | 读取配置失败 | Failed to read configuration |
| `C7002` | `ConfigWriteFailed` | Failed to write configuration | 保存配置失败 | Failed to write configuration |
| `C7003` | `InvalidConfig` | Invalid configuration format | 配置文件格式无效 | Invalid configuration format |

### Unknown (U9xxx)

| 错误码 | 标识符 | Rust Message | 前端中文文案 | 前端英文文案 |
|--------|--------|--------------|--------------|--------------|
| `U9001` | `WindowsApiError` | Windows API call failed | 系统 API 调用失败 | Windows API call failed |
| `U9999` | `Unknown` | An unknown error occurred | 发生未知错误，请重试或提交 Issue | An unknown error occurred |

---

## 错误响应格式

### Rust → 前端

```json
{
  "success": false,
  "error": {
    "code": "S1001",
    "message": "Failed to capture screen: BitBlt failed",
    "details": {
      "api": "BitBlt",
      "last_error": 6
    }
  }
}
```

### 前端 → 用户

```typescript
// 前端根据 code 映射 i18n 文案
const errorMap: Record<string, { zh: string; en: string; suggestion?: { zh: string; en: string } }> = {
  "S1001": {
    zh: "截图失败，无法获取屏幕内容",
    en: "Failed to capture screen",
    suggestion: {
      zh: "请检查是否有其他应用占用了屏幕录制权限",
      en: "Check if another app is using screen capture"
    }
  }
};
```

---

## Rust 错误实现

```rust
// src-tauri/src/utils/error.rs
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug, Clone, Serialize, Deserialize)]
pub enum OpenSnipError {
    // Screenshot (S1xxx)
    #[error("Failed to capture screen: {reason}")]
    CaptureFailed { code: String, reason: String },

    #[error("Invalid capture region: {x},{y} {width}x{height}")]
    InvalidRegion { code: String, x: i32, y: i32, width: u32, height: u32 },

    #[error("PNG encoding failed: {reason}")]
    EncodeFailed { code: String, reason: String },

    // File / IO (F2xxx)
    #[error("Failed to save file: {path}")]
    SaveFailed { code: String, path: String, reason: String },

    #[error("Permission denied: {path}")]
    PermissionDenied { code: String, path: String },

    // OCR (O3xxx)
    #[error("OCR engine not available: {engine}")]
    OcrNotAvailable { code: String, engine: String },

    // Network (N4xxx)
    #[error("Translation API request failed: {status}")]
    TranslationFailed { code: String, api: String, status: u16 },

    #[error("Network timeout: {url}")]
    NetworkTimeout { code: String, url: String, timeout_ms: u64 },

    // Unknown (U9xxx)
    #[error("Windows API call failed: {api}, last_error={last_error}")]
    WindowsApiError { code: String, api: String, last_error: u32 },

    #[error("An unknown error occurred: {message}")]
    Unknown { code: String, message: String },
}

impl OpenSnipError {
    pub fn code(&self) -> &str {
        match self {
            Self::CaptureFailed { code, .. } => code,
            Self::InvalidRegion { code, .. } => code,
            Self::EncodeFailed { code, .. } => code,
            Self::SaveFailed { code, .. } => code,
            Self::PermissionDenied { code, .. } => code,
            Self::OcrNotAvailable { code, .. } => code,
            Self::TranslationFailed { code, .. } => code,
            Self::NetworkTimeout { code, .. } => code,
            Self::WindowsApiError { code, .. } => code,
            Self::Unknown { code, .. } => code,
        }
    }
}

// 统一 Result 类型
pub type OpenSnipResult<T> = Result<T, OpenSnipError>;
```

---

## 前端错误映射

```typescript
// src/utils/error.ts
export interface OpenSnipErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ErrorDisplay {
  title: string;
  description: string;
  suggestion?: string;
}

const ERROR_MAP: Record<string, { zh: ErrorDisplay; en: ErrorDisplay }> = {
  "S1001": {
    zh: {
      title: "截图失败",
      description: "无法获取屏幕内容",
      suggestion: "请检查是否有其他应用占用了屏幕录制权限",
    },
    en: {
      title: "Screenshot Failed",
      description: "Failed to capture screen content",
      suggestion: "Check if another app is using screen capture",
    },
  },
  // ... 更多映射
};

export function getErrorDisplay(code: string, lang: 'zh' | 'en' = 'zh'): ErrorDisplay {
  const mapped = ERROR_MAP[code];
  if (mapped) {
    return mapped[lang];
  }
  // Fallback
  return {
    title: lang === 'zh' ? '未知错误' : 'Unknown Error',
    description: lang === 'zh' ? `错误码: ${code}` : `Error code: ${code}`,
    suggestion: lang === 'zh' ? '请重试或提交 Issue' : 'Please retry or submit an issue',
  };
}
```

---

## 日志体系

### 日志级别

| 级别 | 用途 | 输出位置 | 保留策略 |
|------|------|----------|----------|
| `ERROR` | 用户可见的错误（截图失败、保存失败） | 日志文件 + 可选弹窗 | 7 天 |
| `WARN` | 非致命异常（OCR 语言包缺失、API 限流） | 日志文件 | 7 天 |
| `INFO` | 关键用户操作（截图完成、贴图创建、设置变更） | 日志文件 | 7 天 |
| `DEBUG` | 开发调试信息（API 调用参数、性能计时） | 日志文件（dev 模式） | 3 天 |
| `TRACE` | 详细调用链 | 日志文件（仅 debug 构建） | 1 天 |

### 日志位置

```
%APPDATA%/
└── OpenSnip/
    ├── config.json           # 用户配置
    ├── logs/
    │   ├── opensnip-2026-04-24.log
    │   ├── opensnip-2026-04-23.log
    │   └── opensnip-2026-04-22.log
    ├── thumbnails/           # 历史缩略图缓存
    └── crash-dumps/
        └── crash-20260424-031200.json
```

### 日志格式

```
[2026-04-24T03:12:00.123Z] [INFO] [screenshot] Screenshot captured: 1920x1080 in 45ms
[2026-04-24T03:12:05.456Z] [ERROR] [screenshot] S1001: Failed to capture screen: BitBlt failed | details={"api":"BitBlt","last_error":6}
```

### Rust 日志实现

```rust
// 使用 env_logger + log crate（已集成）
// 生产环境默认级别: info
// 开发环境默认级别: debug

// 初始化（已在 main.rs 中）
env_logger::Builder::from_env(
    env_logger::Env::default().default_filter_or("info")
).init();

// 使用
log::info!("Screenshot captured: {}x{}", width, height);
log::error!("S1001: Failed to capture screen: {}", e);
```

### 前端日志实现

```typescript
// src/utils/logger.ts
const isDev = import.meta.env.DEV;

export const logger = {
  error: (code: string, message: string, details?: unknown) => {
    console.error(`[ERROR] ${code}: ${message}`, details);
    // v1.3+ 可接入远程上报
  },
  warn: (message: string, details?: unknown) => {
    console.warn(`[WARN] ${message}`, details);
  },
  info: (message: string, details?: unknown) => {
    console.info(`[INFO] ${message}`, details);
  },
  debug: (message: string, details?: unknown) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, details);
    }
  },
};
```

---

## 错误处理最佳实践

### Rust 层

```rust
// 1. 使用 ? 传播错误，最后统一映射为 OpenSnipError
pub fn capture_region(&self, region: &CaptureRegion) -> OpenSnipResult<Screenshot> {
    let data = self.capture_screen_data(region.x, region.y, region.width, region.height)
        .map_err(|e| OpenSnipError::CaptureFailed {
            code: "S1001".to_string(),
            reason: e,
        })?;
    
    Ok(Screenshot::new(data, region.width, region.height, region.clone()))
}

// 2. Win32 API 错误转换为统一错误
fn map_win32_error(api: &str, last_error: u32) -> OpenSnipError {
    OpenSnipError::WindowsApiError {
        code: "U9001".to_string(),
        api: api.to_string(),
        last_error,
    }
}
```

### 前端层

```typescript
// 3. 统一封装 invoke，自动错误映射
async function invokeWithError<T>(cmd: string, args?: unknown): Promise<T> {
  try {
    return await invoke<T>(cmd, args);
  } catch (error) {
    const err = error as OpenSnipErrorResponse;
    const display = getErrorDisplay(err.error.code, currentLang);
    
    // 显示 Toast 通知
    toast.error(display.title, { description: display.description });
    
    // 记录日志
    logger.error(err.error.code, err.error.message, err.error.details);
    
    throw error; // 继续抛出，供调用方处理
  }
}
```

---

## 变更记录

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-04-24 | 初始版本，确立错误码体系、前后端映射、日志体系 |
