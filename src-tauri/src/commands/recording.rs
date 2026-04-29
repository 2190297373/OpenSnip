//! Recording commands

use crate::models::recording::{RecordingConfig, RecordingStats, RecordingStatus};
use crate::services::recording::RecordingService;
use std::sync::Mutex;
use tauri::command;

pub struct RecordingState {
    pub service: Mutex<RecordingService>,
}

impl RecordingState {
    pub fn new() -> Self {
        Self {
            service: Mutex::new(RecordingService::new()),
        }
    }
}

impl Default for RecordingState {
    fn default() -> Self {
        Self::new()
    }
}

#[command]
pub fn start_recording(
    config: Option<RecordingConfig>,
    state: tauri::State<'_, RecordingState>,
) -> Result<(), String> {
    let mut service = state.service.lock().map_err(|e| e.to_string())?;
    let cfg = config.unwrap_or_default();
    service.start(cfg)
}

#[command]
pub fn stop_recording(state: tauri::State<'_, RecordingState>) -> Result<String, String> {
    let mut service = state.service.lock().map_err(|e| e.to_string())?;
    service.stop()
}

#[command]
pub fn pause_recording(state: tauri::State<'_, RecordingState>) -> Result<(), String> {
    let mut service = state.service.lock().map_err(|e| e.to_string())?;
    service.pause()
}

#[command]
pub fn resume_recording(state: tauri::State<'_, RecordingState>) -> Result<(), String> {
    let mut service = state.service.lock().map_err(|e| e.to_string())?;
    service.resume()
}

#[command]
pub fn get_recording_status(state: tauri::State<'_, RecordingState>) -> String {
    let service = state.service.lock().unwrap();
    match service.get_status() {
        RecordingStatus::Idle => "idle".to_string(),
        RecordingStatus::Starting => "starting".to_string(),
        RecordingStatus::Recording => "recording".to_string(),
        RecordingStatus::Paused => "paused".to_string(),
        RecordingStatus::Stopping => "stopping".to_string(),
        RecordingStatus::Error => "error".to_string(),
    }
}

#[command]
pub fn get_recording_stats(state: tauri::State<'_, RecordingState>) -> RecordingStats {
    let service = state.service.lock().unwrap();
    service.get_stats()
}

#[command]
pub fn get_recording_config(state: tauri::State<'_, RecordingState>) -> RecordingConfig {
    let service = state.service.lock().unwrap();
    service.get_config()
}
