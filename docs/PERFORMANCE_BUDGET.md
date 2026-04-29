# OpenSnip Performance Budget / 性能预算

> **Version**: 1.0.0  
> **Status**: Active  
> **Scope**: 手动基准测试指标，v1.3+ 逐步接入 CI

---

## 测试方法论

### 测试环境基准

```
操作系统: Windows 11 23H2
CPU: Intel i5-12400 / AMD Ryzen 5 5600X 同级
内存: 16GB DDR4
显示器: 1920×1080 @ 144Hz（主要测试）
        3840×2160（4K 扩展测试）
存储: NVMe SSD
```

### 测量工具

| 指标 | 工具 | 方法 |
|------|------|------|
| 启动时间 | 手动 / `console.time` | 从进程创建到 UI 可交互 |
| 截图耗时 | Rust `Instant::elapsed()` | `capture_screen_data` 内部计时 |
| 内存占用 | Windows 任务管理器 / `sysinfo` | 进程工作集 |
| CPU 占用 | Windows 性能监视器 | 空闲状态 60 秒平均值 |
| UI 帧率 | Chrome DevTools Performance | 标注画布渲染帧率 |

---

## 性能指标

### 冷启动性能

| 指标 | 目标 | 当前 | 测试方法 |
|------|------|------|----------|
| 应用启动到可操作 | **< 800ms** | TBD | 从双击 exe 到主窗口渲染完成 |
| 截图热键响应 | **< 100ms** | TBD | 从按下 Ctrl+Alt+A 到覆盖层显示 |
| 贴图窗口打开 | **< 50ms** | TBD | 从点击"钉图"到新窗口可见 |
| 标注工具切换 | **< 16ms** | TBD | 工具栏按钮点击到光标变化 |

### 运行时性能

| 指标 | 目标 | 当前 | 测试方法 |
|------|------|------|----------|
| 全屏截图 + PNG 编码 (1080p) | **< 200ms** | TBD | `capture_fullscreen` + `to_png_base64` |
| 全屏截图 + PNG 编码 (4K) | **< 500ms** | TBD | 同上 |
| 区域截图 (500×300) | **< 100ms** | TBD | `capture_region` + `to_png_base64` |
| OCR 识别 (100 字以内) | **< 1.5s** | N/A | `perform_ocr` 完成 |
| OCR 识别 (1000 字以内) | **< 3s** | N/A | 同上 |
| 标注画布渲染 | **≥ 60fps** | TBD | 拖拽/缩放时帧率 |
| 贴图窗口拖拽 | **< 16ms** | TBD | 鼠标移动到窗口重绘 |

### 资源占用

| 指标 | 目标 | 当前 | 测试方法 |
|------|------|------|----------|
| 内存常驻（空闲） | **< 150MB** | TBD | 启动后 5 分钟无操作 |
| 内存峰值（截图时） | **< 400MB** | TBD | 4K 截图 + 标注过程中的峰值 |
| CPU 空闲占用 | **< 1%** | TBD | 后台运行 60 秒平均值 |
| 安装包体积 | **< 80MB** | TBD | `.exe` 安装包大小 |
| 安装后磁盘占用 | **< 150MB** | TBD | 安装目录总大小 |

### 可靠性指标

| 指标 | 目标 | 当前 | 测试方法 |
|------|------|------|----------|
| 截图成功率 | **> 99.5%** | TBD | 100 次连续截图统计 |
| 应用崩溃率 | **< 0.1%** | TBD | 连续使用 8 小时 |
| 热键响应成功率 | **> 99.9%** | TBD | 1000 次热键触发 |

---

## 性能回归检查清单

每次发布前手动验证：

- [ ] 冷启动时间 < 800ms（三次取平均）
- [ ] 截图热键响应 < 100ms（三次取平均）
- [ ] 1080p 截图编码 < 200ms（三次取平均）
- [ ] 空闲内存 < 150MB（任务管理器观察 60 秒）
- [ ] 空闲 CPU < 1%（性能监视器观察 60 秒）
- [ ] 标注画布拖拽流畅（目测无卡顿）
- [ ] 贴图窗口拖拽延迟可接受（目测无拖影）

---

## CI 接入计划 (v1.3+)

```
v1.0 ~ v1.2: 手动基准测试（本文档）
v1.3:  启动耗时 + 截图耗时 进入 CI
v1.4:  内存占用 + CPU 占用 进入 CI
v1.5:  全量性能指标 CI 回归测试
```

### CI 性能测试设计

```yaml
# .github/workflows/perf.yml (v1.3+)
name: Performance Benchmark
on:
  pull_request:
    branches: [develop]
  workflow_dispatch:

jobs:
  benchmark:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Release
        run: npm run tauri build
      - name: Run Benchmarks
        run: cargo bench --manifest-path src-tauri/Cargo.toml
      - name: Upload Results
        uses: actions/upload-artifact@v4
        with:
          name: benchmark-results
          path: src-tauri/target/criterion/
```

---

## 优化方向

### 已知瓶颈

| 瓶颈 | 影响 | 优化方案 | 优先级 |
|------|------|----------|--------|
| PNG 编码 (image crate) | 截图延迟 | 异步编码 / 使用 oxipng 后处理 | P1 |
| BGRA → RGBA 转换 | 截图延迟 | SIMD 优化（x86 SSE/AVX） | P2 |
| 标注画布重渲染 | UI 帧率 | 使用 `requestAnimationFrame` + 脏矩形 | P1 |
| 贴图窗口创建 | 打开延迟 | Webview 预创建池 | P2 |

---

## 变更记录

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-04-24 | 初始版本，确立手动基准指标和 CI 接入计划 |
