console.log("[PhishGuard] Content script injected and listening.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[PhishGuard] Message received from background:", message);

    if (message.action === "SHOW_WARNING") {
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
            banner.textContent = "⚠️ WARNING: This website has been flagged as a potential phishing threat.";
            
            document.body.prepend(banner);
            console.log("[PhishGuard] Banner injected successfully!");
        };

        if (document.body) {
            showBanner();
        } else {
            window.addEventListener('DOMContentLoaded', showBanner);
        }
 
        sendResponse({ status: "success" });
    }
});