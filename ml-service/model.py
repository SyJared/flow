import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib

# -----------------------------
# 1. LOAD DATA
# Expects CSV with columns:
# assigned_to, task_id, priority, hours_spent, progress
# (same shape as your SQL query result)
# -----------------------------
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
df["hours_spent"] = pd.to_numeric(df["hours_spent"], errors="coerce").fillna(0)
df["progress"] = pd.to_numeric(df["progress"], errors="coerce").fillna(0)

# -----------------------------
# 3. AGGREGATE PER MEMBER
# Mirrors app.py's defaultdict logic exactly
# -----------------------------
members = {}

for _, row in df.iterrows():
    mid = row["assigned_to"]
    if mid not in members:
        members[mid] = {
            "tasks": set(),
            "total_hours": 0,
            "priority_sum": 0,
            "priority_count": 0,
            "progress_sum": 0,
            "update_count": 0
        }
    members[mid]["tasks"].add(row["task_id"])
    members[mid]["total_hours"] += row["hours_spent"]
    members[mid]["priority_sum"] += row["priority_score"]
    members[mid]["priority_count"] += 1
    members[mid]["progress_sum"] += row["progress"]
    members[mid]["update_count"] += 1

# -----------------------------
# 4. BUILD FEATURES + TARGET
# -----------------------------
records = []

for mid, data in members.items():
    tasks_completed = len(data["tasks"])
    total_hours = data["total_hours"]

    avg_hours_per_task = (
        total_hours / tasks_completed
        if tasks_completed > 0 else 0
    )
    avg_priority_score = (
        data["priority_sum"] / data["priority_count"]
        if data["priority_count"] > 0 else 0
    )
    avg_progress_per_update = (
        data["progress_sum"] / data["update_count"]
        if data["update_count"] > 0 else 0
    )

    # Target: efficiency score
    # - High progress per hour = efficient
    # - More tasks completed = experienced
    # - Penalize too many hours per task (slow)
    progress_per_hour = (
        data["progress_sum"] / total_hours
        if total_hours > 0 else 0
    )
    efficiency_score = (
        (progress_per_hour * 0.5) +
        (tasks_completed * 0.3) +
        (avg_progress_per_update * 0.2)
    )

    records.append({
        "tasks_completed": tasks_completed,
        "total_hours": total_hours,
        "avg_hours_per_task": avg_hours_per_task,
        "avg_priority_score": avg_priority_score,
        "avg_progress_per_update": avg_progress_per_update,
        "efficiency_score": efficiency_score
    })

agg_df = pd.DataFrame(records)

# -----------------------------
# 5. TRAIN
# -----------------------------
X = agg_df[[
    "tasks_completed",
    "total_hours",
    "avg_hours_per_task",
    "avg_priority_score",
    "avg_progress_per_update"
]]
y = agg_df["efficiency_score"]

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

# -----------------------------
# 7. SAVE
# -----------------------------
joblib.dump(model, "member_model.pkl")
print("Model saved to member_model.pkl")