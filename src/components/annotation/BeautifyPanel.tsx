import { useState, useCallback } from "react";
import { beautifyPresets, applyBeautify, downloadBeautified, copyAsMarkdown, copyAsIssueTemplate, type BeautifyConfig } from "./beautify";

export function BeautifyPanel() {
  const [config, setConfig] = useState<BeautifyConfig>(beautifyPresets.basic);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getCanvas = (): HTMLCanvasElement | null =>
    document.querySelector("canvas") as HTMLCanvasElement | null;

  const apply = useCallback(() => {
    const src = getCanvas();
    if (!src) return;
    const result = applyBeautify(src, config);
    setPreviewUrl(result.toDataURL("image/png"));
  }, [config]);

  const download = useCallback(() => {
    const src = getCanvas();
    if (!src) return;
    const result = applyBeautify(src, config);
    downloadBeautified(result);
  }, [config]);

  const copyMd = useCallback(async () => {
    const src = getCanvas();
    if (!src) return;
    const result = applyBeautify(src, config);
    await copyAsMarkdown(result);
  }, [config]);

  const copyIssue = useCallback(async () => {
    const src = getCanvas();
    if (!src) return;
    const result = applyBeautify(src, config);
    await copyAsIssueTemplate(result);
  }, [config]);

  const selectPreset = (preset: keyof typeof beautifyPresets) => {
    setConfig(beautifyPresets[preset]);
    setPreviewUrl(null);
  };

  const presets: { key: keyof typeof beautifyPresets; label: string; icon: string }[] = [
    { key: "basic", label: "简洁", icon: "□" },
    { key: "developer", label: "开发者", icon: "</>" },
    { key: "presentation", label: "演示", icon: "◆" },
    { key: "macos", label: "macOS", icon: "🍎" },
  ];

  return (
    <aside className="w-[240px] border-l border-[var(--color-border)] bg-[var(--color-background)] p-3 flex flex-col text-sm">
      <div className="font-semibold text-[var(--color-text)] mb-3">一键美化</div>

      {/* Preset buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() => selectPreset(p.key)}
            className={`py-1.5 px-2 rounded text-xs border transition-colors ${
              config.style === p.key
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-text)]"
            }`}
          >
            <span className="mr-1">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Parameters */}
      <div className="space-y-2 mb-3">
        <label className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          圆角
          <span className="text-[var(--color-text)]">{config.borderRadius}px</span>
        </label>
        <input
          type="range" min="0" max="30" value={config.borderRadius}
          onChange={(e) => setConfig((c) => ({ ...c, borderRadius: +e.target.value }))}
          className="w-full accent-blue-500"
        />

        <label className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          阴影
          <span className="text-[var(--color-text)]">{config.shadowBlur}px</span>
        </label>
        <input
          type="range" min="0" max="40" value={config.shadowBlur}
          onChange={(e) => setConfig((c) => ({ ...c, shadowBlur: +e.target.value }))}
          className="w-full accent-blue-500"
        />

        <label className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          留白
          <span className="text-[var(--color-text)]">{config.padding}px</span>
        </label>
        <input
          type="range" min="0" max="60" value={config.padding}
          onChange={(e) => setConfig((c) => ({ ...c, padding: +e.target.value }))}
          className="w-full accent-blue-500"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-2">
        <button onClick={apply} className="flex-1 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors">预览</button>
        <button onClick={download} className="flex-1 py-1.5 border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded text-xs transition-colors">导出 PNG</button>
      </div>
      <div className="flex gap-2">
        <button onClick={copyMd} className="flex-1 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs transition-colors">Copy MD</button>
        <button onClick={copyIssue} className="flex-1 py-1.5 border border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-300 transition-colors">Issue 模板</button>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="mt-3 border border-[var(--color-border)] rounded overflow-hidden">
          <img src={previewUrl} alt="预览" className="w-full" />
        </div>
      )}
    </aside>
  );
}

export default BeautifyPanel;
