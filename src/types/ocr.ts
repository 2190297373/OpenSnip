export interface OcrResult {
  text: string;
  confidence: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface OcrResponse {
  success: boolean;
  results: OcrResult[];
  full_text: string;
  language: string;
}

export interface OcrConfig {
  language: string;
  engine: "windows" | "tesseract" | "cloud";
  confidence_threshold: number;
}

export type OcrEngine = "windows" | "tesseract" | "cloud";
