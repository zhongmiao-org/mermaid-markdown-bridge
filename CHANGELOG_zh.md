<!-- Keep a Changelog guide -> https://keepachangelog.com -->

# Mermaid Markdown Bridge 更新日志

> [English Changelog](./CHANGELOG.md) | 中文更新日志

## [Unreleased]

### 🔄 变更
- 将插件图标 SVG 元数据调整为 JetBrains Marketplace 要求的 40 px × 40 px 尺寸。
- 新增 vendor 联系元数据，并为内置 Mermaid runtime 补充第三方声明。
- 替换 IntelliJ Plugin Verifier 报告的已废弃主题检测 API。

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
