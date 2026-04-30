(function () {
  "use strict";

  const MERMAID_THEME = "__MERMAID_MARKDOWN_BRIDGE_THEME__";
  const PENDING_ATTR = "data-mermaid-bridge-pending";
  const RENDERED_ATTR = "data-mermaid-bridge-rendered";
  const ERROR_ATTR = "data-mermaid-bridge-error";
  const VIEWER_ATTR = "data-mermaid-bridge-viewer";
  const CONTROL_SIZE = 32;
  const CONTROL_ICON_SIZE = 16;
  const CONTROL_GAP = 5;
  const CONTROL_OFFSET = 12;
  const MIN_SCALE = 0.25;
  const MAX_SCALE = 4;
  const ZOOM_STEP = 1.2;
  const PAN_STEP = 80;
  const CONTROL_PALETTES = {
    light: {
      backgroundColor: "rgba(246, 248, 250, 0.94)",
      border: "1px solid rgba(31, 35, 40, 0.15)",
      boxShadow: "0 8px 24px rgba(31, 35, 40, 0.16)",
      color: "#24292f",
      hoverBackgroundColor: "rgba(234, 238, 242, 0.98)"
    },
    dark: {
      backgroundColor: "rgba(33, 38, 45, 0.9)",
      border: "1px solid rgba(139, 148, 158, 0.35)",
      boxShadow: "0 8px 18px rgba(0, 0, 0, 0.28)",
      color: "#f0f6fc",
      hoverBackgroundColor: "rgba(48, 54, 61, 0.96)"
    }
  };
  const ICONS = {
    panUp: {
      viewBox: "0 0 1024 1024",
      fill: "currentColor",
      paths: [
        "M512 323.669333l-243.498667 243.498667 60.330667 60.330667L512 444.330667l183.168 183.168 60.330667-60.330667z"
      ]
    },
    panDown: {
      viewBox: "0 0 1024 1024",
      fill: "currentColor",
      paths: [
        "M695.168 396.501333L512 579.669333 328.832 396.501333l-60.330667 60.330667L512 700.330667l243.498667-243.498667z"
      ]
    },
    panLeft: {
      viewBox: "0 0 1024 1024",
      fill: "currentColor",
      paths: [
        "M567.168 268.501333L323.669333 512l243.498667 243.498667 60.330667-60.330667L444.330667 512l183.168-183.168z"
      ]
    },
    panRight: {
      viewBox: "0 0 1024 1024",
      fill: "currentColor",
      paths: [
        "M456.832 755.498667L700.330667 512l-243.498667-243.498667-60.330667 60.330667L579.669333 512l-183.168 183.168z"
      ]
    },
    zoomIn: {
      viewBox: "0 0 1024 1024",
      fill: "currentColor",
      paths: [
        "M469.333333 256H384v128H256v85.333333h128v128h85.333333v-128h128V384h-128z",
        "M426.666667 85.333333c-188.202667 0-341.333333 153.130667-341.333334 341.333334s153.130667 341.333333 341.333334 341.333333a339.285333 339.285333 0 0 0 208.938666-72.021333l187.562667 187.562666 60.330667-60.330666-187.562667-187.562667A339.285333 339.285333 0 0 0 768 426.666667c0-188.202667-153.130667-341.333333-341.333333-341.333334z m0 597.333334c-141.184 0-256-114.816-256-256s114.816-256 256-256 256 114.816 256 256-114.816 256-256 256z"
      ]
    },
    zoomOut: {
      viewBox: "0 0 1024 1024",
      fill: "currentColor",
      paths: [
        "M256 384h341.333333v85.333333H256z",
        "M426.666667 85.333333c-188.202667 0-341.333333 153.130667-341.333334 341.333334s153.130667 341.333333 341.333334 341.333333a339.285333 339.285333 0 0 0 208.938666-72.021333l187.562667 187.562666 60.330667-60.330666-187.562667-187.562667A339.285333 339.285333 0 0 0 768 426.666667c0-188.202667-153.130667-341.333333-341.333333-341.333334z m0 597.333334c-141.184 0-256-114.816-256-256s114.816-256 256-256 256 114.816 256 256-114.816 256-256 256z"
      ]
    },
    reset: {
      viewBox: "0 0 1024 1024",
      fill: "currentColor",
      paths: [
        "M256 512H170.666667c0 185.002667 156.288 341.333333 341.333333 341.333333s341.333333-156.330667 341.333333-341.333333-156.288-341.333333-341.333333-341.333333V85.333333L342.4 213.333333 512 341.333333V256c138.752 0 256 117.248 256 256s-117.248 256-256 256-256-117.248-256-256z",
        "M640 512c0-71.210667-56.704-128-128-128s-128 56.789333-128 128 56.704 128 128 128 128-56.789333 128-128z"
      ]
    }
  };

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

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function setStyles(element, styles) {
    Object.keys(styles).forEach(function (name) {
      element.style[name] = styles[name];
    });
  }

  function createSpacer() {
    const spacer = document.createElement("span");
    spacer.setAttribute("aria-hidden", "true");
    return spacer;
  }

  function createIcon(iconDefinition) {
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", iconDefinition.viewBox);
    icon.setAttribute("width", String(CONTROL_ICON_SIZE));
    icon.setAttribute("height", String(CONTROL_ICON_SIZE));
    icon.setAttribute("fill", iconDefinition.fill);
    if (iconDefinition.stroke) {
      icon.setAttribute("stroke", iconDefinition.stroke);
      icon.setAttribute("stroke-width", iconDefinition.strokeWidth);
      icon.setAttribute("stroke-linecap", "round");
      icon.setAttribute("stroke-linejoin", "round");
    }

    iconDefinition.paths.forEach(function (data) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", data);
      icon.appendChild(path);
    });

    return icon;
  }

  function getControlPalette() {
    return MERMAID_THEME === "dark" ? CONTROL_PALETTES.dark : CONTROL_PALETTES.light;
  }

  function createControlButton(label, iconDefinition, onClick) {
    const palette = getControlPalette();
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.title = label;
    setStyles(button, {
      alignItems: "center",
      backgroundColor: palette.backgroundColor,
      border: palette.border,
      borderRadius: "7px",
      boxShadow: palette.boxShadow,
      color: palette.color,
      cursor: "pointer",
      display: "inline-flex",
      height: CONTROL_SIZE + "px",
      justifyContent: "center",
      padding: "0",
      width: CONTROL_SIZE + "px"
    });
    button.appendChild(createIcon(iconDefinition));
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });
    button.addEventListener("pointerdown", function (event) {
      event.stopPropagation();
    });
    button.addEventListener("mouseenter", function () {
      button.style.backgroundColor = palette.hoverBackgroundColor;
    });
    button.addEventListener("mouseleave", function () {
      button.style.backgroundColor = palette.backgroundColor;
    });
    return button;
  }

  function enhanceRenderedBlocks(blocks) {
    blocks.forEach(enhanceRenderedBlock);
  }

  function enhanceRenderedBlock(block) {
    if (block.hasAttribute(VIEWER_ATTR) || block.hasAttribute(ERROR_ATTR)) {
      return;
    }

    const svg = block.querySelector("svg");
    if (!svg) {
      return;
    }

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;
    let lastClientX = 0;
    let lastClientY = 0;

    if (!block.style.position) {
      block.style.position = "relative";
    }

    setStyles(svg, {
      cursor: "grab",
      touchAction: "none",
      transformOrigin: "0 0",
      userSelect: "none"
    });

    function applyView() {
      if (scale === 1 && offsetX === 0 && offsetY === 0) {
        svg.style.removeProperty("transform");
        return;
      }

      svg.style.transform = "translate(" + offsetX + "px, " + offsetY + "px) scale(" + scale + ")";
    }

    function zoomBy(multiplier, originX, originY) {
      const nextScale = clamp(scale * multiplier, MIN_SCALE, MAX_SCALE);
      if (nextScale === scale) {
        return;
      }

      offsetX = originX - ((originX - offsetX) * nextScale / scale);
      offsetY = originY - ((originY - offsetY) * nextScale / scale);
      scale = nextScale;
      applyView();
    }

    function zoomFromCenter(multiplier) {
      const rect = svg.getBoundingClientRect();
      zoomBy(multiplier, rect.width / 2, rect.height / 2);
    }

    function panBy(deltaX, deltaY) {
      offsetX += deltaX;
      offsetY += deltaY;
      applyView();
    }

    function resetView() {
      scale = 1;
      offsetX = 0;
      offsetY = 0;
      applyView();
    }

    svg.addEventListener("wheel", function (event) {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      event.preventDefault();
      const rect = svg.getBoundingClientRect();
      const originX = event.clientX - rect.left;
      const originY = event.clientY - rect.top;
      zoomBy(event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP, originX, originY);
    }, { passive: false });

    svg.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) {
        return;
      }

      dragging = true;
      lastClientX = event.clientX;
      lastClientY = event.clientY;
      svg.style.cursor = "grabbing";
      svg.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    svg.addEventListener("pointermove", function (event) {
      if (!dragging) {
        return;
      }

      panBy(event.clientX - lastClientX, event.clientY - lastClientY);
      lastClientX = event.clientX;
      lastClientY = event.clientY;
      event.preventDefault();
    });

    function stopDragging(event) {
      if (!dragging) {
        return;
      }

      dragging = false;
      svg.style.cursor = "grab";
      if (svg.hasPointerCapture(event.pointerId)) {
        svg.releasePointerCapture(event.pointerId);
      }
    }

    svg.addEventListener("pointerup", stopDragging);
    svg.addEventListener("pointercancel", stopDragging);
    svg.addEventListener("dblclick", function (event) {
      event.preventDefault();
      resetView();
    });

    const controls = document.createElement("div");
    controls.className = "mermaid-bridge-controls";
    setStyles(controls, {
      bottom: CONTROL_OFFSET + "px",
      display: "grid",
      gap: CONTROL_GAP + "px",
      gridTemplateColumns: "repeat(3, " + CONTROL_SIZE + "px)",
      gridTemplateRows: "repeat(3, " + CONTROL_SIZE + "px)",
      position: "absolute",
      right: CONTROL_OFFSET + "px",
      zIndex: "5"
    });

    controls.appendChild(createSpacer());
    controls.appendChild(createControlButton("Pan up", ICONS.panUp, function () { panBy(0, PAN_STEP); }));
    controls.appendChild(createControlButton("Zoom in", ICONS.zoomIn, function () { zoomFromCenter(ZOOM_STEP); }));
    controls.appendChild(createControlButton("Pan left", ICONS.panLeft, function () { panBy(PAN_STEP, 0); }));
    controls.appendChild(createControlButton("Reset diagram view", ICONS.reset, resetView));
    controls.appendChild(createControlButton("Pan right", ICONS.panRight, function () { panBy(-PAN_STEP, 0); }));
    controls.appendChild(createSpacer());
    controls.appendChild(createControlButton("Pan down", ICONS.panDown, function () { panBy(0, -PAN_STEP); }));
    controls.appendChild(createControlButton("Zoom out", ICONS.zoomOut, function () { zoomFromCenter(1 / ZOOM_STEP); }));

    block.appendChild(controls);
    block.setAttribute(VIEWER_ATTR, "true");
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

    try {
      Promise.resolve(window.mermaid.run({ nodes: blocks }))
        .then(function () {
          enhanceRenderedBlocks(blocks);
          markRendered(blocks);
        })
        .catch(function (error) {
          markFailed(blocks, error);
        });
    } catch (error) {
      markFailed(blocks, error);
    }
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
