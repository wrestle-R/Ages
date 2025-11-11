from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import calendar
from dotenv import load_dotenv
import os
import json
from pytz import timezone
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5173/",
    "http://127.0.0.1:5173/",
    'https://ages-fam.vercel.app/',
    '*'
])

# Gmail API configuration
SCOPES = ['https://www.googleapis.com/auth/gmail.send']
EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS', 'russeldanielpaul@gmail.com')
REFRESH_TOKEN = os.getenv('GMAIL_REFRESH_TOKEN')

# Load credentials from environment variables
def load_gmail_credentials():
    """Load and create Gmail API credentials from environment variables"""
    try:
        if not REFRESH_TOKEN:
            print("ERROR: GMAIL_REFRESH_TOKEN not found in environment variables")
            return None
        
        # Read credentials from environment variables
        client_id = os.getenv('GMAIL_CLIENT_ID')
        client_secret = os.getenv('GMAIL_CLIENT_SECRET')
        token_uri = os.getenv('GMAIL_TOKEN_URI', 'https://oauth2.googleapis.com/token')
        
        if not client_id or not client_secret:
            print("ERROR: GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET not found in environment variables")
            return None
        
        # Create credentials object with refresh token
        creds = Credentials(
            token=None,
            refresh_token=REFRESH_TOKEN,
            token_uri=token_uri,
            client_id=client_id,
            client_secret=client_secret,
            scopes=SCOPES
        )
        return creds
    except Exception as e:
        print(f"Error loading Gmail credentials: {e}")
        return None

# File to store last run timestamp
LAST_RUN_FILE = 'last_run.json'

# Path to the birthdays JSON file
BIRTHDAYS_FILE = 'birthdays.json'

# Define IST timezone
IST = timezone('Asia/Kolkata')

def get_last_run_time():
    """Get the last time birthday emails were checked"""
    try:
        if os.path.exists(LAST_RUN_FILE):
            with open(LAST_RUN_FILE, 'r') as f:
                data = json.load(f)
                last_run = datetime.fromisoformat(data['last_run'])
                # Ensure timezone-aware datetime
                if last_run.tzinfo is None:
                    last_run = last_run.replace(tzinfo=IST)
                return last_run
        else:
            # If file doesn't exist, assume last run was 15 minutes ago
            # This ensures we catch recent birthdays on first run
            fallback_time = datetime.now(IST) - timedelta(minutes=15)
            print(f"  No last_run.json found, using fallback: {fallback_time.isoformat()}")
            # Create the file immediately
            set_last_run_time(fallback_time)
            return fallback_time
    except Exception as e:
        print(f" Error reading last run time: {e}")
        fallback_time = datetime.now(IST) - timedelta(minutes=15)
        return fallback_time

def set_last_run_time(timestamp):
    """Save the last run timestamp"""
    try:
        with open(LAST_RUN_FILE, 'w') as f:
            json.dump({'last_run': timestamp.isoformat()}, f)
        print(f'  Saved last_run.json: {timestamp.isoformat()}')
    except Exception as e:
        print(f" Error saving last run time: {e}")

def send_email(to_email, subject, body):
    """Send an email using Gmail API"""
    print(f'\nSENDING EMAIL:')
    print(f'   To: {to_email}')
    print(f'   Subject: {subject}')
    
    try:
        # Load credentials
        print(f'   Loading Gmail credentials...')
        creds = load_gmail_credentials()
        if not creds:
            print("   Failed to load Gmail credentials")
            return False
        
        print(f'   Credentials loaded successfully')
        
        # Build the Gmail service
        print(f'   Building Gmail API service...')
        service = build('gmail', 'v1', credentials=creds)
        print(f'   Gmail service built')
        
        # Create the email
        print(f'   Creating email message...')
        message = MIMEMultipart('alternative')
        message['From'] = EMAIL_ADDRESS
        message['To'] = to_email
        message['Subject'] = subject
        
        # Attach HTML body
        message.attach(MIMEText(body, 'html'))
        
        # Encode the message
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        print(f'   Message encoded')
        
        # Send the email
        print(f'   Sending via Gmail API...')
        send_result = service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()
        
        print(f'   EMAIL SENT SUCCESSFULLY!')
        print(f'   Gmail Message ID: {send_result.get("id")}')
        print(f'   Thread ID: {send_result.get("threadId")}')
        return True
        
    except HttpError as error:
        print(f'   Gmail API HTTP Error:')
        print(f'      Error: {error}')
        print(f'      Status: {error.resp.status if hasattr(error, "resp") else "unknown"}')
        return False
    except Exception as e:
        print(f'   FAILED TO SEND EMAIL')
        print(f'      Error: {str(e)}')
        import traceback
        traceback.print_exc()
        return False

