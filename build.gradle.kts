import org.gradle.api.GradleException
import org.gradle.kotlin.dsl.assign
import org.jetbrains.changelog.Changelog
import org.jetbrains.changelog.markdownToHTML
import org.jetbrains.intellij.platform.gradle.IntelliJPlatformType
import org.jetbrains.intellij.platform.gradle.TestFrameworkType
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("org.jetbrains.kotlin.jvm") version "2.3.21"
    id("org.jetbrains.intellij.platform") version "2.15.0"
    id("org.jetbrains.changelog") version "2.5.0"
}

repositories {
    mavenCentral()
    intellijPlatform {
        defaultRepositories()
    }
}

kotlin {
    jvmToolchain(17)
    compilerOptions {
        jvmTarget = JvmTarget.JVM_17
    }
}

dependencies {
    testImplementation("junit:junit:4.13.2")

    // IntelliJ Platform Gradle Plugin Dependencies Extension - read more: https://plugins.jetbrains.com/docs/intellij/tools-intellij-platform-gradle-plugin-dependencies-extension.html
    intellijPlatform {
        val platformType = providers.gradleProperty("platformType").get().uppercase()
        val platformVersion = providers.gradleProperty("platformVersion")

        when (platformType) {
            "IDEA" -> intellijIdea(platformVersion)
            "IC" -> intellijIdeaCommunity(platformVersion)
            "IU" -> intellijIdeaUltimate(platformVersion)
            "WS" -> webstorm(platformVersion)
            else -> create(platformType, platformVersion)
        }
        bundledPlugin("org.intellij.plugins.markdown")
        testFramework(TestFrameworkType.Platform)
    }
}

// Configure IntelliJ Platform Gradle Plugin - read more: https://plugins.jetbrains.com/docs/intellij/tools-intellij-platform-gradle-plugin-extension.html
intellijPlatform {
    pluginConfiguration {
        ideaVersion {
            sinceBuild = "231"
            untilBuild = provider { null }
        }

        // Extract the <!-- Plugin description --> section from README.md for the Marketplace description.
        description = providers.fileContents(layout.projectDirectory.file("README.md")).asText.map {
            val start = "<!-- Plugin description -->"
            val end = "<!-- Plugin description end -->"

            with(it.lines()) {
                if (!containsAll(listOf(start, end))) {
                    throw GradleException("Plugin description section not found in README.md:\n$start ... $end")
                }
                subList(indexOf(start) + 1, indexOf(end)).joinToString("\n").let(::markdownToHTML)
            }
        }

        val changelog = project.changelog // local variable for configuration cache compatibility
        // Get the latest available change notes from the changelog file
        changeNotes = version.map { pluginVersion ->
            with(changelog) {
                renderItem(
                    (getOrNull(pluginVersion) ?: getUnreleased())
                        .withHeader(false)
                        .withEmptySections(false),
                    Changelog.OutputType.HTML,
                )
            }
        }
    }

    pluginVerification {
        ides {
            create(IntelliJPlatformType.CLion, "2023.1.7")
            create(IntelliJPlatformType.DataGrip, "2023.1.2")
            create(IntelliJPlatformType.DataSpell, "2023.1.6")
            create(IntelliJPlatformType.GoLand, "2023.1.6")
            create(IntelliJPlatformType.IntellijIdeaCommunity, "2023.1.7")
            create(IntelliJPlatformType.IntellijIdeaUltimate, "2023.1.7")
            create(IntelliJPlatformType.PhpStorm, "2023.1.6")
            create(IntelliJPlatformType.PyCharmCommunity, "2023.1.6")
            create(IntelliJPlatformType.PyCharmProfessional, "2023.1.6")
            create(IntelliJPlatformType.Rider, "2023.1.7") {
                useInstaller = false
            }
            create(IntelliJPlatformType.RubyMine, "2023.1.7")
            create(IntelliJPlatformType.WebStorm, "2023.1.6")
        }
    }
}

// Configure Gradle Changelog Plugin - read more: https://github.com/JetBrains/gradle-changelog-plugin
changelog {
    groups.empty()
    repositoryUrl = providers.gradleProperty("pluginRepositoryUrl")
    versionPrefix = ""
}

tasks {
    publishPlugin {
        dependsOn(patchChangelog)
    }
}
