import { invoke } from "@tauri-apps/api/core";
import type { RecordingConfig, RecordingStatus, RecordingStats } from "@/types";

export async function startRecording(
  region?: { x: number; y: number; width: number; height: number }
): Promise<void> {
  return invoke<void>("start_recording", { region });
}

export async function stopRecording(): Promise<string> {
  return invoke<string>("stop_recording");
}

export async function pauseRecording(): Promise<void> {
  return invoke<void>("pause_recording");
}

export async function resumeRecording(): Promise<void> {
  return invoke<void>("resume_recording");
}

export async function getRecordingStatus(): Promise<RecordingStatus> {
  return invoke<RecordingStatus>("get_recording_status");
}

export async function getRecordingStats(): Promise<RecordingStats> {
  return invoke<RecordingStats>("get_recording_stats");
}

export async function getRecordingConfig(): Promise<RecordingConfig> {
  return invoke<RecordingConfig>("get_recording_config");
}

export async function updateRecordingConfig(config: Partial<RecordingConfig>): Promise<void> {
  return invoke<void>("update_recording_config", { config });
}

export async function addRecordingFrame(frameData: string): Promise<void> {
  return invoke<void>("add_recording_frame", { frameData });
}

export async function checkFfmpeg(): Promise<{ available: boolean; version?: string; path?: string }> {
  return invoke<{ available: boolean; version?: string; path?: string }>("check_ffmpeg");
}
