//! Screenshot service

use crate::models::screenshot::{
    CaptureArgs, CaptureMode, CaptureRegion, MonitorInfo, Screenshot, WindowInfo,
};
use screenshots::{Compression, Screen};
use std::time::Instant;

#[cfg(not(windows))]
compile_error!("Screenshots are only supported on Windows");

pub struct ScreenshotService;

impl ScreenshotService {
    pub fn new() -> Self {
        Self
    }

    pub fn capture_fullscreen(&self) -> Result<Screenshot, String> {
        let start = Instant::now();
        let screens = Screen::all().map_err(|e| format!("Failed to enumerate screens: {}", e))?;
        let screen = screens.first().ok_or("No screen found".to_string())?;
        let image = screen.capture().map_err(|e| format!("Failed to capture screen: {}", e))?;
        let buffer = image.to_png(Compression::Fast).map_err(|e| format!("Failed to convert to PNG: {}", e))?;
        let width = image.width() as u32;
        let height = image.height() as u32;

        log::info!("Screenshot captured: {}x{} in {:?}", width, height, start.elapsed());

        Ok(Screenshot::new(Vec::from(buffer.as_ref()), width, height, CaptureRegion::new(0, 0, width, height)))
    }

    pub fn capture_region(&self, region: &CaptureRegion) -> Result<Screenshot, String> {
        let screens = Screen::all().map_err(|e| format!("Failed to enumerate screens: {}", e))?;
        let screen = screens.first().ok_or("No screen found".to_string())?;
        let image = screen.capture().map_err(|e| format!("Failed to capture screen: {}", e))?;
        let buffer = image.to_png(Compression::Fast).map_err(|e| format!("Failed to convert to PNG: {}", e))?;

        // Crop to region using image crate
        let img = image::load_from_memory(&buffer)
            .map_err(|e| format!("Failed to decode PNG: {}", e))?;
        let cropped = img.crop_imm(
            region.x as u32,
            region.y as u32,
            region.width,
            region.height,
        );

        let mut png_buf = Vec::new();
        cropped.write_to(
            &mut std::io::Cursor::new(&mut png_buf),
            image::ImageFormat::Png,
        ).map_err(|e| format!("PNG encode error: {}", e))?;

        Ok(Screenshot::new(
            png_buf,
            region.width,
            region.height,
            region.clone(),
        ))
    }

    pub fn get_monitors(&self) -> Vec<MonitorInfo> {
        Screen::all()
            .map(|screens| {
                screens
                    .iter()
                    .enumerate()
                    .map(|(i, s)| {
                        let info = &s.display_info;
                        MonitorInfo {
                            index: i,
                            name: format!("Monitor {}", i + 1),
                            x: info.x,
                            y: info.y,
                            width: info.width as u32,
                            height: info.height as u32,
                            is_primary: info.is_primary,
                        }
                    })
                    .collect()
            })
            .unwrap_or_else(|_| vec![MonitorInfo {
                index: 0,
                name: "Primary".to_string(),
                x: 0,
                y: 0,
                width: 1920,
                height: 1080,
                is_primary: true,
            }])
    }

    pub fn get_windows(&self) -> Vec<WindowInfo> {
        vec![]
    }

    pub fn capture(&self, args: &CaptureArgs) -> Result<Screenshot, String> {
        match args.mode {
            CaptureMode::Fullscreen => self.capture_fullscreen(),
            CaptureMode::Region => {
                if let Some(ref region) = args.region {
                    self.capture_region(region)
                } else {
                    self.capture_fullscreen()
                }
            }
            CaptureMode::Window => self.capture_fullscreen(),
        }
    }
}

impl Default for ScreenshotService {
    fn default() -> Self {
        Self::new()
    }
}
