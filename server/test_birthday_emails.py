"""
Test Birthday Email Script
===========================
This script allows you to test both birthday email templates (exact time and midnight)
without modifying your main app.py file.

Usage:
    python test_birthday_emails.py
    python test_birthday_emails.py --name "Russel" --email "your@email.com"
    python test_birthday_emails.py --name "Russel" --email "your@email.com" --type exact
    python test_birthday_emails.py --name "Russel" --email "your@email.com" --type midnight
    python test_birthday_emails.py --name "Russel" --email "your@email.com" --type both
"""

import os
import sys
import argparse
from datetime import datetime
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv
from pytz import timezone

# Load environment variables
load_dotenv()

# Configuration
SCOPES = ['https://www.googleapis.com/auth/gmail.send']
EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS', 'russeldanielpaul@gmail.com')
REFRESH_TOKEN = os.getenv('GMAIL_REFRESH_TOKEN')
IST = timezone('Asia/Kolkata')

def load_gmail_credentials():
    """Load and create Gmail API credentials from environment variables"""
    try:
        if not REFRESH_TOKEN:
            print("❌ ERROR: GMAIL_REFRESH_TOKEN not found in environment variables")
            return None
        
        # Read credentials from environment variables
        client_id = os.getenv('GMAIL_CLIENT_ID')
        client_secret = os.getenv('GMAIL_CLIENT_SECRET')
        token_uri = os.getenv('GMAIL_TOKEN_URI', 'https://oauth2.googleapis.com/token')
        
        if not client_id or not client_secret:
            print("❌ ERROR: GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET not found in environment variables")
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
        print(f"❌ Error loading Gmail credentials: {e}")
        return None

def get_birthday_email_html(name, is_exact_time=False):
    """Generate excited, casual, minimal black-and-white birthday email"""
    if is_exact_time:
        return f"""
        <html>
            <body style="font-family: Inter, Arial, sans-serif; background: #fff; color: #000; text-align: center; padding: 40px;">
                <div style="border: 1px solid #ddd; border-radius: 10px; padding: 50px; max-width: 600px; margin: 0 auto;">
                    <h1 style="font-size: 32px; margin-bottom: 10px;">HAPPPY BIRTHDAY {name.upper()}!!!</h1>
                    <p style="font-size: 16px; margin-top: 20px;">
                        brooo it's literally the exact time u were born, absolutely crazyyy
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

def send_email(to_email, subject, body):
    """Send an email using Gmail API"""
    print(f'\n📧 SENDING EMAIL:')
    print(f'   To: {to_email}')
    print(f'   Subject: {subject}')
    
    try:
        # Load credentials
        print(f'   Loading Gmail credentials...')
        creds = load_gmail_credentials()
        if not creds:
            print("   ❌ Failed to load Gmail credentials")
            return False
        
        print(f'   ✅ Credentials loaded successfully')
        
        # Build the Gmail service
        print(f'   Building Gmail API service...')
        service = build('gmail', 'v1', credentials=creds)
        print(f'   ✅ Gmail service built')
        
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
        print(f'   ✅ Message encoded')
        
        # Send the email
        print(f'   Sending via Gmail API...')
        send_result = service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()
        
        print(f'   ✅ EMAIL SENT SUCCESSFULLY!')
        print(f'   Gmail Message ID: {send_result.get("id")}')
        print(f'   Thread ID: {send_result.get("threadId")}')
        return True
        
    except HttpError as error:
        print(f'   ❌ Gmail API HTTP Error:')
        print(f'      Error: {error}')
        print(f'      Status: {error.resp.status if hasattr(error, "resp") else "unknown"}')
        return False
    except Exception as e:
        print(f'   ❌ FAILED TO SEND EMAIL')
        print(f'      Error: {str(e)}')
        import traceback
        traceback.print_exc()
        return False

def main():
    parser = argparse.ArgumentParser(description='Test birthday email templates')
    parser.add_argument('--name', type=str, default='Test User', help='Name of the person')
    parser.add_argument('--email', type=str, default='russeldanielpaul@gmail.com', help='Email address to send test to')
    parser.add_argument('--type', type=str, default='both', choices=['exact', 'midnight', 'both'], 
                        help='Email type to test: exact, midnight, or both')
    
    args = parser.parse_args()
    
    print('\n' + '🧪' * 40)
    print('📧 BIRTHDAY EMAIL TEST SCRIPT')
    print('🧪' * 40)
    print(f'\n⏰ Current time (IST): {datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S")}')
    print(f'\n📋 TEST PARAMETERS:')
    print(f'   Name: {args.name}')
    print(f'   Email: {args.email}')
    print(f'   Type: {args.type}')
    print(f'   Sender: {EMAIL_ADDRESS}')
    
    emails_sent = []
    
    # Send midnight birthday email
    if args.type in ['midnight', 'both']:
        print(f'\n' + '🌙' * 40)
        print('🌙 TESTING MIDNIGHT BIRTHDAY EMAIL')
        print('🌙' * 40)
        subject = f"🎉 Happy Birthday {args.name}!"
        body = get_birthday_email_html(args.name, is_exact_time=False)
        
        if send_email(args.email, subject, body):
            emails_sent.append({
                "type": "midnight",
                "subject": subject,
                "status": "✅ sent"
            })
            print(f'\n✅ Midnight email sent successfully!')
        else:
            emails_sent.append({
                "type": "midnight",
                "subject": subject,
                "status": "❌ failed"
            })
            print(f'\n❌ Midnight email failed to send!')
    
    # Send exact birth time email
    if args.type in ['exact', 'both']:
        print(f'\n' + '🎂' * 40)
        print('🎂 TESTING EXACT BIRTH TIME EMAIL')
        print('🎂' * 40)
        subject = f"🎂 {args.name} - This is Your Exact Birth Moment!"
        body = get_birthday_email_html(args.name, is_exact_time=True)
        
        if send_email(args.email, subject, body):
            emails_sent.append({
                "type": "exact_time",
                "subject": subject,
                "status": "✅ sent"
            })
            print(f'\n✅ Exact time email sent successfully!')
        else:
            emails_sent.append({
                "type": "exact_time",
                "subject": subject,
                "status": "❌ failed"
            })
            print(f'\n❌ Exact time email failed to send!')
    
    # Summary
    print(f'\n' + '=' * 80)
    print(f'📊 TEST SUMMARY')
    print('=' * 80)
    print(f'   Total emails attempted: {len(emails_sent)}')
    
    for i, email_info in enumerate(emails_sent, 1):
        print(f'   {i}. {email_info["type"]}: {email_info["status"]}')
        print(f'      Subject: {email_info["subject"]}')
    
    success_count = sum(1 for e in emails_sent if "✅" in e["status"])
    print(f'\n   ✅ Successfully sent: {success_count}')
    print(f'   ❌ Failed: {len(emails_sent) - success_count}')
    
    print('=' * 80)
    print('🏁 TEST COMPLETED')
    print('=' * 80 + '\n')
    
    return 0 if success_count > 0 else 1

if __name__ == "__main__":
    sys.exit(main())
