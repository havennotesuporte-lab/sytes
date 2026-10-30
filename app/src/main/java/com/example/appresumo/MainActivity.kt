package com.example.appresumo

import android.annotation.SuppressLint
import android.content.Context
import android.os.Bundle
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.webkit.WebViewAssetLoader
import com.example.appresumo.ui.theme.AppResumoTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        enableEdgeToEdge()
        setContent {
            AppResumoTheme {
                AppWebViewScreen()
            }
        }
    }
}

@Composable
fun AppWebViewScreen() {
    var webViewInstance by remember { mutableStateOf<WebView?>(null) }

    BackHandler(enabled = webViewInstance?.canGoBack() == true) {
        webViewInstance?.goBack()
    }

    AndroidView(
        factory = { context ->
            criarWebView(context).also { webViewInstance = it }
        },
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
    )
}

@SuppressLint("SetJavaScriptEnabled")
private fun criarWebView(context: Context): WebView {
    val webView = WebView(context).apply {
        layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        )
    }
    configurarWebSettings(webView)
    configurarWebViewClient(context, webView)
    webView.loadUrl("https://appassets.androidplatform.net/assets/web/index.html")
    return webView
}

@SuppressLint("SetJavaScriptEnabled")
private fun configurarWebSettings(webView: WebView) {
    with(webView.settings) {
        javaScriptEnabled = true
        domStorageEnabled = true
        allowFileAccess = false
    }
}

private fun configurarWebViewClient(context: Context, webView: WebView) {
    val assetLoader = WebViewAssetLoader.Builder()
        .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context))
        .build()

    webView.webViewClient = object : WebViewClient() {
        override fun shouldInterceptRequest(
            view: WebView,
            request: WebResourceRequest
        ): WebResourceResponse? {
            return assetLoader.shouldInterceptRequest(request.url)
        }
    }
}
