//! OpenSnip - Main entry point
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use opensnip_lib::commands::*;
use opensnip_lib::plugins::{hotkey, tray};
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::ShortcutState;

fn main() {
    env_logger::Builder::from_env(env_logger::Env::default().filter_or("RUST_LOG", "info")).init();
    log::info!("Starting OpenSnip v{}", env!("CARGO_PKG_VERSION"));

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().with_handler(|app, shortcut, event| {
            if event.state == ShortcutState::Pressed {
                let key = shortcut.to_string().to_lowercase();
                match key.as_str() {
                    "ctrl+alt+a" => {
                        log::info!("Global shortcut: Screenshot triggered");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.emit("hotkey-screenshot", ());
                        }
                    }
                    "ctrl+alt+s" => {
                        log::info!("Global shortcut: Scroll capture triggered");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.emit("hotkey-scroll-capture", ());
                        }
                    }
                    "ctrl+alt+r" => {
                        log::info!("Global shortcut: Recording triggered");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.emit("hotkey-recording", ());
                        }
                    }
                    _ => {}
                }
            }
        }).build())
        .manage(ScreenshotState::new())
        .manage(ClipboardState::new())
        .manage(OcrState::new())
        .manage(TranslationState::new())
        .manage(RecordingState::new())
        .manage(PinState::new())
        .setup(|app| {
            // 初始化托盘
            if let Err(e) = tray::init_tray(app.handle()) {
                log::warn!("Failed to initialize tray: {}", e);
            }
            
            let cfg = hotkey::HotkeyConfig::default();
            log::info!("Hotkeys configured: screenshot={}, scroll_capture={}, recording={}",
                cfg.screenshot, cfg.scroll_capture, cfg.recording);
            log::info!("Application setup complete");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Screenshot commands
            capture_screenshot,
            capture_region,
            capture_with_args,
            capture_as_png,
            get_monitors,
            quick_capture,
            save_screenshot,
            // Clipboard commands
            read_clipboard,
            write_clipboard,
            read_clipboard_text,
            write_clipboard_text,
            // Pin commands
            create_image_pin,
            create_text_pin,
            get_pins,
            update_pin_position,
            delete_pin,
            bring_pin_to_front,
            toggle_pin_lock,
            toggle_pin_minimize,
            clear_all_pins,
            // OCR commands
            perform_ocr,
            get_ocr_config,
            update_ocr_config,
            // Translation commands
            translate_text,
            set_translation_engine,
            get_supported_languages,
            // Recording commands
            start_recording,
            stop_recording,
            pause_recording,
            resume_recording,
            get_recording_status,
            get_recording_stats,
            get_recording_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
