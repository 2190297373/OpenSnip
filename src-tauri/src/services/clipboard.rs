//! Clipboard service

use crate::models::clipboard::{ClipboardContent, ClipboardContentType};

pub struct ClipboardService;

impl ClipboardService {
    pub fn new() -> Self {
        Self
    }

    pub fn read_text(&self) -> Option<String> {
        #[cfg(windows)]
        {
            use std::process::Command;
            let output = Command::new("powershell")
                .args(["-Command", "Get-Clipboard -Text"])
                .output()
                .ok()?;
            String::from_utf8(output.stdout).ok()?.trim().to_string().into()
        }
        #[cfg(not(windows))]
        {
            None
        }
    }

    pub fn write_text(&self, text: &str) -> Result<(), String> {
        #[cfg(windows)]
        {
            use std::process::Command;
            Command::new("powershell")
                .args(["-Command", &format!("Set-Clipboard -Value '{}'", text.replace("'", "''"))])
                .output()
                .map_err(|e| e.to_string())?;
            Ok(())
        }
        #[cfg(not(windows))]
        {
            Err("Clipboard not supported on this platform".to_string())
        }
    }

    pub fn read_content(&self) -> ClipboardContent {
        if let Some(text) = self.read_text() {
            if !text.is_empty() {
                return ClipboardContent::new_text(text);
            }
        }
        ClipboardContent::empty()
    }

    pub fn write_content(&self, content: &ClipboardContent) -> Result<(), String> {
        match content.content_type {
            ClipboardContentType::Text => {
                if let Some(ref text) = content.text {
                    self.write_text(text)
                } else {
                    Ok(())
                }
            }
            _ => Ok(()),
        }
    }
}

impl Default for ClipboardService {
    fn default() -> Self {
        Self::new()
    }
}
