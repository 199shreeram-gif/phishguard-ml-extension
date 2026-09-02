from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from functools import lru_cache
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import urllib.parse
import re
import joblib
import os
import requests

# ==========================================
# 🛡️ INITIALIZE RATE LIMITER
# Uses the user's IP address to track request counts.
# ==========================================
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Live PhishGuard API")

# Register the rate limiter with FastAPI
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Allow requests from the Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ml_model = None

@app.on_event("startup")
def load_model():
    global ml_model
    model_path = "phishing_model.joblib"
    
    if os.path.exists(model_path):
        ml_model = joblib.load(model_path)
        print("[SUCCESS] ML Model loaded into memory successfully.")
    else:
        print("[ERROR] Warning: Model file not found! Run train_model.py first.")

class URLRequest(BaseModel):
    url: str

def unroll_url(url: str) -> str:
    try:
        response = requests.head(url, allow_redirects=True, timeout=3)
        return response.url
    except requests.RequestException:
        return url

def extract_features(url: str) -> list:
    decoded_url = urllib.parse.unquote(url) 
    url_length = len(decoded_url)
    has_ip = 1 if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', decoded_url) else 0
    num_dots = decoded_url.count('.')
    return [[url_length, has_ip, num_dots]]

WHITELIST = [
    "google.com", "google.co.in", "bing.com", "youtube.com", 
    "wikipedia.org", "github.com", "microsoft.com", "apple.com",
    "linkedin.com", "stackoverflow.com", "localhost", "127.0.0.1"
]

@lru_cache(maxsize=1024)
def process_and_predict(raw_url: str):
    final_url = unroll_url(raw_url)

    parsed = urllib.parse.urlparse(final_url)
    domain = parsed.netloc.lower().split(':')[0]
    if domain.startswith("www."):
        domain = domain[4:]
    
    if any(domain == wl or domain.endswith("." + wl) for wl in WHITELIST):
        return {
            "url": raw_url,
            "final_destination": final_url,
            "is_phishing": False,
            "confidence": 1.0,
            "features_extracted": {
                "length_url": len(final_url),
                "domain_in_ip": 0,
                "qty_dot_url": final_url.count('.')
            },
            "whitelisted": True,
            "cached_response": True 
        }

    features = extract_features(final_url)
    prediction = ml_model.predict(features)[0]
    probabilities = ml_model.predict_proba(features)[0]

    is_phish = bool(prediction == 1)
    confidence = float(max(probabilities))

    if features[0][1] == 1 and features[0][2] >= 5:
        is_phish = True
        confidence = 0.99 

    return {
        "url": raw_url,
        "final_destination": final_url,
        "is_phishing": is_phish,
        "confidence": confidence,
        "features_extracted": {
            "length_url": features[0][0],
            "domain_in_ip": features[0][1],
            "qty_dot_url": features[0][2]
        },
        "whitelisted": False,
        "cached_response": True 
    }

# ==========================================
# 🛑 RATE LIMITED ENDPOINT
# Restricts users to 60 requests per minute.
# ==========================================
@app.post("/api/analyze")
@limiter.limit("60/minute")
def analyze_url(request: Request, payload: URLRequest):
    if ml_model is None:
        return {"error": "Machine learning model is offline."}

    # Pass the URL from the payload into our cached function
    result = process_and_predict(payload.url)
    return dict(result)

@app.get("/api/health")
def health_check():
    return {"status": "running", "model_loaded": ml_model is not None}