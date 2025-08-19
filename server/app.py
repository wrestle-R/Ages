from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
import calendar

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5173/",
    "http://127.0.0.1:5173/"
])

birthdays = {
    "Russel Daniel Paul": "2005-03-22",
    "Paul Renjithan": "1971-10-29",
    "Lydia Paul": "2002-05-24",
    "Sujana Florence": "1976-04-17",
    "Paty": "1941-03-23"
}

@app.route("/api/age")
def get_ages():
    result = {}
    try:
        today = datetime.now()
        for name, birth_str in birthdays.items():
            birth = datetime.strptime(birth_str, "%Y-%m-%d")
            
            years = today.year - birth.year
            months = today.month - birth.month
            days = today.day - birth.day
            if days < 0:
                prev_month = today.month - 1 or 12
                prev_year = today.year if today.month != 1 else today.year - 1
                days += calendar.monthrange(prev_year, prev_month)[1]
                months -= 1
            if months < 0:
                months += 12
                years -= 1

            total_days = (today - birth).days
            total_seconds = int((today - birth).total_seconds())
            total_minutes = total_seconds // 60
            total_weeks = total_days // 7
            total_months = years * 12 + months

            result[name] = {
                "years": years,
                "months": months,
                "weeks": total_weeks,
                "days": days,
                "hours": today.hour,
                "minutes": today.minute,
                "seconds": today.second,
                "total_months": total_months,
                "total_weeks": total_weeks,
                "total_minutes": total_minutes,
                "total_seconds": total_seconds
            }
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health")
def health():
    try:
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8080)
