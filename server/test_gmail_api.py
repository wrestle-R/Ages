#!/usr/bin/env python3
"""
Test script to verify Gmail API is working correctly
"""

import json
import base64
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Gmail API configuration
SCOPES = ['https://www.googleapis.com/auth/gmail.send']
EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS', 'happy.birthday.russdan@gmail.com')
REFRESH_TOKEN = os.getenv('GMAIL_REFRESH_TOKEN')

def load_gmail_credentials():
    """Load and create Gmail API credentials from environment variables"""
    try:
        if not REFRESH_TOKEN:
            print("❌ ERROR: GMAIL_REFRESH_TOKEN not found in .env file")
            print("   Please add it to your .env file:")
            print("   GMAIL_REFRESH_TOKEN=your_refresh_token_here")
            return None
        
        # Read credentials from environment variables
        client_id = os.getenv('GMAIL_CLIENT_ID')
        client_secret = os.getenv('GMAIL_CLIENT_SECRET')
        token_uri = os.getenv('GMAIL_TOKEN_URI', 'https://oauth2.googleapis.com/token')
        
        if not client_id or not client_secret:
            print("❌ ERROR: GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET not found in .env file")
            print("   Please add them to your .env file:")
            print("   GMAIL_CLIENT_ID=your_client_id_here")
            print("   GMAIL_CLIENT_SECRET=your_client_secret_here")
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

def send_test_email():
    """Send a test email using Gmail API"""
    try:
        print("="*60)
        print("GMAIL API TEST")
        print("="*60)
        
        # Load credentials
        print("\n📋 Loading Gmail credentials...")
        creds = load_gmail_credentials()
        if not creds:
            print("❌ Failed to load Gmail credentials")
            return False
        
        print("✅ Credentials loaded successfully")
        
        # Build the Gmail service
        print("\n🔧 Building Gmail service...")
        service = build('gmail', 'v1', credentials=creds)
        print("✅ Gmail service built successfully")
        
        # Create the email
        print("\n📧 Creating test email...")
        to_email = 'russeldanielpaul@gmail.com'
        subject = '🧪 Gmail API Test - Birthday System'
        
        body = """
        <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="background: white; border-radius: 15px; padding: 40px; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #667eea; font-size: 36px;">🎉 Gmail API Test Successful! 🎉</h1>
                    <p style="font-size: 18px; color: #333; margin-top: 20px;">
                        Your birthday email system is now using Gmail API instead of SMTP!
                    </p>
                    <p style="font-size: 16px; color: #666; margin-top: 20px;">
                        This means:
                    </p>
                    <ul style="text-align: left; margin: 20px auto; max-width: 400px;">
                        <li>✅ More reliable email delivery</li>
                        <li>✅ Better security with OAuth2</li>
                        <li>✅ No app passwords needed</li>
                        <li>✅ Higher sending limits</li>
                    </ul>
                    <p style="font-size: 20px; color: #667eea; margin-top: 30px; font-weight: bold;">
                        Ready to send birthday emails! 🎂
                    </p>
                </div>
            </body>
        </html>
        """
        
        message = MIMEMultipart('alternative')
        message['From'] = EMAIL_ADDRESS
        message['To'] = to_email
        message['Subject'] = subject
        message.attach(MIMEText(body, 'html'))
        
        # Encode the message
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        
        # Send the email
        print(f"📤 Sending email to {to_email}...")
        send_result = service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()
        
        print(f"\n✅ Email sent successfully!")
        print(f"📨 Message ID: {send_result.get('id')}")
        print(f"📬 Recipient: {to_email}")
        print(f"📝 Subject: {subject}")
        
        print("\n" + "="*60)
        print("✅ GMAIL API IS WORKING CORRECTLY!")
        print("="*60)
        
        return True
        
    except HttpError as error:
        print(f"\n❌ Gmail API error: {error}")
        import traceback
        traceback.print_exc()
        return False
    except Exception as e:
        print(f"\n❌ Failed to send email: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    send_test_email()
