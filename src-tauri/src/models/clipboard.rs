//! Clipboard models

use serde::{Deserialize, Serialize};

/// Clipboard content type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ClipboardContentType {
    Text,
    Image,
    Files,
    Empty,
}

/// Clipboard content
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClipboardContent {
    pub content_type: ClipboardContentType,
    pub text: Option<String>,
    pub image: Option<String>, // Base64 encoded
    pub image_width: Option<u32>,
    pub image_height: Option<u32>,
    pub files: Option<Vec<String>>,
}

impl ClipboardContent {
    pub fn new_text(text: String) -> Self {
        Self {
            content_type: ClipboardContentType::Text,
            text: Some(text),
            image: None,
            image_width: None,
            image_height: None,
            files: None,
        }
    }

    pub fn new_image(image: String, width: u32, height: u32) -> Self {
        Self {
            content_type: ClipboardContentType::Image,
            text: None,
            image: Some(image),
            image_width: Some(width),
            image_height: Some(height),
            files: None,
        }
    }

    pub fn empty() -> Self {
        Self {
            content_type: ClipboardContentType::Empty,
            text: None,
            image: None,
            image_width: None,
            image_height: None,
            files: None,
        }
    }
}
