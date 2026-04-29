<p align="center">
  <img src="assets/banner.png" width="100%"/>
</p>

<h1 align="center">OpenSnip</h1>

<p align="center">
  <b>Next-gen Screenshot & Annotation Tool for Windows</b><br/>
  Capture · Annotate · Pin · OCR
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2-24C8D8?logo=tauri"/>
  <img src="https://img.shields.io/github/license/2190297373/OpenSnip"/>
  <img src="https://img.shields.io/badge/platform-Windows-blue"/>
  <img src="https://img.shields.io/badge/status-active-success"/>
</p>

<p align="center">
  <a href="README.zh-CN.md">中文</a> | English
</p>

---

## ⚡ Features

| Feature | Description | Status |
|---------|-------------|--------|
| 📸 Screenshot | Fullscreen, region, window capture | ✅ |
| ✏️ Annotation | Rectangle, arrow, text, pencil, mosaic | ✅ |
| 🎨 Style Controls | Colors, line width, font size, shadows | ✅ |
| 📌 Pin Window | Always-on-top floating screenshot | ✅ |
| 🖱️ Mouse-through | Click-through when locked | ✅ |
| 💾 Export & Copy | Save as PNG, copy to clipboard | ✅ |
| ↩️ Undo & Redo | Full history support | ✅ |
| 🔍 OCR | Real-time text extraction (Windows.Media.Ocr) | ✅ |
| 🌐 Translation | Multi-language (MyMemory API) | ✅ |
| 🎬 Recording | Screen recording | 🔧 Planned |

---

## 🎯 Roadmap

```
Capture ──▶ Annotation ──▶ OCR ──▶ Upload ──▶ Workflow ──▶ Plugin
   ✅            🔧            ✅        ⬜         ⬜          ⬜
```

### Priority 1 · Annotation Pro
**The differentiator.** Users don't pick a tool because it can screenshot — they pick it because annotations are exceptional.

- [ ] Layer system
- [ ] Smart snapping & alignment guides
- [ ] Pixel-precise controls
- [ ] Magnifier & spotlight
- [ ] Gaussian blur
- [ ] Professional export (SVG, PDF)

### Priority 2 · OCR Engine
**The moat.** Turns a tool into a workflow tool.

- [x] Local OCR (Windows.Media.Ocr)
- [ ] Chinese/English mixed recognition
- [ ] Math formula recognition
- [ ] Table recognition
- [ ] Code recognition optimization
- [ ] Screen translation

### Priority 3 · Upload & Share
**Close the loop.** Screenshot → Annotate → Upload → Share.

- [ ] S3, OSS, WebDAV
- [ ] GitHub, Telegram
- [ ] One-click share links

### Priority 4 · Workflow Engine
**The real advantage.** Automate the pipeline.

```
Screenshot → OCR → Translate → Upload → Share → Notify
```

---

## ⌨️ Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Alt + A` | Region screenshot |
| `Ctrl + Alt + S` | Scroll capture |
| `Ctrl + Alt + R` | Recording |
| `Esc` | Cancel capture |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |
| `↑ ↓ ← →` | Nudge annotation |
| `Delete` | Delete annotation |

---

## 📦 Build from Source

**Requirements:** Windows 10/11 · Node.js ≥ 18 · Rust ≥ 1.70 · VS2022 Build Tools

```bash
git clone https://github.com/2190297373/OpenSnip.git
cd OpenSnip
npm install
npm run tauri dev      # dev mode
npm run tauri build    # release build
```

---

## 🏗️ Tech Stack

- **Framework**: [Tauri v2](https://v2.tauri.app)
- **Backend**: Rust + Windows GDI + Windows.Media.Ocr
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Build**: Vite + Cargo

---

## 📄 License

MIT © 2026 [2190297373](https://github.com/2190297373)
