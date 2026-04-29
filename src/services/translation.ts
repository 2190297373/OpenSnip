import { invoke } from "@tauri-apps/api/core";
import type { TranslationResult, TranslationConfig, Language } from "@/types";

export async function translateText(
  text: string,
  sourceLang: string = "auto",
  targetLang: string = "zh-CN"
): Promise<TranslationResult> {
  return invoke<TranslationResult>("translate_text", {
    text,
    source_lang: sourceLang,
    target_lang: targetLang,
  });
}

export async function translateBatch(
  texts: string[],
  sourceLang: string = "auto",
  targetLang: string = "zh-CN"
): Promise<TranslationResult[]> {
  return invoke<TranslationResult[]>("translate_batch", {
    texts,
    source_lang: sourceLang,
    target_lang: targetLang,
  });
}

export async function getSupportedLanguages(): Promise<Language[]> {
  return invoke<Language[]>("get_supported_languages");
}

export async function setTranslationEngine(engine: string): Promise<void> {
  return invoke<void>("set_translation_engine", { engine });
}

export async function getTranslationConfig(): Promise<TranslationConfig> {
  return invoke<TranslationConfig>("get_translation_config");
}

export async function updateTranslationConfig(config: Partial<TranslationConfig>): Promise<void> {
  return invoke<void>("update_translation_config", { config });
}
