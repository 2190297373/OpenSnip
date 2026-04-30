//! OpenSnip - A Windows screenshot tool built with Tauri v2
//!
//! ## Architecture
//!
//! - `commands/` - Tauri interface layer
//! - `services/` - Business logic layer
//! - `models/` - Data structures
//! - `plugins/` - System integration
//! - `utils/` - Utilities

pub mod commands;
pub mod models;
pub mod plugins;
pub mod services;
pub mod utils;
