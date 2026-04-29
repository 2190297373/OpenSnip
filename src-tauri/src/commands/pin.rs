//! Pin commands

use crate::models::pin::Pin;
use crate::services::pin::PinService;
use std::sync::Arc;
use tauri::command;

pub struct PinState {
    pub service: Arc<PinService>,
}

impl PinState {
    pub fn new() -> Self {
        Self {
            service: Arc::new(PinService::new()),
        }
    }
}

impl Default for PinState {
    fn default() -> Self {
        Self::new()
    }
}

#[command]
pub fn create_image_pin(
    image: String,
    width: u32,
    height: u32,
    x: f64,
    y: f64,
    state: tauri::State<'_, PinState>,
) -> Result<String, String> {
    let service = state.service.clone();
    Ok(service.create_image_pin(image, width, height, x, y))
}

#[command]
pub fn create_text_pin(
    text: String,
    x: f64,
    y: f64,
    state: tauri::State<'_, PinState>,
) -> Result<String, String> {
    let service = state.service.clone();
    Ok(service.create_text_pin(text, x, y))
}

#[command]
pub fn get_pins(state: tauri::State<'_, PinState>) -> Result<Vec<Pin>, String> {
    let service = state.service.clone();
    Ok(service.get_pins())
}

#[command]
pub fn update_pin_position(
    id: String,
    x: f64,
    y: f64,
    state: tauri::State<'_, PinState>,
) -> Result<(), String> {
    let service = state.service.clone();
    if service.update_position(&id, x, y) {
        Ok(())
    } else {
        Err(format!("Pin {} not found", id))
    }
}

#[command]
pub fn delete_pin(id: String, state: tauri::State<'_, PinState>) -> Result<(), String> {
    let service = state.service.clone();
    if service.remove_pin(&id) {
        Ok(())
    } else {
        Err(format!("Pin {} not found", id))
    }
}

#[command]
pub fn bring_pin_to_front(id: String, state: tauri::State<'_, PinState>) -> Result<(), String> {
    let service = state.service.clone();
    if service.bring_to_front(&id) {
        Ok(())
    } else {
        Err(format!("Pin {} not found", id))
    }
}

#[command]
pub fn toggle_pin_lock(id: String, state: tauri::State<'_, PinState>) -> Result<bool, String> {
    let service = state.service.clone();
    Ok(service.toggle_lock(&id))
}

#[command]
pub fn toggle_pin_minimize(id: String, state: tauri::State<'_, PinState>) -> Result<bool, String> {
    let service = state.service.clone();
    Ok(service.toggle_minimize(&id))
}

#[command]
pub fn clear_all_pins(state: tauri::State<'_, PinState>) -> Result<(), String> {
    let service = state.service.clone();
    service.clear_all();
    Ok(())
}
