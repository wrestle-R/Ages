from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import calendar
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5173/",
    "http://127.0.0.1:5173/",
    'https://ages-fam.vercel.app/'
    '*'
])

# Email configuration
EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')
SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))

# File to store last run timestamp
LAST_RUN_FILE = 'last_run.json'

def get_last_run_time():
    """Get the last time birthday emails were checked"""
    try:
        if os.path.exists(LAST_RUN_FILE):
            with open(LAST_RUN_FILE, 'r') as f:
                data = json.load(f)
                return datetime.fromisoformat(data['last_run'])
        else:
            # If file doesn't exist, assume last run was 15 minutes ago
            return datetime.now() - timedelta(minutes=15)
    except Exception as e:
        print(f"Error reading last run time: {e}")
        return datetime.now() - timedelta(minutes=15)

def set_last_run_time(timestamp):
    """Save the last run timestamp"""
    try:
        with open(LAST_RUN_FILE, 'w') as f:
            json.dump({'last_run': timestamp.isoformat()}, f)
    except Exception as e:
        print(f"Error saving last run time: {e}")

def send_email(to_email, subject, body):
    """Send an email using Gmail SMTP"""
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'html'))
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)
        
        print(f"Email sent successfully to {to_email}: {subject}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        return False

def get_birthday_email_html(name, is_exact_time=False):
    """Generate HTML content for birthday email"""
    if is_exact_time:
        return f"""
        <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="background: white; border-radius: 15px; padding: 40px; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #667eea; font-size: 36px;">🎂 Happy Birthday {name}! 🎂</h1>
                    <h2 style="color: #764ba2; font-size: 24px; margin-top: 20px;">
                        This is the exact moment you were born!
                    </h2>
                    <p style="font-size: 18px; color: #333; margin-top: 20px;">
                        At this precise time, years ago, you came into this world and made it a better place. 
                        We're so grateful to celebrate this special moment with you!
                    </p>
                    <p style="font-size: 20px; color: #667eea; margin-top: 30px; font-weight: bold;">
                        May this year bring you joy, success, and all the happiness you deserve! 🎉
                    </p>
                </div>
            </body>
        </html>
        """
    else:
        return f"""
        <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <div style="background: white; border-radius: 15px; padding: 40px; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #f5576c; font-size: 36px;">🎉 Happy Birthday {name}! 🎉</h1>
                    <p style="font-size: 20px; color: #333; margin-top: 20px;">
                        Wishing you a fantastic day filled with love, laughter, and joy!
                    </p>
                    <p style="font-size: 18px; color: #666; margin-top: 20px;">
                        May all your dreams come true this year. Have an amazing birthday celebration! 🎂🎈
                    </p>
                    <p style="font-size: 20px; color: #f5576c; margin-top: 30px; font-weight: bold;">
                        Cheers to another year of wonderful memories! 🥳
                    </p>
                </div>
            </body>
        </html>
        """

def check_and_send_birthday_emails():
    """
    Check if it's anyone's birthday and send appropriate emails.
    Uses interval-based checking to ensure no emails are missed.
    """
    current_time = datetime.now()
    last_run_time = get_last_run_time()
    
    print(f"Checking birthdays from {last_run_time} to {current_time}")
    
    emails_sent = []
    
    for name, info in birthdays.items():
        birth_date = info['date']
        birth_time = info['time']
        email = info['email']
        
        # Parse birth date and time
        birth_parts = birth_date.split("-")
        time_parts = birth_time.split(":")
        
        birth_month = int(birth_parts[1])
        birth_day = int(birth_parts[2])
        birth_hour = int(time_parts[0])
        birth_minute = int(time_parts[1])
        
        # Check if today is their birthday
        if current_time.month == birth_month and current_time.day == birth_day:
            
            # Create midnight timestamp for today
            midnight_today = current_time.replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Create exact birth time timestamp for today
            birth_time_today = current_time.replace(
                hour=birth_hour, 
                minute=birth_minute, 
                second=0, 
                microsecond=0
            )
            
            # Check if midnight birthday email should be sent
            # Send if midnight falls within the interval [last_run_time, current_time]
            if last_run_time < midnight_today <= current_time:
                subject = f"🎉 Happy Birthday {name}!"
                body = get_birthday_email_html(name, is_exact_time=False)
                if send_email(email, subject, body):
                    emails_sent.append({
                        "name": name,
                        "type": "midnight",
                        "time": midnight_today.isoformat()
                    })
            
            # Check if exact birth time email should be sent
            # Send if birth time falls within the interval [last_run_time, current_time]
            if last_run_time < birth_time_today <= current_time:
                subject = f"🎂 {name} - This is Your Exact Birth Moment!"
                body = get_birthday_email_html(name, is_exact_time=True)
                if send_email(email, subject, body):
                    emails_sent.append({
                        "name": name,
                        "type": "exact_time",
                        "time": birth_time_today.isoformat()
                    })
    
    # Update last run time
    set_last_run_time(current_time)
    
    return emails_sent

birthdays = {
    "Aliqyaan": {
        "date": "2005-10-19", 
        "time": "13:15",
        "email": "russeldanielpaul@gmail.com",
        "phone": "+1234567890"
    },
    "Russel": {
        "date": "2005-10-19", 
        "time": "14:30",
        "email": "russeldanielpaul@gmail.com",
        "phone": "+1234567890"
    },
    "Romeiro": {
        "date": "2005-10-20", 
        "time": "11:40",
        "email": "russeldanielpaul@gmail.com",
        "phone": "+1234567890"
    },
    "Dylan": {
        "date": "2006-05-13", 
        "time": "11:35",
        "email": "russeldanielpaul@gmail.com",
        "phone": "+1234567890"
    },
    "Gavin": {
        "date": "2005-03-10", 
        "time": "21:14",
        "email": "russeldanielpaul@gmail.com",
        "phone": "+1234567890"
    },
    "Rhea": {
        "date": "2006-01-03", 
        "time": "00:00",
        "email": "russeldanielpaul@gmail.com",
        "phone": "+1234567890"
    },
    "Moiz": {
        "date": "2005-02-15", 
        "time": "00:00",
        "email": "russeldanielpaul@gmail.com",
        "phone": "+1234567890"
    },
    "Rohan": {
        "date": "2004-11-12", 
        "time": "10:12",
        "email": "russeldanielpaul@gmail.com",
        "phone": "+1234567890"
    },
    "Reniyas": {
        "date": "2005-09-19", 
        "time": "11:50",
        "email": "russeldanielpaul@gmail.com",
        "phone": "+1234567890"
    }
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

@app.route("/api/send-birthday-emails", methods=['GET', 'POST'])
def send_birthday_emails_endpoint():
    """
    Endpoint to trigger birthday email checking.
    Called by GitHub Actions cron job or manually.
    """
    try:
        # Optional API key authentication
        api_key = request.headers.get('X-API-Key') or request.args.get('api_key')
        expected_api_key = os.getenv('API_KEY')
        
        # If API_KEY is set in environment, require it
        if expected_api_key and api_key != expected_api_key:
            return jsonify({
                "error": "Unauthorized",
                "message": "Invalid or missing API key"
            }), 401
        
        emails_sent = check_and_send_birthday_emails()
        
        return jsonify({
            "status": "success",
            "message": f"Birthday check completed. {len(emails_sent)} email(s) sent.",
            "emails_sent": emails_sent,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error in send_birthday_emails_endpoint: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/test-email", methods=['GET', 'POST'])
def test_email_endpoint():
    """
    Test endpoint to verify email configuration.
    Sends a test email to verify SMTP settings.
    """
    try:
        test_recipient = request.args.get('email', os.getenv('TEST_EMAIL', 'russeldanielpaul@gmail.com'))
        
        subject = "🧪 Birthday Email System Test"
        body = """
        <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <div style="background: #f0f0f0; border-radius: 15px; padding: 40px; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333;">Email System Test</h1>
                    <p style="font-size: 18px; color: #666;">
                        If you're reading this, your birthday email system is configured correctly! ✅
                    </p>
                    <p style="font-size: 14px; color: #999; margin-top: 30px;">
                        Test performed at: {timestamp}
                    </p>
                </div>
            </body>
        </html>
        """.format(timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        
        success = send_email(test_recipient, subject, body)
        
        if success:
            return jsonify({
                "status": "success",
                "message": f"Test email sent to {test_recipient}",
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Failed to send test email. Check logs for details.",
                "timestamp": datetime.now().isoformat()
            }), 500
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

if __name__ == "__main__":
    print("Birthday Email System Starting...")
    print(f"Email sender configured: {EMAIL_ADDRESS}")
    print(f"SMTP Host: {SMTP_HOST}:{SMTP_PORT}")
    print("API Endpoints:")
    print("  - /api/send-birthday-emails (triggered by GitHub Actions)")
    print("  - /api/test-email (for testing email configuration)")
    print("  - /health (health check)")
    
    app.run(debug=True, host="0.0.0.0", port=8080)
