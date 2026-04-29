//! Translation models

use serde::{Deserialize, Serialize};

/// Translation engine
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TranslationEngine {
    Google,
    DeepL,
    Microsoft,
    Local,
    MyMemory,
}

impl Default for TranslationEngine {
    fn default() -> Self {
        Self::MyMemory
    }
}

/// Language
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Language {
    Auto,
    Chinese,
    English,
    Japanese,
    Korean,
    French,
    German,
    Spanish,
    Italian,
    Portuguese,
    Russian,
    Arabic,
    Dutch,
    Polish,
    Vietnamese,
    Thai,
    Indonesian,
}

impl Language {
    pub fn code(&self) -> &'static str {
        match self {
            Self::Auto => "auto",
            Self::Chinese => "zh",
            Self::English => "en",
            Self::Japanese => "ja",
            Self::Korean => "ko",
            Self::French => "fr",
            Self::German => "de",
            Self::Spanish => "es",
            Self::Italian => "it",
            Self::Portuguese => "pt",
            Self::Russian => "ru",
            Self::Arabic => "ar",
            Self::Dutch => "nl",
            Self::Polish => "pl",
            Self::Vietnamese => "vi",
            Self::Thai => "th",
            Self::Indonesian => "id",
        }
    }

    pub fn from_code(code: &str) -> Option<Self> {
        match code.to_lowercase().as_str() {
            "auto" => Some(Self::Auto),
            "zh" | "chinese" | "zh-cn" => Some(Self::Chinese),
            "en" | "english" => Some(Self::English),
            "ja" | "japanese" => Some(Self::Japanese),
            "ko" | "korean" => Some(Self::Korean),
            "fr" | "french" => Some(Self::French),
            "de" | "german" => Some(Self::German),
            "es" | "spanish" => Some(Self::Spanish),
            "it" | "italian" => Some(Self::Italian),
            "pt" | "portuguese" => Some(Self::Portuguese),
            "ru" | "russian" => Some(Self::Russian),
            "ar" | "arabic" => Some(Self::Arabic),
            "nl" | "dutch" => Some(Self::Dutch),
            "pl" | "polish" => Some(Self::Polish),
            "vi" | "vietnamese" => Some(Self::Vietnamese),
            "th" | "thai" => Some(Self::Thai),
            "id" | "indonesian" => Some(Self::Indonesian),
            _ => None,
        }
    }
}

/// Translation request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranslationRequest {
    pub text: String,
    pub source_lang: Language,
    pub target_lang: Language,
}

/// Translation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranslationResult {
    pub translated_text: String,
    pub detected_language: Option<Language>,
    pub source_lang: Language,
    pub target_lang: Language,
    pub engine: TranslationEngine,
    pub processing_time_ms: u64,
}
