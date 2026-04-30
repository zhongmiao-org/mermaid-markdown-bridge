package com.zhongmiao.mermaid.markdown.bridge.preview

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class MermaidBrowserPreviewExtensionTest {

    @Test
    fun `provides mermaid runtime and bridge scripts`() {
        val extension = MermaidBrowserPreviewExtension("default")

        assertEquals(listOf("mermaid.min.js", "mermaid-bridge.js"), extension.scripts)
        assertTrue(extension.canProvide("mermaid.min.js"))
        assertTrue(extension.canProvide("mermaid-bridge.js"))
        assertFalse(extension.canProvide("plain.js"))
    }

    @Test
    fun `loads bridge script with configured theme`() {
        val extension = MermaidBrowserPreviewExtension("dark")
        val resource = extension.loadResource("mermaid-bridge.js") ?: error("Bridge script was not loaded")
        val script = resource.content.toString(Charsets.UTF_8)

        assertEquals("text/javascript", resource.type)
        assertTrue(script.contains("startOnLoad: false"))
        assertTrue(script.contains("securityLevel: \"loose\""))
        assertTrue(script.contains("theme: MERMAID_THEME"))
        assertTrue(script.contains("const MERMAID_THEME = \"dark\""))
    }

    @Test
    fun `bridge script adds preview-only diagram controls`() {
        val script = loadBridgeScript()

        assertContains(script, "const VIEWER_ATTR = \"data-mermaid-bridge-viewer\"")
        assertContains(script, "const CONTROL_SIZE = 32")
        assertContains(script, "const CONTROL_ICON_SIZE = 16")
        assertContains(script, "const CONTROL_PALETTES = {")
        assertContains(script, "backgroundColor: \"rgba(246, 248, 250, 0.94)\"")
        assertContains(script, "color: \"#24292f\"")
        assertContains(script, "backgroundColor: \"rgba(33, 38, 45, 0.9)\"")
        assertContains(script, "color: \"#f0f6fc\"")
        assertContains(script, "return MERMAID_THEME === \"dark\" ? CONTROL_PALETTES.dark : CONTROL_PALETTES.light")
        assertContains(script, "const ICONS = {")
        assertContains(script, "panUp: {")
        assertContains(script, "panDown: {")
        assertContains(script, "panLeft: {")
        assertContains(script, "panRight: {")
        assertContains(script, "zoomIn: {")
        assertContains(script, "zoomOut: {")
        assertContains(script, "reset: {")
        assertContains(script, "className = \"mermaid-bridge-controls\"")
        assertContains(script, "gridTemplateColumns: \"repeat(3, \" + CONTROL_SIZE + \"px)\"")
        assertContains(script, "gridTemplateRows: \"repeat(3, \" + CONTROL_SIZE + \"px)\"")
        assertContains(script, "Pan up")
        assertContains(script, "Zoom in")
        assertContains(script, "Pan left")
        assertContains(script, "Reset diagram view")
        assertContains(script, "Pan right")
        assertContains(script, "Pan down")
        assertContains(script, "Zoom out")
        assertContains(script, "svg.addEventListener(\"wheel\"")
        assertContains(script, "svg.addEventListener(\"pointerdown\"")
        assertContains(script, "svg.addEventListener(\"pointermove\"")
        assertContains(script, "svg.addEventListener(\"dblclick\"")
        assertContains(script, "fill: \"currentColor\"")
        assertContains(script, "M256 512H170.666667")

        val panUpIndex = script.indexOf("Pan up")
        val zoomInIndex = script.indexOf("Zoom in")
        val panLeftIndex = script.indexOf("Pan left")
        val resetIndex = script.indexOf("Reset diagram view")
        val panRightIndex = script.indexOf("Pan right")
        val panDownIndex = script.indexOf("Pan down")
        val zoomOutIndex = script.indexOf("Zoom out")

        assertTrue(panUpIndex < zoomInIndex)
        assertTrue(zoomInIndex < panLeftIndex)
        assertTrue(panLeftIndex < resetIndex)
        assertTrue(resetIndex < panRightIndex)
        assertTrue(panRightIndex < panDownIndex)
        assertTrue(panDownIndex < zoomOutIndex)
    }

    @Test
    fun `bridge script does not inject global preview theme styles`() {
        val script = loadBridgeScript()

        listOf(
            "createElement(\"style\")",
            "document.head",
            "appendChild(style)",
            "themeVariables",
            "DARK_PREVIEW_CLASS",
            "CONFIGURED_VIEWER_THEME",
            "LafManager",
            "UIManager",
            "html.",
            "document.body",
            "markdown-body",
            "mermaid-bridge-canvas",
            "background: transparent",
            "min-height: 180px",
            "overflow: hidden",
            "padding: 12px",
        ).forEach { forbidden ->
            assertFalse("Bridge script should not contain `$forbidden`", script.contains(forbidden))
        }
    }

    @Test
    fun `loads bundled mermaid runtime`() {
        val extension = MermaidBrowserPreviewExtension("default")
        val resource = extension.loadResource("mermaid.min.js") ?: error("Mermaid runtime was not loaded")
        val script = resource.content.toString(Charsets.UTF_8)

        assertEquals("text/javascript", resource.type)
        assertTrue(script.contains("mermaid"))
    }

    @Test
    fun `does not load unknown resources`() {
        val extension = MermaidBrowserPreviewExtension("default")

        assertNull(extension.loadResource("unknown.js"))
    }

    private fun loadBridgeScript(): String {
        val extension = MermaidBrowserPreviewExtension("default")
        val resource = extension.loadResource("mermaid-bridge.js") ?: error("Bridge script was not loaded")
        return resource.content.toString(Charsets.UTF_8)
    }

    private fun assertContains(value: String, expected: String) {
        assertTrue("Expected value to contain `$expected`", value.contains(expected))
    }
}
