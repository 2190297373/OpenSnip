//! OCR models

use serde::{Deserialize, Serialize};

/// OCR language
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum OcrLanguage {
    Auto,
    ChineseSimplified,
    ChineseTraditional,
    English,
    Japanese,
    Korean,
    French,
    German,
    Spanish,
}

impl Default for OcrLanguage {
    fn default() -> Self {
        Self::Auto
    }
}

/// OCR engine
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OcrEngine {
    Windows,
    Onnx,
    Tesseract,
}

impl Default for OcrEngine {
    fn default() -> Self {
        Self::Windows
    }
}

/// OCR configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OcrConfig {
    pub engine: OcrEngine,
    pub language: OcrLanguage,
    pub use_gpu: bool,
}

impl Default for OcrConfig {
    fn default() -> Self {
        Self {
            engine: OcrEngine::Windows,
            language: OcrLanguage::Auto,
            use_gpu: false,
        }
    }
}

/// Bounding box
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoundingBox {
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
}

impl BoundingBox {
    pub fn new(x: i32, y: i32, width: i32, height: i32) -> Self {
        Self { x, y, width, height }
    }

    pub fn area(&self) -> i32 {
        self.width * self.height
    }

    pub fn center(&self) -> (f32, f32) {
        (self.x as f32 + self.width as f32 / 2.0, self.y as f32 + self.height as f32 / 2.0)
    }
}

/// Text block
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OcrTextBlock {
    pub text: String,
    pub confidence: f32,
    pub bounding_box: BoundingBox,
}

impl OcrTextBlock {
    pub fn new(text: String, confidence: f32, x: i32, y: i32, width: i32, height: i32) -> Self {
        Self {
            text,
            confidence,
            bounding_box: BoundingBox::new(x, y, width, height),
        }
    }
}

/// OCR result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OcrResult {
    pub full_text: String,
    pub blocks: Vec<OcrTextBlock>,
    pub detected_language: Option<String>,
    pub image_width: u32,
    pub image_height: u32,
    pub processing_time_ms: u64,
}
