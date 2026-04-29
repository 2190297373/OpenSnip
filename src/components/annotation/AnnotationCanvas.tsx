import React, { useRef, useEffect, useCallback, useState } from "react";
import { useCanvas, Point, Annotation, Bounds } from "./CanvasContext";
import { computeSnap, drawGuides, type GuideLine } from "./snapToGuides";
import { drawSpotlight } from "./canvasEffects";

interface AnnotationCanvasProps {
  className?: string;
}

type DragMode = "none" | "move" | "resize";
type ResizeHandle = "nw" | "ne" | "sw" | "se";

interface DragState {
  mode: DragMode;
  handle?: ResizeHandle;
  startPoint: Point;
  startBounds: Bounds;
  startPoints?: Point[];
}

interface MarqueeState {
  active: boolean;
  start: Point;
  current: Point;
}

const HANDLE_SIZE = 8;
const HANDLE_HIT_SIZE = 10;

// Draw arrow head
function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  style: "open" | "solid" | "triangle",
  size: number = 10
) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);

  ctx.beginPath();

  if (style === "open") {
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - size * Math.cos(angle - Math.PI / 6),
      to.y - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - size * Math.cos(angle + Math.PI / 6),
      to.y - size * Math.sin(angle + Math.PI / 6)
    );
  } else if (style === "solid") {
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - size * Math.cos(angle - Math.PI / 6),
      to.y - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      to.x - size * Math.cos(angle + Math.PI / 6),
      to.y - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
  } else if (style === "triangle") {
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - size * Math.cos(angle - Math.PI / 6),
      to.y - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      to.x - size * 2 * Math.cos(angle),
      to.y - size * 2 * Math.sin(angle)
    );
    ctx.lineTo(
      to.x - size * Math.cos(angle + Math.PI / 6),
      to.y - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
  }

  ctx.stroke();
  if (style !== "open") ctx.fill();
}

