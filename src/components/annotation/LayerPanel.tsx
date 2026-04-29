import { useState } from "react";
import { useCanvas } from "./CanvasContext";

interface LayerData {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  annotations: unknown[];
  opacity: number;
}

interface DragState {
  fromId: string | null;
  overIndex: number | null;
}

export function LayerPanel() {
  const { state, dispatch } = useCanvas();
  const layers: LayerData[] = (state as any).layers ?? [];
  const currentLayerId = (state as any).currentLayerId ?? "default";

  const [drag, setDrag] = useState<DragState>({ fromId: null, overIndex: null });

  const addLayer = () => {
    const id = `layer_${Date.now()}`;
    dispatch({
      type: "ADD_LAYER" as any,
      payload: { id, name: `图层 ${layers.length + 1}` },
    } as any);
  };

  const deleteLayer = (id: string) => {
    if (layers.length <= 1) return;
    const layer = layers.find((l) => l.id === id);
    if (layer && layer.annotations.length > 0) {
      if (!confirm("确定删除该图层？包含的标注将被保留到下一个图层。")) return;
    }
    dispatch({ type: "DELETE_LAYER" as any, payload: id } as any);
  };

  const selectLayer = (id: string) => {
    dispatch({ type: "SET_CURRENT_LAYER" as any, payload: id } as any);
  };

  const toggleVisible = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch({ type: "TOGGLE_LAYER_VISIBILITY" as any, payload: id } as any);
  };

  const toggleLock = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch({ type: "TOGGLE_LAYER_LOCK" as any, payload: id } as any);
  };

  const rename = (id: string, newName: string) => {
    dispatch({
      type: "RENAME_LAYER" as any,
      payload: { layerId: id, name: newName || "未命名" },
    } as any);
  };

  const onDragStart = (e: React.DragEvent, id: string, index: number) => {
    e.dataTransfer.setData("text/plain", id);
    setDrag({ fromId: id, overIndex: null });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (drag.fromId == null) return;
    const fromIndex = layers.findIndex((l) => l.id === drag.fromId);
    if (fromIndex >= 0 && fromIndex !== toIndex) {
      dispatch({
        type: "REORDER_LAYER" as any,
        payload: { fromIndex, toIndex },
      } as any);
    }
    setDrag({ fromId: null, overIndex: null });
  };

  return (
    <aside className="w-[240px] border-l border-[var(--color-border)] bg-[var(--color-background)] p-3 flex flex-col">
      <div className="text-sm font-semibold text-[var(--color-text)] mb-3">图层管理</div>

      <div className="flex-1 overflow-auto space-y-1" onDragOver={onDragOver}>
        {layers.map((layer, idx) => (
          <div
            key={layer.id}
            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${
              layer.id === currentLayerId
                ? "bg-blue-100 dark:bg-blue-900/30"
                : "hover:bg-[var(--color-surface)]"
            }`}
            draggable
            onDragStart={(e) => onDragStart(e, layer.id, idx)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, idx)}
            onClick={() => selectLayer(layer.id)}
          >
            {/* Visibility toggle */}
            <button
              className="w-5 h-5 flex items-center justify-center text-xs flex-shrink-0"
              onClick={(e) => toggleVisible(e, layer.id)}
              title={layer.visible ? "隐藏" : "显示"}
            >
              {layer.visible ? "\u{1F441}" : "\u{1F576}"}
            </button>

            {/* Lock toggle */}
            <button
              className="w-5 h-5 flex items-center justify-center text-xs flex-shrink-0"
              onClick={(e) => toggleLock(e, layer.id)}
              title={layer.locked ? "解锁" : "锁定"}
            >
              {layer.locked ? "\u{1F512}" : "\u{1F513}"}
            </button>

            {/* Layer name */}
            <input
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-[var(--color-text)]"
              value={layer.name}
              onChange={(e) => rename(layer.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Annotation count */}
            <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0 ml-1">
              {layer.annotations.length}
            </span>

            {/* Delete */}
            {layers.length > 1 && (
              <button
                className="w-5 h-5 flex items-center justify-center text-xs text-red-400 hover:text-red-500 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLayer(layer.id);
                }}
                title="删除图层"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addLayer}
        className="mt-2 w-full py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
      >
        + 新建图层
      </button>
    </aside>
  );
}

export default LayerPanel;
