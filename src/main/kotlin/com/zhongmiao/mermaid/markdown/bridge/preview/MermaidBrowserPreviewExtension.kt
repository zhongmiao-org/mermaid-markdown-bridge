package com.zhongmiao.mermaid.markdown.bridge.preview

import com.intellij.openapi.util.Disposer
import com.intellij.ui.JBColor
import org.intellij.plugins.markdown.extensions.MarkdownBrowserPreviewExtension
import org.intellij.plugins.markdown.ui.preview.MarkdownHtmlPanel
import org.intellij.plugins.markdown.ui.preview.ResourceProvider

class MermaidBrowserPreviewExtension internal constructor(
    private val theme: String,
) : MarkdownBrowserPreviewExtension, ResourceProvider {

    override val scripts: List<String>
        get() = SCRIPTS

    override val resourceProvider: ResourceProvider
        get() = this

    override fun canProvide(resourceName: String): Boolean = resourceName in SCRIPTS

    override fun loadResource(resourceName: String): ResourceProvider.Resource? {
        val resource = ResourceProvider.loadInternalResource(
            MermaidBrowserPreviewExtension::class.java,
            "/mermaid/$resourceName",
            JAVASCRIPT_MIME_TYPE,
        ) ?: return null

        if (resourceName != BRIDGE_SCRIPT) {
            return resource
        }

        val content = resource.content
            .toString(Charsets.UTF_8)
            .replace(THEME_PLACEHOLDER, theme)
            .toByteArray(Charsets.UTF_8)

        return ResourceProvider.Resource(content, JAVASCRIPT_MIME_TYPE)
    }

    override fun dispose() = Unit

    class Provider : MarkdownBrowserPreviewExtension.Provider {
        override fun createBrowserExtension(panel: MarkdownHtmlPanel): MarkdownBrowserPreviewExtension {
            val theme = if (JBColor.isBright()) "default" else "dark"
            return MermaidBrowserPreviewExtension(theme).also {
                Disposer.register(panel, it)
            }
        }
    }

    companion object {
        private const val JAVASCRIPT_MIME_TYPE = "text/javascript"
        private const val BRIDGE_SCRIPT = "mermaid-bridge.js"
        private const val THEME_PLACEHOLDER = "__MERMAID_MARKDOWN_BRIDGE_THEME__"

        private val SCRIPTS = listOf(
            "mermaid.min.js",
            BRIDGE_SCRIPT,
        )
    }
}
