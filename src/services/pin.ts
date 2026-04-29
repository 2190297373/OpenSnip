import { invoke } from "@tauri-apps/api/core";
import type { Pin, CreatePinOptions, PinPosition, PinSize, PinStyle } from "@/types";

export async function createImagePin(content: string, x?: number, y?: number): Promise<Pin> {
  return invoke<Pin>("create_image_pin", { content, x, y });
}

export async function createTextPin(content: string, x?: number, y?: number): Promise<Pin> {
  return invoke<Pin>("create_text_pin", { content, x, y });
}

export async function getPins(): Promise<Pin[]> {
  return invoke<Pin[]>("get_pins");
}

export async function updatePinPosition(id: string, position: PinPosition): Promise<void> {
  return invoke<void>("update_pin_position", { id, position });
}

export async function updatePinSize(id: string, size: PinSize): Promise<void> {
  return invoke<void>("update_pin_size", { id, size });
}

export async function updatePinStyle(id: string, style: Partial<PinStyle>): Promise<void> {
  return invoke<void>("update_pin_style", { id, style });
}

export async function deletePin(id: string): Promise<void> {
  return invoke<void>("delete_pin", { id });
}

export async function bringPinToFront(id: string): Promise<void> {
  return invoke<void>("bring_pin_to_front", { id });
}

export async function togglePinLock(id: string): Promise<void> {
  return invoke<void>("toggle_pin_lock", { id });
}

export async function togglePinMinimize(id: string): Promise<void> {
  return invoke<void>("toggle_pin_minimize", { id });
}

export async function clearAllPins(): Promise<void> {
  return invoke<void>("clear_all_pins");
}

export async function createPin(options: CreatePinOptions): Promise<Pin> {
  if (options.type === "image") {
    return createImagePin(options.content, options.x, options.y);
  } else {
    return createTextPin(options.content, options.x, options.y);
  }
}
