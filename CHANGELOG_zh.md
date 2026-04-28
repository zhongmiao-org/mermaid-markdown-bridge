<!-- Keep a Changelog guide -> https://keepachangelog.com -->

# Mermaid Markdown Bridge 更新日志

> [English Changelog](./CHANGELOG.md) | 中文更新日志

## [Unreleased]

### CI/CD
- 新增 JetBrains Marketplace 发布和 GitHub Release 插件 ZIP 上传相关的发布 CI 加固。
- 新增发布成功后的 changelog 归档流程，自动创建可合并的 changelog 更新 PR。
- 新增双语 changelog 门禁，普通 PR 必须同时更新英文和中文 changelog。
- 新增中文 changelog 支持，并在发布时同步归档版本标题。

### 新增
- 基于 [IntelliJ Platform Plugin Template](https://github.com/JetBrains/intellij-platform-plugin-template) 创建初始脚手架。
