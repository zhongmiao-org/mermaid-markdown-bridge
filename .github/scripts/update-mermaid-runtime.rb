#!/usr/bin/env ruby
# frozen_string_literal: true

version = ARGV.fetch(0)
tag = ARGV[1] || "mermaid@#{version}"
release_url = ARGV[2] || "https://github.com/mermaid-js/mermaid/releases/tag/mermaid%40#{version}"

runtime_path = "src/main/resources/mermaid/mermaid.min.js"
runtime = File.read(runtime_path)
versions = runtime.scan(/version:"(\d+\.\d+\.\d+)"/).flatten.uniq
abort("Missing Mermaid version in #{runtime_path}") if versions.empty?
abort("Ambiguous Mermaid versions in #{runtime_path}: #{versions.join(", ")}") if versions.length != 1
abort("Expected Mermaid #{version}, found #{versions.first} in #{runtime_path}") unless versions.first == version

def update_readme_badge(path, version, release_url)
  content = File.read(path)
  content.gsub!(%r{https://img\.shields\.io/badge/Mermaid-\d+\.\d+\.\d+-ff3670},
                "https://img.shields.io/badge/Mermaid-#{version}-ff3670")
  content.gsub!(%r{https://github\.com/mermaid-js/mermaid/releases/tag/mermaid%40\d+\.\d+\.\d+},
                release_url)
  File.write(path, content)
end

def ensure_changelog_entry(path, heading, entry)
  content = File.read(path)
  return if content.include?(entry)

  unreleased = /^## \[Unreleased\]\n/
  abort("Missing Unreleased section in #{path}") unless content.match?(unreleased)

  if content.include?("#{heading}\n")
    content.sub!("#{heading}\n", "#{heading}\n#{entry}\n")
  else
    content.sub!(unreleased, "## [Unreleased]\n\n#{heading}\n#{entry}\n")
  end

  File.write(path, content)
end

update_readme_badge("README.md", version, release_url)
update_readme_badge("README_zh.md", version, release_url)

ensure_changelog_entry(
  "CHANGELOG.md",
  "### 🔄 Changed",
  "- Updated the bundled Mermaid runtime to [#{tag}](#{release_url})."
)

ensure_changelog_entry(
  "CHANGELOG_zh.md",
  "### 🔄 变更",
  "- 将内置 Mermaid runtime 更新到 [#{tag}](#{release_url})。"
)
