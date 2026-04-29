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
  const PAN_STEP = 80;

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
      ".mermaid-bridge-controls {",
      "  position: absolute;",
      "  z-index: 1;",
      "  right: 16px;",
      "  bottom: 16px;",
      "  display: grid;",
      "  grid-template-columns: repeat(3, 44px);",
      "  grid-template-rows: repeat(3, 44px);",
      "  gap: 6px;",
      "  pointer-events: none;",
      "}",
      ".mermaid-bridge-zoom-controls {",
      "  position: absolute;",
      "  z-index: 1;",
      "  right: 16px;",
      "  bottom: 172px;",
      "  display: grid;",
      "  gap: 6px;",
      "  pointer-events: none;",
      "}",
      ".mermaid-bridge-controls button,",
      ".mermaid-bridge-zoom-controls button {",
      "  width: 44px;",
      "  height: 44px;",
      "  padding: 0;",
      "  border: 1px solid rgba(127, 127, 127, 0.34);",
      "  border-radius: 8px;",
      "  background: color-mix(in srgb, Canvas 82%, transparent);",
      "  color: CanvasText;",
      "  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);",
      "  cursor: pointer;",
      "  font: 700 20px/1 system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;",
      "  pointer-events: auto;",
      "}",
      ".mermaid-bridge-controls button:hover,",
      ".mermaid-bridge-zoom-controls button:hover {",
      "  background: rgba(127, 127, 127, 0.18);",
      "}",
      ".mermaid-bridge-controls button:focus-visible,",
      ".mermaid-bridge-zoom-controls button:focus-visible {",
      "  outline: 2px solid Highlight;",
      "  outline-offset: 1px;",
      "}",
      ".mermaid-bridge-pan-up {",
      "  grid-column: 2;",
      "  grid-row: 1;",
      "}",
      ".mermaid-bridge-pan-left {",
      "  grid-column: 1;",
      "  grid-row: 2;",
      "}",
      ".mermaid-bridge-reset-view {",
      "  grid-column: 2;",
      "  grid-row: 2;",
      "}",
      ".mermaid-bridge-pan-right {",
      "  grid-column: 3;",
      "  grid-row: 2;",
      "}",
      ".mermaid-bridge-pan-down {",
      "  grid-column: 2;",
      "  grid-row: 3;",
      "}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function createControlButton(className, label, text, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
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

    function panBy(deltaX, deltaY) {
      state.x += deltaX;
      state.y += deltaY;
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

    const zoomControls = document.createElement("div");
    zoomControls.className = "mermaid-bridge-zoom-controls";
    zoomControls.setAttribute("aria-label", "Mermaid diagram zoom controls");
    zoomControls.appendChild(createControlButton("mermaid-bridge-zoom-in", "Zoom in", "+", function () {
      zoomBy(ZOOM_STEP);
    }));
    zoomControls.appendChild(createControlButton("mermaid-bridge-zoom-out", "Zoom out", "-", function () {
      zoomBy(1 / ZOOM_STEP);
    }));

    const controls = document.createElement("div");
    controls.className = "mermaid-bridge-controls";
    controls.setAttribute("aria-label", "Mermaid diagram pan controls");
    controls.appendChild(createControlButton("mermaid-bridge-pan-up", "Pan up", "↑", function () {
      panBy(0, -PAN_STEP);
    }));
    controls.appendChild(createControlButton("mermaid-bridge-pan-left", "Pan left", "←", function () {
      panBy(-PAN_STEP, 0);
    }));
    controls.appendChild(createControlButton("mermaid-bridge-reset-view", "Reset view", "⟳", resetView));
    controls.appendChild(createControlButton("mermaid-bridge-pan-right", "Pan right", "→", function () {
      panBy(PAN_STEP, 0);
    }));
    controls.appendChild(createControlButton("mermaid-bridge-pan-down", "Pan down", "↓", function () {
      panBy(0, PAN_STEP);
    }));

    block.appendChild(canvas);
    block.appendChild(zoomControls);
    block.appendChild(controls);
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
