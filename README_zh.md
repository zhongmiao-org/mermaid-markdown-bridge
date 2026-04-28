# Mermaid Markdown Bridge

[![Build](https://github.com/zhongmiao-org/mermaid-markdown-bridge/actions/workflows/build.yml/badge.svg)](https://github.com/zhongmiao-org/mermaid-markdown-bridge/actions/workflows/build.yml)
[![Changelog](https://github.com/zhongmiao-org/mermaid-markdown-bridge/actions/workflows/changelog.yml/badge.svg)](https://github.com/zhongmiao-org/mermaid-markdown-bridge/actions/workflows/changelog.yml)
[![GitHub release](https://img.shields.io/github/v/release/zhongmiao-org/mermaid-markdown-bridge?include_prereleases&sort=semver)](https://github.com/zhongmiao-org/mermaid-markdown-bridge/releases)
[![License](https://img.shields.io/github/license/zhongmiao-org/mermaid-markdown-bridge)](./LICENSE)
![Kotlin](https://img.shields.io/badge/Kotlin-2.3.21-7F52FF?logo=kotlin&logoColor=white)
![JetBrains Platform](https://img.shields.io/badge/JetBrains%20Platform-2025.2-000000?logo=jetbrains&logoColor=white)

[English README](./README.md)

在 JetBrains IDE 自带 Markdown Preview 中直接渲染 Mermaid code block。

Mermaid Markdown Bridge 是一个轻量 JetBrains IDE 插件，面向希望在 Markdown 预览里查看 Mermaid 图表的用户。MVP 只增强 Markdown Preview 渲染，不提供 Mermaid PSI、补全、inspection、intention 或自定义编辑器。

## 功能

- 在 JetBrains Markdown Preview 中渲染 fenced Mermaid code block。
- 支持常见 Mermaid 图表，例如 `flowchart TD` 和 `sequenceDiagram`。
- 通过 JetBrains Markdown Preview 的浏览器扩展层工作，不替换原有 Markdown 编辑器或预览面板。
- 插件内置 Mermaid runtime，不依赖额外安装 Mermaid 插件。
- 根据 IDE 明暗主题切换 Mermaid 主题。
- 不影响普通 Markdown code block。

## 使用方式

在 Markdown 文件中编写标准 Mermaid fenced code block：

````markdown
```mermaid
flowchart TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Done]
  B -->|No| D[Fix it]
  D --> B
```
````

在支持的 JetBrains IDE 中打开该 Markdown 文件并切换到 Markdown Preview，Mermaid block 会在预览面板中渲染为图表。

示例见 [examples/demo.md](./examples/demo.md)，其中包含 flowchart 和 sequence diagram。

## 安装

插件暂未上架 JetBrains Marketplace。

当前可通过 GitHub Releases 手动安装：

1. 从 [GitHub Releases](https://github.com/zhongmiao-org/mermaid-markdown-bridge/releases) 下载最新插件 ZIP。
2. 在 IDE 中打开 `Settings/Preferences` > `Plugins`。
3. 点击齿轮菜单，选择 `Install Plugin from Disk...`。
4. 选择下载的 ZIP，并按提示重启 IDE。

## 兼容性

- 目标平台：IntelliJ Platform `2025.2`。
- 主要目标 IDE：IntelliJ IDEA Community 和 WebStorm。
- 依赖内置插件：JetBrains Markdown 插件（`org.intellij.plugins.markdown`）。
- 预览引擎：基于 JCEF 的 Markdown Preview。

## 已知限制

- Compose Markdown Preview 可能不会加载浏览器扩展脚本。
- MVP 不包含 Mermaid 语言服务。
- 不注册 `.mmd` 或 `.mermaid` 文件类型。
- 不包含语法高亮、补全、inspection、intention 或设置页。
- JetBrains Marketplace 插件 ID 可用后再补充 Marketplace 徽标。

## 开发

运行测试：

```shell
./gradlew test
```

构建插件：

```shell
./gradlew build
```

启动沙箱 IDE：

```shell
./gradlew runIde
```

## License

本项目使用 [MIT License](./LICENSE)。
