import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib

df = pd.read_csv("training_data.csv")

# -----------------------------
# 2. ENCODE PRIORITY
# -----------------------------
def encode_priority(p):
    if p == "high":
        return 3
    elif p == "medium":
        return 2
    return 1

df["priority_score"] = df["priority"].apply(encode_priority)

# -----------------------------
# 5. TRAIN
# -----------------------------
X = df[[
    "assigned_to",
    "priority_score",
    "planned_days",
    "total_hours",
    "num_updates"
]]
y = df["days_late"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# -----------------------------
# 6. EVALUATE
# -----------------------------
preds = model.predict(X_test)
mae = mean_absolute_error(y_test, preds)
print(f"MAE: {mae:.4f}")

for name, score in zip(X.columns, model.feature_importances_):
    print(f"  {name}: {score:.3f}")
for actual, pred in zip(y_test, preds):
    print(f"Actual: {actual}  Predicted: {pred:.2f}")

# -----------------------------
# 7. SAVE
# -----------------------------
joblib.dump(model, "member_model.pkl")
print("Model saved to member_model.pkl")