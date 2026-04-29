//! Translation commands

use crate::models::translation::{Language, TranslationEngine, TranslationRequest};
use crate::services::translation::TranslationService;
use std::sync::Mutex;
use tauri::command;

pub struct TranslationState {
    pub service: Mutex<TranslationService>,
}

impl TranslationState {
    pub fn new() -> Self {
        Self {
            service: Mutex::new(TranslationService::new(TranslationEngine::MyMemory, None)),
        }
    }
}

impl Default for TranslationState {
    fn default() -> Self {
        Self::new()
    }
}

#[command]
pub fn translate_text(
    text: String,
    source_lang: String,
    target_lang: String,
    state: tauri::State<'_, TranslationState>,
) -> Result<String, String> {
    let service = state.service.lock().map_err(|e| e.to_string())?;
    
    let source = Language::from_code(&source_lang)
        .ok_or_else(|| format!("Unsupported source language: {}", source_lang))?;
    let target = Language::from_code(&target_lang)
        .ok_or_else(|| format!("Unsupported target language: {}", target_lang))?;
    
    let request = TranslationRequest {
        text,
        source_lang: source,
        target_lang: target,
    };
    
    let result = service.translate(&request)?;
    Ok(result.translated_text)
}

#[command]
pub fn set_translation_engine(
    engine: String,
    api_key: Option<String>,
    state: tauri::State<'_, TranslationState>,
) -> Result<(), String> {
    let mut service = state.service.lock().map_err(|e| e.to_string())?;
    
    let eng = match engine.to_lowercase().as_str() {
        "mymemory" => TranslationEngine::MyMemory,
        "google" => TranslationEngine::Google,
        "deepl" => TranslationEngine::DeepL,
        "microsoft" => TranslationEngine::Microsoft,
        "local" => TranslationEngine::Local,
        _ => return Err(format!("Unsupported engine: {}", engine)),
    };
    
    service.set_engine(eng, api_key);
    Ok(())
}

#[command]
pub fn get_supported_languages() -> Vec<LanguageInfo> {
    vec![
        LanguageInfo { code: "auto", name: "Auto" },
        LanguageInfo { code: "zh", name: "Chinese" },
        LanguageInfo { code: "en", name: "English" },
        LanguageInfo { code: "ja", name: "Japanese" },
        LanguageInfo { code: "ko", name: "Korean" },
        LanguageInfo { code: "fr", name: "French" },
        LanguageInfo { code: "de", name: "German" },
        LanguageInfo { code: "es", name: "Spanish" },
        LanguageInfo { code: "it", name: "Italian" },
        LanguageInfo { code: "pt", name: "Portuguese" },
        LanguageInfo { code: "ru", name: "Russian" },
        LanguageInfo { code: "ar", name: "Arabic" },
        LanguageInfo { code: "nl", name: "Dutch" },
        LanguageInfo { code: "pl", name: "Polish" },
        LanguageInfo { code: "vi", name: "Vietnamese" },
        LanguageInfo { code: "th", name: "Thai" },
        LanguageInfo { code: "id", name: "Indonesian" },
    ]
}

#[derive(Debug, serde::Serialize)]
pub struct LanguageInfo {
    pub code: &'static str,
    pub name: &'static str,
}
