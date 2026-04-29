<!-- Keep a Changelog guide -> https://keepachangelog.com -->

# mermaid-markdown-bridge Changelog

> English Changelog | [中文更新日志](./CHANGELOG_zh.md)

## [Unreleased]

### ✨ Added
- Added Mermaid Markdown Preview rendering for fenced `mermaid` code blocks.
- Added bundled Mermaid runtime integration with light and dark theme support.
- Added demo Markdown content covering flowchart and sequence diagram examples.
- Added MIT License.
- Added English and Chinese README documentation for installation, usage, compatibility, and limitations.

### 🔄 Changed
- Prepared the plugin version for the `0.1.0` release.
- Replaced template README content with project-focused documentation and GitHub badges.

### 📚 Documentation
- Expanded the English and Chinese README files with a complete project description, extension package scope, implementation notes, and release process details.

### 🔧 CI/CD
- Replaced the old draft-release-on-main flow with a reviewed release PR workflow.
- Added a manual release preparation workflow that bumps `gradle.properties` and archives bilingual changelog entries.
- Moved real publishing to release PR merge, with tag creation on the merged `main` commit and draft release publication after a successful Marketplace upload.
- Removed the unused UI test workflow.
- Added plugin ZIP integrity validation to PR packaging.
- Added release CI hardening for JetBrains Marketplace publishing and GitHub Release ZIP uploads.
- Added a bilingual changelog gate requiring both English and Chinese changelog updates for regular PRs.
- Added Chinese changelog support with release-time archive handling.

### 🧱 Scaffold
- Initial scaffold created from [IntelliJ Platform Plugin Template](https://github.com/JetBrains/intellij-platform-plugin-template)
