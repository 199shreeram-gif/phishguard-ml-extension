# Live PhishGuard: ML-Powered Phishing Detection Extension

Live PhishGuard is a real-time, Machine Learning-powered browser extension built on the Chrome Manifest V3 architecture. It intercepts web traffic, extracts lexical URL features, and evaluates them against a custom-trained Random Forest Classifier to detect and block phishing attempts before a user can interact with malicious elements.

## Table of Contents

- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Complete Installation Guide](#complete-installation-guide)
  - [Phase 1: Setting up the Machine Learning Backend](#phase-1-setting-up-the-machine-learning-backend)
  - [Phase 2: Installing the Browser Extension](#phase-2-installing-the-browser-extension)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Folder Structure](#folder-structure)
- [Troubleshooting](#troubleshooting)

---

## System Architecture

The project utilizes a Hybrid 3-Tier Architecture:

1. **Frontend (Extension Client)**
   - **Service Worker (`background.js`):** Operates ephemerally to intercept `webNavigation` events, manage cross-origin communication with the API backend, and maintain persistent state.
   - **Content Script (`content.js`):** Injects non-destructive DOM warnings onto flagged web pages securely to prevent XSS vulnerabilities.
   - **Dashboard UI (`popup.html`):** Provides a real-time threat analytics interface.

2. **API Gateway (FastAPI)**
   An asynchronous Python web server that handles CORS middleware, feature extraction mapping, and Singleton-pattern model loading for near-zero latency inference.

3. **Machine Learning Engine (Scikit-Learn)**
   An offline training pipeline that ingests dataset CSVs and serializes a trained Random Forest model (`.joblib`) for live evaluation.

---

## Prerequisites

Before installing the project, ensure your system has the following installed:

- **Python 3.10 or higher** (ensure Python is added to your system PATH)
- **Git** (for cloning the repository)
- **Google Chrome** (or any Chromium-based browser)

---

## Complete Installation Guide

### Phase 1: Setting up the Machine Learning Backend

**Step 1 — Clone the repository**

Open your terminal or command prompt and run:

```bash
git clone https://github.com/yourusername/phishing-detector-project.git
cd phishing-detector-project/backend
```

**Step 2 — Create a virtual environment**

It is strictly recommended to use a virtual environment to prevent dependency conflicts.

For Windows:

```bash
python -m venv venv
.\venv\Scripts\activate
```

For Mac/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

**Step 3 — Install required dependencies**

With your virtual environment active, install the required Python packages:

```bash
pip install fastapi uvicorn pydantic scikit-learn pandas joblib
```

**Step 4 — Prepare the dataset**

- Download a Phishing Websites Dataset (e.g., from Kaggle or the UCI Machine Learning Repository).
- Rename the downloaded file to `dataset.csv`.
- Place `dataset.csv` directly into the `backend/` directory.

**Step 5 — Train the AI model**

Generate the machine learning model by running the training pipeline:

```bash
python train_model.py
```

Wait for the terminal to print `Model trained successfully!` and confirm that `phishing_model.joblib` has been generated in the folder.

**Step 6 — Start the API server**

Launch the FastAPI backend server:

```bash
uvicorn app:app --reload
```

The server is now running locally at `http://127.0.0.1:8000`.

---

### Phase 2: Installing the Browser Extension

1. Open Google Chrome and type `chrome://extensions/` in the URL bar.
2. In the top right corner, toggle **Developer mode** to **ON**.
3. In the top left corner, click the **Load unpacked** button.
4. Navigate to your cloned repository and select the `extension/` folder.
5. The Live PhishGuard extension will now appear in your browser.
6. Click the puzzle piece icon in the Chrome toolbar and pin Live PhishGuard for easy access.

---

## Usage Guide

1. Ensure the Python backend server is actively running in your terminal.
2. Browse the web normally.
3. If you navigate to a URL that matches the mathematical profile of a phishing site, the extension will instantly inject a full-page warning banner preventing interaction with the site.
4. Click the PhishGuard extension icon in the toolbar to view real-time statistics on sites scanned and threats blocked.

---

## API Documentation

### `POST /api/analyze`

Evaluates a URL against the loaded Machine Learning model.

**Request Payload:**

```json
{
  "url": "http://192.168.1.1/secure-update.php?login=admin"
}
```

**Response Payload:**

```json
{
  "url": "http://192.168.1.1/secure-update.php?login=admin",
  "is_phishing": true,
  "confidence": 0.92,
  "features_extracted": {
    "length_url": 50,
    "domain_in_ip": 1,
    "qty_dot_url": 3
  }
}
```

---

## Folder Structure

```
phishing-detector-project/
├── backend/
│   ├── app.py                 # FastAPI Server & Feature Extraction
│   ├── train_model.py         # Model Training Script
│   ├── dataset.csv            # Training Data (Not included in repo)
│   └── phishing_model.joblib  # Serialized AI Model
└── extension/
    ├── manifest.json          # Chrome Extension Config
    ├── background.js          # Service Worker Interceptor
    ├── content.js              # DOM Warning Injector
    ├── popup.html              # Dashboard UI
    └── popup.js                # UI Logic & State Management
```

---

## Troubleshooting

**Error: `ModuleNotFoundError` (Pandas/Scikit-Learn)**

Ensure your virtual environment is activated before running the training script or starting the server.

**Error: `IndexError` / `KeyError` during training**

Open `dataset.csv` and verify the column headers exactly match the variables declared in the `feature_columns` array inside `train_model.py`.

**Extension reads "AI Server Offline"**

Check your terminal to ensure `uvicorn app:app --reload` is running and returning a `200 OK` status when you visit `http://localhost:8000/docs`.
