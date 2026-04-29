import { useState, useCallback, useRef, useEffect } from "react";
import type { CapturedImage } from "@/types";
import { captureAsPng, buildCaptureArgs, createCapturedImage } from "@/services/capture";

interface UseCaptureOptions {
  onCaptureComplete?: (image: CapturedImage) => void;
  onCaptureError?: (error: Error) => void;
}

interface UseCaptureReturn {
  isCapturing: boolean;
  capturedImage: CapturedImage | null;
  startCapture: (mode: "region" | "window" | "fullscreen") => void;
  cancelCapture: () => void;
  clearCapture: () => void;
  performCapture: (
    mode: "region" | "window" | "fullscreen",
    region?: { x: number; y: number; width: number; height: number },
    windowHwnd?: number
  ) => Promise<CapturedImage>;
}

export function useCapture(options: UseCaptureOptions = {}): UseCaptureReturn {
  const { onCaptureComplete, onCaptureError } = options;
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const captureModeRef = useRef<"region" | "window" | "fullscreen">("region");
  
  const startCapture = useCallback((mode: "region" | "window" | "fullscreen") => {
    captureModeRef.current = mode;
    setIsCapturing(true);
  }, []);
  
  const performCapture = useCallback(async (
    mode: "region" | "window" | "fullscreen",
    region?: { x: number; y: number; width: number; height: number },
    windowHwnd?: number
  ): Promise<CapturedImage> => {
    try {
      const args = buildCaptureArgs(mode, region, windowHwnd);
      const base64 = await captureAsPng(args);
      const image = createCapturedImage(base64, region?.width || 1920, region?.height || 1080);
      
      setCapturedImage(image);
      setIsCapturing(false);
      onCaptureComplete?.(image);
      
      return image;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onCaptureError?.(err);
      setIsCapturing(false);
      throw err;
    }
  }, [onCaptureComplete, onCaptureError]);
  
  const cancelCapture = useCallback(() => {
    setIsCapturing(false);
  }, []);
  
  const clearCapture = useCallback(() => {
    setCapturedImage(null);
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCapturing) {
        e.preventDefault();
        cancelCapture();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCapturing, cancelCapture]);
  
  return {
    isCapturing,
    capturedImage,
    startCapture,
    cancelCapture,
    clearCapture,
    performCapture,
  };
}
