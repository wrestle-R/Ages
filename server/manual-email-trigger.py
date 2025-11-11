#!/usr/bin/env python3
"""
Manual Email Trigger Script
Use this to manually trigger the birthday email check without waiting for the cron
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BACKEND_URL = "https://ages-5g4e.onrender.com"
# For production: BACKEND_URL = "https://ages-5g4e.onrender.com"

API_KEY = os.getenv('API_KEY')  # Load API key from .env

def trigger_birthday_check():
    """Manually trigger the birthday email check"""
    
    print("="*60)
    print("MANUAL BIRTHDAY EMAIL TRIGGER")
    print("="*60)
    
    url = f"{BACKEND_URL}/api/send-birthday-emails"
    
    print(f"\n📡 Sending request to: {url}")
    
    try:
        headers = {'Content-Type': 'application/json'}
        if API_KEY:
            headers['X-API-Key'] = API_KEY
        
        response = requests.post(url, headers=headers)
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ SUCCESS!")
            print(json.dumps(data, indent=2))
            
            if data.get('emails_sent'):
                print(f"\n📧 {len(data['emails_sent'])} email(s) sent:")
                for email in data['emails_sent']:
                    print(f"  - {email['name']} ({email['type']}) at {email['time']}")
            else:
                print("\n📭 No emails sent (no birthdays match current time window)")
        else:
            print("\n❌ ERROR!")
            print(response.text)
            
    except Exception as e:
        print(f"\n❌ EXCEPTION: {e}")
        print("\nMake sure the Flask backend is running!")
        print("Run: python app.py")
    
    print("\n" + "="*60)

def test_email_config():
    """Test the email configuration"""
    
    print("="*60)
    print("EMAIL CONFIGURATION TEST")
    print("="*60)
    
    url = f"{BACKEND_URL}/api/test-email"
    
    print(f"\n📡 Sending test email via: {url}")
    
    try:
        response = requests.get(url)
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ SUCCESS!")
            print(json.dumps(data, indent=2))
        else:
            print("\n❌ ERROR!")
            print(response.text)
            
    except Exception as e:
        print(f"\n❌ EXCEPTION: {e}")
        print("\nMake sure the Flask backend is running!")
    
    print("\n" + "="*60)

def check_health():
    """Check backend health"""
    
    print("="*60)
    print("BACKEND HEALTH CHECK")
    print("="*60)
    
    url = f"{BACKEND_URL}/health"
    
    print(f"\n📡 Checking: {url}")
    
    try:
        response = requests.get(url)
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Backend is healthy!")
            print(json.dumps(data, indent=2))
        else:
            print("\n⚠️ Backend returned non-200 status")
            print(response.text)
            
    except Exception as e:
        print(f"\n❌ Cannot reach backend: {e}")
        print("\nMake sure the Flask backend is running!")
        print("Run: python app.py")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "health":
            check_health()
        elif command == "test-email":
            test_email_config()
        elif command == "trigger":
            trigger_birthday_check()
        else:
            print("Usage: python manual-email-trigger.py [health|test-email|trigger]")
    else:
        # Default: run all checks
        check_health()
        print("\n")
        trigger_birthday_check()
