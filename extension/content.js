console.log("[PhishGuard] Content script injected and scanning page...");

(async () => {
    try {
        const currentUrl = window.location.href;
        
        // Skip internal chrome pages or local development dashboard
        if (currentUrl.startsWith("chrome://") || currentUrl.includes("127.0.0.1") || currentUrl.includes("localhost")) {
            return;
        }

        // Send current tab URL to your FastAPI backend
        const response = await fetch('http://127.0.0.1:8000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: currentUrl })
        });
        
        const data = await response.json();

        // If the ML model or heuristic override flags it, show the banner
        if (data.is_phishing) {
            showWarningBanner(data.confidence);
        }

    } catch (error) {
        console.log("[PhishGuard] Backend is offline or unreachable:", error);
    }
})();

function showWarningBanner(confidence) {
    const showBanner = () => {
        if (document.getElementById('phishguard-banner')) return; 
        
        const banner = document.createElement('div');
        banner.id = 'phishguard-banner';
        Object.assign(banner.style, {
            position: 'fixed', top: '0', left: '0', width: '100%',
            backgroundColor: '#d32f2f', color: 'white', textAlign: 'center',
            padding: '15px', zIndex: '2147483647', 
            fontSize: '18px', fontWeight: 'bold', fontFamily: 'sans-serif',
            boxShadow: '0 4px 6px rgba(0,0,0,0.5)'
        });
        banner.textContent = `⚠️ PhishGuard WARNING: Potential phishing threat detected! (Confidence: ${(confidence * 100).toFixed(1)}%)`;
        
        document.body.prepend(banner);
        console.log("[PhishGuard] Warning banner injected successfully!");
    };

    if (document.body) {
        showBanner();
    } else {
        window.addEventListener('DOMContentLoaded', showBanner);
    }
}