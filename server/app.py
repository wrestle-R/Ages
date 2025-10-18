from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
import calendar

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5173/",
    "http://127.0.0.1:5173/",
    'https://ages-fam.vercel.app/'
    '*'
])

birthdays = {
    "Aliqyaan": {"date": "2005-11-12", "time": "13:15"},
    "Russel": {"date": "2005-03-22", "time": "23:40"},
    "Romeiro": {"date": "2005-10-19", "time": "00:04"},
    "Dylan": {"date": "2006-05-13", "time": "11:35"},
    "Gavin": {"date": "2005-03-10", "time": "21:14"},
    "Rhea": {"date": "2006-01-03", "time": "00:00"},
    "Moiz": {"date": "2005-02-15", "time": "00:00"},
    "Rohan": {"date": "2004-11-12", "time": "10:12"},
    "Reniyas": {"date": "2005-09-19", "time": "11:50"}
}

@app.route("/api/age")
def get_ages():
    result = {}
    try:
        today = datetime.now()
        for name, birth_info in birthdays.items():
            birth_str = birth_info["date"]
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

@app.route("/api/birthdays")
def get_birthdays():
    result = []
    try:
        now = datetime.now()
        
        for name, birth_info in birthdays.items():
            birth_date_str = birth_info["date"]
            birth_time_str = birth_info["time"]
            
            # Parse birth date and time
            birth_parts = birth_date_str.split("-")
            time_parts = birth_time_str.split(":")
            
            birth_year = int(birth_parts[0])
            birth_month = int(birth_parts[1])
            birth_day = int(birth_parts[2])
            birth_hour = int(time_parts[0])
            birth_minute = int(time_parts[1])
            
            # Calculate current age
            birth_datetime = datetime(birth_year, birth_month, birth_day, birth_hour, birth_minute)
            age_seconds = (now - birth_datetime).total_seconds()
            age_years = age_seconds / (365.25 * 24 * 60 * 60)
            
            # Calculate next birthday
            next_birthday = datetime(now.year, birth_month, birth_day, birth_hour, birth_minute)
            if next_birthday < now:
                next_birthday = datetime(now.year + 1, birth_month, birth_day, birth_hour, birth_minute)
            
            # Check if today is birthday
            is_birthday = (now.month == birth_month and now.day == birth_day)
            
            # Countdown to next birthday
            countdown_delta = next_birthday - now
            countdown_seconds = countdown_delta.total_seconds()
            
            result.append({
                "name": name,
                "month": birth_month,
                "day": birth_day,
                "year": birth_year,
                "hour": birth_hour,
                "minute": birth_minute,
                "currentAge": age_years,
                "isBirthday": is_birthday,
                "countdownSeconds": countdown_seconds
            })
        
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
