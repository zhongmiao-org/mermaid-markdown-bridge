(function () {
  "use strict";

  const MERMAID_THEME = "__MERMAID_MARKDOWN_BRIDGE_THEME__";
  const VIEWER_THEME = "__MERMAID_MARKDOWN_BRIDGE_VIEWER_THEME__";
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

  const BRIDGE_THEMES = {
    light: {
      viewerBackground: "#ffffff",
      viewerBorder: "#d0d7de",
      canvasBackground: "#ffffff",
      buttonBackground: "#f6f8fa",
      buttonBackgroundHover: "#ebf0f4",
      buttonBorder: "#d0d7de",
      buttonColor: "#24292f",
      buttonShadow: "rgba(27, 31, 36, 0.12)",
      focusOutline: "#0969da"
    },
    dark: {
      viewerBackground: "#0d1117",
      viewerBorder: "#30363d",
      canvasBackground: "#0d1117",
      buttonBackground: "#21262d",
      buttonBackgroundHover: "#30363d",
      buttonBorder: "#3d444d",
      buttonColor: "#c9d1d9",
      buttonShadow: "rgba(1, 4, 9, 0.45)",
      focusOutline: "#58a6ff"
    }
  };

  const BRIDGE_THEME = BRIDGE_THEMES[VIEWER_THEME] || BRIDGE_THEMES.light;

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
      "  border: 1px solid " + BRIDGE_THEME.viewerBorder + ";",
      "  border-radius: 6px;",
      "  background: " + BRIDGE_THEME.viewerBackground + ";",
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
      "  background: " + BRIDGE_THEME.canvasBackground + ";",
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
      "  border: 1px solid " + BRIDGE_THEME.buttonBorder + ";",
      "  border-radius: 8px;",
      "  background: " + BRIDGE_THEME.buttonBackground + ";",
      "  color: " + BRIDGE_THEME.buttonColor + ";",
      "  box-shadow: 0 2px 8px " + BRIDGE_THEME.buttonShadow + ";",
      "  cursor: pointer;",
      "  display: inline-flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  pointer-events: auto;",
      "}",
      ".mermaid-bridge-controls button svg,",
      ".mermaid-bridge-zoom-controls button svg {",
      "  width: 22px;",
      "  height: 22px;",
      "  display: block;",
      "}",
      ".mermaid-bridge-controls button:hover,",
      ".mermaid-bridge-zoom-controls button:hover {",
      "  background: " + BRIDGE_THEME.buttonBackgroundHover + ";",
      "}",
      ".mermaid-bridge-controls button:focus-visible,",
      ".mermaid-bridge-zoom-controls button:focus-visible {",
      "  outline: 2px solid " + BRIDGE_THEME.focusOutline + ";",
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

  function iconSvg(name) {
    const icons = {
      panUp: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>',
      panDown: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>',
      panLeft: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>',
      panRight: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>',
      reset: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.5-6.2"/><path d="M18.5 2.8v5.5H13"/><path d="M21 12a9 9 0 0 1-15.5 6.2"/><path d="M5.5 21.2v-5.5H11"/></svg>',
      zoomIn: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M16 16l5 5"/><path d="M10.5 7.5v6"/><path d="M7.5 10.5h6"/></svg>',
      zoomOut: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M16 16l5 5"/><path d="M7.5 10.5h6"/></svg>'
    };
    return icons[name] || "";
  }

  function createControlButton(className, label, iconName, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.innerHTML = iconSvg(iconName);
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
    zoomControls.appendChild(createControlButton("mermaid-bridge-zoom-in", "Zoom in", "zoomIn", function () {
      zoomBy(ZOOM_STEP);
    }));
    zoomControls.appendChild(createControlButton("mermaid-bridge-zoom-out", "Zoom out", "zoomOut", function () {
      zoomBy(1 / ZOOM_STEP);
    }));

    const controls = document.createElement("div");
    controls.className = "mermaid-bridge-controls";
    controls.setAttribute("aria-label", "Mermaid diagram pan controls");
    controls.appendChild(createControlButton("mermaid-bridge-pan-up", "Pan up", "panUp", function () {
      panBy(0, -PAN_STEP);
    }));
    controls.appendChild(createControlButton("mermaid-bridge-pan-left", "Pan left", "panLeft", function () {
      panBy(-PAN_STEP, 0);
    }));
    controls.appendChild(createControlButton("mermaid-bridge-reset-view", "Reset view", "reset", resetView));
    controls.appendChild(createControlButton("mermaid-bridge-pan-right", "Pan right", "panRight", function () {
      panBy(PAN_STEP, 0);
    }));
    controls.appendChild(createControlButton("mermaid-bridge-pan-down", "Pan down", "panDown", function () {
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
