#!/usr/bin/env python3
"""
Test script to verify the AQI Dashboard backend is working correctly
"""

import requests
import json
import time

def test_backend():
    """Test the backend endpoints"""
    base_url = "http://localhost:5008"
    
    print("🧪 Testing AQI Dashboard Backend")
    print("=" * 40)
    
    # Test health endpoint
    try:
        print("1. Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("   ✅ Health check passed")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Health check failed: {e}")
        return False
    
    # Test readings endpoint
    try:
        print("2. Testing readings endpoint...")
        response = requests.get(f"{base_url}/readings", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Readings endpoint working")
            print(f"   📊 Sample data: {json.dumps(data, indent=2)}")
        else:
            print(f"   ❌ Readings endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Readings endpoint failed: {e}")
    
    # Test weather endpoint
    try:
        print("3. Testing weather endpoint...")
        response = requests.get(f"{base_url}/weather?city=Delhi", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Weather endpoint working")
            print(f"   🌤️ Weather data: {json.dumps(data, indent=2)}")
        else:
            print(f"   ❌ Weather endpoint failed: {response.status_code}")
            if response.status_code == 500:
                error_data = response.json()
                print(f"   Error details: {error_data}")
    except Exception as e:
        print(f"   ❌ Weather endpoint failed: {e}")
    
    # Test login endpoint
    try:
        print("4. Testing login endpoint...")
        login_data = {"username": "admin", "password": "pass"}
        response = requests.post(f"{base_url}/login", json=login_data, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Login endpoint working")
            print(f"   🔐 Token received: {data.get('access_token', 'N/A')[:20]}...")
        else:
            print(f"   ❌ Login endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Login endpoint failed: {e}")
    
    print("=" * 40)
    print("🎉 Backend testing completed!")
    print(f"🌐 Frontend URL: file:///C:/Users/singh/OneDrive/Desktop/AQI_data/index.html")
    print("💡 Open the frontend in your browser to test the full application")

if __name__ == "__main__":
    test_backend()

