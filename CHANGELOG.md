<!-- Keep a Changelog guide -> https://keepachangelog.com -->

# mermaid-markdown-bridge Changelog

> English Changelog | [中文更新日志](./CHANGELOG_zh.md)

## [Unreleased]

### 🔄 Changed
- Updated the bundled Mermaid runtime to [mermaid@11.15.0](https://github.com/mermaid-js/mermaid/releases/tag/mermaid%4011.15.0).

### 🔧 CI/CD
- Filtered internal maintenance entries out of public release notes and JetBrains Marketplace change notes.
- Configured release automation commits and tags with GitHub-attributed author and collaborator metadata.
- Enforced Unreleased-only bilingual changelog updates and duplicate section checks in CI.
- Added upstream release links, automated PR labels, and co-author metadata to Mermaid runtime sync automation.
- Added automatic Mermaid runtime sync pull requests linked to the upstream Mermaid reminder issue through GitHub Development.
- Added headless browser rendering checks for Mermaid diagrams in `examples/demo.md`.
- Added a scheduled Mermaid runtime release watch that opens or updates a reminder issue when a newer stable upstream Mermaid version is available.

## [1.1.0] - 2026-04-30

### 🔄 Changed
- Declared JetBrains IDE compatibility from IntelliJ Platform `2023.1` onward and lowered the build baseline to IDEA Community `2023.1.7`.
- Expanded plugin verification coverage across JetBrains IntelliJ-based IDE product families supported by the Gradle verifier at their 2023+ compatibility lower bounds.

## [1.0.0] - 2026-04-30

### ✨ Added
- Added preview-only Mermaid diagram zoom, pan, reset, and drag controls without changing Markdown editor or preview page theming.

### 📚 Documentation
- Polished the English and Chinese README files with clearer Marketplace-facing documentation, preview-only scope, GitHub-like rendering expectations, Mermaid third-party runtime notes, updated brand asset placement, and a theme-aware Markdown logo variant.
- Expanded the demo Markdown file with Mermaid example diagrams and upstream Mermaid source attribution.
- Updated plugin description metadata to align with the README-based Marketplace description.

## [0.1.2] - 2026-04-29

### 🔄 Changed
- Adjusted plugin icon SVG metadata to the JetBrains Marketplace required 40 px by 40 px size.
- Added vendor contact metadata and third-party notices for the bundled Mermaid runtime.
- Replaced deprecated theme detection API usage reported by IntelliJ Plugin Verifier.

### 📚 Documentation
- Documented Marketplace discovery limits for Mermaid fenced code blocks in Markdown and clarified that the plugin does not register a Markdown file type for installation recommendations.

## [0.1.1] - 2026-04-29

### ✨ Added
- Added Mermaid Markdown Preview rendering for fenced `mermaid` code blocks.
- Added bundled Mermaid runtime integration with light and dark theme support.
- Added demo Markdown content covering flowchart and sequence diagram examples.
- Added plugin icon assets based on the project logo.
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