def get_birthday_email_html(name, is_exact_time=False):
    """Generate excited, casual, minimal black-and-white birthday email"""
    if is_exact_time:
        return f"""
        <html>
            <body style="font-family: Inter, Arial, sans-serif; background: #fff; color: #000; text-align: center; padding: 40px;">
                <div style="border: 1px solid #ddd; border-radius: 10px; padding: 50px; max-width: 600px; margin: 0 auto;">
                    <h1 style="font-size: 32px; margin-bottom: 10px;">HAPPPY BIRTHDAY {name.upper()}!!!</h1>
                    <p style="font-size: 16px; margin-top: 20px;">
                        brooo it’s literally the exact time u were born, absolutely crazyyy
                    </p>
                    <p style="font-size: 16px; margin-top: 15px;">
                        some great many years ago, on this exact moment u were born and the world is slightly better for it
                    </p>
                    <p style="font-size: 14px; margin-top: 30px; color: #555;">
                        – ages fam<br>
                        <a href="https://ages-fam.vercel.app" style="color: #000; text-decoration: none;">
                            ages-fam.vercel.app
                        </a>
                    </p>
                </div>
            </body>
        </html>
        """
    else:
        return f"""
        <html>
            <body style="font-family: Inter, Arial, sans-serif; background: #fff; color: #000; text-align: center; padding: 40px;">
                <div style="border: 1px solid #ddd; border-radius: 10px; padding: 50px; max-width: 600px; margin: 0 auto;">
                    <h1 style="font-size: 32px; margin-bottom: 10px;">HAPPPPY BIRTHDAY {name.upper()}!!!</h1>
                    <p style="font-size: 16px; margin-top: 20px;">
                        umer horra haai bro, UNC status now 
                    </p>
                    <p style="font-size: 16px; margin-top: 15px;">
                        hope u have a wonderful year ahead sirrr, and stop being gay
                    </p>
                    <p style="font-size: 14px; margin-top: 30px; color: #555;">
                        – ages fam<br>
                        <a href="https://ages-fam.vercel.app" style="color: #000; text-decoration: none;">
                                    ages-fam.vercel.app                    
                        </a>
                    </p>
                </div>
            </body>
        </html>
        """

