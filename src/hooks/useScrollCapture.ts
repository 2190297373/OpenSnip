import { useState, useCallback, useRef } from "react";
import type { ScrollCaptureConfig, ScrollCaptureProgress, ScrollDirection } from "@/types";
import { updateScrollCaptureConfig } from "@/services/capture";

export interface UseScrollCaptureReturn {
  config: ScrollCaptureConfig;
  progress: ScrollCaptureProgress | null;
  isCapturing: boolean;
  screenshots: Array<{ data: number[]; width: number; height: number }>;
  setDirection: (direction: ScrollDirection) => void;
  setStep: (step: number) => void;
  setDelay: (delay: number) => void;
  setMaxHeight: (height: number) => void;
  startCapture: () => void;
  stopCapture: () => void;
  addScreenshot: (screenshot: { data: number[]; width: number; height: number }) => void;
  clearScreenshots: () => void;
  getTotalHeight: () => number;
  getTotalWidth: () => number;
}

const DEFAULT_CONFIG: ScrollCaptureConfig = {
  auto_scroll: true,
  scroll_step: 300,
  scroll_delay_ms: 100,
  max_height: 10000,
  capture_direction: "Down",
};

export function useScrollCapture(): UseScrollCaptureReturn {
  const [config, setConfig] = useState<ScrollCaptureConfig>(DEFAULT_CONFIG);
  const [progress, setProgress] = useState<ScrollCaptureProgress | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [screenshots, setScreenshots] = useState<
    Array<{ data: number[]; width: number; height: number }>
  >([]);
  const scrollIntervalRef = useRef<number | null>(null);

  const saveConfig = useCallback(async (newConfig: ScrollCaptureConfig) => {
    try {
      await updateScrollCaptureConfig(newConfig);
      setConfig(newConfig);
    } catch (error) {
      console.error("Failed to save scroll capture config:", error);
    }
  }, []);

  const setDirection = useCallback(
    (direction: ScrollDirection) => {
      saveConfig({ ...config, capture_direction: direction });
    },
    [config, saveConfig]
  );

  const setStep = useCallback(
    (step: number) => {
      saveConfig({ ...config, scroll_step: Math.max(50, Math.min(1000, step)) });
    },
    [config, saveConfig]
  );

  const setDelay = useCallback(
    (delay: number) => {
      saveConfig({ ...config, scroll_delay_ms: Math.max(10, Math.min(1000, delay)) });
    },
    [config, saveConfig]
  );

  const setMaxHeight = useCallback(
    (height: number) => {
      saveConfig({ ...config, max_height: Math.max(1000, Math.min(50000, height)) });
    },
    [config, saveConfig]
  );

  const startCapture = useCallback(() => {
    setIsCapturing(true);
    setScreenshots([]);
    setProgress(null);
  }, []);

  const stopCapture = useCallback(() => {
    setIsCapturing(false);
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  const addScreenshot = useCallback(
    (screenshot: { data: number[]; width: number; height: number }) => {
      setScreenshots((prev) => [...prev, screenshot]);

      const totalHeight = screenshots.reduce((sum, s) => sum + s.height, 0) + screenshot.height;
      const progress: ScrollCaptureProgress = {
        current_y: totalHeight,
        total_y: config.max_height,
        progress: Math.min(1, totalHeight / config.max_height),
        is_complete: totalHeight >= config.max_height,
      };
      setProgress(progress);
    },
    [screenshots, config.max_height]
  );

  const clearScreenshots = useCallback(() => {
    setScreenshots([]);
    setProgress(null);
  }, []);

  const getTotalHeight = useCallback(() => {
    return screenshots.reduce((sum, s) => sum + s.height, 0);
  }, [screenshots]);

  const getTotalWidth = useCallback(() => {
    if (screenshots.length === 0) return 0;
    return Math.max(...screenshots.map((s) => s.width));
  }, [screenshots]);

  return {
    config,
    progress,
    isCapturing,
    screenshots,
    setDirection,
    setStep,
    setDelay,
    setMaxHeight,
    startCapture,
    stopCapture,
    addScreenshot,
    clearScreenshots,
    getTotalHeight,
    getTotalWidth,
  };
}
