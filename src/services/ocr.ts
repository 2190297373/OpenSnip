import { invoke } from "@tauri-apps/api/core";
import type { OcrResponse, OcrConfig } from "@/types";

export async function performOcr(imageData: string, config?: Partial<OcrConfig>): Promise<OcrResponse> {
  return invoke<OcrResponse>("perform_ocr", { 
    imageData,
    config: config || {}
  });
}

export async function extractText(
  imageData: string,
  language: string = "auto"
): Promise<string> {
  return invoke<string>("extract_text", { imageData, language });
}

export async function getOcrConfig(): Promise<OcrConfig> {
  return invoke<OcrConfig>("get_ocr_config");
}

export async function updateOcrConfig(config: Partial<OcrConfig>): Promise<void> {
  return invoke<void>("update_ocr_config", { config });
}

export function base64ToImageElement(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/png;base64,${base64}`;
  });
}
