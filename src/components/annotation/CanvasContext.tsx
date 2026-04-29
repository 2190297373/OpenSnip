import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";

// Tool types
export type ToolType =
  | "select"
  | "rectangle"
  | "ellipse"
  | "line"
  | "arrow"
  | "pencil"
  | "text"
  | "highlighter"
  | "mosaic"
  | "blur"
  | "spotlight"
  | "eraser"
  | "numbering";

// Annotation style
export interface AnnotationStyle {
  strokeColor: string;
  fillColor: string | null;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  dashed: boolean;
  arrowHead: "none" | "open" | "solid" | "triangle";
  blurRadius: number;
  mosaicSize: number;
}

// Point
export interface Point {
  x: number;
  y: number;
}

// Bounds
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Annotation base
export interface Annotation {
  id: string;
  toolType: ToolType;
  bounds: Bounds;
  style: AnnotationStyle;
  points?: Point[]; // For pencil/highlighter
  text?: string; // For text tool
  number?: number; // For numbering tool
  path?: Point[]; // Pre-smoothed path
}

// Canvas state
export interface CanvasState {
  image: string | null;
  annotations: Annotation[];
  selectedId: string | null;
  tool: ToolType;
  style: AnnotationStyle;
  isDrawing: boolean;
  currentPoints: Point[];
  nextNumber: number;
  history: Annotation[][];
  historyIndex: number;
  canvasWidth: number;
  canvasHeight: number;
  // Layer system
  layers: LayerData[];
  currentLayerId: string;
}

interface LayerData {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  annotations: Annotation[];
  opacity: number;
}