def check_and_send_birthday_emails():
    """
    Check if it's anyone's birthday and send appropriate emails.
    Uses interval-based checking to ensure no emails are missed.
    FIXED: Better interval logic to prevent missing emails due to timing issues
    """
    print('\n' + '=' * 80)
    print('BIRTHDAY EMAIL CHECK STARTED')
    print('=' * 80)
    
    current_time = datetime.now(IST)
    last_run_time = get_last_run_time()
    
    # Calculate time between runs
    time_diff = current_time - last_run_time
    time_diff_seconds = time_diff.total_seconds()
    time_diff_minutes = time_diff_seconds / 60
    
    print(f'\nTIMING INFORMATION:')
    print(f'   Current time (IST): {current_time.strftime("%Y-%m-%d %H:%M:%S")}')
    print(f'   Last run time:      {last_run_time.strftime("%Y-%m-%d %H:%M:%S")}')
    print(f'   Time between runs:  {time_diff_minutes:.2f} minutes ({time_diff_seconds:.0f} seconds)')
    print(f'   Interval:           [{last_run_time.strftime("%H:%M:%S")} to {current_time.strftime("%H:%M:%S")}]')
    
    # Add buffer to avoid edge cases (subtract a few seconds from last_run for safety)
    last_run_buffer = last_run_time - timedelta(seconds=30)
    
    print(f"   Buffer applied:     -30 seconds")
    print(f"   Buffered start:     {last_run_buffer.strftime('%Y-%m-%d %H:%M:%S')}")
    
    print(f'\nCHECKING {len(birthdays)} BIRTHDAYS...')
    
    emails_sent = []
    
    for name, info in birthdays.items():
        print(f'\n{"-" * 60}')
        print(f'Checking: {name}')
        
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
        
        print(f'   Birth date: {birth_month}/{birth_day}')
        print(f'   Birth time: {birth_hour:02d}:{birth_minute:02d}')
        print(f'   Email: {email}')
        
        # Check if today is their birthday
        if current_time.month == birth_month and current_time.day == birth_day:
            print(f'   TODAY IS {name}\'s BIRTHDAY!')
            
            # Create midnight timestamp for today (IST)
            midnight_today = current_time.replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Create exact birth time timestamp for today (IST)
            birth_time_today = current_time.replace(
                hour=birth_hour, 
                minute=birth_minute, 
                second=0, 
                microsecond=0
            )
            
            print(f'\n   CHECKING MIDNIGHT EMAIL:')
            print(f'      Midnight time: {midnight_today.strftime("%H:%M:%S")}')
            print(f'      In interval?: {last_run_buffer <= midnight_today <= current_time}')
            
            # Check if midnight birthday email should be sent
            # FIXED: Use <= on both sides for inclusive interval check
            if last_run_buffer <= midnight_today <= current_time:
                print(f'      SENDING MIDNIGHT EMAIL to {name}')
                subject = f"Happy Birthday {name}!"
                body = get_birthday_email_html(name, is_exact_time=False)
                if send_email(email, subject, body):
                    emails_sent.append({
                        "name": name,
                        "type": "midnight",
                        "time": midnight_today.isoformat()
                    })
                    print(f'      Midnight email SENT successfully')
                else:
                    print(f'      Midnight email FAILED to send')
            else:
                print(f'      Midnight email not in current interval (skipped)')
            
            print(f'\n   CHECKING EXACT BIRTH TIME EMAIL:')
            print(f'      Birth time: {birth_time_today.strftime("%H:%M:%S")}')
            print(f'      In interval?: {last_run_buffer <= birth_time_today <= current_time}')
            
            # Check if exact birth time email should be sent
            # FIXED: Use <= on both sides for inclusive interval check
            if last_run_buffer <= birth_time_today <= current_time:
                print(f'      SENDING EXACT BIRTH TIME EMAIL to {name}')
                subject = f" {name} - This is Your Exact Birth Moment!"
                body = get_birthday_email_html(name, is_exact_time=True)
                if send_email(email, subject, body):
                    emails_sent.append({
                        "name": name,
                        "type": "exact_time",
                        "time": birth_time_today.isoformat()
                    })
                    print(f'      Exact time email SENT successfully')
                else:
                    print(f'      Exact time email FAILED to send')
            else:
                print(f'      Exact time email not in current interval (skipped)')
        else:
            print(f'   Not their birthday today (Current: {current_time.month}/{current_time.day})')
    
    # Update last run time
    set_last_run_time(current_time)
    
    print(f'\n{"-" * 60}')
    print(f'\nSUMMARY:')
    print(f'   Total birthdays checked: {len(birthdays)}')
    print(f'   Total emails sent: {len(emails_sent)}')
    if emails_sent:
        for i, email_info in enumerate(emails_sent, 1):
            print(f'   {i}. {email_info["name"]} ({email_info["type"]}) at {email_info["time"]}')
    
    print(f'\nUPDATED last_run.json to: {current_time.strftime("%Y-%m-%d %H:%M:%S")}')
    print('=' * 80)
    print('BIRTHDAY EMAIL CHECK COMPLETED')
    print('=' * 80 + '\n')
    
    return emails_sent

def load_birthdays():
    """Load birthdays from a JSON file."""
    try:
        if os.path.exists(BIRTHDAYS_FILE):
            with open(BIRTHDAYS_FILE, 'r') as f:
                return json.load(f)
        else:
            print(f"Warning: {BIRTHDAYS_FILE} not found. Using empty birthdays list.")
            return {}
    except Exception as e:
        print(f"Error loading birthdays: {e}")
        return {}

