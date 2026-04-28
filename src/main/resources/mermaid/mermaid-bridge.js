(function () {
  "use strict";

  const MERMAID_THEME = "__MERMAID_MARKDOWN_BRIDGE_THEME__";
  const PENDING_ATTR = "data-mermaid-bridge-pending";
  const RENDERED_ATTR = "data-mermaid-bridge-rendered";
  const ERROR_ATTR = "data-mermaid-bridge-error";

  let initialized = false;
  let scheduled = false;

  function isMermaidCodeBlock(code) {
    if (!code || !code.classList) {
      return false;
    }

    return Array.from(code.classList).some(function (className) {
      return className.toLowerCase() === "language-mermaid";
    });
  }

  function createMermaidBlock(code) {
    const pre = code.closest("pre");
    if (!pre || pre.hasAttribute(PENDING_ATTR) || pre.hasAttribute(RENDERED_ATTR)) {
      return null;
    }

    const block = document.createElement("div");
    block.className = "mermaid";
    block.textContent = code.textContent || "";
    block.setAttribute(PENDING_ATTR, "true");

    pre.replaceWith(block);
    return block;
  }

  function collectPendingBlocks() {
    const blocks = [];
    document.querySelectorAll("pre > code").forEach(function (code) {
      if (!isMermaidCodeBlock(code)) {
        return;
      }

      const block = createMermaidBlock(code);
      if (block) {
        blocks.push(block);
      }
    });

    document.querySelectorAll(".mermaid[" + PENDING_ATTR + "]").forEach(function (block) {
      if (!blocks.includes(block)) {
        blocks.push(block);
      }
    });

    return blocks.filter(function (block) {
      return !block.hasAttribute(RENDERED_ATTR) && !block.hasAttribute(ERROR_ATTR);
    });
  }

  function initializeMermaid() {
    if (!window.mermaid) {
      return false;
    }

    if (!initialized) {
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: MERMAID_THEME
      });
      initialized = true;
    }

    return true;
  }

  function markRendered(blocks) {
    blocks.forEach(function (block) {
      block.removeAttribute(PENDING_ATTR);
      block.setAttribute(RENDERED_ATTR, "true");
    });
  }

  function markFailed(blocks, error) {
    blocks.forEach(function (block) {
      block.removeAttribute(PENDING_ATTR);
      block.setAttribute(RENDERED_ATTR, "true");
      block.setAttribute(ERROR_ATTR, "true");
    });
    console.warn("Mermaid Markdown Bridge failed to render a diagram.", error);
  }

  function renderPendingBlocks() {
    scheduled = false;

    if (!initializeMermaid()) {
      window.setTimeout(scheduleRender, 100);
      return;
    }

    const blocks = collectPendingBlocks();
    if (blocks.length === 0) {
      return;
    }

    Promise.resolve(window.mermaid.run({ nodes: blocks }))
      .then(function () {
        markRendered(blocks);
      })
      .catch(function (error) {
        markFailed(blocks, error);
      });
  }

  function scheduleRender() {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.requestAnimationFrame(renderPendingBlocks);
  }

  const observer = new MutationObserver(scheduleRender);

  function start() {
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    scheduleRender();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}());
