package com.familia.inicio

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Bundle
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.webkit.WebViewAssetLoader
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream

/**
 * Contenedor nativo de la interfaz web (carpeta assets).
 * Expone window.AndroidBridge: dial, listApps, appIcon, openApp, saveFile.
 */
class MainActivity : Activity() {

    private lateinit var web: WebView
    private var fileCb: ValueCallback<Array<Uri>>? = null
    private var pendingDial: String? = null
    private var pendingSave: String? = null

    private companion object {
        const val RC_CALL = 1
        const val RC_FILE = 7
        const val RC_SAVE = 8
        const val HOST = "appassets.androidplatform.net"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val loader = WebViewAssetLoader.Builder()
            .setDomain(HOST)
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        web = WebView(this)
        setContentView(web)

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
        }
        web.addJavascriptInterface(Bridge(), "AndroidBridge")

        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView, request: WebResourceRequest
            ): WebResourceResponse? = loader.shouldInterceptRequest(request.url)

            override fun shouldOverrideUrlLoading(
                view: WebView, request: WebResourceRequest
            ): Boolean {
                if (request.url.host == HOST) return false
                openExternal(request.url.toString())
                return true
            }
        }

        web.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                w: WebView, cb: ValueCallback<Array<Uri>>, params: FileChooserParams
            ): Boolean {
                fileCb?.onReceiveValue(null)
                fileCb = cb
                return try {
                    startActivityForResult(params.createIntent(), RC_FILE)
                    true
                } catch (e: Exception) {
                    fileCb = null
                    false
                }
            }
        }

        web.loadUrl("https://$HOST/assets/index.html")

        if (checkSelfPermission(Manifest.permission.CALL_PHONE) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(Manifest.permission.CALL_PHONE), RC_CALL)
        }
    }

    // Al pulsar Inicio de Android con la app ya abierta: volver a la pantalla principal
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (intent.hasCategory(Intent.CATEGORY_HOME)) {
            web.evaluateJavascript("window.goHome&&window.goHome()", null)
        }
    }

    // Como launcher, Atrás nunca cierra la app
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (web.canGoBack()) web.goBack()
    }

    private fun openExternal(url: String) {
        try {
            if (url.startsWith("intent:")) {
                val i = Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
                try {
                    startActivity(i)
                } catch (e: Exception) {
                    val fb = i.getStringExtra("browser_fallback_url")
                    if (fb != null) startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(fb)))
                    else toast("No se pudo abrir.")
                }
            } else {
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
            }
        } catch (e: Exception) {
            toast("No se pudo abrir.")
        }
    }

    private fun toast(t: String) = Toast.makeText(this, t, Toast.LENGTH_LONG).show()

    private fun doDial(n: String) {
        val uri = Uri.fromParts("tel", n, null)
        if (checkSelfPermission(Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
            try {
                startActivity(Intent(Intent.ACTION_CALL, uri))
                return
            } catch (e: Exception) { /* cae al marcador */ }
        } else {
            pendingDial = n
            requestPermissions(arrayOf(Manifest.permission.CALL_PHONE), RC_CALL)
            return
        }
        try { startActivity(Intent(Intent.ACTION_DIAL, uri)) } catch (e: Exception) { toast("No se pudo llamar.") }
    }

    override fun onRequestPermissionsResult(rc: Int, perms: Array<out String>, res: IntArray) {
        super.onRequestPermissionsResult(rc, perms, res)
        if (rc != RC_CALL) return
        val n = pendingDial ?: return
        pendingDial = null
        val ok = res.isNotEmpty() && res[0] == PackageManager.PERMISSION_GRANTED
        val uri = Uri.fromParts("tel", n, null)
        try {
            startActivity(Intent(if (ok) Intent.ACTION_CALL else Intent.ACTION_DIAL, uri))
        } catch (e: Exception) { toast("No se pudo llamar.") }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(rc: Int, res: Int, data: Intent?) {
        when (rc) {
            RC_FILE -> {
                fileCb?.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data))
                fileCb = null
            }
            RC_SAVE -> {
                val uri = data?.data
                val txt = pendingSave
                pendingSave = null
                if (res == RESULT_OK && uri != null && txt != null) {
                    try {
                        contentResolver.openOutputStream(uri)?.use { it.write(txt.toByteArray(Charsets.UTF_8)) }
                        toast("Copia guardada.")
                    } catch (e: Exception) { toast("No se pudo guardar la copia.") }
                }
            }
            else -> super.onActivityResult(rc, res, data)
        }
    }

    private fun iconB64(d: Drawable, size: Int): String {
        val dr = d.constantState?.newDrawable()?.mutate() ?: d
        val bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        dr.setBounds(0, 0, size, size)
        dr.draw(Canvas(bmp))
        val out = ByteArrayOutputStream()
        bmp.compress(Bitmap.CompressFormat.PNG, 100, out)
        return "data:image/png;base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
    }

    inner class Bridge {
        @JavascriptInterface
        fun dial(n: String) { runOnUiThread { doDial(n) } }

        @JavascriptInterface
        fun openApp(pkg: String): Boolean {
            val i = packageManager.getLaunchIntentForPackage(pkg) ?: return false
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            runOnUiThread { try { startActivity(i) } catch (e: Exception) { toast("No se pudo abrir.") } }
            return true
        }

        /** [{label, pkg, icon(dataURL 96px)}] de todas las apps con icono de lanzador, ordenadas por nombre */
        @JavascriptInterface
        fun listApps(): String {
            val q = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
            val list = packageManager.queryIntentActivities(q, 0)
                .filter { it.activityInfo.packageName != packageName }
                .distinctBy { it.activityInfo.packageName }
                .sortedBy { it.loadLabel(packageManager).toString().lowercase() }
            val arr = JSONArray()
            for (ri in list) {
                arr.put(JSONObject().apply {
                    put("label", ri.loadLabel(packageManager).toString())
                    put("pkg", ri.activityInfo.packageName)
                    put("icon", iconB64(ri.loadIcon(packageManager), 96))
                })
            }
            return arr.toString()
        }

        /** Icono grande (192px) de una app, para el cuadro del inicio */
        @JavascriptInterface
        fun appIcon(pkg: String): String = try {
            iconB64(packageManager.getApplicationIcon(pkg), 192)
        } catch (e: Exception) { "" }

        /** Guarda un archivo de texto (copia de seguridad) donde elija la persona */
        @JavascriptInterface
        fun saveFile(name: String, data: String) {
            pendingSave = data
            runOnUiThread {
                val i = Intent(Intent.ACTION_CREATE_DOCUMENT)
                    .addCategory(Intent.CATEGORY_OPENABLE)
                    .setType("application/json")
                    .putExtra(Intent.EXTRA_TITLE, name)
                try { startActivityForResult(i, RC_SAVE) } catch (e: Exception) { toast("No se pudo guardar la copia.") }
            }
        }
    }
}
