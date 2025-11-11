#!/usr/bin/env python3
"""
Test script for Render deployment
Tests Gmail API functionality on production server

DO NOT RUN LOCALLY - This is for testing on Render.com deployment
Usage: Call this endpoint via curl or browser after deploying to Render
"""

import requests
import json
import os

# Production URL (update this with your Render URL)
RENDER_URL = "https://ages-5g4e.onrender.com"

def test_health_check():
    """Test if the server is running and healthy"""
    print("="*60)
    print("1. HEALTH CHECK TEST")
    print("="*60)
    
    try:
        url = f"{RENDER_URL}/health"
        print(f"📡 Testing: {url}")
        
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Server is healthy!")
            print(json.dumps(data, indent=2))
            
            # Check specific fields
            if data.get('email_configured'):
                print("\n✅ Gmail API credentials are loaded")
            else:
                print("\n❌ Gmail API credentials NOT configured")
                
            if data.get('email_method') == 'Gmail API':
                print("✅ Using Gmail API (not SMTP)")
            else:
                print("⚠️ Not using Gmail API")
                
            return True
        else:
            print(f"\n❌ Health check failed with status {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

def test_gmail_api_email():
    """Test sending email via Gmail API"""
    print("\n" + "="*60)
    print("2. GMAIL API EMAIL TEST")
    print("="*60)
    
    try:
        url = f"{RENDER_URL}/api/test-email"
        print(f"📡 Testing: {url}")
        print("📧 This will send a test email...")
        
        response = requests.get(url, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Email sent successfully!")
            print(json.dumps(data, indent=2))
            return True
        else:
            print(f"\n❌ Email test failed with status {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

def test_birthday_check():
    """Test birthday email check endpoint"""
    print("\n" + "="*60)
    print("3. BIRTHDAY CHECK TEST")
    print("="*60)
    
    try:
        url = f"{RENDER_URL}/api/send-birthday-emails"
        api_key = os.getenv('API_KEY', 'ilovefooty')  # Use your actual API key
        
        print(f"📡 Testing: {url}")
        print("🔐 Using API key for authentication")
        
        headers = {'X-API-Key': api_key}
        response = requests.post(url, headers=headers, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Birthday check completed!")
            print(json.dumps(data, indent=2))
            
            emails_sent = data.get('emails_sent', [])
            if emails_sent:
                print(f"\n📧 {len(emails_sent)} birthday email(s) sent:")
                for email in emails_sent:
                    print(f"  - {email['name']} ({email['type']}) at {email['time']}")
            else:
                print("\n📭 No birthday emails sent (no birthdays in current window)")
                
            return True
        else:
            print(f"\n❌ Birthday check failed with status {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

def test_all():
    """Run all tests"""
    print("\n" + "🎂 RENDER GMAIL API TEST SUITE")
    print("=" * 60)
    print(f"Testing: {RENDER_URL}")
    print("=" * 60)
    
    results = {
        'health_check': False,
        'gmail_api': False,
        'birthday_check': False
    }
    
    # Test 1: Health Check
    results['health_check'] = test_health_check()
    
    # Test 2: Gmail API Email (only if health check passed)
    if results['health_check']:
        results['gmail_api'] = test_gmail_api_email()
    else:
        print("\n⏭️ Skipping Gmail API test (health check failed)")
    
    # Test 3: Birthday Check (only if previous tests passed)
    if results['health_check'] and results['gmail_api']:
        results['birthday_check'] = test_birthday_check()
    else:
        print("\n⏭️ Skipping birthday check test (previous tests failed)")
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\nTotal: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED! Gmail API is working on Render!")
    else:
        print("\n⚠️ Some tests failed. Check the logs above for details.")
    
    print("="*60)

def quick_test():
    """Quick test - just health check"""
    print("\n🔍 QUICK HEALTH CHECK")
    print("="*60)
    test_health_check()
    print("="*60)

if __name__ == "__main__":
    import sys
    
    print("\n⚠️  WARNING: This script tests the PRODUCTION Render deployment")
    print(f"URL: {RENDER_URL}")
    print("\nMake sure:")
    print("  1. You've deployed the latest code to Render")
    print("  2. GMAIL_REFRESH_TOKEN is set in Render environment variables")
    print("  3. GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET are set in Render environment variables")
    print("  4. API_KEY is set in Render environment variables\n")
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "health":
            quick_test()
        elif command == "all":
            test_all()
        else:
            print("Usage: python test_render_gmail.py [health|all]")
    else:
        # Default: run all tests
        test_all()
