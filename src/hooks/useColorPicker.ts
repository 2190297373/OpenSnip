import { useState, useCallback, useEffect } from "react";
import {
  pickColorFromScreenshot,
  getColorHistory,
  clearColorHistory,
  removeColorFromHistory,
  setColorFormat as setColorFormatApi,
  getColorFormat as getColorFormatApi,
} from "@/services/capture";
import type { ColorFormat, ColorHistoryEntry, PickedColor } from "@/types";

export interface UseColorPickerReturn {
  currentColor: PickedColor | null;
  colorHistory: ColorHistoryEntry[];
  currentFormat: ColorFormat;
  isLoading: boolean;
  pickColor: (screenshot: { data: number[]; width: number; height: number; region: unknown }, x: number, y: number) => Promise<PickedColor | null>;
  setFormat: (format: ColorFormat) => Promise<void>;
  clearHistory: () => Promise<void>;
  removeFromHistory: (index: number) => Promise<void>;
  getFormattedColor: (format?: ColorFormat) => string;
  reloadHistory: () => Promise<void>;
}

export function useColorPicker(): UseColorPickerReturn {
  const [currentColor, setCurrentColor] = useState<PickedColor | null>(null);
  const [colorHistory, setColorHistory] = useState<ColorHistoryEntry[]>([]);
  const [currentFormat, setCurrentFormat] = useState<ColorFormat>("hex");
  const [isLoading, setIsLoading] = useState(false);

  const reloadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const history = await getColorHistory();
      setColorHistory(history);
    } catch (error) {
      console.error("Failed to load color history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pickColor = useCallback(
    async (
      screenshot: { data: number[]; width: number; height: number; region: unknown },
      x: number,
      y: number
    ): Promise<PickedColor | null> => {
      try {
        const color = await pickColorFromScreenshot(screenshot, x, y);
        setCurrentColor(color);
        await reloadHistory();
        return color;
      } catch (error) {
        console.error("Failed to pick color:", error);
        return null;
      }
    },
    [reloadHistory]
  );

  const setFormat = useCallback(async (format: ColorFormat) => {
    try {
      await setColorFormatApi(format);
      setCurrentFormat(format);
    } catch (error) {
      console.error("Failed to set color format:", error);
    }
  }, []);

  const clearHistoryHandler = useCallback(async () => {
    try {
      await clearColorHistory();
      setColorHistory([]);
    } catch (error) {
      console.error("Failed to clear color history:", error);
    }
  }, []);

  const removeFromHistory = useCallback(async (index: number) => {
    try {
      await removeColorFromHistory(index);
      await reloadHistory();
    } catch (error) {
      console.error("Failed to remove color from history:", error);
    }
  }, [reloadHistory]);

  const getFormattedColor = useCallback(
    (format?: ColorFormat): string => {
      if (!currentColor) return "";
      const fmt = format || currentFormat;

      switch (fmt) {
        case "hex":
          return currentColor.hex;
        case "rgb":
          return currentColor.rgb_string;
        case "rgba":
          return `rgba(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b}, 1)`;
        case "hsl":
          return currentColor.hsl
            ? `hsl(${Math.round(currentColor.hsl.h)}, ${Math.round(currentColor.hsl.s)}%, ${Math.round(currentColor.hsl.l)}%)`
            : "";
        default:
          return currentColor.hex;
      }
    },
    [currentColor, currentFormat]
  );

  useEffect(() => {
    reloadHistory();
    getColorFormatApi()
      .then(setCurrentFormat)
      .catch(console.error);
  }, [reloadHistory]);

  return {
    currentColor,
    colorHistory,
    currentFormat,
    isLoading,
    pickColor,
    setFormat,
    clearHistory: clearHistoryHandler,
    removeFromHistory,
    getFormattedColor,
    reloadHistory,
  };
}