birthdays = load_birthdays()

@app.route("/api/age")
def get_ages():
    result = {}
    try:
        today = datetime.now(IST)
        for name, birth_info in birthdays.items():
            birth_str = birth_info["date"]
            birth = datetime.strptime(birth_str, "%Y-%m-%d").replace(tzinfo=IST)
            
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
        print(f"Error in get_ages: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/birthdays")
def get_birthdays():
    result = []
    try:
        now = datetime.now(IST)
        
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
            
            # Calculate current age (using naive datetime for calculation)
            birth_datetime_naive = datetime(birth_year, birth_month, birth_day, birth_hour, birth_minute)
            now_naive = now.replace(tzinfo=None)
            age_seconds = (now_naive - birth_datetime_naive).total_seconds()
            age_years = age_seconds / (365.25 * 24 * 60 * 60)
            
            # Calculate next birthday (using naive datetime)
            next_birthday_naive = datetime(now.year, birth_month, birth_day, birth_hour, birth_minute)
            if next_birthday_naive < now_naive:
                next_birthday_naive = datetime(now.year + 1, birth_month, birth_day, birth_hour, birth_minute)
            
            # Check if today is birthday
            is_birthday = (now.month == birth_month and now.day == birth_day)
            
            # Countdown to next birthday
            countdown_delta = next_birthday_naive - now_naive
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
        print(f"Error in get_birthdays: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/health")
def health():
    try:
        # Check if Gmail credentials are valid
        creds = load_gmail_credentials()
        email_configured = creds is not None
        
        return jsonify({
            "status": "healthy",
            "service": "birthday-email-api",
            "timestamp": datetime.now(IST).isoformat(),
            "birthdays_loaded": len(birthdays),
            "email_configured": email_configured,
            "email_method": "Gmail API",
            "api_key_required": bool(os.getenv('API_KEY'))
        })
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

@app.route("/api/send-birthday-emails", methods=['GET', 'POST'])
def send_birthday_emails_endpoint():
    """
    Endpoint to trigger birthday email checking.
    Called by Cloudflare Workers cron job or manually.
    """
    endpoint_start_time = datetime.now(IST)
    
    print('\n' + '*' * 40)
    print('API ENDPOINT HIT: /api/send-birthday-emails')
    print('*' * 40)
    print(f'Request received at: {endpoint_start_time.strftime("%Y-%m-%d %H:%M:%S")} IST')
    print(f'Request method: {request.method}')
    print(f'Request URL: {request.url}')
    print(f'Remote address: {request.remote_addr}')
    print(f'User agent: {request.headers.get("User-Agent", "Unknown")}')
    
    try:
        # Log request headers (excluding sensitive data)
        print(f'\nREQUEST HEADERS:')
        for header, value in request.headers.items():
            if 'key' in header.lower() or 'auth' in header.lower():
                print(f'   {header}: [REDACTED]')
            else:
                print(f'   {header}: {value}')
        
        # Optional API key authentication
        api_key = request.headers.get('X-API-Key') or request.args.get('api_key')
        expected_api_key = os.getenv('API_KEY')
        
        # If API_KEY is set in environment, require it
        if expected_api_key:
            print(f'\nAPI KEY VALIDATION:')
            if api_key == expected_api_key:
                print(f'   API key is VALID')
            else:
                print(f'   API key is INVALID or MISSING')
                print(f'   Expected key present: {bool(expected_api_key)}')
                print(f'   Provided key present: {bool(api_key)}')
                return jsonify({
                    "error": "Unauthorized",
                    "message": "Invalid or missing API key"
                }), 401
        else:
            print(f'\n  No API key required (API_KEY not set in environment)')
        
        # Check and send birthday emails
        print(f'\nStarting birthday email check...')
        emails_sent = check_and_send_birthday_emails()
        
        endpoint_end_time = datetime.now(IST)
        endpoint_duration = (endpoint_end_time - endpoint_start_time).total_seconds()
        
        # Get timing information
        last_run_time = get_last_run_time()
        time_between_runs = (endpoint_start_time - last_run_time).total_seconds() / 60  # in minutes
        
        response_data = {
            "status": "success",
            "message": f"Birthday check completed. {len(emails_sent)} email(s) sent.",
            "emails_sent": emails_sent,
            "timestamp": endpoint_end_time.isoformat(),
            "last_run_time": last_run_time.isoformat(),
            "current_run_time": endpoint_end_time.isoformat(),
            "time_between_runs": f"{time_between_runs:.2f} minutes",
            "endpoint_duration_seconds": f"{endpoint_duration:.2f}"
        }
        
        print(f'\nAPI REQUEST COMPLETED SUCCESSFULLY')
        print(f'   Total emails sent: {len(emails_sent)}')
        print(f'   Endpoint duration: {endpoint_duration:.2f} seconds')
        print(f'   Response timestamp: {endpoint_end_time.strftime("%Y-%m-%d %H:%M:%S")} IST')
        
        if emails_sent:
            print(f'\nEMAILS SENT DETAILS:')
            for i, email in enumerate(emails_sent, 1):
                print(f'   {i}. {email["name"]} ({email["type"]}) at {email["time"]}')
        
        print('*' * 40 + '\n')
        
        return jsonify(response_data)
        
    except Exception as e:
        endpoint_end_time = datetime.now(IST)
        endpoint_duration = (endpoint_end_time - endpoint_start_time).total_seconds()
        error_msg = str(e)
        
        print(f'\nAPI REQUEST FAILED')
        print(f'   Error: {error_msg}')
        print(f'   Endpoint duration: {endpoint_duration:.2f} seconds')
        print(f'   Error timestamp: {endpoint_end_time.strftime("%Y-%m-%d %H:%M:%S")} IST')
        
        import traceback
        print(f'\nTRACEBACK:')
        traceback.print_exc()
        
        print('*' * 40 + '\n')
        
        return jsonify({
            "status": "error",
            "message": error_msg,
            "timestamp": endpoint_end_time.isoformat()
        }), 500

