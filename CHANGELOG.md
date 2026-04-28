<!-- Keep a Changelog guide -> https://keepachangelog.com -->

# mermaid-markdown-bridge Changelog

> English Changelog | [中文更新日志](./CHANGELOG_zh.md)

## [Unreleased]

### Added
- Added Mermaid Markdown Preview rendering for fenced `mermaid` code blocks.
- Added bundled Mermaid runtime integration with light and dark theme support.
- Added demo Markdown content covering flowchart and sequence diagram examples.
- Added MIT License.
- Added English and Chinese README documentation for installation, usage, compatibility, and limitations.

### Changed
- Prepared the plugin version for the `0.1.0` release.
- Replaced template README content with project-focused documentation and GitHub badges.

### CI/CD
- Added release CI hardening for JetBrains Marketplace publishing and GitHub Release ZIP uploads.
- Added a post-release changelog archive flow that opens an auto-merge PR after a successful publish.
- Added a bilingual changelog gate requiring both English and Chinese changelog updates for regular PRs.
- Added Chinese changelog support with release-time archive handling.

### Scaffold
- Initial scaffold created from [IntelliJ Platform Plugin Template](https://github.com/JetBrains/intellij-platform-plugin-template)
