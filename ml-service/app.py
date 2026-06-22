from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
@app.route("/predict-members", methods=["POST"])
def predict_members():
    try:
        # 1. GET DATA FROM NODE
        data = request.json

        features = data["features"]

        print("Received from Node:")
        print(features)

        results = []

        # 2. PROCESS FEATURES (dummy scoring for now)
        for f in features:

            planned_days = float(str(f["planned_days"]))
            total_hours = float(str(f["total_hours"]))
            priority_score = 3 if f["priority"] == "high" else 2 if f["priority"] == "medium" else 1

            score = (
                planned_days * 0.5 +
                total_hours * 0.3 +
                priority_score
            )

            results.append({
                "assigned_to": f["assigned_to"],
                "score": score
            })
        # 3. SORT BEST MEMBER FIRST
        results = sorted(results, key=lambda x: x["score"])

        # 4. RETURN TO NODE
        return jsonify({
            "success": True,
            "ranking": results
        })

    except Exception as e:
        print("FLASK ERROR:", e)  # ← add this
        import traceback
        traceback.print_exc()     # ← and this
        return jsonify({ "success": False, "error": str(e) }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)