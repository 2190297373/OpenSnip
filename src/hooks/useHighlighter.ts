import { useState, useCallback } from "react";
import type { HighlighterConfig, HighlighterStroke } from "@/types";

export type HighlighterColorName = "Yellow" | "Green" | "Blue" | "Pink" | "Orange";

export interface UseHighlighterReturn {
  strokes: HighlighterStroke[];
  currentStroke: HighlighterStroke | null;
  config: HighlighterConfig;
  isDrawing: boolean;
  startStroke: (x: number, y: number, pressure?: number) => void;
  addPoint: (x: number, y: number, pressure?: number) => void;
  endStroke: () => void;
  cancelStroke: () => void;
  clearStrokes: () => void;
  undo: () => void;
  setColor: (color: HighlighterColorName) => void;
  setOpacity: (opacity: number) => void;
  setThickness: (thickness: number) => void;
  getSvgPaths: () => string[];
  getStrokeBounds: () => { minX: number; minY: number; maxX: number; maxY: number } | null;
}

export function useHighlighter(initialConfig?: Partial<HighlighterConfig>): UseHighlighterReturn {
  const [strokes, setStrokes] = useState<HighlighterStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<HighlighterStroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [config, setConfig] = useState<HighlighterConfig>({
    color: "Yellow",
    opacity: 0.4,
    thickness: 20,
    ...initialConfig,
  });

  const startStroke = useCallback(
    (x: number, y: number, pressure: number = 1.0) => {
      const stroke: HighlighterStroke = {
        points: [{ x, y, pressure }],
        config: { ...config },
      };
      setCurrentStroke(stroke);
      setIsDrawing(true);
    },
    [config]
  );

  const addPoint = useCallback(
    (x: number, y: number, pressure: number = 1.0) => {
      if (!isDrawing || !currentStroke) return;

      setCurrentStroke({
        ...currentStroke,
        points: [...currentStroke.points, { x, y, pressure }],
      });
    },
    [isDrawing, currentStroke]
  );

  const endStroke = useCallback(() => {
    if (currentStroke && currentStroke.points.length > 1) {
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  }, [currentStroke]);

  const cancelStroke = useCallback(() => {
    setCurrentStroke(null);
    setIsDrawing(false);
  }, []);

  const clearStrokes = useCallback(() => {
    setStrokes([]);
  }, []);

  const undo = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1));
  }, []);

  const setColor = useCallback((color: HighlighterColorName) => {
    setConfig((prev) => ({ ...prev, color }));
  }, []);

  const setOpacity = useCallback((opacity: number) => {
    setConfig((prev) => ({ ...prev, opacity: Math.max(0.1, Math.min(0.8, opacity)) }));
  }, []);

  const setThickness = useCallback((thickness: number) => {
    setConfig((prev) => ({ ...prev, thickness: Math.max(5, Math.min(100, thickness)) }));
  }, []);

  const getSvgPaths = useCallback((): string[] => {
    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;
    return allStrokes.map((stroke) => {
      const points = stroke.points;
      if (points.length === 0) return "";
      if (points.length === 1) {
        const p = points[0];
        const r = stroke.config.thickness / 2;
        return `M ${p.x - r} ${p.y} A ${r} ${r} 0 1 0 ${p.x + r} ${p.y} A ${r} ${r} 0 1 0 ${p.x - r} ${p.y}`;
      }

      let path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;
        path += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
      }
      const last = points[points.length - 1];
      path += ` L ${last.x} ${last.y}`;
      return path;
    });
  }, [strokes, currentStroke]);

  const getStrokeBounds = useCallback(() => {
    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;
    if (allStrokes.length === 0) return null;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (const stroke of allStrokes) {
      for (const point of stroke.points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }
    }

    return { minX, minY, maxX, maxY };
  }, [strokes, currentStroke]);

  return {
    strokes,
    currentStroke,
    config,
    isDrawing,
    startStroke,
    addPoint,
    endStroke,
    cancelStroke,
    clearStrokes,
    undo,
    setColor,
    setOpacity,
    setThickness,
    getSvgPaths,
    getStrokeBounds,
  };
}
