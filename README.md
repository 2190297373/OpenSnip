<p align="center">
  <img src="assets/banner.png" width="100%"/>
</p>

<h1 align="center">OpenSnip</h1>

<p align="center">
  Lightweight Screenshot & Annotation Tool<br/>
  <b>Capture · Annotate · Pin</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2-24C8D8?logo=tauri"/>
  <img src="https://img.shields.io/github/license/2190297373/OpenSnip"/>
  <img src="https://img.shields.io/badge/platform-Windows-blue"/>
  <img src="https://img.shields.io/github/v/release/2190297373/OpenSnip"/>
</p>

<p align="center">
  <a href="README.zh-CN.md">中文</a> | English
</p>

---

## 🎬 Demo

> GIF demo placeholder (recommend a 5-8 second GIF showing screenshot → annotate → pin)

<p align="center">
  <img src="assets/demo.gif" width="720" alt="Demo GIF placeholder"/>
</p>

---

## ✨ About

OpenSnip is a lightweight desktop screenshot tool focused on speed and productivity.

**Capture → Annotate → Pin → Done in seconds**

---

## ⚡ Features

| Feature | Description | Status |
|---------|-------------|--------|
| 📸 Instant screenshot | Fullscreen, region, window capture | ✅ Available |
| ✏️ Annotation tools | Rectangle, arrow, text, pencil, mosaic | ✅ Available |
| 🎨 Style controls | Colors, line width, font size, shadows | ✅ Available |
| 📌 Pin window | Always-on-top floating screenshot | ✅ Available |
| 🖱 Mouse-through | Click-through when locked | ✅ Available |
| 💾 Export & copy | Save as PNG, copy to clipboard | ✅ Available |
| ↩️ Undo & redo | Full history support | ✅ Available |
| 🔍 OCR | Extract text from screenshots (Windows.Media.Ocr) | 🔧 Implemented |
| 🌐 Translation | Multi-language translation (MyMemory API) | ✅ Available |
| 🎬 Recording | Screen recording | 🔧 Coming Soon |

---

## 🚀 Highlights

- ⚡ Instant capture workflow
- 📌 Pin window workflow inspired by Snipaste
- 🪶 Lightweight & fast (Tauri v2 + Rust)
- 🔓 Open-source & extensible

---

## 📦 Installation

### Download

Download the latest release from [Releases](https://github.com/2190297373/OpenSnip/releases):

- **NSIS Installer** (Recommended): `OpenSnip_x.x.x_x64-setup.exe`
- **MSI Installer** (Standard): `OpenSnip_x.x.x_x64_en-US.msi`

### Build from source

**Requirements:**
- Windows 10/11 (64-bit)
- Node.js >= 18
- Rust >= 1.70
- Visual Studio 2022 Build Tools (C++ desktop development)

```bash
# Clone
git clone https://github.com/2190297373/OpenSnip.git
cd OpenSnip

# Install dependencies
npm install

# Run in dev mode
npm run tauri dev

# Build release
npm run tauri build
```

---

## 🛠 Build Output

After building, the installer is located at:

```
src-tauri/target/release/bundle/nsis/OpenSnip_x.x.x_x64-setup.exe
src-tauri/target/release/bundle/msi/OpenSnip_x.x.x_x64_en-US.msi
```

---

## ⌨️ Shortcuts

| Shortcut | Function |
|----------|----------|
| `Ctrl + Alt + A` | Region screenshot |
| `Ctrl + Alt + S` | Scroll screenshot |
| `Ctrl + Alt + R` | Screen recording |
| `Esc` | Cancel capture |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |
| `↑ ↓ ← →` | Nudge selected annotation |
| `Delete` | Delete selected annotation |

---

## 🗺 Roadmap

- [x] v0.1.0 — Core screenshot + annotation + pin
- [ ] v0.2.0 — OCR with Windows.Media.Ocr
- [ ] v0.3.0 — Screen recording with FFmpeg
- [ ] v0.4.0 — Scroll capture
- [x] v1.0.0 — Stable release with installer

---

## 📌 Use Cases

- 🐛 Bug reporting
- 🎨 UI review
- 📚 Tutorials
- 💬 Dev communication

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## ⭐ Support

If you like this project, please consider giving it a star!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
