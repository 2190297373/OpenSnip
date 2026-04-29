# OpenSnip Release Strategy / 版本发布策略

> **Version**: 1.0.0  
> **Status**: Active  
> **Scope**: 分支管理、版本号规则、发布流程

---

## 分支模型 (Git Flow 简化版)

```
main        ───────●───────●───────●───────●───────  (稳定版)
                   ↑       ↑       ↑
develop     ───────●──●──●──●──●──●──●──●──●───────  (开发版)
                      ↑     ↑     ↑
feature/*   ──────────●─────●─────●─────────────────  (功能分支)
                      │     │
release/*   ──────────┴─────┴────────────────────────  (预发布分支)
                      │
hotfix/*    ──────────●──────────────────────────────  (紧急修复)
```

### 分支说明

| 分支 | 保护规则 | 用途 | 生命周期 |
|------|----------|------|----------|
| `main` | ✅ 禁止直接 push | 稳定版，只接受 release/* 和 hotfix/* 的 PR | 永久 |
| `develop` | ✅ 禁止直接 push | 开发版，功能集成 | 永久 |
| `feature/*` | ❌ 允许 force push | 新功能开发 | 合并后删除 |
| `release/*` | ❌ 允许 force push | 版本发布准备（冻结功能，只修 bug） | 发布后删除 |
| `hotfix/*` | ❌ 允许 force push | 生产环境紧急修复 | 合并后删除 |

---

## 版本号规则 (Semantic Versioning)

格式: `MAJOR.MINOR.PATCH[-prerelease][+build]`

```
1.2.3-beta.1
│ │ │ │
│ │ │ └─ 预发布标识
│ │ └── Patch: bug 修复、性能优化
│ └──── Minor: 新功能（向后兼容）
└────── Major: Breaking Change
```

### 版本定义

| 版本类型 | 格式示例 | 触发条件 | 说明 |
|----------|----------|----------|------|
| **Stable** | `v1.0.0` | `main` 分支 tag | 面向所有用户 |
| **Beta** | `v1.1.0-beta.1` | `release/*` 分支 tag | 功能冻结，只修 bug，面向测试用户 |
| **Nightly** | `v1.2.0-nightly.20260424` | 每日 `develop` 构建 | 面向开发者和早期用户，不保证稳定 |

### 版本升级规则

| 场景 | 升级 | 示例 |
|------|------|------|
| 新增功能（向后兼容） | Minor +1, Patch = 0 | `1.0.0` → `1.1.0` |
| Bug 修复 | Patch +1 | `1.1.0` → `1.1.1` |
| Breaking Change | Major +1, Minor = 0, Patch = 0 | `1.2.3` → `2.0.0` |
| 预发布迭代 | prerelease +1 | `1.1.0-beta.1` → `1.1.0-beta.2` |

---

## Breaking Change 规则

1. **废弃通知**: 任何即将废弃的 API/功能，必须在 **两个 Minor 版本** 之前标记废弃
2. **文档要求**: 废弃必须同时更新：
   - `CHANGELOG.md`（标注 `[DEPRECATED]`）
   - `MIGRATION.md`（提供迁移指南）
   - 代码注释（`#[deprecated]` / `@deprecated`）
3. **移除时机**: 废弃标记后，最早在 **Major +1** 时移除
4. **例外**: 安全漏洞相关的 Breaking Change 可立即执行，但需在 CHANGELOG 中说明

---

## 发布流程

### 标准发布 (Minor/Patch)

```
1. 从 develop 创建 release/v{version} 分支
   git checkout -b release/v1.1.0 develop

2. 更新版本号
   - package.json
   - src-tauri/Cargo.toml
   - src-tauri/tauri.conf.json
   - CHANGELOG.md

3. 测试验证（手动）
   - 截图 → 标注 → 钉图 → 保存 全流程
   - 性能基准检查

4. 合并到 main
   git checkout main
   git merge --no-ff release/v1.1.0

5. 打 tag
   git tag -a v1.1.0 -m "OpenSnip v1.1.0"
   git push origin v1.1.0

6. GitHub Actions 自动构建 Release
   - 等待 CI 完成
   - 验证 Release 页面 artifact

7. 合并回 develop
   git checkout develop
   git merge --no-ff main

8. 删除 release 分支
   git branch -d release/v1.1.0
```

### 紧急修复 (Hotfix)

```
1. 从 main 创建 hotfix/v{version} 分支
   git checkout -b hotfix/v1.1.1 main

2. 修复 bug（最小改动）

3. 合并到 main 和 develop
   git checkout main && git merge --no-ff hotfix/v1.1.1
   git checkout develop && git merge --no-ff hotfix/v1.1.1

4. 打 tag
   git tag -a v1.1.1 -m "OpenSnip v1.1.1 - Hotfix"

5. 删除 hotfix 分支
```

---

## CI/CD 策略

### 工作流矩阵

| 触发条件 | 工作流 | 产物 |
|----------|--------|------|
| `push` to `main`/`develop` | `build.yml` (debug) | Artifact (no release) |
| `push` tag `v*` | `build.yml` (release) | GitHub Release + `.exe` + `.msi` |
| `pull_request` | `build.yml` (check only) | 无产物 |
| `workflow_dispatch` | `build.yml` (manual) | 可选 release |
| nightly (计划 `v1.3+`) | `nightly.yml` | Pre-release tag |

### 发布产物命名

```
OpenSnip_1.1.0_x64-setup.exe      # NSIS 安装包（推荐）
OpenSnip_1.1.0_x64_en-US.msi      # MSI 标准安装包
OpenSnip_1.1.0_x64_portable.zip   # 便携版（v1.3+ 计划）
```

---

## 代码签名策略

### 当前 (v1.0 ~ v1.2)

- **无代码签名**
- Windows SmartScreen 会显示警告
- 用户在 GitHub Release 页面手动下载

### 未来 (v1.3+)

- 评估代码签名证书（OV 约 $200/年，EV 约 $400/年）
- 消除 SmartScreen 警告
- 支持自动更新（`tauri-plugin-updater` 要求签名）

---

## 变更记录

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-04-24 | 初始版本，确立 Git Flow 简化版分支模型 |
