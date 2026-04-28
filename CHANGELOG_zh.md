<!-- Keep a Changelog guide -> https://keepachangelog.com -->

# Mermaid Markdown Bridge 更新日志

> [English Changelog](./CHANGELOG.md) | 中文更新日志

## [Unreleased]

### 新增
- 新增 Markdown Preview 中 fenced `mermaid` code block 的 Mermaid 渲染能力。
- 新增内置 Mermaid runtime 集成，并支持明暗主题基础适配。
- 新增包含 flowchart 和 sequence diagram 的 Markdown 示例内容。
- 新增 MIT License。
- 新增英文和中文 README，覆盖安装、使用、兼容性和已知限制。

### 变更
- 将插件版本准备为 `0.1.0`。
- 将模板 README 替换为面向项目的文档和 GitHub 徽标。

### CI/CD
- 新增 JetBrains Marketplace 发布和 GitHub Release 插件 ZIP 上传相关的发布 CI 加固。
- 新增发布成功后的 changelog 归档流程，自动创建可合并的 changelog 更新 PR。
- 新增双语 changelog 门禁，普通 PR 必须同时更新英文和中文 changelog。
- 新增中文 changelog 支持，并在发布时同步归档版本标题。

### 脚手架
- 基于 [IntelliJ Platform Plugin Template](https://github.com/JetBrains/intellij-platform-plugin-template) 创建初始脚手架。
