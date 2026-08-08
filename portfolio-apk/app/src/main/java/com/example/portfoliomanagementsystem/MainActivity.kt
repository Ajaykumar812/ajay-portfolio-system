package com.example.portfoliomanagementsystem

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.*
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.portfoliomanagementsystem.theme.PortfolioManagementSystemTheme
import kotlinx.coroutines.delay

// ─── Brand Colors (matching portfolio website) ───────────────────────────────
val DarkBg       = Color(0xFF0A0E1A)
val CardBg       = Color(0xFF111827)
val NavBg        = Color(0xFF0D1321)
val CyanPrimary  = Color(0xFF00D4FF)
val PurpleAccent = Color(0xFF8B5CF6)
val SuccessGreen = Color(0xFF3FB950)
val White        = Color(0xFFFFFFFF)
val White60      = Color(0x99FFFFFF)
val White30      = Color(0x4DFFFFFF)
val BorderColor  = Color(0x1AFFFFFF)

// ─── Navigation Tabs ─────────────────────────────────────────────────────────
data class NavTab(
    val label: String,
    val icon: String,
    val url: String
)

val BASE_URL = "http://ajaykumardotandaimldeveloper.runasp.net"

val navTabs = listOf(
    NavTab("Home",       "🏠",  BASE_URL),
    NavTab("Skills",     "⚡",  "$BASE_URL#skills"),
    NavTab("Projects",   "💼",  "$BASE_URL#projects"),
    NavTab("Blog",       "📝",  "$BASE_URL#blog"),
    NavTab("Contact",    "📬",  "$BASE_URL#contact"),
)

