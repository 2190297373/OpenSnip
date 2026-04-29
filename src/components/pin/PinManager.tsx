import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { PinWindow, Pin } from "./PinWindow";

interface PinManagerProps {
  className?: string;
}

export function PinManager({ className = "" }: PinManagerProps) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);

  // Fetch pins from backend
  const fetchPins = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await invoke<any[]>("get_pins");
      const mapped: Pin[] = result.map((p) => ({
        id: p.id,
        pinType: p.pin_type,
        content: {
          image: p.content.image,
          imageWidth: p.content.image_width,
          imageHeight: p.content.image_height,
          text: p.content.text,
          ocrText: p.content.ocr_text,
          translation: p.content.translation,
        },
        x: p.position.x,
        y: p.position.y,
        width: p.size.width,
        height: p.size.height,
        style: {
          backgroundColor: p.style.background_color,
          borderColor: p.style.border_color,
          borderWidth: p.style.border_width,
          borderRadius: p.style.border_radius,
          shadowEnabled: p.style.shadow_enabled,
          shadowOffset: p.style.shadow_offset,
          shadowBlur: p.style.shadow_blur,
          alwaysOnTop: p.style.always_on_top,
          opacity: p.style.opacity,
          showTitleBar: p.style.show_title_bar,
        },
        zIndex: p.z_index,
        isPinned: p.is_pinned,
        isMinimized: p.is_minimized,
        isLocked: p.is_locked,
      }));
      setPins(mapped);
    } catch (e) {
      console.error("Failed to fetch pins:", e);
    }
  }, []);

  // Update pin position
  const updatePinPosition = useCallback(async (id: string, x: number, y: number) => {
    try {
      await invoke("update_pin_position", { id, x, y });
      setPins((prev) =>
        prev.map((p) => (p.id === id ? { ...p, x, y } : p))
      );
    } catch (e) {
      console.error("Failed to update pin position:", e);
    }
  }, []);

  // Update pin size
  const updatePinSize = useCallback(async (id: string, width: number, height: number) => {
    try {
      await invoke("update_pin_size", { id, width, height });
      setPins((prev) =>
        prev.map((p) => (p.id === id ? { ...p, width, height } : p))
      );
    } catch (e) {
      console.error("Failed to update pin size:", e);
    }
  }, []);

  // Delete pin
  const deletePin = useCallback(async (id: string) => {
    try {
      await invoke("delete_pin", { id });
      setPins((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error("Failed to delete pin:", e);
    }
  }, []);

  // Bring pin to front
  const bringPinToFront = useCallback(async (id: string) => {
    try {
      await invoke("bring_pin_to_front", { id });
      const newZIndex = nextZIndex + 1;
      setNextZIndex(newZIndex);
      setPins((prev) =>
        prev.map((p) => (p.id === id ? { ...p, zIndex: newZIndex } : p))
      );
    } catch (e) {
      console.error("Failed to bring pin to front:", e);
    }
  }, [nextZIndex]);

  // Toggle pin lock
  const togglePinLock = useCallback(async (id: string) => {
    try {
      const result = await invoke<boolean>("toggle_pin_lock", { id });
      setPins((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isLocked: result } : p))
      );
    } catch (e) {
      console.error("Failed to toggle pin lock:", e);
    }
  }, []);

  // Toggle pin minimize
  const togglePinMinimize = useCallback(async (id: string) => {
    try {
      const result = await invoke<boolean>("toggle_pin_minimize", { id });
      setPins((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isMinimized: result } : p))
      );
    } catch (e) {
      console.error("Failed to toggle pin minimize:", e);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPins();
  }, [fetchPins]);

  // Sort pins by z-index for rendering
  const sortedPins = [...pins].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className={`pin-manager ${className}`}>
      {sortedPins.map((pin) => (
        <PinWindow
          key={pin.id}
          pin={pin}
          onClose={() => deletePin(pin.id)}
          onUpdatePosition={(x, y) => updatePinPosition(pin.id, x, y)}
          onUpdateSize={(width, height) => updatePinSize(pin.id, width, height)}
          onBringToFront={() => bringPinToFront(pin.id)}
          onToggleLock={() => togglePinLock(pin.id)}
          onToggleMinimize={() => togglePinMinimize(pin.id)}
        >
          {/* Image content */}
          {pin.content.image && (
            <img
              src={`data:image/png;base64,${pin.content.image}`}
              alt="Pin"
              className="max-w-full max-h-full object-contain"
              style={{
                width: pin.content.imageWidth || "100%",
                height: pin.content.imageHeight || "auto",
              }}
            />
          )}

          {/* Text content */}
          {pin.content.text && (
            <div className="whitespace-pre-wrap break-words">
              {pin.content.text}
            </div>
          )}

          {/* OCR content */}
          {pin.content.ocrText && (
            <div className="whitespace-pre-wrap break-words text-sm">
              <div className="font-semibold mb-1">OCR Result:</div>
              {pin.content.ocrText}
            </div>
          )}

          {/* Translation content */}
          {pin.content.translation && (
            <div className="whitespace-pre-wrap break-words">
              <div className="font-semibold mb-1">Translation:</div>
              {pin.content.translation}
            </div>
          )}
        </PinWindow>
      ))}
    </div>
  );
}

export default PinManager;
