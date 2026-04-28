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
}