// Actions
type Action =
  | { type: "SET_IMAGE"; payload: string | null }
  | { type: "SET_TOOL"; payload: ToolType }
  | { type: "SET_STYLE"; payload: Partial<AnnotationStyle> }
  | { type: "START_DRAWING"; payload: Point }
  | { type: "ADD_POINT"; payload: Point }
  | { type: "END_DRAWING" }
  | { type: "ADD_ANNOTATION"; payload: Annotation }
  | { type: "UPDATE_ANNOTATION"; payload: { id: string; updates: Partial<Annotation> } }
  | { type: "DELETE_ANNOTATION"; payload: string }
  | { type: "SELECT_ANNOTATION"; payload: string | null }
  | { type: "CLEAR_ALL" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_SIZE"; payload: { width: number; height: number } }
  // Layer actions
  | { type: "ADD_LAYER"; payload: { id: string; name: string } }
  | { type: "DELETE_LAYER"; payload: string }
  | { type: "REORDER_LAYER"; payload: { fromIndex: number; toIndex: number } }
  | { type: "SET_CURRENT_LAYER"; payload: string }
  | { type: "TOGGLE_LAYER_VISIBILITY"; payload: string }
  | { type: "TOGGLE_LAYER_LOCK"; payload: string }
  | { type: "SET_LAYER_OPACITY"; payload: { layerId: string; opacity: number } }
  | { type: "RENAME_LAYER"; payload: { layerId: string; name: string } };

// Default style
const defaultStyle: AnnotationStyle = {
  strokeColor: "#FF0000",
  fillColor: null,
  strokeWidth: 2,
  fontSize: 16,
  fontFamily: "Arial",
  dashed: false,
  arrowHead: "none",
  blurRadius: 10,
  mosaicSize: 8,
};

const DEFAULT_LAYER_ID = "default";

// Initial state
const initialState: CanvasState = {
  image: null,
  annotations: [],
  selectedId: null,
  tool: "rectangle",
  style: defaultStyle,
  isDrawing: false,
  currentPoints: [],
  nextNumber: 1,
  history: [],
  historyIndex: -1,
  canvasWidth: 1920,
  canvasHeight: 1080,
  layers: [
    { id: DEFAULT_LAYER_ID, name: "默认图层", visible: true, locked: false, annotations: [], opacity: 1 }
  ],
  currentLayerId: DEFAULT_LAYER_ID,
};

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Calculate bounds from points
const calculateBounds = (points: Point[]): Bounds => {
  if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

// Reducer
function canvasReducer(state: CanvasState, action: Action): CanvasState {
  switch (action.type) {
    case "SET_IMAGE":
      return { ...state, image: action.payload };

    case "SET_TOOL":
      return { ...state, tool: action.payload, selectedId: null };

    case "SET_STYLE":
      return { ...state, style: { ...state.style, ...action.payload } };

    case "START_DRAWING":
      return {
        ...state,
        isDrawing: true,
        currentPoints: [action.payload],
      };

    case "ADD_POINT":
      return {
        ...state,
        currentPoints: [...state.currentPoints, action.payload],
      };

    case "END_DRAWING": {
      const { currentPoints, tool, style, nextNumber } = state;
      
      if (currentPoints.length < 2) {
        return { ...state, isDrawing: false, currentPoints: [] };
      }

      // Save history before adding
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.annotations]);

      let annotation: Annotation;

      if (tool === "pencil" || tool === "highlighter") {
        annotation = {
          id: generateId(),
          toolType: tool,
          bounds: calculateBounds(currentPoints),
          style,
          points: currentPoints,
          path: smoothPath(currentPoints),
        };
      } else if (tool === "numbering") {
        annotation = {
          id: generateId(),
          toolType: tool,
          bounds: {
            x: currentPoints[0].x,
            y: currentPoints[0].y,
            width: 30,
            height: 30,
          },
          style,
          number: nextNumber,
        };
      } else {
        annotation = {
          id: generateId(),
          toolType: tool,
          bounds: calculateBounds(currentPoints),
          style,
        };
      }

      return {
        ...state,
        isDrawing: false,
        currentPoints: [],
        annotations: [...state.annotations, annotation],
        // Also store in current layer
        layers: state.layers.map(l =>
          l.id === state.currentLayerId
            ? { ...l, annotations: [...l.annotations, annotation] }
            : l
        ),
        history: newHistory,
        historyIndex: newHistory.length - 1,
        nextNumber: tool === "numbering" ? nextNumber + 1 : nextNumber,
      };
    }

    case "ADD_ANNOTATION": {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.annotations]);
      return {
        ...state,
        annotations: [...state.annotations, action.payload],
        layers: state.layers.map(l =>
          l.id === state.currentLayerId
            ? { ...l, annotations: [...l.annotations, action.payload] }
            : l
        ),
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case "UPDATE_ANNOTATION":
      return {
        ...state,
        annotations: state.annotations.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload.updates } : a
        ),
      };

    case "DELETE_ANNOTATION": {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.annotations]);
      return {
        ...state,
        annotations: state.annotations.filter((a) => a.id !== action.payload),
        layers: state.layers.map(l =>
          l.id === state.currentLayerId
            ? { ...l, annotations: l.annotations.filter(a => a.id !== action.payload) }
            : l
        ),
        selectedId: state.selectedId === action.payload ? null : state.selectedId,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case "SELECT_ANNOTATION":
      return { ...state, selectedId: action.payload };

    case "CLEAR_ALL": {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.annotations]);
      return {
        ...state,
        annotations: [],
        layers: state.layers.map(l =>
          l.id === state.currentLayerId ? { ...l, annotations: [] } : l
        ),
        selectedId: null,
        nextNumber: 1,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case "UNDO":
      if (state.historyIndex < 0) return state;
      return {
        ...state,
        annotations: state.history[state.historyIndex],
        layers: state.layers.map(l =>
          l.id === state.currentLayerId
            ? { ...l, annotations: [...state.history[state.historyIndex]] }
            : l
        ),
        historyIndex: state.historyIndex - 1,
      };

    case "REDO":
      if (state.historyIndex >= state.history.length - 1) return state;
      return {
        ...state,
        annotations: state.history[state.historyIndex + 1],
        layers: state.layers.map(l =>
          l.id === state.currentLayerId
            ? { ...l, annotations: [...state.history[state.historyIndex + 1]] }
            : l
        ),
        historyIndex: state.historyIndex + 1,
      };

    case "SET_SIZE":
      return {
        ...state,
        canvasWidth: action.payload.width,
        canvasHeight: action.payload.height,
      };

    // --- Layer actions ---
    case "ADD_LAYER": {
      const layer: LayerData = {
        id: action.payload.id,
        name: action.payload.name,
        visible: true,
        locked: false,
        annotations: [],
        opacity: 1,
      };
      return { ...state, layers: [...state.layers, layer] };
    }
    case "DELETE_LAYER": {
      if (state.layers.length <= 1) return state;
      const newLayers = state.layers.filter(l => l.id !== action.payload);
      const newCurrentId = state.currentLayerId === action.payload
        ? (newLayers[newLayers.length - 1]?.id ?? DEFAULT_LAYER_ID)
        : state.currentLayerId;
      return { ...state, layers: newLayers, currentLayerId: newCurrentId };
    }
    case "REORDER_LAYER": {
      const { fromIndex, toIndex } = action.payload;
      const layers = [...state.layers];
      const [moved] = layers.splice(fromIndex, 1);
      layers.splice(toIndex, 0, moved);
      return { ...state, layers };
    }
    case "SET_CURRENT_LAYER": {
      // Save current annotations to current layer before switching
      const savedLayers = state.layers.map(l =>
        l.id === state.currentLayerId
          ? { ...l, annotations: [...state.annotations] }
          : l
      );
      // Load target layer's annotations into state.annotations
      const target = savedLayers.find(l => l.id === action.payload);
      return {
        ...state,
        currentLayerId: action.payload,
        layers: savedLayers,
        annotations: target ? [...target.annotations] : [],
        selectedId: null,
      };
    }
    case "TOGGLE_LAYER_VISIBILITY": {
      const layers = state.layers.map(l =>
        l.id === action.payload ? { ...l, visible: !l.visible } : l
      );
      return { ...state, layers };
    }
    case "TOGGLE_LAYER_LOCK": {
      const layers = state.layers.map(l =>
        l.id === action.payload ? { ...l, locked: !l.locked } : l
      );
      return { ...state, layers };
    }
    case "SET_LAYER_OPACITY": {
      const layers = state.layers.map(l =>
        l.id === action.payload.layerId ? { ...l, opacity: action.payload.opacity } : l
      );
      return { ...state, layers };
    }
    case "RENAME_LAYER": {
      const layers = state.layers.map(l =>
        l.id === action.payload.layerId ? { ...l, name: action.payload.name } : l
      );
      return { ...state, layers };
    }

    default:
      return state;
  }
}

