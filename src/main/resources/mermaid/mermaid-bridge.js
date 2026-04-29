(function () {
  "use strict";

  const MERMAID_THEME = "__MERMAID_MARKDOWN_BRIDGE_THEME__";
  const PENDING_ATTR = "data-mermaid-bridge-pending";
  const RENDERED_ATTR = "data-mermaid-bridge-rendered";
  const ERROR_ATTR = "data-mermaid-bridge-error";
  const VIEWER_ATTR = "data-mermaid-bridge-viewer";
  const STYLE_ID = "mermaid-bridge-viewer-style";
  const MIN_SCALE = 0.25;
  const MAX_SCALE = 4;
  const ZOOM_STEP = 1.2;

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

  function injectViewerStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".mermaid[" + VIEWER_ATTR + "] {",
      "  position: relative;",
      "  overflow: hidden;",
      "  min-height: 180px;",
      "  border: 1px solid rgba(127, 127, 127, 0.28);",
      "  border-radius: 6px;",
      "  background: rgba(127, 127, 127, 0.04);",
      "}",
      ".mermaid-bridge-canvas {",
      "  display: inline-block;",
      "  min-width: 100%;",
      "  min-height: 180px;",
      "  box-sizing: border-box;",
      "  padding: 16px;",
      "  text-align: center;",
      "  transform-origin: 0 0;",
      "  cursor: grab;",
      "  user-select: none;",
      "  touch-action: none;",
      "}",
      ".mermaid-bridge-canvas:active {",
      "  cursor: grabbing;",
      "}",
      ".mermaid-bridge-canvas svg {",
      "  max-width: 100%;",
      "  height: auto;",
      "}",
      ".mermaid-bridge-toolbar {",
      "  position: absolute;",
      "  z-index: 1;",
      "  top: 8px;",
      "  right: 8px;",
      "  display: flex;",
      "  gap: 4px;",
      "  padding: 4px;",
      "  border: 1px solid rgba(127, 127, 127, 0.3);",
      "  border-radius: 6px;",
      "  background: color-mix(in srgb, Canvas 88%, transparent);",
      "  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.14);",
      "}",
      ".mermaid-bridge-toolbar button {",
      "  width: 28px;",
      "  height: 28px;",
      "  padding: 0;",
      "  border: 0;",
      "  border-radius: 4px;",
      "  background: transparent;",
      "  color: CanvasText;",
      "  font: 600 16px/1 system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;",
      "  cursor: pointer;",
      "}",
      ".mermaid-bridge-toolbar button:hover {",
      "  background: rgba(127, 127, 127, 0.18);",
      "}",
      ".mermaid-bridge-toolbar button:focus-visible {",
      "  outline: 2px solid Highlight;",
      "  outline-offset: 1px;",
      "}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function createToolbarButton(label, text, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.title = label;
    button.setAttribute("aria-label", label);
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });
    return button;
  }

  function enhanceRenderedBlock(block) {
    if (block.hasAttribute(VIEWER_ATTR) || block.hasAttribute(ERROR_ATTR)) {
      return;
    }

    const svg = block.querySelector("svg");
    if (!svg) {
      return;
    }

    injectViewerStyles();

    const canvas = document.createElement("div");
    canvas.className = "mermaid-bridge-canvas";
    while (block.firstChild) {
      canvas.appendChild(block.firstChild);
    }

    const state = {
      dragging: false,
      lastX: 0,
      lastY: 0,
      scale: 1,
      x: 0,
      y: 0
    };

    function applyTransform() {
      canvas.style.transform = "translate(" + state.x + "px, " + state.y + "px) scale(" + state.scale + ")";
    }

    function setScale(nextScale, originX, originY) {
      const previousScale = state.scale;
      state.scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);

      if (state.scale === previousScale) {
        return;
      }

      state.x = originX - (originX - state.x) * (state.scale / previousScale);
      state.y = originY - (originY - state.y) * (state.scale / previousScale);
      applyTransform();
    }

    function zoomBy(multiplier) {
      const rect = block.getBoundingClientRect();
      setScale(state.scale * multiplier, rect.width / 2, rect.height / 2);
    }

    function resetView() {
      state.scale = 1;
      state.x = 0;
      state.y = 0;
      applyTransform();
    }

    const toolbar = document.createElement("div");
    toolbar.className = "mermaid-bridge-toolbar";
    toolbar.setAttribute("aria-label", "Mermaid diagram controls");
    toolbar.appendChild(createToolbarButton("Zoom in", "+", function () {
      zoomBy(ZOOM_STEP);
    }));
    toolbar.appendChild(createToolbarButton("Zoom out", "-", function () {
      zoomBy(1 / ZOOM_STEP);
    }));
    toolbar.appendChild(createToolbarButton("Reset view", "1:1", resetView));

    block.appendChild(toolbar);
    block.appendChild(canvas);
    block.setAttribute(VIEWER_ATTR, "true");
    applyTransform();

    block.addEventListener("wheel", function (event) {
      if (!event.ctrlKey && !event.metaKey && Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
        return;
      }

      event.preventDefault();
      const rect = block.getBoundingClientRect();
      const originX = event.clientX - rect.left;
      const originY = event.clientY - rect.top;
      const multiplier = event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      setScale(state.scale * multiplier, originX, originY);
    }, { passive: false });

    canvas.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      state.dragging = true;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener("pointermove", function (event) {
      if (!state.dragging) {
        return;
      }

      state.x += event.clientX - state.lastX;
      state.y += event.clientY - state.lastY;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      applyTransform();
    });

    canvas.addEventListener("pointerup", function (event) {
      state.dragging = false;
      canvas.releasePointerCapture(event.pointerId);
    });

    canvas.addEventListener("pointercancel", function () {
      state.dragging = false;
    });

    canvas.addEventListener("dblclick", function (event) {
      event.preventDefault();
      resetView();
    });
  }

  function enhanceRenderedBlocks(blocks) {
    blocks.forEach(enhanceRenderedBlock);
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
        enhanceRenderedBlocks(blocks);
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
