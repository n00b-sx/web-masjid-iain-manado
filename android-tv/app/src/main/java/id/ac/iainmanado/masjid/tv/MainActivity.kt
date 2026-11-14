package id.ac.iainmanado.masjid.tv

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.ConnectivityManager
import android.net.Network
import android.net.Uri
import android.net.http.SslError
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.SslErrorHandler
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var prefs: SharedPreferences
    private val mainHandler = Handler(Looper.getMainLooper())

    private var activeDialog: AlertDialog? = null
    private var isShowingErrorFallback = false
    private var pendingErrorOnCurrentLoad = false
    private var lastBackPressTime = 0L
    private val okPressTimestamps = mutableListOf<Long>()

    private val retryRunnable = Runnable {
        if (!isFinishing && !isDestroyed && isShowingErrorFallback) {
            loadTargetTvUrl()
        }
    }

    private var connectivityManager: ConnectivityManager? = null
    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            mainHandler.postDelayed({
                if (!isFinishing && !isDestroyed && isShowingErrorFallback) {
                    loadTargetTvUrl()
                }
            }, 1500L)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        configureAlwaysOnAndWakeScreen()
        enableImmersiveFullscreen()

        val storageContext = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            createDeviceProtectedStorageContext()
        } else {
            this
        }
        prefs = storageContext.getSharedPreferences(BootReceiver.PREFS_NAME, Context.MODE_PRIVATE)

        val rootLayout = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(0xFF14110F.toInt())
            keepScreenOn = true
        }

        webView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(0xFF14110F.toInt())
            isVerticalScrollBarEnabled = false
            isHorizontalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
            isFocusable = false
            isFocusableInTouchMode = false

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                // Kunci skala teks 100% agar font TV pabrikan tidak membesar sendiri
                textZoom = 100
                useWideViewPort = true
                loadWithOverviewMode = true
                mediaPlaybackRequiresUserGesture = false
                cacheMode = WebSettings.LOAD_DEFAULT
                mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
                userAgentString = "$userAgentString MasjidAlJamiahTV/1.0"
            }

            webChromeClient = WebChromeClient()

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    // Kunci navigasi agar selalu tetap berada di dalam aplikasi TV
                    return false
                }

                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?
                ) {
                    if (request?.isForMainFrame == true) {
                        pendingErrorOnCurrentLoad = true
                        showWaitingConnectionScreen(view)
                    }
                }

                override fun onReceivedHttpError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    errorResponse: WebResourceResponse?
                ) {
                    val status = errorResponse?.statusCode ?: 200
                    if (request?.isForMainFrame == true && status >= 500) {
                        pendingErrorOnCurrentLoad = true
                        showWaitingConnectionScreen(view)
                    }
                }

                override fun onReceivedSslError(
                    view: WebView?,
                    handler: SslErrorHandler?,
                    error: SslError?
                ) {
                    handler?.cancel()
                    pendingErrorOnCurrentLoad = true
                    showWaitingConnectionScreen(view)
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                        if (!pendingErrorOnCurrentLoad) {
                            isShowingErrorFallback = false
                            mainHandler.removeCallbacks(retryRunnable)
                        }
                    }
                }
            }
        }

        rootLayout.addView(webView)
        setContentView(rootLayout)

        registerNetworkWatchdog()
        loadTargetTvUrl()

        Toast.makeText(
            this,
            "TV Masjid Al Jami'ah Aktif • Tekan OK 3x atau MENU di remote untuk Pengaturan",
            Toast.LENGTH_LONG
        ).show()

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val now = System.currentTimeMillis()
                if (now - lastBackPressTime < 3000L) {
                    finishAffinity()
                } else {
                    lastBackPressTime = now
                    Toast.makeText(
                        this@MainActivity,
                        "Tekan KEMBALI sekali lagi untuk keluar, atau tekan OK 3x untuk Pengaturan TV",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        })
    }

    override fun onResume() {
        super.onResume()
        enableImmersiveFullscreen()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            enableImmersiveFullscreen()
        }
    }

    override fun onDestroy() {
        mainHandler.removeCallbacksAndMessages(null)
        try {
            connectivityManager?.unregisterNetworkCallback(networkCallback)
        } catch (_: Exception) {
        }
        webView.destroy()
        super.onDestroy()
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (activeDialog?.isShowing == true) {
            return super.dispatchKeyEvent(event)
        }

        if (event.action == KeyEvent.ACTION_DOWN) {
            when (event.keyCode) {
                KeyEvent.KEYCODE_MENU,
                KeyEvent.KEYCODE_SETTINGS,
                KeyEvent.KEYCODE_INFO,
                KeyEvent.KEYCODE_BOOKMARK -> {
                    showTvSettingsDialog()
                    return true
                }

                KeyEvent.KEYCODE_DPAD_CENTER,
                KeyEvent.KEYCODE_ENTER,
                KeyEvent.KEYCODE_NUMPAD_ENTER -> {
                    if (event.repeatCount >= 1) {
                        okPressTimestamps.clear()
                        showTvSettingsDialog()
                        return true
                    }
                    val now = System.currentTimeMillis()
                    okPressTimestamps.removeAll { now - it > 1800L }
                    okPressTimestamps.add(now)
                    if (okPressTimestamps.size >= 3) {
                        okPressTimestamps.clear()
                        showTvSettingsDialog()
                        return true
                    }
                    return true
                }

                KeyEvent.KEYCODE_F5,
                KeyEvent.KEYCODE_PROG_GREEN,
                KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> {
                    Toast.makeText(this, "Memuat ulang layar TV...", Toast.LENGTH_SHORT).show()
                    loadTargetTvUrl()
                    return true
                }
            }
        }

        return super.dispatchKeyEvent(event)
    }

    private fun getSavedTvUrl(): String {
        val raw = prefs.getString(BootReceiver.KEY_TV_SERVER_URL, BuildConfig.DEFAULT_TV_URL)
            ?.trim()
            .orEmpty()
        return normalizeTvUrl(raw.ifEmpty { BuildConfig.DEFAULT_TV_URL })
    }

    private fun normalizeTvUrl(url: String): String {
        var clean = url.trim()
        if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
            clean = "https://$clean"
        }
        return if (clean.contains("kiosk=")) {
            clean
        } else if (clean.contains("?")) {
            "$clean&kiosk=1"
        } else {
            "$clean?kiosk=1"
        }
    }

    private fun loadTargetTvUrl() {
        mainHandler.removeCallbacks(retryRunnable)
        pendingErrorOnCurrentLoad = false
        val target = getSavedTvUrl()
        webView.loadUrl(target)
    }

    private fun showWaitingConnectionScreen(view: WebView?) {
        isShowingErrorFallback = true
        val activeUrl = getSavedTvUrl()
        val html = """
            <!DOCTYPE html>
            <html lang="id">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body {
                  background: #14110F;
                  color: #FAF7F2;
                  font-family: sans-serif;
                  height: 100vh;
                  width: 100vw;
                  overflow: hidden;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 32px;
                  text-align: center;
                }
                .panel {
                  background: #1E1B18;
                  border: 2px solid #E8CFA0;
                  border-radius: 24px;
                  padding: 40px 48px;
                  max-width: 760px;
                  width: 100%;
                }
                .badge {
                  display: inline-block;
                  background: #A84A2E;
                  color: #FFFFFF;
                  font-size: 13px;
                  font-weight: bold;
                  padding: 6px 14px;
                  border-radius: 8px;
                  margin-bottom: 18px;
                  letter-spacing: 0.06em;
                }
                h1 {
                  color: #FAF7F2;
                  font-size: 28px;
                  margin-bottom: 12px;
                }
                p {
                  color: #E8CFA0;
                  font-size: 16px;
                  line-height: 1.6;
                  margin-bottom: 16px;
                }
                code {
                  display: block;
                  background: #14110F;
                  border: 1px solid rgba(232, 207, 160, 0.3);
                  color: #FAF7F2;
                  padding: 10px 16px;
                  border-radius: 10px;
                  font-size: 14px;
                  margin-bottom: 18px;
                  word-break: break-all;
                }
                .hint {
                  color: #DFD5C5;
                  font-size: 13px;
                }
              </style>
            </head>
            <body>
              <div class="panel">
                <div class="badge">SMART TV MASJID AL JAMI'AH IAIN MANADO</div>
                <h1>Menghubungkan ke Jaringan Server Masjid...</h1>
                <p>Layar TV akan tersambung dan menampilkan jadwal sholat secara otomatis begitu WiFi atau koneksi internet siap.</p>
                <code>$activeUrl</code>
                <div class="hint">Mencoba menyambung ulang otomatis setiap 10 detik &bull; Tekan tombol OK 3x pada remote untuk membuka Pengaturan TV</div>
              </div>
            </body>
            </html>
        """.trimIndent()

        view?.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null)
        mainHandler.removeCallbacks(retryRunnable)
        mainHandler.postDelayed(retryRunnable, 10_000L)
    }

    private fun showTvSettingsDialog() {
        activeDialog?.dismiss()

        val autoStartEnabled = prefs.getBoolean(BootReceiver.KEY_AUTO_START_BOOT, true)
        val overlayGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(this)
        } else {
            true
        }

        val items = arrayOf(
            "1. Muat Ulang Layar TV Sekarang",
            "2. Auto-Start Saat TV Menyala: ${if (autoStartEnabled) "AKTIF" else "NONAKTIF"}",
            "3. Izin Auto-Start Android TV 10+: ${if (overlayGranted) "SUDAH AKTIF" else "KLIK UNTUK IZINKAN"}",
            "4. Ubah Alamat URL Server TV",
            "5. Keluar ke Menu Utama TV"
        )

        activeDialog = AlertDialog.Builder(this)
            .setTitle("Pengaturan TV Masjid Al Jami'ah")
            .setItems(items) { dialog, which ->
                when (which) {
                    0 -> {
                        dialog.dismiss()
                        Toast.makeText(this, "Memuat ulang layar TV...", Toast.LENGTH_SHORT).show()
                        loadTargetTvUrl()
                    }
                    1 -> {
                        val nextState = !autoStartEnabled
                        prefs.edit().putBoolean(BootReceiver.KEY_AUTO_START_BOOT, nextState).apply()
                        Toast.makeText(
                            this,
                            if (nextState) "Auto-Start saat TV menyala: AKTIF" else "Auto-Start saat TV menyala: NONAKTIF",
                            Toast.LENGTH_SHORT
                        ).show()
                        dialog.dismiss()
                    }
                    2 -> {
                        dialog.dismiss()
                        openOverlayPermissionSettings()
                    }
                    3 -> {
                        dialog.dismiss()
                        showChangeUrlDialog()
                    }
                    4 -> {
                        dialog.dismiss()
                        finishAffinity()
                    }
                }
            }
            .setNegativeButton("Tutup") { dialog, _ ->
                dialog.dismiss()
                enableImmersiveFullscreen()
            }
            .create()

        activeDialog?.show()
    }

    private fun showChangeUrlDialog() {
        val currentRaw = prefs.getString(BootReceiver.KEY_TV_SERVER_URL, "https://aljamiah.iain-manado.ac.id/tv")
            ?: "https://aljamiah.iain-manado.ac.id/tv"
        val displayUrl = currentRaw.replace("?kiosk=1", "").replace("&kiosk=1", "")

        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            val pad = (20 * resources.displayMetrics.density).toInt()
            setPadding(pad, pad / 2, pad, 0)
        }

        val input = EditText(this).apply {
            setText(displayUrl)
            hint = "https://aljamiah.iain-manado.ac.id/tv"
            setSingleLine(true)
        }
        container.addView(input)

        activeDialog = AlertDialog.Builder(this)
            .setTitle("Alamat URL Layar TV Masjid")
            .setMessage("Masukkan alamat halaman /tv server Masjid Al Jami'ah:")
            .setView(container)
            .setPositiveButton("Simpan & Muat") { _, _ ->
                val entered = input.text.toString().trim()
                val finalUrl = if (entered.isEmpty()) {
                    BuildConfig.DEFAULT_TV_URL
                } else {
                    normalizeTvUrl(entered)
                }
                prefs.edit().putString(BootReceiver.KEY_TV_SERVER_URL, finalUrl).apply()
                loadTargetTvUrl()
                enableImmersiveFullscreen()
            }
            .setNeutralButton("Reset Default") { _, _ ->
                prefs.edit().putString(BootReceiver.KEY_TV_SERVER_URL, BuildConfig.DEFAULT_TV_URL).apply()
                loadTargetTvUrl()
                enableImmersiveFullscreen()
            }
            .setNegativeButton("Batal") { _, _ ->
                enableImmersiveFullscreen()
            }
            .create()

        activeDialog?.show()
    }

    private fun openOverlayPermissionSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:$packageName")
                )
                startActivity(intent)
                return
            } catch (_: Exception) {
            }
        }
        try {
            val fallback = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.parse("package:$packageName")
            }
            startActivity(fallback)
        } catch (_: Exception) {
            Toast.makeText(
                this,
                "Buka Pengaturan TV > Aplikasi > TV Masjid Al Jami'ah > Tampilkan di atas aplikasi lain",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    private fun registerNetworkWatchdog() {
        try {
            connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
            connectivityManager?.registerDefaultNetworkCallback(networkCallback)
        } catch (_: Exception) {
        }
    }

    private fun configureAlwaysOnAndWakeScreen() {
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
        }
    }

    private fun enableImmersiveFullscreen() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
}
