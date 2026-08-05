from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import urllib.parse
import re
import joblib
import os

app = FastAPI()

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
        print("✅ ML Model loaded into memory successfully.")
    else:
        print("❌ Warning: Model file not found! Run train_model.py first.")

class URLRequest(BaseModel):
    url: str

def extract_features(url: str) -> list:
    parsed = urllib.parse.urlparse(url)
    decoded_url = urllib.parse.unquote(url) 

    url_length = len(decoded_url)
 
    has_ip = 1 if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', decoded_url) else 0

    num_dots = decoded_url.count('.')
    
    return [[url_length, has_ip, num_dots]]

@app.post("/api/analyze")
async def analyze_url(req: URLRequest):
    if ml_model is None:
        return {"error": "Machine learning model is offline."}

    features = extract_features(req.url)

    prediction = ml_model.predict(features)[0]
    probabilities = ml_model.predict_proba(features)[0]

    is_phish = bool(prediction == 1)
    
    return {
        "url": req.url,
        "is_phishing": is_phish,
        "confidence": float(max(probabilities)),
        "features_extracted": {
            "length_url": features[0][0],
            "domain_in_ip": features[0][1],
            "qty_dot_url": features[0][2]
        }
    }