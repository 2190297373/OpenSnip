/**
 * OpenSnip 前端错误体系
 * 
 * 设计原则：
 * 1. Rust 返回 code + message，前端映射用户可见文案
 * 2. 支持 i18n 多语言（当前中英）
 * 3. 提供用户友好的错误建议
 */

export interface OpenSnipErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ErrorDisplay {
  /** 错误标题 */
  title: string;
  /** 错误描述 */
  description: string;
  /** 用户建议（可选） */
  suggestion?: string;
}

/** 错误码映射表 */
const ERROR_MAP: Record<string, { zh: ErrorDisplay; en: ErrorDisplay }> = {
  // Screenshot (S1xxx)
  S1001: {
    zh: { title: "截图失败", description: "无法获取屏幕内容", suggestion: "请检查是否有其他应用占用了屏幕录制权限，或尝试以管理员身份运行" },
    en: { title: "Screenshot Failed", description: "Failed to capture screen content", suggestion: "Check if another app is using screen capture, or try running as administrator" },
  },
  S1002: {
    zh: { title: "无效截图区域", description: "截图区域宽高必须大于0", suggestion: "请重新选择有效的截图区域" },
    en: { title: "Invalid Region", description: "Capture region width and height must be greater than 0", suggestion: "Please reselect a valid capture region" },
  },
  S1003: {
    zh: { title: "图像编码失败", description: "PNG 编码过程中发生错误", suggestion: "请尝试重新截图" },
    en: { title: "Encoding Failed", description: "Error during PNG encoding", suggestion: "Please try capturing again" },
  },
  S1004: {
    zh: { title: "获取屏幕失败", description: "无法获取屏幕设备上下文", suggestion: "请尝试以管理员身份运行应用" },
    en: { title: "Screen Access Failed", description: "Failed to get screen device context", suggestion: "Try running the application as administrator" },
  },
  S1005: {
    zh: { title: "屏幕复制失败", description: "BitBlt 操作失败", suggestion: "请检查显卡驱动或尝试以管理员身份运行" },
    en: { title: "Screen Copy Failed", description: "BitBlt operation failed", suggestion: "Check your graphics driver or try running as administrator" },
  },
  S1006: {
    zh: { title: "显示器未找到", description: "指定的显示器不存在", suggestion: "请检查显示器连接" },
    en: { title: "Monitor Not Found", description: "Specified monitor does not exist", suggestion: "Please check your monitor connection" },
  },
  S1007: {
    zh: { title: "窗口未找到", description: "指定的窗口不存在或已关闭", suggestion: "请重新选择窗口" },
    en: { title: "Window Not Found", description: "Specified window does not exist or is closed", suggestion: "Please reselect the window" },
  },

  // File / IO (F2xxx)
  F2001: {
    zh: { title: "保存失败", description: "无法保存文件", suggestion: "请检查磁盘空间或选择其他保存位置" },
    en: { title: "Save Failed", description: "Failed to save file", suggestion: "Check disk space or choose a different save location" },
  },
  F2002: {
    zh: { title: "权限不足", description: "没有权限访问该路径", suggestion: "请以管理员身份运行应用或选择其他路径" },
    en: { title: "Permission Denied", description: "No permission to access this path", suggestion: "Run as administrator or choose a different path" },
  },
  F2003: {
    zh: { title: "目录不存在", description: "指定的保存目录不存在", suggestion: "请创建目录或选择其他路径" },
    en: { title: "Directory Not Found", description: "The specified save directory does not exist", suggestion: "Create the directory or choose a different path" },
  },
  F2004: {
    zh: { title: "磁盘已满", description: "磁盘空间不足，无法保存文件", suggestion: "请清理磁盘空间后重试" },
    en: { title: "Disk Full", description: "Insufficient disk space to save file", suggestion: "Free up disk space and try again" },
  },
  F2005: {
    zh: { title: "无效路径", description: "文件路径格式无效", suggestion: "请检查路径是否包含非法字符" },
    en: { title: "Invalid Path", description: "File path format is invalid", suggestion: "Check if the path contains illegal characters" },
  },

  // OCR (O3xxx)
  O3001: {
    zh: { title: "OCR 不可用", description: "OCR 引擎尚未实现", suggestion: "该功能将在后续版本推出" },
    en: { title: "OCR Not Available", description: "OCR engine is not yet implemented", suggestion: "This feature will be available in a future update" },
  },
  O3002: {
    zh: { title: "语言不支持", description: "当前不支持该语言的 OCR 识别", suggestion: "请尝试其他语言或安装语言包" },
    en: { title: "Language Not Supported", description: "OCR is not supported for this language", suggestion: "Try another language or install the language pack" },
  },
  O3003: {
    zh: { title: "图像无效", description: "图像格式无效，无法识别", suggestion: "请确保截图内容清晰可见" },
    en: { title: "Invalid Image", description: "Image format is invalid for OCR", suggestion: "Make sure the screenshot content is clearly visible" },
  },
  O3004: {
    zh: { title: "引擎加载失败", description: "OCR 引擎加载失败", suggestion: "请重启应用后重试" },
    en: { title: "Engine Load Failed", description: "Failed to load OCR engine", suggestion: "Please restart the application and try again" },
  },

  // Network (N4xxx)
  N4001: {
    zh: { title: "翻译失败", description: "翻译 API 请求失败", suggestion: "请检查网络连接或稍后重试" },
    en: { title: "Translation Failed", description: "Translation API request failed", suggestion: "Check your internet connection or try again later" },
  },
  N4002: {
    zh: { title: "网络超时", description: "网络请求超时", suggestion: "请检查网络连接后重试" },
    en: { title: "Network Timeout", description: "Network request timed out", suggestion: "Check your internet connection and try again" },
  },
  N4003: {
    zh: { title: "请求过于频繁", description: "API 请求频率超限", suggestion: "请稍等片刻后重试" },
    en: { title: "Rate Limited", description: "API rate limit exceeded", suggestion: "Please wait a moment and try again" },
  },
  N4004: {
    zh: { title: "API 响应无效", description: "API 返回数据格式无效", suggestion: "请稍后重试" },
    en: { title: "Invalid Response", description: "Invalid API response format", suggestion: "Please try again later" },
  },
  N4005: {
    zh: { title: "服务不可用", description: "翻译服务暂时不可用", suggestion: "请稍后重试" },
    en: { title: "Service Unavailable", description: "Translation service temporarily unavailable", suggestion: "Please try again later" },
  },

  // Recording (R5xxx)
  R5001: {
    zh: { title: "录屏不可用", description: "录屏功能尚未实现", suggestion: "该功能将在后续版本推出" },
    en: { title: "Recording Not Available", description: "Recording feature is not yet implemented", suggestion: "This feature will be available in a future update" },
  },
  R5002: {
    zh: { title: "编码器未找到", description: "未找到视频编码器", suggestion: "请检查 FFmpeg 是否正确安装" },
    en: { title: "Encoder Not Found", description: "Video encoder not found", suggestion: "Please check if FFmpeg is properly installed" },
  },
  R5003: {
    zh: { title: "正在录制中", description: "当前已有录制任务在进行", suggestion: "请先停止当前录制" },
    en: { title: "Already Recording", description: "A recording is already in progress", suggestion: "Please stop the current recording first" },
  },

  // Pin (P6xxx)
  P6001: {
    zh: { title: "创建贴图失败", description: "无法创建贴图窗口", suggestion: "请尝试重新截图后钉图" },
    en: { title: "Pin Creation Failed", description: "Failed to create pin window", suggestion: "Try capturing again and then pin" },
  },
  P6002: {
    zh: { title: "贴图不存在", description: "指定的贴图窗口不存在", suggestion: "该贴图可能已被关闭" },
    en: { title: "Pin Not Found", description: "Specified pin window does not exist", suggestion: "The pin may have been closed" },
  },

  // Config (C7xxx)
  C7001: {
    zh: { title: "读取配置失败", description: "无法读取应用配置", suggestion: "尝试重置设置为默认值" },
    en: { title: "Config Read Failed", description: "Failed to read application configuration", suggestion: "Try resetting settings to default" },
  },
  C7002: {
    zh: { title: "保存配置失败", description: "无法保存应用配置", suggestion: "请检查磁盘空间或权限" },
    en: { title: "Config Write Failed", description: "Failed to save application configuration", suggestion: "Check disk space or permissions" },
  },
  C7003: {
    zh: { title: "配置无效", description: "配置文件格式无效", suggestion: "尝试重置设置为默认值" },
    en: { title: "Invalid Config", description: "Configuration file format is invalid", suggestion: "Try resetting settings to default" },
  },

  // Unknown (U9xxx)
  U9001: {
    zh: { title: "系统错误", description: "Windows API 调用失败", suggestion: "请尝试重启应用" },
    en: { title: "System Error", description: "Windows API call failed", suggestion: "Try restarting the application" },
  },
  U9999: {
    zh: { title: "未知错误", description: "发生未知错误", suggestion: "请重试或提交 Issue" },
    en: { title: "Unknown Error", description: "An unknown error occurred", suggestion: "Please retry or submit an issue" },
  },
};

/**
 * 根据错误码获取用户友好的错误显示信息
 * @param code 错误码（如 "S1001"）
 * @param lang 语言（'zh' | 'en'）
 * @returns ErrorDisplay 对象
 */
export function getErrorDisplay(code: string, lang: "zh" | "en" = "zh"): ErrorDisplay {
  const mapped = ERROR_MAP[code];
  if (mapped) {
    return mapped[lang];
  }
  // Fallback: 返回未知错误
  return {
    title: lang === "zh" ? "未知错误" : "Unknown Error",
    description: lang === "zh" ? `错误码: ${code}` : `Error code: ${code}`,
    suggestion: lang === "zh" ? "请重试或提交 Issue" : "Please retry or submit an issue",
  };
}

/**
 * 判断是否为已知错误码
 */
export function isKnownError(code: string): boolean {
  return code in ERROR_MAP;
}

/**
 * 获取所有错误码列表（用于测试和文档生成）
 */
export function getAllErrorCodes(): string[] {
  return Object.keys(ERROR_MAP);
}
