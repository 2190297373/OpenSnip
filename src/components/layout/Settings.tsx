import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Hotkeys {
  screenshot: string;
  scroll_capture: string;
  recording: string;
}

const defaults: Hotkeys = {
  screenshot: "Ctrl+Alt+A",
  scroll_capture: "Ctrl+Alt+S",
  recording: "Ctrl+Alt+R",
};

export function Settings() {
  const [hotkeys, setHotkeys] = useState<Hotkeys>(defaults);
  const [saved, setSaved] = useState(false);

  const persist = async (hk: Hotkeys) => {
    const cfg = {
      screenshot: hk.screenshot,
      scroll_capture: hk.scroll_capture,
      recording: hk.recording,
    };
    try {
      await invoke("update_hotkey_config", { cfg });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      console.error("Failed to update hotkeys:", e);
    }
  };

  const update = (key: keyof Hotkeys, value: string) => {
    const next = { ...hotkeys, [key]: value };
    setHotkeys(next);
    persist(next);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-lg mx-auto p-8 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text)]">设置</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">快捷键修改后自动保存</p>
        </div>

        {/* Hotkeys */}
        <section>
          <h2 className="text-sm font-medium text-[var(--color-text)] mb-3">全局快捷键</h2>
          <div className="space-y-3">
            {([
              { key: "screenshot" as const, label: "截图", desc: "区域截图" },
              { key: "scroll_capture" as const, label: "滚动截图", desc: "长页面拼接" },
              { key: "recording" as const, label: "录屏", desc: "屏幕录制" },
            ]).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-28 shrink-0">
                  <div className="text-sm text-[var(--color-text)]">{label}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">{desc}</div>
                </div>
                <input
                  value={hotkeys[key]}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder="Ctrl+Alt+A"
                  className="flex-1 px-3 py-1.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] font-mono outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={() => update(key, defaults[key])}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] shrink-0"
                  title="恢复默认"
                >
                  默认
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Capture */}
        <section>
          <h2 className="text-sm font-medium text-[var(--color-text)] mb-3">截图</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
              <span className="text-sm text-[var(--color-text)]">截图后自动复制</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-500" />
            </label>
            <div className="flex items-center gap-3 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
              <span className="text-sm text-[var(--color-text)] shrink-0">保存目录</span>
              <input
                defaultValue="Pictures/OpenSnip"
                className="flex-1 px-2 py-1 text-xs bg-transparent border-b border-[var(--color-border)] text-[var(--color-text-muted)] outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Annotation */}
        <section>
          <h2 className="text-sm font-medium text-[var(--color-text)] mb-3">标注</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "默认笔宽", value: "2px" },
              { label: "默认字号", value: "14px" },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">{label}</div>
                <div className="text-sm font-medium text-[var(--color-text)]">{value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Saved indicator */}
        {saved && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-4 py-2 rounded-full shadow-lg animate-fade-in">
            已保存
          </div>
        )}

      </div>
    </div>
  );
}

export default Settings;
