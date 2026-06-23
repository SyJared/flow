from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import defaultdict
import joblib
import os

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

        members = defaultdict(lambda: {
            "tasks": set(),
            "total_hours": 0,
            "priority_sum": 0,
            "priority_count": 0,
            "progress_sum": 0,  # NEW
            "update_count": 0   # NEW
        })

        # --------------------------
        # Aggregate raw SQL rows
        # --------------------------
        for row in rows:
            member_id = row["assigned_to"]
            members[member_id]["tasks"].add(row["task_id"])
            members[member_id]["total_hours"] += float(
                row.get("hours_spent", 0) or 0
            )
            members[member_id]["priority_sum"] += encode_priority(
                row.get("priority", "low")
            )
            members[member_id]["priority_count"] += 1
            members[member_id]["progress_sum"] += float(  # NEW
                row.get("progress", 0) or 0
            )
            members[member_id]["update_count"] += 1  # NEW

        results = []

        # --------------------------
        # Build ML features
        # --------------------------
        for member_id, data in members.items():
            tasks_completed = len(data["tasks"])
            avg_hours_per_task = (
                data["total_hours"] / tasks_completed
                if tasks_completed > 0 else 0
            )
            avg_priority_score = (
                data["priority_sum"] / data["priority_count"]
                if data["priority_count"] > 0 else 0
            )
            avg_progress_per_update = (          # NEW
                data["progress_sum"] / data["update_count"]
                if data["update_count"] > 0 else 0
            )

            X_input = [[
                tasks_completed,
                data["total_hours"],
                avg_hours_per_task,
                avg_priority_score,
                avg_progress_per_update  # NEW
            ]]

            score = model.predict(X_input)[0]
            results.append({
                "assigned_to": member_id,
                "tasks_completed": tasks_completed,
                "total_hours": round(data["total_hours"], 2),
                "avg_hours_per_task": round(avg_hours_per_task, 2),
                "score": float(score)
            })

        results.sort(key=lambda x: x["score"], reverse=True)

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