//! Hotkey configuration commands

use crate::plugins::hotkey::{validate_hotkey, HotkeyConfig};
use tauri::{command, AppHandle};
use tauri_plugin_global_shortcut::GlobalShortcutExt;
use tauri_plugin_store::StoreExt;

#[command]
pub fn get_hotkey_config(app: AppHandle) -> HotkeyConfig {
    let store = app.store("settings.json").unwrap();
    store
        .get("hotkeys")
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_else(HotkeyConfig::default)
}

#[command]
pub fn update_hotkey_config(cfg: HotkeyConfig, app: AppHandle) -> Result<(), String> {
    for hk in [&cfg.screenshot, &cfg.scroll_capture, &cfg.recording] {
        if !validate_hotkey(hk) {
            return Err(format!("Invalid hotkey: {}", hk));
        }
    }

    let store = app
        .store("settings.json")
        .map_err(|e| e.to_string())?;

    let old: HotkeyConfig = store
        .get("hotkeys")
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_else(HotkeyConfig::default);

    let gs = app.global_shortcut();
    for old_hk in [&old.screenshot, &old.scroll_capture, &old.recording] {
        let _ = gs.unregister(old_hk.as_str());
    }
    for new_hk in [&cfg.screenshot, &cfg.scroll_capture, &cfg.recording] {
        let _ = gs.register(new_hk.as_str());
    }

    store.set(
        "hotkeys",
        serde_json::to_value(&cfg).map_err(|e| e.to_string())?,
    );
    store.save().map_err(|e| e.to_string())?;

    log::info!(
        "Hotkeys updated: screenshot={}, scroll_capture={}, recording={}",
        cfg.screenshot,
        cfg.scroll_capture,
        cfg.recording
    );
    Ok(())
}
