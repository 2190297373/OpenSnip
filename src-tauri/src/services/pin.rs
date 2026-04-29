//! Pin service

use crate::models::pin::{Pin, PinContent, PinPosition, PinType};
use std::sync::{Arc, Mutex};

pub struct PinService {
    pins: Arc<Mutex<Vec<Pin>>>,
    _active_pin_id: Arc<Mutex<Option<String>>>,
    next_z_index: Arc<Mutex<i32>>,
}

impl PinService {
    pub fn new() -> Self {
        Self {
            pins: Arc::new(Mutex::new(Vec::new())),
            _active_pin_id: Arc::new(Mutex::new(None)),
            next_z_index: Arc::new(Mutex::new(1)),
        }
    }

    pub fn add_pin(&self, mut pin: Pin) -> String {
        let mut z_index = self.next_z_index.lock().unwrap();
        pin.z_index = *z_index;
        *z_index += 1;
        
        let id = pin.id.clone();
        self.pins.lock().unwrap().push(pin);
        id
    }

    pub fn create_image_pin(&self, image: String, width: u32, height: u32, x: f64, y: f64) -> String {
        let content = PinContent::new().with_image(image, width, height);
        let mut pin = Pin::new(PinType::Image, content);
        pin.position = PinPosition { x, y };
        self.add_pin(pin)
    }

    pub fn create_text_pin(&self, text: String, x: f64, y: f64) -> String {
        let content = PinContent::new().with_text(text);
        let mut pin = Pin::new(PinType::Text, content);
        pin.position = PinPosition { x, y };
        self.add_pin(pin)
    }

    pub fn get_pins(&self) -> Vec<Pin> {
        self.pins.lock().unwrap().clone()
    }

    pub fn get_pin(&self, id: &str) -> Option<Pin> {
        self.pins.lock().unwrap().iter().find(|p| p.id == id).cloned()
    }

    pub fn remove_pin(&self, id: &str) -> bool {
        let mut pins = self.pins.lock().unwrap();
        if let Some(pos) = pins.iter().position(|p| p.id == id) {
            pins.remove(pos);
            true
        } else {
            false
        }
    }

    pub fn update_position(&self, id: &str, x: f64, y: f64) -> bool {
        let mut pins = self.pins.lock().unwrap();
        if let Some(pin) = pins.iter_mut().find(|p| p.id == id) {
            pin.position = PinPosition { x, y };
            pin.modified_at = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_millis() as i64)
                .unwrap_or(0);
            true
        } else {
            false
        }
    }

    pub fn bring_to_front(&self, id: &str) -> bool {
        let mut z_index = self.next_z_index.lock().unwrap();
        let mut pins = self.pins.lock().unwrap();
        if let Some(pin) = pins.iter_mut().find(|p| p.id == id) {
            pin.z_index = *z_index;
            *z_index += 1;
            true
        } else {
            false
        }
    }

    pub fn toggle_lock(&self, id: &str) -> bool {
        let mut pins = self.pins.lock().unwrap();
        if let Some(pin) = pins.iter_mut().find(|p| p.id == id) {
            pin.is_locked = !pin.is_locked;
            pin.is_locked
        } else {
            false
        }
    }

    pub fn toggle_minimize(&self, id: &str) -> bool {
        let mut pins = self.pins.lock().unwrap();
        if let Some(pin) = pins.iter_mut().find(|p| p.id == id) {
            pin.is_minimized = !pin.is_minimized;
            pin.is_minimized
        } else {
            false
        }
    }

    pub fn clear_all(&self) {
        self.pins.lock().unwrap().clear();
    }

    pub fn len(&self) -> usize {
        self.pins.lock().unwrap().len()
    }
}

impl Default for PinService {
    fn default() -> Self {
        Self::new()
    }
}
