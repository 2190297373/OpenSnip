//! Clipboard commands

use crate::models::clipboard::ClipboardContent;
use crate::services::clipboard::ClipboardService;
use std::sync::Mutex;
use tauri::command;

pub struct ClipboardState {
    pub service: Mutex<ClipboardService>,
}

impl ClipboardState {
    pub fn new() -> Self {
        Self {
            service: Mutex::new(ClipboardService::new()),
        }
    }
}

impl Default for ClipboardState {
    fn default() -> Self {
        Self::new()
    }
}

#[command]
pub fn read_clipboard_text(state: tauri::State<'_, ClipboardState>) -> Option<String> {
    let service = state.service.lock().unwrap();
    service.read_text()
}

#[command]
pub fn write_clipboard_text(text: String, state: tauri::State<'_, ClipboardState>) -> Result<(), String> {
    let service = state.service.lock().map_err(|e| e.to_string())?;
    service.write_text(&text)
}

#[command]
pub fn read_clipboard(state: tauri::State<'_, ClipboardState>) -> ClipboardContent {
    let service = state.service.lock().unwrap();
    service.read_content()
}

#[command]
pub fn write_clipboard(content: ClipboardContent, state: tauri::State<'_, ClipboardState>) -> Result<(), String> {
    let service = state.service.lock().map_err(|e| e.to_string())?;
    service.write_content(&content)
}
