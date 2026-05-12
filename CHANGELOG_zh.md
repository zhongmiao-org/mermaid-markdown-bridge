<!-- Keep a Changelog guide -> https://keepachangelog.com -->

# Mermaid Markdown Bridge 更新日志

> [English Changelog](./CHANGELOG.md) | 中文更新日志

## [Unreleased]

### 🔧 CI/CD
- 新增 Mermaid runtime 自动同步 PR，并通过 GitHub Development 与上游 Mermaid 提醒 issue 关联。
- 新增针对 `examples/demo.md` 中 Mermaid 图表的 headless browser 渲染检查。
- 新增 Mermaid runtime 定时发布监控，当上游 Mermaid 出现新的稳定版本时创建或更新提醒 issue。

## [1.1.0]

### 🔄 变更
- 将内置 Mermaid runtime 更新到 `mermaid@11.15.0`。
- 声明兼容 IntelliJ Platform `2023.1` 及后续版本的 JetBrains IDE，并将构建基线下调到 IDEA Community `2023.1.7`。
- 将插件验证范围扩展到 Gradle verifier 可支持的 JetBrains IntelliJ-based IDE 产品族 2023+ 兼容下限。

### 🔄 变更
- 声明兼容 IntelliJ Platform `2023.1` 及后续版本的 JetBrains IDE，并将构建基线下调到 IDEA Community `2023.1.7`。
- 将插件验证范围扩展到 Gradle verifier 可支持的 JetBrains IntelliJ-based IDE 产品族 2023+ 兼容下限。

## [1.0.0]

### ✨ 新增
- 新增仅作用于 Mermaid 图表预览块的缩放、平移、重置和拖拽控件，不改变 Markdown 编辑区或预览页面主题。

### 📚 文档
- 完善英文和中文 README，补充面向 Marketplace 的说明、仅用于预览的边界、贴近 GitHub 的渲染预期、Mermaid 第三方 runtime 说明、品牌资源位置调整，以及适配暗色主题的 Markdown logo 变体。
- 扩展示例 Markdown 文件，加入多种 Mermaid 示例图，并补充 Mermaid 上游来源说明。
- 更新插件描述元数据，使其与基于 README 生成的 Marketplace description 保持一致。

### ✨ 新增
- 新增仅作用于 Mermaid 图表预览块的缩放、平移、重置和拖拽控件，不改变 Markdown 编辑区或预览页面主题。

### 📚 文档
- 完善英文和中文 README，补充面向 Marketplace 的说明、仅用于预览的边界、贴近 GitHub 的渲染预期、Mermaid 第三方 runtime 说明、品牌资源位置调整，以及适配暗色主题的 Markdown logo 变体。
- 扩展示例 Markdown 文件，加入多种 Mermaid 示例图，并补充 Mermaid 上游来源说明。
- 更新插件描述元数据，使其与基于 README 生成的 Marketplace description 保持一致。

## [0.1.2]

### 🔄 变更
- 将插件图标 SVG 元数据调整为 JetBrains Marketplace 要求的 40 px × 40 px 尺寸。
- 新增 vendor 联系元数据，并为内置 Mermaid runtime 补充第三方声明。
- 替换 IntelliJ Plugin Verifier 报告的已废弃主题检测 API。

### 📚 文档
- 补充 Mermaid fenced code block 在 Markdown 中触发 Marketplace 推荐的限制，并说明插件不会为了安装推荐而注册 Markdown 文件类型。

### 🔄 变更
- 将插件图标 SVG 元数据调整为 JetBrains Marketplace 要求的 40 px × 40 px 尺寸。
- 新增 vendor 联系元数据，并为内置 Mermaid runtime 补充第三方声明。
- 替换 IntelliJ Plugin Verifier 报告的已废弃主题检测 API。

### 📚 文档
- 补充 Mermaid fenced code block 在 Markdown 中触发 Marketplace 推荐的限制，并说明插件不会为了安装推荐而注册 Markdown 文件类型。

## [0.1.1]

### ✨ 新增
- 新增 Markdown Preview 中 fenced `mermaid` code block 的 Mermaid 渲染能力。
- 新增内置 Mermaid runtime 集成，并支持明暗主题基础适配。
- 新增包含 flowchart 和 sequence diagram 的 Markdown 示例内容。
- 新增基于项目 logo 的插件图标资源。
- 新增 MIT License。
- 新增英文和中文 README，覆盖安装、使用、兼容性和已知限制。

### 🔄 变更
- 将插件版本准备为 `0.1.0`。
- 将模板 README 替换为面向项目的文档和 GitHub 徽标。

### 📚 文档
- 扩充英文和中文 README，补充完整项目描述、扩展包范围、实现说明和发布流程。

### 🔧 CI/CD
- 将旧的 main 分支自动创建 draft release 流程替换为需 review 的 release PR 流程。
- 新增手动 release 准备 workflow，用于更新 `gradle.properties` 并归档中英文 changelog。
- 将真正发布移动到 release PR 合并后执行，在合并后的 `main` commit 上创建 tag，并在 Marketplace 上传成功后发布 GitHub draft release。
- 移除未使用的 UI test workflow。
- 为 PR 打包流程新增插件 ZIP 完整性校验。
- 新增 JetBrains Marketplace 发布和 GitHub Release 插件 ZIP 上传相关的发布 CI 加固。
- 新增双语 changelog 门禁，普通 PR 必须同时更新英文和中文 changelog。
- 新增中文 changelog 支持，并在发布时同步归档版本标题。

### 🧱 脚手架
- 基于 [IntelliJ Platform Plugin Template](https://github.com/JetBrains/intellij-platform-plugin-template) 创建初始脚手架。
