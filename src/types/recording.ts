export interface RecordingConfig {
  fps: number;
  quality: "low" | "medium" | "high";
  codec: string;
  output_format: string;
  save_path: string;
}

export interface RecordingStatus {
  is_recording: boolean;
  is_paused: boolean;
  duration: number;
  current_fps: number;
  file_size: number;
}

export interface RecordingStats {
  total_frames: number;
  dropped_frames: number;
  average_encoding_time: number;
  output_path: string;
}

export type RecordingQuality = "low" | "medium" | "high";
