from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import defaultdict
import joblib
import os
import numpy as pd
import pandas as pd

app = Flask(__name__)
CORS(app)

def encode_priority(priority):
    if priority == "high":
        return 3
    elif priority == "medium":
        return 2
    return 1
model = None  # ← don't load on startup
@app.route("/predict-members", methods=["POST"])
def predict_members():
    global model

    # Load model on first request
    if model is None:
        if not os.path.exists("member_model.pkl"):
            return jsonify({
                "success": False,
                "error": "Model not trained yet. Run train_model.py first."
            }), 503
        model = joblib.load("member_model.pkl")

    
    try:
        rows = request.json["features"]

        df = pd.DataFrame(rows)

        df["priority_score"] = df["priority"].apply(encode_priority)
        print(df.columns.tolist())
        print(df.head())
        X_input = df[[
            "assigned_to",
            "priority_score",
            "planned_days",
            "total_hours",
            "num_updates"
        ]]

        predictions = model.predict(X_input)

        results = []

        for i, prediction in enumerate(predictions):
            results.append({
                "task_id": int(df.iloc[i]["task_id"]),
                "assigned_to": int(df.iloc[i]["assigned_to"]),
                "predicted_days_late": float(prediction)
            })

        results.sort(
            key=lambda x: x["predicted_days_late"]
        )

        return jsonify({
            "success": True,
            "ranking": results
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)