// Smooth path using Catmull-Rom spline
function smoothPath(points: Point[]): Point[] {
  if (points.length < 3) return points;
  
  const result: Point[] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    
    for (let t = 0; t < 1; t += 0.1) {
      const t2 = t * t;
      const t3 = t2 * t;
      
      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      );
      
      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
      );
      
      result.push({ x, y });
    }
  }
  
  result.push(points[points.length - 1]);
  return result;
}

// Context
interface CanvasContextType {
  state: CanvasState;
  dispatch: React.Dispatch<Action>;
  setImage: (image: string | null) => void;
  setTool: (tool: ToolType) => void;
  setStyle: (style: Partial<AnnotationStyle>) => void;
  addAnnotation: (annotation: Annotation) => void;
  deleteAnnotation: (id: string) => void;
  selectAnnotation: (id: string | null) => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

// Provider
interface CanvasProviderProps {
  children: ReactNode;
}

export function CanvasProvider({ children }: CanvasProviderProps) {
  const [state, dispatch] = useReducer(canvasReducer, initialState);

  const setImage = useCallback((image: string | null) => {
    dispatch({ type: "SET_IMAGE", payload: image });
  }, []);

  const setTool = useCallback((tool: ToolType) => {
    dispatch({ type: "SET_TOOL", payload: tool });
  }, []);

  const setStyle = useCallback((style: Partial<AnnotationStyle>) => {
    dispatch({ type: "SET_STYLE", payload: style });
  }, []);

  const addAnnotation = useCallback((annotation: Annotation) => {
    dispatch({ type: "ADD_ANNOTATION", payload: annotation });
  }, []);

  const deleteAnnotation = useCallback((id: string) => {
    dispatch({ type: "DELETE_ANNOTATION", payload: id });
  }, []);

  const selectAnnotation = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_ANNOTATION", payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  const value = {
    state,
    dispatch,
    setImage,
    setTool,
    setStyle,
    addAnnotation,
    deleteAnnotation,
    selectAnnotation,
    clearAll,
    undo,
    redo,
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
}

// Hook
export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
}

export { defaultStyle };
