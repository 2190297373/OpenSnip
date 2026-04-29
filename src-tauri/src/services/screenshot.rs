//! Screenshot service

use crate::models::screenshot::{
    CaptureArgs, CaptureMode, CaptureRegion, MonitorInfo, Screenshot, WindowInfo,
};
use std::time::Instant;

#[cfg(windows)]
use windows::Win32::Graphics::Gdi::{
    BitBlt, CreateCompatibleDC, DeleteDC, GetDC, GetDeviceCaps, ReleaseDC,
    SRCCOPY, HORZRES, VERTRES,
};

impl ScreenshotService {
    pub fn new() -> Self {
        Self {}
    }

    #[cfg(windows)]
    pub fn capture_fullscreen(&self) -> Result<Screenshot, String> {
        let start = Instant::now();
        
        let screen_width = unsafe {
            let hdc = GetDC(None);
            let width = GetDeviceCaps(hdc, HORZRES);
            let height = GetDeviceCaps(hdc, VERTRES);
            ReleaseDC(None, hdc);
            (width as u32, height as u32)
        };

        let (width, height) = screen_width;
        let data = self.capture_screen_data(0, 0, width, height)?;
        
        let region = CaptureRegion::new(0, 0, width, height);
        
        log::info!("Screenshot captured: {}x{} in {:?}", width, height, start.elapsed());
        
        Ok(Screenshot::new(data, width, height, region))
    }

    #[cfg(windows)]
    pub fn capture_region(&self, region: &CaptureRegion) -> Result<Screenshot, String> {
        let data = self.capture_screen_data(
            region.x as u32,
            region.y as u32,
            region.width,
            region.height,
        )?;
        
        Ok(Screenshot::new(data, region.width, region.height, region.clone()))
    }

    #[cfg(windows)]
    fn capture_screen_data(&self, x: u32, y: u32, width: u32, height: u32) -> Result<Vec<u8>, String> {
        unsafe {
            let src_hdc = GetDC(None);
            if src_hdc.is_invalid() {
                return Err("Failed to get screen DC".to_string());
            }
            
            let mem_hdc = CreateCompatibleDC(src_hdc);
            if mem_hdc.is_invalid() {
                ReleaseDC(None, src_hdc);
                return Err("Failed to create compatible DC".to_string());
            }
            
            let mut bmi = windows::Win32::Graphics::Gdi::BITMAPINFO {
                bmiHeader: windows::Win32::Graphics::Gdi::BITMAPINFOHEADER {
                    biSize: std::mem::size_of::<windows::Win32::Graphics::Gdi::BITMAPINFOHEADER>() as u32,
                    biWidth: width as i32,
                    biHeight: -(height as i32),
                    biPlanes: 1,
                    biBitCount: 32,
                    biCompression: windows::Win32::Graphics::Gdi::BI_RGB.0 as u32,
                    biSizeImage: 0,
                    biXPelsPerMeter: 0,
                    biYPelsPerMeter: 0,
                    biClrUsed: 0,
                    biClrImportant: 0,
                },
                bmiColors: [windows::Win32::Graphics::Gdi::RGBQUAD::default()],
            };
            
            let mut bits: *mut std::ffi::c_void = std::ptr::null_mut();
            let hbitmap = windows::Win32::Graphics::Gdi::CreateDIBSection(
                mem_hdc,
                &mut bmi,
                windows::Win32::Graphics::Gdi::DIB_RGB_COLORS,
                &mut bits,
                None,
                0,
            );
            
            if hbitmap.is_err() || bits.is_null() {
                DeleteDC(mem_hdc);
                ReleaseDC(None, src_hdc);
                return Err("Failed to create DIB section".to_string());
            }
            
            let old_bitmap = windows::Win32::Graphics::Gdi::SelectObject(mem_hdc, hbitmap.unwrap().into());
            
            BitBlt(
                mem_hdc,
                0,
                0,
                width as i32,
                height as i32,
                src_hdc,
                x as i32,
                y as i32,
                SRCCOPY,
            ).map_err(|e| format!("BitBlt failed: {}", e))?;
            
            let size = (width * height * 4) as usize;
            let data = std::slice::from_raw_parts(bits as *const u8, size).to_vec();
            
            if !old_bitmap.is_invalid() {
                windows::Win32::Graphics::Gdi::SelectObject(mem_hdc, old_bitmap);
            }
            windows::Win32::Graphics::Gdi::DeleteObject(hbitmap.unwrap());
            DeleteDC(mem_hdc);
            ReleaseDC(None, src_hdc);
            
            Ok(data)
        }
    }

    #[cfg(not(windows))]
    pub fn capture_fullscreen(&self) -> Result<Screenshot, String> {
        Err("Screenshot not supported on this platform".to_string())
    }

    #[cfg(not(windows))]
    pub fn capture_region(&self, _region: &CaptureRegion) -> Result<Screenshot, String> {
        Err("Screenshot not supported on this platform".to_string())
    }

    pub fn get_monitors(&self) -> Vec<MonitorInfo> {
        vec![MonitorInfo {
            index: 0,
            name: "Primary".to_string(),
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
            is_primary: true,
        }]
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
