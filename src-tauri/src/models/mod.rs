//! Models module - Core data structures

pub mod screenshot;
pub mod pin;
pub mod ocr;
pub mod recording;
pub mod translation;
pub mod clipboard;
pub mod domain;

pub use screenshot::*;
pub use pin::*;
pub use ocr::*;
pub use recording::*;
pub use translation::*;
pub use clipboard::*;
// domain types are available via crate::models::domain::*
