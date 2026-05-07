//! Screenshot commands

use crate::models::screenshot::{CaptureArgs, CaptureRegion, MonitorInfo, Screenshot};
use crate::services::screenshot::ScreenshotService;
use std::sync::Mutex;
use tauri::{command, Manager};

pub struct ScreenshotState {
    pub service: Mutex<ScreenshotService>,
}

impl ScreenshotState {
    pub fn new() -> Self {
        Self {
            service: Mutex::new(ScreenshotService::new()),
        }
    }
}

impl Default for ScreenshotState {
    fn default() -> Self {
        Self::new()
    }
}

#[command]
pub fn capture_screenshot(state: tauri::State<'_, ScreenshotState>) -> Result<Screenshot, String> {
    let service = state.service.lock().map_err(|e| e.to_string())?;
    service.capture_fullscreen()
}

#[command]
pub fn capture_region(
    x: i32,
    y: i32,
    width: u32,
    height: u32,
    state: tauri::State<'_, ScreenshotState>,
) -> Result<Screenshot, String> {
    let service = state.service.lock().map_err(|e| e.to_string())?;
    let region = CaptureRegion::new(x, y, width, height);
    service.capture_region(&region)
}

#[command]
pub fn capture_with_args(
    args: CaptureArgs,
    state: tauri::State<'_, ScreenshotState>,
) -> Result<Screenshot, String> {
    let service = state.service.lock().map_err(|e| e.to_string())?;
    service.capture(&args)
}

#[command]
pub fn get_monitors(state: tauri::State<'_, ScreenshotState>) -> Vec<MonitorInfo> {
    let service = state.service.lock().unwrap();
    service.get_monitors()
}

#[command]
pub fn quick_capture(state: tauri::State<'_, ScreenshotState>) -> Result<String, String> {
    let service = state.service.lock().map_err(|e| e.to_string())?;
    let screenshot = service.capture_fullscreen()?;
    screenshot.to_png_base64()
}

#[command]
pub fn capture_as_png(
    args: CaptureArgs,
    state: tauri::State<'_, ScreenshotState>,
) -> Result<String, String> {
    let service = state.service.lock().map_err(|e| e.to_string())?;
    let screenshot = service.capture(&args)?;
    screenshot.to_png_base64()
}

#[command]
pub fn save_screenshot(
    data: String,
    filename: String,
    app: tauri::AppHandle,
) -> Result<String, String> {
    use base64::Engine;
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(&data)
        .map_err(|e| format!("Base64 decode error: {}", e))?;
    
    let pictures_dir = app.path().picture_dir()
        .map_err(|e| format!("Failed to get picture dir: {}", e))?;
    let dir = pictures_dir.join("OpenSnip");
    std::fs::create_dir_all(&dir).map_err(|e| format!("Create dir error: {}", e))?;
    
    let path = dir.join(&filename);
    std::fs::write(&path, &bytes).map_err(|e| format!("Write file error: {}", e))?;
    
    Ok(path.to_string_lossy().to_string())
}
