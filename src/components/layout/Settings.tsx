import React, { useState } from "react";
import { Button, Input, Select } from "../ui";
import { useTranslation } from 'react-i18next';
import '../../i18n/i18n';
import i18n from 'i18next';
import { invoke } from "@tauri-apps/api/core";

type Tab = "system" | "capture" | "pin" | "annotation" | "recording" | "shortcuts";

interface SettingsData {
  general: { language: string; theme: string; start_minimized: boolean };
  capture: { save_path: string; default_format: string; copy_to_clipboard: boolean; include_cursor: boolean };
  pin: { default_opacity: number; default_zoom: number; snap_to_edge: boolean };
  annotation: { default_stroke_width: number; default_font_size: number };
  recording: { fps: number; quality: string; output_path: string };
  shortcuts: { screenshot: string; scroll_capture: string; recording: string };
}

const defaultSettings: SettingsData = {
  general: { language: "zh-CN", theme: "system", start_minimized: false },
  capture: { save_path: "", default_format: "png", copy_to_clipboard: true, include_cursor: true },
  pin: { default_opacity: 0.8, default_zoom: 1, snap_to_edge: true },
  annotation: { default_stroke_width: 2, default_font_size: 14 },
  recording: { fps: 30, quality: "high", output_path: "" },
  shortcuts: { screenshot: "Ctrl+Alt+A", scroll_capture: "Ctrl+Alt+S", recording: "Ctrl+Alt+R" },
};

// Tabs are defined inside the component to access i18n translation keys safely

