import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const demoPath = path.join(root, "examples", "demo.md");
const runtimePath = path.join(root, "src", "main", "resources", "mermaid", "mermaid.min.js");
const bridgePath = path.join(root, "src", "main", "resources", "mermaid", "mermaid-bridge.js");

function extractMermaidBlocks(markdown) {
  return Array.from(markdown.matchAll(/```mermaid\n([\s\S]*?)```/g), (match) => match[1].trim());
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

test("examples demo renders without Mermaid preview errors", async ({ page }) => {
  const blocks = extractMermaidBlocks(fs.readFileSync(demoPath, "utf8"));
  expect(blocks.length).toBeGreaterThan(0);

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: sans-serif; margin: 24px; }
      pre { white-space: pre-wrap; }
    </style>
  </head>
  <body>
    ${blocks.map((block) => `<pre><code class="language-mermaid">${escapeHtml(block)}</code></pre>`).join("\n")}
  </body>
</html>`;

  const browserErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.text().includes("Mermaid Markdown Bridge failed")) {
      browserErrors.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    browserErrors.push(error.message);
  });

  await page.setContent(html);
  await page.addScriptTag({ path: runtimePath });
  await page.addScriptTag({
    content: fs
      .readFileSync(bridgePath, "utf8")
      .replaceAll("__MERMAID_MARKDOWN_BRIDGE_THEME__", "default")
  });

  await page.waitForFunction((expectedCount) => {
    const renderedCount = document.querySelectorAll(".mermaid[data-mermaid-bridge-rendered='true']").length;
    const pendingCount = document.querySelectorAll(".mermaid[data-mermaid-bridge-pending='true']").length;
    return renderedCount === expectedCount && pendingCount === 0;
  }, blocks.length);

  expect(browserErrors).toEqual([]);
  await expect(page.locator("[data-mermaid-bridge-error]")).toHaveCount(0);
  await expect(page.locator("text=Syntax error in text")).toHaveCount(0);
  await expect(page.locator(".mermaid > svg")).toHaveCount(blocks.length);
  await expect(page.locator(".mermaid-bridge-controls")).toHaveCount(blocks.length);
});