// ─── Screens ──────────────────────────────────────────────────────────────────
enum class Screen { SPLASH, MAIN }

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            PortfolioManagementSystemTheme {
                PortfolioApp()
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun PortfolioApp() {
    var currentScreen by remember { mutableStateOf(Screen.SPLASH) }
    var webViewRef    by remember { mutableStateOf<WebView?>(null) }

    BackHandler(enabled = webViewRef?.canGoBack() == true) {
        webViewRef?.goBack()
    }

    when (currentScreen) {
        Screen.SPLASH -> SplashScreen(onFinished = { currentScreen = Screen.MAIN })
        Screen.MAIN   -> MainScreen(onWebViewReady = { webViewRef = it })
    }
}

// ─── Splash Screen ────────────────────────────────────────────────────────────
@Composable
fun SplashScreen(onFinished: () -> Unit) {
    val pulseScale by rememberInfiniteTransition(label = "pulse").animateFloat(
        initialValue = 1f,
        targetValue  = 1.12f,
        animationSpec = infiniteRepeatable(
            animation  = tween(900, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    var contentAlpha by remember { mutableStateOf(0f) }
    val alphaAnim by animateFloatAsState(
        targetValue   = contentAlpha,
        animationSpec = tween(800),
        label         = "alpha"
    )

    LaunchedEffect(Unit) {
        contentAlpha = 1f
        delay(2800)
        onFinished()
    }

    Box(
        modifier           = Modifier.fillMaxSize().background(DarkBg),
        contentAlignment   = Alignment.Center
    ) {
        // Background glow
        Box(
            modifier = Modifier
                .size(300.dp)
                .background(
                    Brush.radialGradient(
                        colors = listOf(CyanPrimary.copy(alpha = 0.12f), Color.Transparent)
                    )
                )
        )

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier            = Modifier.alpha(alphaAnim)
        ) {
            // Logo — AK initials in gradient circle
            Box(
                modifier = Modifier
                    .size(110.dp)
                    .scale(pulseScale)
                    .clip(CircleShape)
                    .background(Brush.linearGradient(listOf(CyanPrimary, PurpleAccent))),
                contentAlignment = Alignment.Center
            ) {
                Text("AK", fontSize = 38.sp, fontWeight = FontWeight.ExtraBold,
                    color = DarkBg, letterSpacing = 3.sp)
            }

            Spacer(Modifier.height(28.dp))

            Text("AJAY KUMAR", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold,
                color = White, letterSpacing = 5.sp)

            Spacer(Modifier.height(8.dp))

            Text("</> Full Stack  •  AI / ML Developer",
                fontSize = 13.sp, color = CyanPrimary,
                fontWeight = FontWeight.SemiBold, letterSpacing = 1.sp,
                textAlign = TextAlign.Center)

            Spacer(Modifier.height(16.dp))

            // Tech stack tags
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("ASP.NET", "SQL Server", "AI/ML").forEach { tag ->
                    Box(
                        modifier = Modifier
                            .background(CyanPrimary.copy(alpha = 0.12f), RoundedCornerShape(20.dp))
                            .padding(horizontal = 12.dp, vertical = 4.dp)
                    ) {
                        Text(tag, fontSize = 11.sp, color = CyanPrimary, fontWeight = FontWeight.Medium)
                    }
                }
            }

            Spacer(Modifier.height(48.dp))
            LoadingDots()

            Spacer(Modifier.height(12.dp))
            Text("Loading portfolio...", fontSize = 12.sp, color = White30)
        }
    }
}

// ─── Animated Loading Dots ────────────────────────────────────────────────────
@Composable
fun LoadingDots() {
    val tr = rememberInfiniteTransition(label = "dots")
    val scales = listOf(0, 150, 300).map { delay ->
        tr.animateFloat(
            initialValue = 0.4f, targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation  = tween(600, delayMillis = delay, easing = FastOutSlowInEasing),
                repeatMode = RepeatMode.Reverse
            ),
            label = "d$delay"
        )
    }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        scales.forEach {
            Box(Modifier.size(10.dp).scale(it.value).clip(CircleShape).background(CyanPrimary))
        }
    }
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun MainScreen(onWebViewReady: (WebView) -> Unit) {
    val context         = LocalContext.current
    var isLoading       by remember { mutableStateOf(true) }
    var hasError        by remember { mutableStateOf(false) }
    var loadProgress    by remember { mutableStateOf(0) }
    var selectedTab     by remember { mutableStateOf(0) }
    var showTopBar      by remember { mutableStateOf(true) }
    var currentUrl      by remember { mutableStateOf(BASE_URL) }
    var webView         by remember { mutableStateOf<WebView?>(null) }

    val targetUrl = navTabs[selectedTab].url

    Scaffold(
        containerColor = DarkBg,
        topBar = {
            AnimatedVisibility(visible = showTopBar, enter = slideInVertically(), exit = slideOutVertically()) {
                TopAppBar(currentUrl = currentUrl,
                    onShare = {
                        val intent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_TEXT, currentUrl)
                        }
                        context.startActivity(Intent.createChooser(intent, "Share Portfolio"))
                    },
                    onBrowser = {
                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(currentUrl)))
                    },
                    loadProgress = loadProgress,
                    isLoading    = isLoading
                )
            }
        },
        bottomBar = {
            BottomNavBar(
                tabs        = navTabs,
                selectedIdx = selectedTab,
                onSelect    = { idx ->
                    if (idx != selectedTab) {
                        selectedTab = idx
                        isLoading   = true
                        hasError    = false
                        webView?.loadUrl(navTabs[idx].url)
                    }
                }
            )
        }
    ) { innerPadding ->
        Box(
            Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(DarkBg)
        ) {
            // WebView
            AndroidView(
                factory = { ctx ->
                    WebView(ctx).apply {
                        layoutParams = ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                        webViewClient = object : WebViewClient() {
                            override fun onPageStarted(v: WebView?, url: String?, fav: android.graphics.Bitmap?) {
                                isLoading  = true
                                hasError   = false
                                currentUrl = url ?: BASE_URL
                            }
                            override fun onPageFinished(v: WebView?, url: String?) {
                                isLoading = false
                                currentUrl = url ?: BASE_URL
                            }
                            override fun onReceivedError(v: WebView?, req: WebResourceRequest?, err: WebResourceError?) {
                                if (req?.isForMainFrame == true) { isLoading = false; hasError = true }
                            }
                            override fun shouldOverrideUrlLoading(v: WebView?, req: WebResourceRequest?) = false
                        }
                        webChromeClient = object : WebChromeClient() {
                            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                                loadProgress = newProgress
                            }
                        }
                        settings.apply {
                            javaScriptEnabled    = true
                            domStorageEnabled    = true
                            databaseEnabled      = true
                            loadWithOverviewMode = true
                            useWideViewPort      = true
                            setSupportZoom(true)
                            builtInZoomControls  = true
                            displayZoomControls  = false
                            mixedContentMode     = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                            cacheMode            = WebSettings.LOAD_DEFAULT
                        }
                        loadUrl(BASE_URL)
                        webView = this
                        onWebViewReady(this)
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            // ── Loading Bar (top edge) ────────────────────────────────────
            if (isLoading && !hasError) {
                Box(
                    Modifier
                        .fillMaxWidth()
                        .height(3.dp)
                        .background(BorderColor)
                        .align(Alignment.TopCenter)
                ) {
                    Box(
                        Modifier
                            .fillMaxHeight()
                            .fillMaxWidth(fraction = loadProgress / 100f)
                            .background(Brush.linearGradient(listOf(CyanPrimary, PurpleAccent)))
                    )
                }
            }

            // ── Error Screen ──────────────────────────────────────────────
            AnimatedVisibility(
                visible = hasError,
                enter   = fadeIn() + slideInVertically { it / 2 },
                exit    = fadeOut()
            ) {
                ErrorScreen(
                    onRetry = {
                        hasError  = false
                        isLoading = true
                        webView?.loadUrl(navTabs[selectedTab].url)
                    },
                    onBrowser = {
                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(BASE_URL)))
                    }
                )
            }
        }
    }
}

