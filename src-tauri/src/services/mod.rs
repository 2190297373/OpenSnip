//! Services module - Business logic layer

pub mod screenshot;
pub mod pin;
pub mod ocr;
pub mod recording;
pub mod translation;
pub mod clipboard;

pub use screenshot::*;
pub use pin::*;
pub use ocr::*;
pub use recording::*;
pub use translation::*;
pub use clipboard::*;