// Draw single annotation
function drawAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  isSelected: boolean
) {
  const { toolType, bounds, style, points, text, number } = annotation;

  ctx.strokeStyle = style.strokeColor;
  ctx.lineWidth = style.strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (style.dashed) {
    ctx.setLineDash([5, 5]);
  } else {
    ctx.setLineDash([]);
  }

  if (style.fillColor) {
    ctx.fillStyle = style.fillColor;
  }

  switch (toolType) {
    case "rectangle":
      if (style.fillColor) {
        ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      }
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      break;

    case "ellipse":
      ctx.beginPath();
      ctx.ellipse(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
        bounds.width / 2,
        bounds.height / 2,
        0,
        0,
        Math.PI * 2
      );
      if (style.fillColor) ctx.fill();
      ctx.stroke();
      break;

    case "line":
      if (points && points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.stroke();

        if (style.arrowHead !== "none") {
          drawArrowHead(ctx, points[0], points[points.length - 1], style.arrowHead);
        }
      }
      break;

    case "arrow":
      if (points && points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.stroke();
        drawArrowHead(ctx, points[0], points[points.length - 1], "triangle");
      }
      break;

    case "pencil":
    case "highlighter":
      if (points && points.length >= 2) {
        const path = annotation.path || points;

        if (toolType === "highlighter") {
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = style.strokeWidth * 3;
        }

        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();

        ctx.globalAlpha = 1;
      }
      break;

    case "text":
      if (text) {
        ctx.font = `${style.fontSize}px ${style.fontFamily}`;
        ctx.fillStyle = style.strokeColor;
        ctx.fillText(text, bounds.x, bounds.y + style.fontSize);
      }
      break;

    case "mosaic":
      ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
      for (let i = 0; i < bounds.width; i += style.mosaicSize) {
        for (let j = 0; j < bounds.height; j += style.mosaicSize) {
          ctx.strokeRect(bounds.x + i, bounds.y + j, style.mosaicSize, style.mosaicSize);
        }
      }
      break;

    case "blur":
      // Simplified blur: semi-transparent overlay
      // Full Gaussian blur requires reading background canvas (available in render loop for future enhancement)
      ctx.fillStyle = `rgba(200, 200, 200, 0.5)`;
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      break;

    case "spotlight": {
      // Spotlight: dim everything except the focal area
      const canvas = ctx.canvas;
      drawSpotlight(
        ctx,
        bounds,
        canvas.width,
        canvas.height,
        "rgba(0, 0, 0, 0.7)",
        30
      );
      break;
    }

    case "numbering":
      if (number !== undefined) {
        const radius = style.fontSize;

        ctx.fillStyle = style.strokeColor;
        ctx.beginPath();
        ctx.arc(bounds.x, bounds.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = style.fillColor || "#FFFFFF";
        ctx.font = `bold ${radius}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(number), bounds.x, bounds.y);
      }
      break;
  }

  // Draw selection handles
  if (isSelected) {
    ctx.strokeStyle = "#007AFF";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(bounds.x - 2, bounds.y - 2, bounds.width + 4, bounds.height + 4);
    ctx.setLineDash([]);

    // Corner handles
    const corners = [
      { x: bounds.x, y: bounds.y },
      { x: bounds.x + bounds.width, y: bounds.y },
      { x: bounds.x, y: bounds.y + bounds.height },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    ];

    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#007AFF";
    for (const corner of corners) {
      ctx.fillRect(corner.x - HANDLE_SIZE / 2, corner.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      ctx.strokeRect(corner.x - HANDLE_SIZE / 2, corner.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    }
  }
}

// Detect if point is on a resize handle of the given bounds
function getResizeHandle(point: Point, bounds: Bounds): ResizeHandle | null {
  const corners: { key: ResizeHandle; x: number; y: number }[] = [
    { key: "nw", x: bounds.x, y: bounds.y },
    { key: "ne", x: bounds.x + bounds.width, y: bounds.y },
    { key: "sw", x: bounds.x, y: bounds.y + bounds.height },
    { key: "se", x: bounds.x + bounds.width, y: bounds.y + bounds.height },
  ];

  for (const corner of corners) {
    if (
      Math.abs(point.x - corner.x) <= HANDLE_HIT_SIZE &&
      Math.abs(point.y - corner.y) <= HANDLE_HIT_SIZE
    ) {
      return corner.key;
    }
  }
  return null;
}

// Check if point is inside annotation bounds
function hitTestAnnotation(point: Point, bounds: Bounds): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

export function AnnotationCanvas({ className = "" }: AnnotationCanvasProps) {
  const { state, dispatch } = useCanvas();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setImageData] = useState<ImageData | null>(null);

  // Interaction states
  const [dragState, setDragState] = useState<DragState>({
    mode: "none",
    startPoint: { x: 0, y: 0 },
    startBounds: { x: 0, y: 0, width: 0, height: 0 },
  });

  const [marquee, setMarquee] = useState<MarqueeState>({
    active: false,
    start: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
  });

  const [guides, setGuides] = useState<GuideLine[]>([]);

  // Load background image
  useEffect(() => {
    if (!state.image) {
      setImageData(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;
      dispatch({ type: "SET_SIZE", payload: { width: img.width, height: img.height } });

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        setImageData(ctx.getImageData(0, 0, img.width, img.height));
      }
    };
    img.src = state.image;
  }, [state.image, dispatch]);

  // Draw canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    if (state.image) {
      const img = new Image();
      img.src = state.image;
      ctx.drawImage(img, 0, 0);
    }

    // Draw annotations from all visible layers (bottom to top)
    // Pass 1: background effects (spotlight, blur)
    // Pass 2: regular annotations on top
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layers = (state as any).layers;
    if (layers && layers.length > 0) {
      ctx.save();
      // Pass 1: spotlight + blur effects
      for (const layer of layers) {
        if (!layer.visible) continue;
        const effects = layer.annotations.filter(
          (a: Annotation) => a.toolType === "spotlight" || a.toolType === "blur"
        );
        for (const annotation of effects) {
          drawAnnotation(ctx, annotation, false);
        }
      }
      // Pass 2: regular annotations
      for (const layer of layers) {
        if (!layer.visible) continue;
        ctx.globalAlpha = layer.opacity ?? 1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isCurrentLayer = layer.id === (state as any).currentLayerId;
        const regular = layer.annotations.filter(
          (a: Annotation) => a.toolType !== "spotlight" && a.toolType !== "blur"
        );
        for (const annotation of regular) {
          drawAnnotation(ctx, annotation, annotation.id === state.selectedId && isCurrentLayer);
        }
      }
      ctx.restore();
    } else {
      // Fallback for backward compatibility
      for (const annotation of state.annotations) {
        drawAnnotation(ctx, annotation, annotation.id === state.selectedId);
      }
    }

    // Draw alignment guides (pink dashed lines for snapping)
    if (guides.length > 0) {
      drawGuides(ctx, guides);
    }

    // Draw marquee selection box
    if (marquee.active) {
      const x = Math.min(marquee.start.x, marquee.current.x);
      const y = Math.min(marquee.start.y, marquee.current.y);
      const w = Math.abs(marquee.current.x - marquee.start.x);
      const h = Math.abs(marquee.current.y - marquee.start.y);

      ctx.strokeStyle = "#007AFF";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = "rgba(0, 122, 255, 0.1)";
      ctx.fillRect(x, y, w, h);
      ctx.setLineDash([]);
    }

    // Draw current drawing
    if (state.isDrawing && state.currentPoints.length > 0) {
      ctx.strokeStyle = state.style.strokeColor;
      ctx.lineWidth = state.style.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const points = state.currentPoints;

      switch (state.tool) {
        case "rectangle":
        case "ellipse":
          if (points.length >= 2) {
            const start = points[0];
            const end = points[points.length - 1];
            const x = Math.min(start.x, end.x);
            const y = Math.min(start.y, end.y);
            const w = Math.abs(end.x - start.x);
            const h = Math.abs(end.y - start.y);

            if (state.tool === "rectangle") {
              ctx.strokeRect(x, y, w, h);
            } else {
              ctx.beginPath();
              ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
          break;

        case "line":
        case "arrow":
          if (points.length >= 2) {
            const start = points[0];
            const end = points[points.length - 1];
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            if (state.tool === "arrow") {
              drawArrowHead(ctx, start, end, "triangle");
            } else if (state.style.arrowHead !== "none") {
              drawArrowHead(ctx, start, end, state.style.arrowHead);
            }
          }
          break;

        case "pencil":
        case "highlighter":
          if (points.length >= 2) {
            if (state.tool === "highlighter") {
              ctx.globalAlpha = 0.3;
              ctx.lineWidth = state.style.strokeWidth * 3;
            }
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
              ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
          break;

        case "numbering":
          if (points.length >= 1) {
            const pos = points[0];
            const radius = state.style.fontSize;
            ctx.fillStyle = state.style.strokeColor;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#FFFFFF";
            ctx.font = `bold ${radius}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(String(state.nextNumber), pos.x, pos.y);
          }
          break;
      }
    }
  }, [state, marquee, guides]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Mouse handlers
  const getCanvasPoint = useCallback((e: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  // Update cursor based on hover state
  const updateCursor = useCallback(
    (point: Point) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (state.tool !== "select") {
        canvas.style.cursor = "crosshair";
        return;
      }

      // Check resize handles first
      if (state.selectedId) {
        const selected = state.annotations.find((a) => a.id === state.selectedId);
        if (selected) {
          const handle = getResizeHandle(point, selected.bounds);
          if (handle) {
            canvas.style.cursor =
              handle === "nw" || handle === "se" ? "nwse-resize" : "nesw-resize";
            return;
          }
        }
      }

      // Check annotation hover
      const hovered = state.annotations
        .slice()
        .reverse()
        .find((a) => hitTestAnnotation(point, a.bounds));

      if (hovered) {
        canvas.style.cursor = hovered.id === state.selectedId ? "move" : "pointer";
      } else {
        canvas.style.cursor = "default";
      }
    },
    [state.tool, state.selectedId, state.annotations]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const point = getCanvasPoint(e);

      if (state.tool === "select") {
        // 1. Check resize handles on selected annotation
        if (state.selectedId) {
          const selected = state.annotations.find((a) => a.id === state.selectedId);
          if (selected) {
            const handle = getResizeHandle(point, selected.bounds);
            if (handle) {
              setDragState({
                mode: "resize",
                handle,
                startPoint: point,
                startBounds: { ...selected.bounds },
                startPoints: selected.points ? [...selected.points] : undefined,
              });
              return;
            }
          }
        }

        // 2. Check if clicking inside selected annotation (move)
        if (state.selectedId) {
          const selected = state.annotations.find((a) => a.id === state.selectedId);
          if (selected && hitTestAnnotation(point, selected.bounds)) {
            setDragState({
              mode: "move",
              startPoint: point,
              startBounds: { ...selected.bounds },
              startPoints: selected.points ? [...selected.points] : undefined,
            });
            return;
          }
        }

        // 3. Check other annotations (select)
        const clicked = state.annotations
          .slice()
          .reverse()
          .find((a) => hitTestAnnotation(point, a.bounds));

        if (clicked) {
          dispatch({ type: "SELECT_ANNOTATION", payload: clicked.id });
          setDragState({
            mode: "move",
            startPoint: point,
            startBounds: { ...clicked.bounds },
            startPoints: clicked.points ? [...clicked.points] : undefined,
          });
        } else {
          // 4. Clicked on empty area - start marquee selection
          dispatch({ type: "SELECT_ANNOTATION", payload: null });
          setMarquee({
            active: true,
            start: point,
            current: point,
          });
        }
      } else if (state.tool === "text") {
        const text = prompt("Enter text:");
        if (text) {
          dispatch({
            type: "ADD_ANNOTATION",
            payload: {
              id: `${Date.now()}`,
              toolType: "text",
              bounds: { x: point.x, y: point.y, width: 100, height: 30 },
              style: state.style,
              text,
            },
          });
        }
      } else {
        dispatch({ type: "START_DRAWING", payload: point });
      }
    },
    [getCanvasPoint, state.tool, state.style, state.annotations, state.selectedId, dispatch]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const point = getCanvasPoint(e);

      // Update cursor
      updateCursor(point);

      // Handle drawing
      if (state.isDrawing) {
        dispatch({ type: "ADD_POINT", payload: point });
        return;
      }

      // Handle marquee
      if (marquee.active) {
        setMarquee((prev) => ({ ...prev, current: point }));
        return;
      }

      // Handle drag / resize
      if (dragState.mode === "move" && state.selectedId) {
        const dx = point.x - dragState.startPoint.x;
        const dy = point.y - dragState.startPoint.y;
        let newBounds = {
          x: dragState.startBounds.x + dx,
          y: dragState.startBounds.y + dy,
          width: dragState.startBounds.width,
          height: dragState.startBounds.height,
        };

        // Alignment snapping
        const others = state.annotations.filter(a => a.id !== state.selectedId)
          .map(a => a.bounds);
        const snap = computeSnap(newBounds, others);
        setGuides(snap.guides);
        newBounds = snap.bounds;

        const updates: Partial<Annotation> = { bounds: newBounds };

        // Also move points for pencil/line/arrow/highlighter
        if (dragState.startPoints && dragState.startPoints.length > 0) {
          const newPoints = dragState.startPoints.map((p) => ({
            x: p.x + dx,
            y: p.y + dy,
          }));
          updates.points = newPoints;
          // Clear cached path so it falls back to new points
          updates.path = undefined;
        }

        dispatch({
          type: "UPDATE_ANNOTATION",
          payload: { id: state.selectedId, updates },
        });
      } else if (dragState.mode === "resize" && state.selectedId && dragState.handle) {
        const orig = dragState.startBounds;
        const origRight = orig.x + orig.width;
        const origBottom = orig.y + orig.height;
        let newBounds = { ...orig };

        switch (dragState.handle) {
          case "nw":
            newBounds.x = Math.min(point.x, origRight - 1);
            newBounds.y = Math.min(point.y, origBottom - 1);
            newBounds.width = origRight - newBounds.x;
            newBounds.height = origBottom - newBounds.y;
            break;
          case "ne":
            newBounds.y = Math.min(point.y, origBottom - 1);
            newBounds.width = Math.max(point.x - orig.x, 1);
            newBounds.height = origBottom - newBounds.y;
            break;
          case "sw":
            newBounds.x = Math.min(point.x, origRight - 1);
            newBounds.width = origRight - newBounds.x;
            newBounds.height = Math.max(point.y - orig.y, 1);
            break;
          case "se":
            newBounds.width = Math.max(point.x - orig.x, 1);
            newBounds.height = Math.max(point.y - orig.y, 1);
            break;
        }

        // Alignment snapping for resize
        const others = state.annotations.filter(a => a.id !== state.selectedId)
          .map(a => a.bounds);
        const snap = computeSnap(newBounds, others, true);
        setGuides(snap.guides);
        newBounds = snap.bounds;

        dispatch({
          type: "UPDATE_ANNOTATION",
          payload: { id: state.selectedId, updates: { bounds: newBounds } },
        });
      }
    },
    [
      state.isDrawing,
      dragState,
      marquee.active,
      getCanvasPoint,
      updateCursor,
      dispatch,
      state.selectedId,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (state.isDrawing) {
      dispatch({ type: "END_DRAWING" });
    }

    if (dragState.mode !== "none") {
      setDragState({
        mode: "none",
        startPoint: { x: 0, y: 0 },
        startBounds: { x: 0, y: 0, width: 0, height: 0 },
      });
      setGuides([]);
    }

    if (marquee.active) {
      // Find annotations inside marquee
      const mx = Math.min(marquee.start.x, marquee.current.x);
      const my = Math.min(marquee.start.y, marquee.current.y);
      const mw = Math.abs(marquee.current.x - marquee.start.x);
      const mh = Math.abs(marquee.current.y - marquee.start.y);

      if (mw > 5 && mh > 5) {
        const inside = state.annotations.filter((a) => {
          const b = a.bounds;
          return (
            b.x >= mx &&
            b.y >= my &&
            b.x + b.width <= mx + mw &&
            b.y + b.height <= my + mh
          );
        });

        if (inside.length > 0) {
          // Select the last one (top-most)
          dispatch({
            type: "SELECT_ANNOTATION",
            payload: inside[inside.length - 1].id,
          });
        }
      }

      setMarquee({ active: false, start: { x: 0, y: 0 }, current: { x: 0, y: 0 } });
    }
  }, [state.isDrawing, dragState.mode, marquee, dispatch, state.annotations]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Nudge selected annotation with arrow keys
      if (state.selectedId && !e.ctrlKey && !e.altKey && !e.metaKey) {
        let dx = 0;
        let dy = 0;
        const step = e.shiftKey ? 10 : 1;

        if (e.key === "ArrowLeft") dx = -step;
        else if (e.key === "ArrowRight") dx = step;
        else if (e.key === "ArrowUp") dy = -step;
        else if (e.key === "ArrowDown") dy = step;

        if (dx !== 0 || dy !== 0) {
          e.preventDefault();
          const selected = state.annotations.find((a) => a.id === state.selectedId);
          if (selected) {
            const newBounds = {
              x: selected.bounds.x + dx,
              y: selected.bounds.y + dy,
              width: selected.bounds.width,
              height: selected.bounds.height,
            };

            const updates: Partial<Annotation> = { bounds: newBounds };
            if (selected.points && selected.points.length > 0) {
              updates.points = selected.points.map((p) => ({
                x: p.x + dx,
                y: p.y + dy,
              }));
              updates.path = undefined;
            }

            dispatch({
              type: "UPDATE_ANNOTATION",
              payload: { id: state.selectedId, updates },
            });
          }
          return;
        }
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (state.selectedId) {
          dispatch({ type: "DELETE_ANNOTATION", payload: state.selectedId });
        }
      } else if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        dispatch({ type: "UNDO" });
      } else if ((e.ctrlKey && e.key === "y") || (e.ctrlKey && e.shiftKey && e.key === "Z")) {
        e.preventDefault();
        dispatch({ type: "REDO" });
      } else if (e.key === "Escape") {
        dispatch({ type: "SELECT_ANNOTATION", payload: null });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.selectedId, state.annotations, dispatch]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}

export default AnnotationCanvas;
