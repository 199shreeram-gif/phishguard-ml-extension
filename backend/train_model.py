import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

print("🚀 Starting Production ML Training Pipeline...")

csv_path = "dataset.csv"

if not os.path.exists(csv_path):
    print("❌ Error: dataset.csv not found in the backend folder.")
    exit(1)

df = pd.read_csv(csv_path)
print(f"📊 Dataset loaded successfully with {len(df)} rows.")

feature_columns = ['length_url', 'domain_in_ip', 'qty_dot_url']
target_column = 'phishing'

X = df[feature_columns]
y = df[target_column]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("🧠 Training Random Forest Classifier on Kaggle data...")
model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"✅ Model trained successfully! Accuracy: {accuracy * 100:.2f}%")

joblib.dump(model, 'phishing_model.joblib')
print("💾 Production model saved to disk as 'phishing_model.joblib'.")