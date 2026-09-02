console.log("[PhishGuard] Service Worker initialized.");

async function sendMessageWithRetry(tabId, message, retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(tabId, message, (res) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(res);
                    }
                });
            });
            console.log("[PhishGuard] Tab acknowledged the warning:", response);
            return; 
        } catch (error) {
            console.warn(`[PhishGuard] Attempt ${i + 1} failed. Tab not ready: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    console.warn("[PhishGuard] Failed to send message after maximum retries.");
}

async function updateStats(isThreat) {
    
    const data = await chrome.storage.local.get(['sitesScanned', 'threatsBlocked']);
    
    
    let scanned = (data.sitesScanned || 0) + 1;
    let threats = data.threatsBlocked || 0;

    if (isThreat) {
        threats += 1;
    }

    await chrome.storage.local.set({ 
        sitesScanned: scanned, 
        threatsBlocked: threats 
    });
    
    console.log(`[PhishGuard] Stats updated - Scanned: ${scanned}, Threats: ${threats}`);
}

chrome.webNavigation.onCompleted.addListener(async (details) => {
    if (details.frameId !== 0) return;

    const url = details.url;
    if (url.startsWith('chrome://') || url.startsWith('about:')) return;

    console.log(`[PhishGuard] Intercepted URL: ${url}`);

    try {
        const response = await fetch('http://127.0.0.1:8000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();
        console.log(`[PhishGuard] AI Prediction received:`, data);

        //Update statistics every time we analyze a URL
        await updateStats(data.is_phishing);

        if (data.is_phishing) {
            console.log(`[PhishGuard] Threat detected! Alerting content script...`);
            await sendMessageWithRetry(details.tabId, { action: "SHOW_WARNING", url: url });
        }
    } catch (error) {
        console.warn("[PhishGuard] Backend unreachable.", error);
    }
});