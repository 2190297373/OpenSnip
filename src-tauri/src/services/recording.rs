//! Recording service

use crate::models::recording::{
    RecordingConfig, RecordingStats, RecordingStatus,
};
use std::sync::{Arc, Mutex};
use std::time::Instant;

pub struct RecordingService {
    config: Arc<Mutex<RecordingConfig>>,
    status: Arc<Mutex<RecordingStatus>>,
    stats: Arc<Mutex<RecordingStats>>,
    start_time: Arc<Mutex<Option<Instant>>>,
}

impl RecordingService {
    pub fn new() -> Self {
        Self {
            config: Arc::new(Mutex::new(RecordingConfig::default())),
            status: Arc::new(Mutex::new(RecordingStatus::Idle)),
            stats: Arc::new(Mutex::new(RecordingStats::default())),
            start_time: Arc::new(Mutex::new(None)),
        }
    }

    pub fn start(&mut self, config: RecordingConfig) -> Result<(), String> {
        *self.config.lock().unwrap() = config;
        *self.status.lock().unwrap() = RecordingStatus::Starting;
        *self.start_time.lock().unwrap() = Some(Instant::now());
        *self.stats.lock().unwrap() = RecordingStats::default();
        *self.status.lock().unwrap() = RecordingStatus::Recording;
        log::info!("Recording started");
        Ok(())
    }

    pub fn stop(&mut self) -> Result<String, String> {
        *self.status.lock().unwrap() = RecordingStatus::Stopping;
        let config = self.config.lock().unwrap();
        let path = config.output_path();
        *self.status.lock().unwrap() = RecordingStatus::Idle;
        log::info!("Recording stopped: {}", path);
        Ok(path)
    }

    pub fn pause(&mut self) -> Result<(), String> {
        let mut status = self.status.lock().unwrap();
        if *status == RecordingStatus::Recording {
            *status = RecordingStatus::Paused;
            log::info!("Recording paused");
            Ok(())
        } else {
            Err("Cannot pause: not recording".to_string())
        }
    }

    pub fn resume(&mut self) -> Result<(), String> {
        let mut status = self.status.lock().unwrap();
        if *status == RecordingStatus::Paused {
            *status = RecordingStatus::Recording;
            log::info!("Recording resumed");
            Ok(())
        } else {
            Err("Cannot resume: not paused".to_string())
        }
    }

    pub fn get_status(&self) -> RecordingStatus {
        *self.status.lock().unwrap()
    }

    pub fn get_stats(&self) -> RecordingStats {
        let mut stats = self.stats.lock().unwrap().clone();
        if let Some(start) = *self.start_time.lock().unwrap() {
            stats.duration_ms = start.elapsed().as_millis() as u64;
        }
        stats
    }

    pub fn get_config(&self) -> RecordingConfig {
        self.config.lock().unwrap().clone()
    }

    pub fn update_config(&mut self, config: RecordingConfig) {
        *self.config.lock().unwrap() = config;
    }
}

impl Default for RecordingService {
    fn default() -> Self {
        Self::new()
    }
}
