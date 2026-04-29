import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface RecordingStats {
  duration_ms: number;
  frame_count: number;
  current_fps: number;
  file_size: number;
}

interface RecordingConfig {
  format: string;
  codec: string;
  fps: number;
  quality: string;
  capture_cursor: boolean;
  capture_clicks: boolean;
  audio_enabled: boolean;
}

interface RecordingPanelProps {
  onRecordingComplete?: (filePath: string) => void;
}

export function RecordingPanel({ onRecordingComplete }: RecordingPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [, setStatus] = useState("idle");
  const [stats, setStats] = useState<RecordingStats | null>(null);
  const [config, setConfig] = useState<RecordingConfig>({
    format: "mp4",
    codec: "h264",
    fps: 30,
    quality: "high",
    capture_cursor: true,
    capture_clicks: false,
    audio_enabled: false,
  });
  const [ffmpegAvailable] = useState<boolean>(true);

  // FFmpeg check placeholder - can be implemented when recording is fully supported
  // useEffect(() => {
  //   invoke<{ available: boolean }>("check_ffmpeg")
  //     .then((result) => setFfmpegAvailable(result.available))
  //     .catch(() => setFfmpegAvailable(false));
  // }, []);

  // Poll recording status
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(async () => {
      try {
        const currentStatus = await invoke<string>("get_recording_status");
        setStatus(currentStatus);
        setIsRecording(currentStatus === "recording");
        setIsPaused(currentStatus === "paused");

        const currentStats = await invoke<RecordingStats>("get_recording_stats");
        setStats(currentStats);
      } catch (e) {
        console.error("Failed to get recording status:", e);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      await invoke("start_recording", {
        config: {
          format: config.format,
          codec: config.codec,
          frameRate: { 0: config.fps },
          quality: config.quality,
          captureCursor: config.capture_cursor,
          captureClicks: config.capture_clicks,
          audio: {
            enabled: config.audio_enabled,
            sampleRate: 44100,
            channels: 2,
            volume: 1.0,
          },
        },
      });
      setIsRecording(true);
      setStatus("recording");
    } catch (e) {
      console.error("Failed to start recording:", e);
    }
  }, [config]);

  const stopRecording = useCallback(async () => {
    try {
      const path = await invoke<string>("stop_recording");
      setIsRecording(false);
      setIsPaused(false);
      setStatus("idle");
      setStats(null);
      
      if (onRecordingComplete) {
        onRecordingComplete(path);
      }
    } catch (e) {
      console.error("Failed to stop recording:", e);
    }
  }, [onRecordingComplete]);

  const pauseRecording = useCallback(async () => {
    try {
      await invoke("pause_recording");
      setIsPaused(true);
    } catch (e) {
      console.error("Failed to pause recording:", e);
    }
  }, []);

  const resumeRecording = useCallback(async () => {
    try {
      await invoke("resume_recording");
      setIsPaused(false);
    } catch (e) {
      console.error("Failed to resume recording:", e);
    }
  }, []);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium">屏幕录制</h3>
        <div className="flex items-center gap-2">
          {ffmpegAvailable === false && (
            <span className="text-xs text-yellow-500">⚠️ FFmpeg 未安装</span>
          )}
          {ffmpegAvailable === true && (
            <span className="text-xs text-green-500">✓ FFmpeg 就绪</span>
          )}
        </div>
      </div>

      {/* Recording indicator */}
      {(isRecording || isPaused) && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"}`} />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {isPaused ? "录制已暂停" : "正在录制"}
              </span>
            </div>
            <span className="text-lg font-mono text-red-600 dark:text-red-400">
              {stats ? formatDuration(stats.duration_ms) : "00:00:00"}
            </span>
          </div>
          {stats && (
            <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>FPS: {stats.current_fps.toFixed(1)}</span>
              <span>帧: {stats.frame_count}</span>
              <span>大小: {formatFileSize(stats.file_size)}</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Format settings */}
        <div>
          <label className="block text-sm font-medium mb-2">输出格式</label>
          <div className="grid grid-cols-2 gap-2">
            {["mp4", "webm", "gif"].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setConfig((c) => ({ ...c, format: fmt }))}
                disabled={isRecording}
                className={`px-3 py-2 text-sm rounded border transition-colors ${
                  config.format === fmt
                    ? "bg-blue-500 text-white border-blue-500"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                } disabled:opacity-50`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Quality settings */}
        <div>
          <label className="block text-sm font-medium mb-2">质量</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "low", label: "低" },
              { value: "medium", label: "中" },
              { value: "high", label: "高" },
              { value: "ultra", label: "超高" },
            ].map((q) => (
              <button
                key={q.value}
                onClick={() => setConfig((c) => ({ ...c, quality: q.value }))}
                disabled={isRecording}
                className={`px-3 py-2 text-sm rounded border transition-colors ${
                  config.quality === q.value
                    ? "bg-blue-500 text-white border-blue-500"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                } disabled:opacity-50`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* FPS */}
        <div>
          <label className="block text-sm font-medium mb-2">
            帧率: {config.fps} FPS
          </label>
          <input
            type="range"
            min="15"
            max="60"
            step="5"
            value={config.fps}
            onChange={(e) => setConfig((c) => ({ ...c, fps: parseInt(e.target.value) }))}
            disabled={isRecording}
            className="w-full accent-blue-500 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>15 FPS</span>
            <span>60 FPS</span>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.capture_cursor}
              onChange={(e) => setConfig((c) => ({ ...c, capture_cursor: e.target.checked }))}
              disabled={isRecording}
              className="rounded"
            />
            <span className="text-sm">录制光标</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.capture_clicks}
              onChange={(e) => setConfig((c) => ({ ...c, capture_clicks: e.target.checked }))}
              disabled={isRecording}
              className="rounded"
            />
            <span className="text-sm">录制鼠标点击</span>
          </label>
        </div>

        {/* Info */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-500 dark:text-gray-400">
          <p>• MP4/WebM 需要 FFmpeg 支持</p>
          <p>• GIF 格式会使用较低帧率</p>
          <p>• 录制完成后会自动保存到视频目录</p>
        </div>
      </div>

      {/* Footer - Controls */}
      <div className="flex gap-2 p-3 border-t border-gray-200 dark:border-gray-700">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={ffmpegAvailable === false}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded transition-colors"
          >
            ⏺ 开始录制
          </button>
        ) : (
          <>
            {isPaused ? (
              <button
                onClick={resumeRecording}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
              >
                ▶ 继续
              </button>
            ) : (
              <button
                onClick={pauseRecording}
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
              >
                ⏸ 暂停
              </button>
            )}
            <button
              onClick={stopRecording}
              className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
            >
              ⏹ 停止
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default RecordingPanel;
