plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val customTvUrl = (project.findProperty("TV_SERVER_URL") as String?)
    ?.trim()
    ?.takeIf { it.isNotEmpty() }
    ?: "https://aljamiah.iain-manado.ac.id/tv?kiosk=1"

android {
    namespace = "id.ac.iainmanado.masjid.tv"
    compileSdk = 34

    defaultConfig {
        applicationId = "id.ac.iainmanado.masjid.tv"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        buildConfigField("String", "DEFAULT_TV_URL", "\"$customTvUrl\"")
    }

    buildFeatures {
        buildConfig = true
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ""
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-ktx:1.9.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
}
