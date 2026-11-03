package id.ac.iainmanado.masjid.bendahara

import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageButton
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val dataUri = result.data?.data
            val results = if (dataUri != null) arrayOf(dataUri) else null
            filePathCallback?.onReceiveValue(results)
        } else {
            filePathCallback?.onReceiveValue(null)
        }
        filePathCallback = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val prefs = getSharedPreferences("bendahara_prefs", Context.MODE_PRIVATE)
        val currentServerUrl = prefs.getString("server_url", BuildConfig.DEFAULT_SERVER_URL)
            ?: BuildConfig.DEFAULT_SERVER_URL

        val rootLayout = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(0xFF14110F.toInt())
        }

        webView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(0xFF14110F.toInt())
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = true
            settings.cacheMode = WebSettings.LOAD_DEFAULT
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    val url = request?.url?.toString() ?: return false
                    if (url.startsWith("https://wa.me/") || url.startsWith("whatsapp://")) {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        return true
                    }
                    return false
                }

                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?
                ) {
                    if (request?.isForMainFrame == true) {
                        val activeUrl = prefs.getString("server_url", BuildConfig.DEFAULT_SERVER_URL)
                            ?: BuildConfig.DEFAULT_SERVER_URL
                        val fallbackHtml = """
                            <!DOCTYPE html>
                            <html lang="id">
                            <head>
                              <meta charset="utf-8" />
                              <meta name="viewport" content="width=device-width, initial-scale=1" />
                              <style>
                                body {
                                  background: #14110F;
                                  color: #FAF7F2;
                                  font-family: sans-serif;
                                  display: flex;
                                  flex-direction: column;
                                  justify-content: center;
                                  align-items: center;
                                  min-height: 90vh;
                                  margin: 0;
                                  padding: 24px;
                                  text-align: center;
                                }
                                .card {
                                  background: #1E1B18;
                                  border: 1px solid #A84A2E;
                                  border-radius: 16px;
                                  padding: 24px;
                                  max-width: 360px;
                                }
                                h2 { color: #E8CFA0; margin-top: 0; font-size: 18px; }
                                p { font-size: 13px; color: #DFD5C5; line-height: 1.5; }
                                code {
                                  display: block;
                                  background: #14110F;
                                  padding: 8px;
                                  border-radius: 8px;
                                  color: #E8CFA0;
                                  font-size: 12px;
                                  margin: 12px 0;
                                  word-break: break-all;
                                }
                              </style>
                            </head>
                            <body>
                              <div class="card">
                                <h2>Aplikasi Bendahara Masjid Al Jami'ah</h2>
                                <p>Belum dapat terhubung ke alamat server masjid:</p>
                                <code>$activeUrl</code>
                                <p>Ketuk ikon <strong>Pengaturan (Gear)</strong> di pojok kanan bawah layar untuk mengatur alamat domain atau IP server masjid Anda.</p>
                              </div>
                            </body>
                            </html>
                        """.trimIndent()
                        view?.loadDataWithBaseURL(null, fallbackHtml, "text/html", "UTF-8", null)
                    }
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    this@MainActivity.filePathCallback?.onReceiveValue(null)
                    this@MainActivity.filePathCallback = filePathCallback
                    val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type = "image/*"
                    }
                    fileChooserLauncher.launch(Intent.createChooser(intent, "Pilih Foto Nota / Bukti"))
                    return true
                }
            }
        }

        // Tombol Kecil Pengaturan URL Server (Pojok Kanan Bawah di atas Bottom Nav)
        val serverConfigBtn = ImageButton(this).apply {
            setImageResource(android.R.drawable.ic_menu_preferences)
            setBackgroundColor(0xCC2C2520.toInt())
            val sizePx = (42 * resources.displayMetrics.density).toInt()
            val marginPx = (14 * resources.displayMetrics.density).toInt()
            val bottomMarginPx = (78 * resources.displayMetrics.density).toInt()
            layoutParams = FrameLayout.LayoutParams(sizePx, sizePx).apply {
                gravity = Gravity.BOTTOM or Gravity.END
                setMargins(marginPx, marginPx, marginPx, bottomMarginPx)
            }
            setOnClickListener {
                showServerUrlDialog()
            }
        }

        rootLayout.addView(webView)
        rootLayout.addView(serverConfigBtn)
        setContentView(rootLayout)

        webView.loadUrl(currentServerUrl)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    private fun showServerUrlDialog() {
        val prefs = getSharedPreferences("bendahara_prefs", Context.MODE_PRIVATE)
        val savedUrl = prefs.getString("server_url", BuildConfig.DEFAULT_SERVER_URL)
            ?: BuildConfig.DEFAULT_SERVER_URL

        val input = EditText(this).apply {
            setText(savedUrl)
            hint = "https://domain-masjid.ac.id/bendahara"
        }

        AlertDialog.Builder(this)
            .setTitle("Alamat Server Masjid")
            .setMessage("Masukkan URL halaman /bendahara pada server Masjid Al Jami'ah:")
            .setView(input)
            .setPositiveButton("Simpan & Muat") { _, _ ->
                val nextUrl = input.text.toString().trim().ifEmpty { BuildConfig.DEFAULT_SERVER_URL }
                prefs.edit().putString("server_url", nextUrl).apply()
                webView.loadUrl(nextUrl)
            }
            .setNegativeButton("Batal", null)
            .show()
    }
}
