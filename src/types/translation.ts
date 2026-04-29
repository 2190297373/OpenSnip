export interface TranslationResult {
  translated_text: string;
  source_language: string;
  target_language: string;
  confidence?: number;
}

export interface TranslationConfig {
  engine: "google" | "baidu" | "deepl" | "local";
  source_language: string;
  target_language: string;
}

export type TranslationEngine = "google" | "baidu" | "deepl" | "local";

export interface Language {
  code: string;
  name: string;
  native_name: string;
}
