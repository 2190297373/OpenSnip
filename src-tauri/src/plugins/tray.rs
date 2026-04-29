use tauri::{AppHandle, Emitter, Manager};
use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};

pub fn init_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // 构建托盘菜单
    let screenshot = MenuItemBuilder::new("📸 截图")
        .id("screenshot")
        .build(app)?;
    let scroll_capture = MenuItemBuilder::new("📜 滚动截图")
        .id("scroll_capture")
        .build(app)?;
    let recording = MenuItemBuilder::new("🎬 录屏")
        .id("recording")
        .build(app)?;
    let settings = MenuItemBuilder::new("⚙️ 设置")
        .id("settings")
        .build(app)?;
    let show_window = MenuItemBuilder::new("📱 显示窗口")
        .id("show")
        .build(app)?;
    let exit = MenuItemBuilder::new("❌ 退出")
        .id("exit")
        .build(app)?;

    let menu = MenuBuilder::new(app)
        .item(&screenshot)
        .item(&scroll_capture)
        .item(&recording)
        .separator()
        .item(&settings)
        .item(&show_window)
        .separator()
        .item(&exit)
        .build()?;

    // 构建托盘图标
    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "screenshot" => {
                log::info!("Tray: Screenshot clicked");
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                    let _ = window.emit("trigger-capture", "fullscreen");
                }
            }
            "recording" => {
                log::info!("Tray: Recording clicked");
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                    let _ = window.emit("trigger-recording", ());
                }
            }
            "settings" => {
                log::info!("Tray: Settings clicked");
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                    let _ = window.emit("open-settings", ());
                }
            }
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "exit" => {
                log::info!("Tray: Exit clicked");
                std::process::exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click { .. } = event {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)?;

    Ok(())
}
