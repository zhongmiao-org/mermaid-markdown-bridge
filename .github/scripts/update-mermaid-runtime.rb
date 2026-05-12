#!/usr/bin/env ruby
# frozen_string_literal: true

version = ARGV.fetch(0)
tag = ARGV[1] || "mermaid@#{version}"
release_url = ARGV[2] || "https://github.com/mermaid-js/mermaid/releases/tag/mermaid%40#{version}"

CHANGELOG_HEADINGS = {
  "CHANGELOG.md" => [
    "### ✨ Added",
    "### 🔄 Changed",
    "### 📚 Documentation",
    "### 🔧 CI/CD"
  ],
  "CHANGELOG_zh.md" => [
    "### ✨ 新增",
    "### 🔄 变更",
    "### 📚 文档",
    "### 🔧 CI/CD"
  ]
}.freeze

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
  match = content.match(/^## \[Unreleased\]\s*$\n(?<body>.*?)(?=^## \[|\z)/m)
  abort("Missing Unreleased section in #{path}") unless match

  body = match[:body].strip
  return if body.include?(entry)

  if body.match?(/(^|\n)#{Regexp.escape(heading)}\n/)
    body.sub!(/(^|\n)#{Regexp.escape(heading)}\n/) do
      "#{Regexp.last_match(1)}#{heading}\n#{entry}\n"
    end
  else
    headings = CHANGELOG_HEADINGS.fetch(path)
    target_index = headings.index(heading)
    abort("Unsupported changelog heading #{heading} for #{path}") unless target_index

    insert_before = headings.drop(target_index + 1).find do |candidate|
      body.match?(/(^|\n)#{Regexp.escape(candidate)}\n/)
    end

    insert_block = "#{heading}\n#{entry}"
    if insert_before
      body.sub!(/(^|\n)#{Regexp.escape(insert_before)}\n/) do
        "#{Regexp.last_match(1)}#{insert_block}\n\n#{insert_before}\n"
      end
    elsif body.empty?
      body = insert_block
    else
      body = "#{body.rstrip}\n\n#{insert_block}"
    end
  end

  updated_unreleased = "## [Unreleased]\n\n#{body.strip}\n\n"
  File.write(path, content.sub(match[0], updated_unreleased))
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
