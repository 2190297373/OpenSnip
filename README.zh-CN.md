> 这是通过AI实现的一个测试项目 | This is an AI-assisted development test project.

<p align="center">
  <img src="assets/banner.png" width="100%"/>
</p>

<h1 align="center">OpenSnip</h1>

<p align="center">
  <b>下一代 Windows 截图 & 标注工具</b><br/>
  截图 · 标注 · 贴图 · 文字识别
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2-24C8D8?logo=tauri"/>
  <img src="https://img.shields.io/github/license/FuSheng-MG/OpenSnip"/>
  <img src="https://img.shields.io/badge/platform-Windows-blue"/>
  <img src="https://img.shields.io/badge/status-active-success"/>
</p>

<p align="center">
  中文 | <a href="README.md">English</a>
</p>

---

## ⚡ 功能特性

| 功能 | 说明 | 状态 |
|------|------|------|
| 📸 截图 | 全屏、区域、窗口截图 | ✅ |
| ✏️ 标注 | 矩形、箭头、文字、画笔、马赛克 | ✅ |
| 🎨 样式控制 | 颜色、线宽、字号、阴影 | ✅ |
| 📌 贴图 | 置顶浮动截图 | ✅ |
| 🖱️ 鼠标穿透 | 锁定后点击穿透 | ✅ |
| 💾 导出与复制 | 保存 PNG、复制到剪贴板 | ✅ |
| ↩️ 撤销重做 | 完整历史记录 | ✅ |
| 🔍 文字识别 | Windows.Media.Ocr 本地引擎 | ✅ |
| 🌐 翻译 | 多语言翻译（MyMemory API） | ✅ |
| 🎬 录屏 | 屏幕录制 | 🔧 规划中 |

---

## 🎯 研发路线

```
截图 ──▶ 标注 ──▶ 文字识别 ──▶ 上传 ──▶ 工作流 ──▶ 插件
  ✅         🔧         ✅          ⬜        ⬜        ⬜
```

### 优先级 1 · 专业标注
**这是产品的差异化优势。** 用户不会因为能截图选择你，会因为标注特别强选择你。

- [ ] 图层系统
- [ ] 智能吸附对齐
- [ ] 精确像素控制
- [ ] 放大镜 & 聚光灯
- [ ] 高斯模糊
- [ ] SVG / PDF 专业导出

### 优先级 2 · OCR 引擎
**这是产品的护城河。** 把工具变成工作流工具。

- [x] 本地 OCR（Windows.Media.Ocr）
- [ ] 中英文混排识别
- [ ] 数学公式识别
- [ ] 表格识别
- [ ] 代码识别优化
- [ ] 屏幕翻译

### 优先级 3 · 上传分享
**形成闭环。** 截图 → 标注 → 上传 → 分享。

- [ ] S3、OSS、WebDAV
- [ ] GitHub、Telegram
- [ ] 一键分享链接

### 优先级 4 · 工作流引擎
**真正拉开差距。** 自动化整条链路。

```
截图 → 文字识别 → 翻译 → 上传 → 分享 → 通知
```

---

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Alt + A` | 区域截图 |
| `Ctrl + Alt + S` | 滚动截图 |
| `Ctrl + Alt + R` | 录屏 |
| `Esc` | 取消截图 |
| `Ctrl + Z` | 撤销 |
| `Ctrl + Shift + Z` | 重做 |
| `↑ ↓ ← →` | 微调标注位置 |
| `Delete` | 删除选中标注 |

---

## 📦 从源码构建

**环境要求：** Windows 10/11 · Node.js ≥ 18 · Rust ≥ 1.70 · VS2022 生成工具

```bash
git clone https://github.com/FuSheng-MG/OpenSnip.git
cd OpenSnip
npm install
npm run tauri dev      # 开发模式
npm run tauri build    # 发布构建
```

---

## 🏗️ 技术栈

- **框架**: [Tauri v2](https://v2.tauri.app)
- **后端**: Rust + Windows GDI + Windows.Media.Ocr
- **前端**: React 19 + TypeScript + Tailwind CSS
- **构建**: Vite + Cargo

---

## 📄 开源协议

[MIT License](LICENSE)