@app.route("/api/test-email", methods=['GET', 'POST'])
def test_email_endpoint():
    """
    Test endpoint to verify email configuration.
    Sends a test email to verify SMTP settings.
    """
    try:
        test_recipient = request.args.get('email', os.getenv('TEST_EMAIL', 'russeldanielpaul@gmail.com'))
        
        subject = "Birthday Email System Test"
        body = """
        <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <div style="background: #f0f0f0; border-radius: 15px; padding: 40px; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333;">Email System Test</h1>
                    <p style="font-size: 18px; color: #666;">
                        If you're reading this, your birthday email system is configured correctly!
                    </p>
                    <p style="font-size: 14px; color: #999; margin-top: 30px;">
                        Test performed at: {timestamp}
                    </p>
                </div>
            </body>
        </html>
        """.format(timestamp=datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S"))
        
        success = send_email(test_recipient, subject, body)
        
        if success:
            return jsonify({
                "status": "success",
                "message": f"Test email sent to {test_recipient}",
                "timestamp": datetime.now(IST).isoformat()
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Failed to send test email. Check logs for details.",
                "timestamp": datetime.now(IST).isoformat()
            }), 500
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now(IST).isoformat()
        }), 500

if __name__ == "__main__":
    print("Birthday Email System Starting...")
    print("=" * 50)
    print(f"Email sender configured: {EMAIL_ADDRESS}")
    print(f"Email method: Gmail API")
    print(f"API Key protection: {'Enabled' if os.getenv('API_KEY') else 'Disabled'}")
    print(f"Birthdays loaded: {len(birthdays)}")
    print("\nAPI Endpoints:")
    print("  - GET  /health (health check)")
    print("  - GET  /api/age (get ages)")
    print("  - GET  /api/birthdays (get birthdays)")
    print("  - POST /api/send-birthday-emails (Cloudflare Workers cron trigger)")
    print("  - GET  /api/test-email (test email configuration)")
    print("\nCloudflare Workers Cron:")
    print("  - Runs every 5 minutes")
    print("  - Endpoint: https://ages-5g4e.onrender.com/api/send-birthday-emails")
    print("=" * 50)
    
    app.run(debug=True, host="0.0.0.0", port=8080)