export function Settings() {
  const { t } = useTranslation();
  // Local tab definitions to bind i18n keys at render time
  const tabs: { id: Tab; labelKey: string }[] = [
    { id: "system", labelKey: "sections.system" },
    { id: "capture", labelKey: "sections.capture" },
    { id: "pin", labelKey: "sections.pin" },
    { id: "annotation", labelKey: "sections.annotation" },
    { id: "recording", labelKey: "sections.recording" },
    { id: "shortcuts", labelKey: "sections.shortcuts" },
  ];
  const [activeTab, setActiveTab] = useState<Tab>("system");
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Synchronize UI language with selected language in settings
  React.useEffect(() => {
    i18n.changeLanguage(settings.general.language);
  }, [settings.general.language]);

  // Persist hotkeys when shortcuts are changed
  const persistHotkeys = async (shortcuts: SettingsData["shortcuts"]) => {
    const cfg = {
      screenshot: shortcuts.screenshot,
      scroll_capture: shortcuts.scroll_capture,
      recording: shortcuts.recording,
    };
    try {
      await invoke("update_hotkeys", { config: cfg });
    } catch (e) {
      console.error("Failed to update hotkeys:", e);
    }
  };

  const update = <K extends keyof SettingsData>(section: K, key: keyof SettingsData[K], value: unknown) => {
    // Compute next state to allow persisting full shortcuts when needed
    const next = {
      ...settings,
      [section]: { ...settings[section], [key]: value },
    } as SettingsData;
    setSettings(next);
    setSaved(false);

    // If shortcuts were updated, persist and re-register hotkeys
    if (section === "shortcuts") {
      const newShortcuts = {
        ...settings.shortcuts,
        [key]: value,
      } as SettingsData["shortcuts"];
      persistHotkeys(newShortcuts);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await invoke("save_settings", { settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save settings:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setSaved(false);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-40 bg-[var(--color-background)] border-r border-[var(--color-border)] flex flex-col gap-1 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "px-3 py-2 rounded-[var(--radius-md)] text-sm text-left transition-colors",
              activeTab === tab.id
                ? "bg-[var(--color-surface)] text-[var(--color-text)] font-medium shadow-[var(--shadow-sm)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
            ].join(" ")}
            >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "system" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t('sections.system')}</h2>
              <Select
                label={t('settings.languageLabel')}
                value={settings.general.language}
                onChange={(v) => update("general", "language", v)}
                options={[
                  { value: "zh-CN", label: t('settings.languageOptions.zh_CN') },
                  { value: "en", label: t('settings.languageOptions.en') },
                ]}
              />
              <Select
                label={t('settings.themeLabel')}
                value={settings.general.theme}
                onChange={(v) => update("general", "theme", v)}
                options={[
                  { value: "system", label: t('settings.themeOptions.system') },
                  { value: "light", label: t('settings.themeOptions.light') },
                  { value: "dark", label: t('settings.themeOptions.dark') },
                ]}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.general.start_minimized}
                  onChange={(e) => update("general", "start_minimized", e.target.checked)}
                  className="w-4 h-4"
                />
                {t('settings.startMinimized')}
              </label>
            </div>
          )}

          {activeTab === "capture" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t('sections.capture')}</h2>
              <Input
                label="Save Path"
                value={settings.capture.save_path}
                onChange={(e) => update("capture", "save_path", e.target.value)}
                placeholder="C:\Users\..."
              />
              <Select
                label="Default Format"
                value={settings.capture.default_format}
                onChange={(v) => update("capture", "default_format", v)}
                options={[
                  { value: "png", label: "PNG" },
                  { value: "jpg", label: "JPG" },
                  { value: "webp", label: "WebP" },
                ]}
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={settings.capture.copy_to_clipboard} onChange={(e) => update("capture", "copy_to_clipboard", e.target.checked)} className="w-4 h-4" />
                Copy to clipboard after capture
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={settings.capture.include_cursor} onChange={(e) => update("capture", "include_cursor", e.target.checked)} className="w-4 h-4" />
                Include cursor in screenshots
              </label>
            </div>
          )}

          {activeTab === "pin" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Pin</h2>
              <div>
                <label className="text-sm font-medium">Default Opacity: {Math.round(settings.pin.default_opacity * 100)}%</label>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={settings.pin.default_opacity}
                  onChange={(e) => update("pin", "default_opacity", parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={settings.pin.snap_to_edge} onChange={(e) => update("pin", "snap_to_edge", e.target.checked)} className="w-4 h-4" />
                Snap to screen edges
              </label>
            </div>
          )}

          {activeTab === "annotation" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t('sections.annotation')}</h2>
              <div>
                <label className="text-sm font-medium">Default Stroke Width: {settings.annotation.default_stroke_width}px</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={settings.annotation.default_stroke_width}
                  onChange={(e) => update("annotation", "default_stroke_width", parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Default Font Size: {settings.annotation.default_font_size}px</label>
                <input
                  type="range"
                  min={8}
                  max={48}
                  value={settings.annotation.default_font_size}
                  onChange={(e) => update("annotation", "default_font_size", parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {activeTab === "recording" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t('sections.recording')}</h2>
              <Select
                label="FPS"
                value={String(settings.recording.fps)}
                onChange={(v) => update("recording", "fps", parseInt(v))}
                options={[
                  { value: "15", label: "15 FPS" },
                  { value: "30", label: "30 FPS" },
                  { value: "60", label: "60 FPS" },
                ]}
              />
              <Select
                label="Quality"
                value={settings.recording.quality}
                onChange={(v) => update("recording", "quality", v)}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
              />
              <Input
                label="Output Path"
                value={settings.recording.output_path}
                onChange={(e) => update("recording", "output_path", e.target.value)}
                placeholder="C:\Videos"
              />
            </div>
          )}

          {activeTab === "shortcuts" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t('sections.shortcuts')}</h2>
              <Input
                label={t('shortcuts.screenshot')}
                value={settings.shortcuts.screenshot}
                onChange={(e) => update("shortcuts", "screenshot", e.target.value)}
                placeholder="Ctrl+Alt+A"
              />
              <Input
                label={t('shortcuts.scroll_capture')}
                value={settings.shortcuts.scroll_capture}
                onChange={(e) => update("shortcuts", "scroll_capture", e.target.value)}
                placeholder="Ctrl+Alt+S"
              />
              <Input
                label={t('shortcuts.recording')}
                value={settings.shortcuts.recording}
                onChange={(e) => update("shortcuts", "recording", e.target.value)}
                placeholder="Ctrl+Alt+R"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <Button variant="ghost" onClick={handleReset}>{t('settings.reset')}</Button>
          <div className="flex items-center gap-2">
            {saved && <span className="text-sm text-[var(--color-success)]">{t('settings.saved')}</span>}
            <Button variant="secondary" onClick={handleSave} loading={saving}>{t('settings.save')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
