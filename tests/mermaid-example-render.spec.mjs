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

async function loadBridge(page) {
  await page.addScriptTag({
    content: fs
      .readFileSync(bridgePath, "utf8")
      .replaceAll("__MERMAID_MARKDOWN_BRIDGE_THEME__", "default")
  });
}

async function flushRenderFrames(page) {
  // Let MutationObserver callbacks and the animation frames they schedule run
  // while the test holds the renderer's promise open.
  await page.evaluate(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }));
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
  await loadBridge(page);

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

test("waits for the active render before adding controls and rendering new blocks", async ({ page }) => {
  await page.setContent('<pre><code class="language-mermaid">flowchart LR\nA --> B</code></pre>');
  await page.evaluate(() => {
    const state = window.renderState = { batches: [] };
    window.mermaid = {
      initialize() {},
      run({ nodes }) {
        state.batches.push(nodes.map((node) => node.textContent));
        // Match Mermaid's early data-processed marker and temporary layout SVG:
        // another run would skip these nodes before the final SVG is written.
        const pending = nodes.filter((node) => !node.hasAttribute("data-processed"));
        for (const node of pending) {
          node.setAttribute("data-processed", "true");
          node.innerHTML = '<svg data-stage="layout"></svg>';
        }
        const finish = () => {
          for (const node of pending) {
            node.innerHTML = '<svg data-stage="final" width="200" height="200"></svg>';
          }
        };
        if (state.batches.length === 1) {
          return new Promise((resolve) => {
            state.finish = () => { finish(); resolve(); };
          });
        }
        finish();
        return Promise.resolve();
      }
    };
  });
  await loadBridge(page);
  await page.waitForFunction(() => typeof window.renderState.finish === "function");
  await page.evaluate(() => {
    document.body.insertAdjacentHTML("beforeend",
      '<pre><code class="language-mermaid">flowchart LR\nB --> C</code></pre>');
  });
  await flushRenderFrames(page);

  expect(await page.evaluate(() => window.renderState.batches)).toEqual([["flowchart LR\nA --> B"]]);
  await expect(page.locator("[data-mermaid-bridge-rendered]")).toHaveCount(0);
  await expect(page.locator(".mermaid-bridge-controls")).toHaveCount(0);

  await page.evaluate(() => window.renderState.finish());
  await expect(page.locator(".mermaid[data-mermaid-bridge-rendered='true']")).toHaveCount(2);
  await expect(page.locator("[data-mermaid-bridge-pending], [data-mermaid-bridge-error]")).toHaveCount(0);
  await flushRenderFrames(page);
  expect(await page.evaluate(() => window.renderState.batches)).toEqual([
    ["flowchart LR\nA --> B"], ["flowchart LR\nB --> C"]
  ]);

  for (const block of await page.locator(".mermaid").all()) {
    const svg = block.locator(":scope > svg[data-stage='final']");
    await expect(svg).toHaveCount(1);
    await expect(block.locator(".mermaid-bridge-controls")).toHaveCount(1);
    await block.getByRole("button", { name: "Zoom in", exact: true }).click();
    expect(await svg.evaluate((node) => node.style.transform)).toContain("scale(1.2)");
    await block.getByRole("button", { name: "Reset diagram view", exact: true }).click();
    expect(await svg.evaluate((node) => node.style.transform)).toBe("");
  }
});

for (const failureMode of ["reject", "throw"]) {
  test(`renders later blocks after Mermaid ${failureMode === "reject" ? "rejects" : "throws"}`, async ({ page }) => {
    await page.setContent('<pre><code class="language-mermaid">first diagram</code></pre>');
    await page.evaluate((mode) => {
      const state = window.renderState = { calls: 0 };
      window.mermaid = {
        initialize() {},
        run({ nodes }) {
          state.calls += 1;
          if (state.calls === 1) {
            if (mode === "throw") {
              throw new Error("test render failure");
            }
            return new Promise((resolve, reject) => {
              state.fail = () => reject(new Error("test render failure"));
            });
          }
          for (const node of nodes) {
            node.innerHTML = '<svg width="100" height="100"></svg>';
          }
          return Promise.resolve();
        }
      };
    }, failureMode);
    await loadBridge(page);
    await page.waitForFunction(() => window.renderState.calls === 1);
    await page.evaluate(() => {
      document.body.insertAdjacentHTML("beforeend",
        '<pre><code class="language-mermaid">later diagram</code></pre>');
    });
    if (failureMode === "reject") {
      await flushRenderFrames(page);
      expect(await page.evaluate(() => window.renderState.calls)).toBe(1);
      await page.evaluate(() => window.renderState.fail());
    }

    await expect(page.locator(".mermaid[data-mermaid-bridge-rendered='true']")).toHaveCount(2);
    await expect(page.locator("[data-mermaid-bridge-error]")).toHaveCount(1);
    await expect(page.locator("[data-mermaid-bridge-pending]")).toHaveCount(0);
    await expect(page.locator(".mermaid:not([data-mermaid-bridge-error]) > svg")).toHaveCount(1);
    await expect(page.locator(".mermaid-bridge-controls")).toHaveCount(1);
    await flushRenderFrames(page);
    expect(await page.evaluate(() => window.renderState.calls)).toBe(2);
  });
}
