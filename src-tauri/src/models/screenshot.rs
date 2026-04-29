//! Screenshot models

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::SystemTime;

/// Screenshot capture mode
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CaptureMode {
    Fullscreen,
    Region,
    Window,
}

impl Default for CaptureMode {
    fn default() -> Self {
        Self::Fullscreen
    }
}

/// Capture region
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaptureRegion {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

impl Default for CaptureRegion {
    fn default() -> Self {
        Self {
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
        }
    }
}

impl CaptureRegion {
    pub fn new(x: i32, y: i32, width: u32, height: u32) -> Self {
        Self { x, y, width, height }
    }

    pub fn is_valid(&self) -> bool {
        self.width > 0 && self.height > 0
    }
}

/// Monitor information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorInfo {
    pub index: usize,
    pub name: String,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub is_primary: bool,
}

/// Window information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowInfo {
    pub hwnd: isize,
    pub title: String,
    pub class_name: String,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub is_visible: bool,
    pub process_id: u32,
}

/// Screenshot data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Screenshot {
    pub data: Vec<u8>,
    pub width: u32,
    pub height: u32,
    pub region: CaptureRegion,
    pub timestamp: SystemTime,
    pub metadata: HashMap<String, String>,
}

impl Screenshot {
    pub fn new(data: Vec<u8>, width: u32, height: u32, region: CaptureRegion) -> Self {
        Self {
            data,
            width,
            height,
            region,
            timestamp: SystemTime::now(),
            metadata: HashMap::new(),
        }
    }

    pub fn expected_size(&self) -> usize {
        (self.width as usize) * (self.height as usize) * 4
    }

    pub fn verify_size(&self) -> bool {
        self.data.len() == self.expected_size()
    }

    /// 将原始 BGRA 数据编码为 PNG 并返回 base64
    pub fn to_png_base64(&self) -> Result<String, String> {
        let rgba = bgra_to_rgba(&self.data);
        let img = image::RgbaImage::from_raw(self.width, self.height, rgba)
            .ok_or("Failed to create image from raw data")?;
        let mut buffer = Vec::new();
        let encoder = image::codecs::png::PngEncoder::new(&mut buffer);
        img.write_with_encoder(encoder)
            .map_err(|e| format!("PNG encode error: {}", e))?;
        use base64::Engine;
        Ok(base64::engine::general_purpose::STANDARD.encode(&buffer))
    }

    /// 保存为 PNG 文件到指定路径
    pub fn save_to_file(&self, path: &std::path::Path) -> Result<(), String> {
        let rgba = bgra_to_rgba(&self.data);
        let img = image::RgbaImage::from_raw(self.width, self.height, rgba)
            .ok_or("Failed to create image from raw data")?;
        img.save(path)
            .map_err(|e| format!("Save PNG error: {}", e))?;
        Ok(())
    }
}

/// BGRA -> RGBA 转换（Win32 GDI 返回的是 BGRA）
fn bgra_to_rgba(bgra: &[u8]) -> Vec<u8> {
    let mut rgba = Vec::with_capacity(bgra.len());
    for chunk in bgra.chunks_exact(4) {
        rgba.push(chunk[2]); // R
        rgba.push(chunk[1]); // G
        rgba.push(chunk[0]); // B
        rgba.push(chunk[3]); // A
    }
    rgba
}

/// Capture arguments
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaptureArgs {
    pub mode: CaptureMode,
    pub region: Option<CaptureRegion>,
    pub window_hwnd: Option<isize>,
    pub include_cursor: bool,
}

impl Default for CaptureArgs {
    fn default() -> Self {
        Self {
            mode: CaptureMode::Fullscreen,
            region: None,
            window_hwnd: None,
            include_cursor: true,
        }
    }
}

/// Capture history item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaptureHistoryItem {
    pub id: String,
    pub thumbnail: Option<String>,
    pub width: u32,
    pub height: u32,
    pub timestamp: u64,
    pub path: Option<String>,
}

impl CaptureHistoryItem {
    pub fn new(width: u32, height: u32, path: Option<String>) -> Self {
        Self {
            id: format!("capture-{}", std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis()),
            thumbnail: None,
            width,
            height,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64,
            path,
        }
    }
}
