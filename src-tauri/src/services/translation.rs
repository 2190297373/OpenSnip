//! Translation service

use crate::models::translation::{
    Language, TranslationEngine, TranslationRequest, TranslationResult,
};
use std::time::Instant;

pub struct TranslationService {
    engine: TranslationEngine,
    #[allow(dead_code)]
    api_key: Option<String>,
}

impl TranslationService {
    pub fn new(engine: TranslationEngine, api_key: Option<String>) -> Self {
        Self { engine, api_key }
    }

    pub fn translate(&self, request: &TranslationRequest) -> Result<TranslationResult, String> {
        let start = Instant::now();
        
        match self.engine {
            TranslationEngine::MyMemory => self.translate_mymemory(request),
            TranslationEngine::Google => Err("Google Translate not implemented".to_string()),
            TranslationEngine::DeepL => Err("DeepL not implemented".to_string()),
            TranslationEngine::Microsoft => Err("Microsoft Translator not implemented".to_string()),
            TranslationEngine::Local => Err("Local translation not implemented".to_string()),
        }.map(|mut result| {
            result.processing_time_ms = start.elapsed().as_millis() as u64;
            result
        })
    }

    fn translate_mymemory(&self, request: &TranslationRequest) -> Result<TranslationResult, String> {
        let source = request.source_lang.code();
        let target = request.target_lang.code();
        
        let url = format!(
            "https://api.mymemory.translated.net/get?q={}&langpair={}|{}",
            urlencoding::encode(&request.text),
            source,
            target
        );

        let response = ureq::get(&url)
            .call()
            .map_err(|e| format!("MyMemory API request failed: {}", e))?;

        let body = response
            .into_string()
            .map_err(|e| format!("Failed to read response: {}", e))?;
        let json: serde_json::Value = serde_json::from_str(&body)
            .map_err(|e| format!("Failed to parse JSON: {}", e))?;

        let translated_text = json["responseData"]["translatedText"]
            .as_str()
            .ok_or("Invalid response format")?
            .to_string();

        Ok(TranslationResult {
            translated_text,
            detected_language: None,
            source_lang: request.source_lang,
            target_lang: request.target_lang,
            engine: self.engine,
            processing_time_ms: 0,
        })
    }

    pub fn set_engine(&mut self, engine: TranslationEngine, api_key: Option<String>) {
        self.engine = engine;
        self.api_key = api_key;
    }
}

impl Default for TranslationService {
    fn default() -> Self {
        Self::new(TranslationEngine::MyMemory, None)
    }
}