// ─── Top App Bar ──────────────────────────────────────────────────────────────
@Composable
fun TopAppBar(
    currentUrl: String,
    onShare: () -> Unit,
    onBrowser: () -> Unit,
    loadProgress: Int,
    isLoading: Boolean
) {
    Column(
        Modifier
            .fillMaxWidth()
            .background(NavBg)
    ) {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalAlignment     = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Brand
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Box(
                    Modifier.size(36.dp).clip(CircleShape)
                        .background(Brush.linearGradient(listOf(CyanPrimary, PurpleAccent))),
                    contentAlignment = Alignment.Center
                ) {
                    Text("AK", fontSize = 13.sp, fontWeight = FontWeight.ExtraBold, color = DarkBg)
                }
                Column {
                    Text("Ajay Kumar", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = White)
                    Text(
                        text = if (currentUrl.length > 38) currentUrl.take(38) + "…" else currentUrl,
                        fontSize = 10.sp, color = White30
                    )
                }
            }

            // Action buttons
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                IconBtn("🔗", onShare)
                IconBtn("🌐", onBrowser)
            }
        }

        // Thin progress line
        if (isLoading) {
            Box(Modifier.fillMaxWidth().height(2.dp).background(BorderColor)) {
                val animProg by animateFloatAsState(loadProgress / 100f, label = "prog")
                Box(
                    Modifier.fillMaxHeight().fillMaxWidth(animProg)
                        .background(Brush.linearGradient(listOf(CyanPrimary, PurpleAccent)))
                )
            }
        }

        Divider(color = BorderColor, thickness = 1.dp)
    }
}

@Composable
fun IconBtn(icon: String, onClick: () -> Unit) {
    Box(
        Modifier
            .size(36.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(White.copy(alpha = 0.05f))
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(icon, fontSize = 16.sp)
    }
}

// ─── Bottom Navigation Bar ────────────────────────────────────────────────────
@Composable
fun BottomNavBar(tabs: List<NavTab>, selectedIdx: Int, onSelect: (Int) -> Unit) {
    Column(Modifier.fillMaxWidth().background(NavBg)) {
        Divider(color = BorderColor, thickness = 1.dp)
        Row(
            Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp)
                .navigationBarsPadding(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            tabs.forEachIndexed { idx, tab ->
                val isSelected = idx == selectedIdx
                val scale by animateFloatAsState(if (isSelected) 1.05f else 1f, label = "tabScale")

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .scale(scale)
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isSelected) CyanPrimary.copy(alpha = 0.12f) else Color.Transparent)
                        .clickable { onSelect(idx) }
                        .padding(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text(tab.icon, fontSize = 20.sp)
                    Spacer(Modifier.height(2.dp))
                    Text(
                        text     = tab.label,
                        fontSize = 10.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        color    = if (isSelected) CyanPrimary else White60
                    )
                    // Active indicator dot
                    if (isSelected) {
                        Spacer(Modifier.height(3.dp))
                        Box(Modifier.size(4.dp).clip(CircleShape).background(CyanPrimary))
                    }
                }
            }
        }
    }
}

// ─── Error Screen ─────────────────────────────────────────────────────────────
@Composable
fun ErrorScreen(onRetry: () -> Unit, onBrowser: () -> Unit) {
    Box(
        Modifier.fillMaxSize().background(DarkBg),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(36.dp)
        ) {
            // Animated warning icon
            val warningScale by rememberInfiniteTransition(label = "warn").animateFloat(
                1f, 1.08f,
                animationSpec = infiniteRepeatable(tween(800, easing = FastOutSlowInEasing), RepeatMode.Reverse),
                label = "ws"
            )
            Box(
                Modifier.size(90.dp).scale(warningScale).clip(CircleShape)
                    .background(CardBg),
                contentAlignment = Alignment.Center
            ) {
                Text("⚠️", fontSize = 40.sp)
            }

            Spacer(Modifier.height(24.dp))

            Text("No Connection", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = White)
            Spacer(Modifier.height(10.dp))
            Text(
                "Could not reach the portfolio.\nCheck your internet and try again.",
                fontSize = 14.sp, color = White60, textAlign = TextAlign.Center, lineHeight = 22.sp
            )

            Spacer(Modifier.height(36.dp))

            // Retry button (cyan→purple gradient)
            GradientButton("🔄  Retry", onClick = onRetry)

            Spacer(Modifier.height(12.dp))

            // Open in browser secondary
            TextButton(onClick = onBrowser) {
                Text("Open in Browser", color = CyanPrimary, fontSize = 14.sp)
            }
        }
    }
}

// ─── Reusable Gradient Button ─────────────────────────────────────────────────
@Composable
fun GradientButton(text: String, onClick: () -> Unit) {
    Button(
        onClick    = onClick,
        modifier   = Modifier.height(52.dp).width(180.dp),
        shape      = RoundedCornerShape(14.dp),
        colors     = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
        contentPadding = PaddingValues(0.dp)
    ) {
        Box(
            Modifier
                .fillMaxSize()
                .background(
                    Brush.linearGradient(listOf(CyanPrimary, PurpleAccent)),
                    RoundedCornerShape(14.dp)
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(text, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = DarkBg)
        }
    }
}
