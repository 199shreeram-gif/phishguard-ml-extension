document.addEventListener('DOMContentLoaded', async () => {
    const urlDisplay = document.getElementById('current-url');
    const statusCard = document.getElementById('status-card');
    const statusText = document.getElementById('status-text');
    const confidenceText = document.getElementById('confidence-text');

    // 1. Get the current active tab
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Display shortened URL for aesthetic reasons
    let shortUrl = tab.url.length > 50 ? tab.url.substring(0, 50) + "..." : tab.url;
    urlDisplay.textContent = shortUrl;

    try {
        // 2. Ping the FastAPI Backend
        let response = await fetch('http://127.0.0.1:8000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: tab.url })
        });
        
        let data = await response.json();

        // 3. Update UI based on Machine Learning prediction
        if (data.is_phishing) {
            statusCard.className = 'status-card danger';
            statusText.textContent = '⚠️ Phishing Threat Detected';
            confidenceText.textContent = `Confidence: ${(data.confidence * 100).toFixed(1)}%`;
        } else {
            statusCard.className = 'status-card safe';
            statusText.textContent = '✅ Safe Website';
            if (data.whitelisted) {
                confidenceText.textContent = "Verified by Trusted Domain Whitelist";
            } else {
                confidenceText.textContent = `Confidence: ${(data.confidence * 100).toFixed(1)}%`;
            }
        }
    } catch (error) {
        statusCard.className = 'status-card neutral';
        statusText.textContent = 'API Offline';
        confidenceText.textContent = 'Please start the Uvicorn server.';
    }
});