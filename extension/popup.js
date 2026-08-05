document.addEventListener('DOMContentLoaded', async () => {
    const scannedEl = document.getElementById('scanned-count');
    const threatsEl = document.getElementById('threats-count');
    const whitelistBtn = document.getElementById('whitelist-btn');
    const statusDot = document.getElementById('server-status-dot');
    const statusText = document.getElementById('server-status-text');

    chrome.storage.local.get(['sitesScanned', 'threatsBlocked'], (data) => {
        scannedEl.textContent = data.sitesScanned || 0;
        threatsEl.textContent = data.threatsBlocked || 0;
    });

    try {
        const response = await fetch('http://localhost:8000/docs');
        if (response.ok) {
            statusDot.style.backgroundColor = '#4CAF50'; 
            statusText.textContent = "AI Server Online";
        } else {
            throw new Error('Server returned non-200');
        }
    } catch (error) {
        statusDot.style.backgroundColor = '#f44336'; 
        statusText.textContent = "AI Server Offline";
    }

    whitelistBtn.addEventListener('click', async () => {
        
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab && tab.url) {
            const url = new URL(tab.url);
            const domain = url.hostname;

            alert(`✅ ${domain} has been added to your local whitelist.`);
        }
    });
});