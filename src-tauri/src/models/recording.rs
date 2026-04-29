//! Recording models

use serde::{Deserialize, Serialize};

/// Recording format
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RecordingFormat {
    Mp4,
    Webm,
    Gif,
    Apng,
}

impl Default for RecordingFormat {
    fn default() -> Self {
        Self::Mp4
    }
}

/// Video codec
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum VideoCodec {
    H264,
    VP9,
    AV1,
    Gif,
}

impl Default for VideoCodec {
    fn default() -> Self {
        Self::H264
    }
}

/// Quality preset
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum QualityPreset {
    Low,
    Medium,
    High,
    Ultra,
}

impl QualityPreset {
    pub fn crf(&self) -> u8 {
        match self {
            Self::Low => 35,
            Self::Medium => 28,
            Self::High => 23,
            Self::Ultra => 18,
        }
    }
}

impl Default for QualityPreset {
    fn default() -> Self {
        Self::High
    }
}

/// Frame rate
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct FrameRate(pub u32);

impl FrameRate {
    pub const FPS_15: FrameRate = FrameRate(15);
    pub const FPS_24: FrameRate = FrameRate(24);
    pub const FPS_30: FrameRate = FrameRate(30);
    pub const FPS_60: FrameRate = FrameRate(60);
}

impl Default for FrameRate {
    fn default() -> Self {
        Self::FPS_30
    }
}

/// Audio config
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioConfig {
    pub enabled: bool,
    pub sample_rate: u32,
    pub channels: u32,
    pub volume: f32,
}

impl Default for AudioConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            sample_rate: 44100,
            channels: 2,
            volume: 1.0,
        }
    }
}

/// Recording region
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordingRegion {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub monitor_index: Option<usize>,
}

impl RecordingRegion {
    pub fn fullscreen(monitor_index: Option<usize>) -> Self {
        Self {
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
            monitor_index,
        }
    }

    pub fn from_bounds(x: i32, y: i32, width: u32, height: u32) -> Self {
        Self {
            x,
            y,
            width,
            height,
            monitor_index: None,
        }
    }
}

impl Default for RecordingRegion {
    fn default() -> Self {
        Self::fullscreen(None)
    }
}

/// Recording configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordingConfig {
    pub format: RecordingFormat,
    pub codec: VideoCodec,
    pub frame_rate: FrameRate,
    pub quality: QualityPreset,
    pub region: RecordingRegion,
    pub capture_cursor: bool,
    pub capture_clicks: bool,
    pub audio: AudioConfig,
    pub output_dir: Option<String>,
}

impl RecordingConfig {
    pub fn output_path(&self) -> String {
        let dir = self.output_dir.clone().unwrap_or_else(|| ".".to_string());
        let ext = match self.format {
            RecordingFormat::Mp4 => "mp4",
            RecordingFormat::Webm => "webm",
            RecordingFormat::Gif => "gif",
            RecordingFormat::Apng => "apng",
        };
        format!("{}/recording_{}.{}", dir, std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis(), ext)
    }
}

impl Default for RecordingConfig {
    fn default() -> Self {
        Self {
            format: RecordingFormat::Mp4,
            codec: VideoCodec::H264,
            frame_rate: FrameRate::default(),
            quality: QualityPreset::default(),
            region: RecordingRegion::default(),
            capture_cursor: true,
            capture_clicks: false,
            audio: AudioConfig::default(),
            output_dir: None,
        }
    }
}

/// Recording status
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RecordingStatus {
    Idle,
    Starting,
    Recording,
    Paused,
    Stopping,
    Error,
}

/// Recording stats
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct RecordingStats {
    pub duration_ms: u64,
    pub frame_count: u64,
    pub current_fps: f64,
    pub file_size: u64,
}
