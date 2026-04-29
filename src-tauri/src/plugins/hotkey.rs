use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum HotkeyAction {
    Screenshot,
    ScrollCapture,
    Recording,
    None,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HotkeyConfig {
    pub screenshot: String,
    pub scroll_capture: String,
    pub recording: String,
}

impl Default for HotkeyConfig {
    fn default() -> Self {
        HotkeyConfig {
            screenshot: "Ctrl+Alt+A".to_string(),
            scroll_capture: "Ctrl+Alt+S".to_string(),
            recording: "Ctrl+Alt+R".to_string(),
        }
    }
}

/// 解析热键字符串为组件
pub fn parse_hotkey(hotkey: &str) -> Vec<String> {
    hotkey
        .split('+')
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect()
}

/// 验证热键格式
pub fn validate_hotkey(hotkey: &str) -> bool {
    let parts = parse_hotkey(hotkey);
    if parts.len() < 2 {
        return false;
    }

    // 至少需要一个修饰键
    let modifiers = ["Ctrl", "Alt", "Shift", "Win", "Super", "Meta"];
    let has_modifier = parts
        .iter()
        .any(|p| modifiers.iter().any(|m| m.eq_ignore_ascii_case(p)));
    has_modifier
}

/// 格式化热键显示
pub fn format_hotkey_display(hotkey: &str) -> String {
    parse_hotkey(hotkey)
        .into_iter()
        .map(|key| {
            let lower = key.to_lowercase();
            match lower.as_str() {
                "ctrl" => "Ctrl".to_string(),
                "alt" => "Alt".to_string(),
                "shift" => "Shift".to_string(),
                "win" | "super" | "meta" => "Win".to_string(),
                _ => key,
            }
        })
        .collect::<Vec<_>>()
        .join(" + ")
}
