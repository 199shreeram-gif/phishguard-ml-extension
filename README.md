PhishGuard: Enterprise-Grade Real-Time Phishing Detection System

PhishGuard is an advanced, production-ready cybersecurity solution designed to protect users from malicious phishing links in real-time. It combines a high-performance FastAPI machine learning backend with an autonomous Manifest V3 Chrome Extension frontend, utilizing a multi-layered defense-in-depth security model.

Key Architectural Features

1. Defense-in-Depth Analysis Engine

Trusted Domain Whitelist: Instantly bypasses analysis for verified, safe domains (e.g., Google, GitHub) to maximize performance and minimize overhead.

Asynchronous URL Unrolling: Handles shortened or masked URLs (e.g., TinyURL, Bitly) by performing async redirect resolution (HEAD requests) to uncover the final target destination before analysis.

Machine Learning Core: Powered by a scikit-learn model serialized via joblib, evaluating text and structural features to return a granular threat confidence score.

Heuristic Override Layer: Hardened rule-based overrides that automatically intercept high-risk structural anomalies (such as raw IP addresses combined with excessive subdomain dots) to guarantee a high-confidence catch rate on severe threats.

2. Enterprise Security & Performance Hardening

In-Memory LRU Caching: Utilizes Python's lru_cache to cache recent URL evaluations, dropping lookup latency to near-zero milliseconds for frequently visited domains.

API Rate Limiting (SlowAPI): Mitigates denial-of-service and brute-force scraping attempts by enforcing strict rate-limiting policies (e.g., 60 requests/minute per client IP), gracefully returning HTTP 429 Too Many Requests responses when breached.

CORS Configuration: Securely handles cross-origin resource sharing to facilitate seamless communication between the browser extension and the local or remote API server.

Tech Stack

Backend Framework: FastAPI, Uvicorn (ASGI Server)

Machine Learning: Scikit-learn, Joblib, Pydantic

Security & Middleware: SlowAPI (Rate Limiting), LRU Caching

Frontend: Chrome Extension (Manifest V3), JavaScript (ES6+), HTML5, CSS3

Project Directory Structure

Phishing-detector-project/
│
├── backend/
│   ├── app.py              # FastAPI application, routes, and middleware
│   ├── model.pkl           # Serialized machine learning model
│   └── requirements.txt    # Backend dependencies
│
└── extension/              # Chrome Extension frontend
    ├── manifest.json       # Extension configuration (Manifest V3)
    ├── popup.html          # Extension popup UI structure
    ├── popup.css           # Modern enterprise styling
    ├── popup.js            # Popup logic and API integration
    └── content.js          # Autonomous background page scanner

Installation & Setup Guide

Step 1: Clone the Repository & Configure Backend

Navigate to the backend directory:

cd Phishing-detector-project/backend

Create and activate a Python virtual environment:

python -m venv venv
..\venv\Scripts\activate   # On Windows PowerShell

Install the required dependencies inside the isolated environment:

python -m pip install fastapi uvicorn slowapi joblib scikit-learn requests pydantic

Step 2: Run the FastAPI Server

Start the application server using Uvicorn with automatic reloading enabled:

python -m uvicorn app:app --reload

The API server will boot up successfully on http://127.0.0.1:8000. You can access the interactive Swagger documentation at http://127.0.0.1:8000/docs.

Step 3: Load the Chrome Extension

Open Google Chrome and navigate to chrome://extensions/.

Enable Developer mode using the toggle switch in the top-right corner.

Click Load unpacked in the top-left corner.

Select your project's extension folder (Phishing-detector-project/extension).

API Reference

Analyze URL Endpoint

Property

Value

URL

/api/analyze

Method

POST

Content-Type

application/json

Request Body:

{
  "url": "https://example.com"
}

Response Body:

{
  "url": "https://example.com",
  "final_destination": "https://example.com",
  "is_phishing": false,
  "confidence": 0.05,
  "whitelisted": true,
  "cached_response": false
}
