import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface CaptureHistoryItem {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  timestamp: number;
  thumbnail?: string;
}

const MAX_HISTORY = 10;

interface UseCaptureHistoryReturn {
  history: CaptureHistoryItem[];
  currentIndex: number;
  currentItem: CaptureHistoryItem | null;
  addToHistory: (item: Omit<CaptureHistoryItem, "id">) => void;
  goToPrevious: () => CaptureHistoryItem | null;
  goToNext: () => CaptureHistoryItem | null;
  clearHistory: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  hasHistory: boolean;
}

export function useCaptureHistory(): UseCaptureHistoryReturn {
  const [history, setHistory] = useState<CaptureHistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const currentItem = currentIndex >= 0 && currentIndex < history.length 
    ? history[currentIndex] 
    : null;

  const addToHistory = useCallback((item: Omit<CaptureHistoryItem, "id">) => {
    const newItem: CaptureHistoryItem = {
      ...item,
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    setHistory((prev) => {
      const newHistory = [newItem, ...prev].slice(0, MAX_HISTORY);
      return newHistory;
    });
    setCurrentIndex(0);
  }, []);

  const goToPrevious = useCallback((): CaptureHistoryItem | null => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [currentIndex, history]);

  const goToNext = useCallback((): CaptureHistoryItem | null => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [currentIndex, history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  const canGoPrevious = currentIndex < history.length - 1;
  const canGoNext = currentIndex > 0;
  const hasHistory = history.length > 0;

  return {
    history,
    currentIndex,
    currentItem,
    addToHistory,
    goToPrevious,
    goToNext,
    clearHistory,
    canGoPrevious,
    canGoNext,
    hasHistory,
  };
}

export function useCaptureHistorySync(maxHistory: number = 10) {
  const [history, setHistory] = useState<CaptureHistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const items = await invoke<CaptureHistoryItem[]>("get_capture_history");
      setHistory(items);
    } catch (error) {
      console.error("Failed to load capture history:", error);
    }
  };

  const addToHistory = async (item: Omit<CaptureHistoryItem, "id">) => {
    try {
      const newItem = await invoke<CaptureHistoryItem>("add_capture_history", {
        item: { ...item, id: "" },
        maxItems: maxHistory,
      });
      setHistory((prev) => [newItem, ...prev].slice(0, maxHistory));
      return newItem;
    } catch (error) {
      console.error("Failed to add to capture history:", error);
      throw error;
    }
  };

  const clearHistory = async () => {
    try {
      await invoke("clear_capture_history");
      setHistory([]);
    } catch (error) {
      console.error("Failed to clear capture history:", error);
    }
  };

  return {
    history,
    addToHistory,
    clearHistory,
    loadHistory,
  };
}
