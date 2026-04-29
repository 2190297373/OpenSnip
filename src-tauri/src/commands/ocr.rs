//! OCR commands

use base64::Engine;
use crate::models::ocr::{OcrConfig, OcrResult};
use crate::services::ocr::OcrService;
use std::sync::Mutex;
use tauri::command;

pub struct OcrState {
    pub service: Mutex<OcrService>,
}

impl OcrState {
    pub fn new() -> Self {
        Self {
            service: Mutex::new(OcrService::new(OcrConfig::default())),
        }
    }
}

impl Default for OcrState {
    fn default() -> Self {
        Self::new()
    }
}

#[command]
pub fn perform_ocr(
    image_data: String,
    width: u32,
    height: u32,
    state: tauri::State<'_, OcrState>,
) -> Result<OcrResult, String> {
    let service = state.service.lock().map_err(|e| e.to_string())?;
    
    let data = base64::engine::general_purpose::STANDARD
        .decode(&image_data)
        .map_err(|e| format!("Failed to decode image: {}", e))?;
    
    service.recognize(&data, width, height)
}

#[command]
pub fn get_ocr_config(state: tauri::State<'_, OcrState>) -> Result<OcrConfig, String> {
    let service = state.service.lock().map_err(|e| e.to_string())?;
    Ok(service.get_config())
}

#[command]
pub fn update_ocr_config(
    config: OcrConfig,
    state: tauri::State<'_, OcrState>,
) -> Result<OcrConfig, String> {
    let mut service = state.service.lock().map_err(|e| e.to_string())?;
    service.update_config(config.clone());
    Ok(config)
}
