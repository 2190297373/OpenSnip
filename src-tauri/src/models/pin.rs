//! Pin models

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Pin type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PinType {
    Image,
    Text,
    Mixed,
    Ocr,
    Translation,
}

impl Default for PinType {
    fn default() -> Self {
        Self::Image
    }
}

/// Pin position
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct PinPosition {
    pub x: f64,
    pub y: f64,
}

impl Default for PinPosition {
    fn default() -> Self {
        Self { x: 100.0, y: 100.0 }
    }
}

/// Pin size
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct PinSize {
    pub width: f64,
    pub height: f64,
}

impl Default for PinSize {
    fn default() -> Self {
        Self { width: 400.0, height: 300.0 }
    }
}

/// Pin style
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PinStyle {
    pub background_color: String,
    pub border_color: String,
    pub border_width: f64,
    pub border_radius: f64,
    pub shadow_enabled: bool,
    pub shadow_offset: f64,
    pub shadow_blur: f64,
    pub always_on_top: bool,
    pub opacity: f64,
    pub show_title_bar: bool,
}

impl Default for PinStyle {
    fn default() -> Self {
        Self {
            background_color: "#FFFFFF".to_string(),
            border_color: "#E5E5E5".to_string(),
            border_width: 1.0,
            border_radius: 8.0,
            shadow_enabled: true,
            shadow_offset: 0.0,
            shadow_blur: 20.0,
            always_on_top: true,
            opacity: 1.0,
            show_title_bar: true,
        }
    }
}

/// Pin content
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PinContent {
    pub image: Option<String>,
    pub image_width: Option<u32>,
    pub image_height: Option<u32>,
    pub text: Option<String>,
    pub ocr_text: Option<String>,
    pub translation: Option<String>,
}

impl PinContent {
    pub fn new() -> Self {
        Self {
            image: None,
            image_width: None,
            image_height: None,
            text: None,
            ocr_text: None,
            translation: None,
        }
    }

    pub fn with_image(mut self, image: String, width: u32, height: u32) -> Self {
        self.image = Some(image);
        self.image_width = Some(width);
        self.image_height = Some(height);
        self
    }

    pub fn with_text(mut self, text: String) -> Self {
        self.text = Some(text);
        self
    }
}

impl Default for PinContent {
    fn default() -> Self {
        Self::new()
    }
}

/// Main Pin struct
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pin {
    pub id: String,
    pub pin_type: PinType,
    pub content: PinContent,
    pub position: PinPosition,
    pub size: PinSize,
    pub style: PinStyle,
    pub created_at: i64,
    pub modified_at: i64,
    pub z_index: i32,
    pub is_pinned: bool,
    pub is_minimized: bool,
    pub is_locked: bool,
    pub metadata: HashMap<String, String>,
}

impl Pin {
    pub fn new(pin_type: PinType, content: PinContent) -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis() as i64)
            .unwrap_or(0);

        Self {
            id: format!("pin-{}", now),
            pin_type,
            content,
            position: PinPosition::default(),
            size: PinSize::default(),
            style: PinStyle::default(),
            created_at: now,
            modified_at: now,
            z_index: 0,
            is_pinned: true,
            is_minimized: false,
            is_locked: false,
            metadata: HashMap::new(),
        }
    }

    pub fn from_image(image: String, width: u32, height: u32) -> Self {
        let content = PinContent::new().with_image(image, width, height);
        Self::new(PinType::Image, content)
    }

    pub fn from_text(text: String) -> Self {
        let content = PinContent::new().with_text(text);
        Self::new(PinType::Text, content)
    }
}

/// Pin group
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PinGroup {
    pub id: String,
    pub name: String,
    pub pin_ids: Vec<String>,
    pub created_at: i64,
}

impl PinGroup {
    pub fn new(name: String) -> Self {
        Self {
            id: format!("group-{}", std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis()),
            name,
            pin_ids: Vec::new(),
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis() as i64,
        }
    }
}
