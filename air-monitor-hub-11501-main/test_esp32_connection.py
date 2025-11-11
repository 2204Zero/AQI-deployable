#!/usr/bin/env python3
"""
ESP32 Sensor Data Test Script
Test sending sensor data to the FastAPI backend
"""

import requests
import json
import time
import random
from datetime import datetime

def test_esp32_endpoint():
    """Test the ESP32 endpoint with sample data"""
    
    # Backend URL - update this with your actual backend IP
    base_url = "http://localhost:5008"
    esp32_endpoint = f"{base_url}/esp32/readings"
    
    print("🚀 Testing ESP32 Sensor Data Endpoint")
    print(f"📡 Backend URL: {base_url}")
    print("=" * 50)
    
    # Generate sample sensor data
    sample_data = {
        "device_id": "esp32_test_001",
        "temperature": round(random.uniform(18, 32), 1),
        "humidity": round(random.uniform(40, 80), 1),
        "pm25": round(random.uniform(15, 75), 1),
        "pm10": round(random.uniform(25, 120), 1),
        "mq135_raw": random.randint(200, 600),
        "mq135_ppm": round(random.uniform(0.5, 3.0), 2)
    }
    
    print("📊 Sample Data:")
    print(json.dumps(sample_data, indent=2))
    print()
    
    try:
        # Send POST request
        response = requests.post(
            esp32_endpoint,
            json=sample_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"📤 POST Request Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Data sent successfully!")
            print("📥 Response:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Could not connect to backend")
        print("💡 Make sure your FastAPI server is running on port 5008")
    except requests.exceptions.Timeout:
        print("❌ Timeout Error: Request took too long")
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
    
    print()
    
    # Test getting latest reading
    print("🔍 Testing GET /readings endpoint...")
    try:
        response = requests.get(f"{base_url}/readings", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("📈 Latest Reading:")
            print(json.dumps(data, indent=2))
        else:
            print(f"❌ Error getting readings: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    
    # Test ESP32 specific endpoints
    print("🔍 Testing ESP32 specific endpoints...")
    
    # Test latest ESP32 reading
    try:
        response = requests.get(f"{base_url}/esp32/latest?device_id=esp32_test_001", timeout=10)
        if response.status_code == 200:
            print("📈 Latest ESP32 Reading:")
            print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"❌ Error getting ESP32 latest: {e}")
    
    # Test connected devices
    try:
        response = requests.get(f"{base_url}/esp32/devices", timeout=10)
        if response.status_code == 200:
            print("📱 Connected Devices:")
            print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"❌ Error getting devices: {e}")

def test_continuous_data():
    """Send continuous test data to simulate ESP32"""
    base_url = "http://localhost:5008"
    esp32_endpoint = f"{base_url}/esp32/readings"
    
    print("🔄 Starting continuous data stream simulation...")
    print("Press Ctrl+C to stop")
    print()
    
    try:
        while True:
            # Generate realistic sensor data
            data = {
                "device_id": "esp32_001",
                "temperature": round(random.uniform(20, 28), 1),
                "humidity": round(random.uniform(45, 75), 1),
                "pm25": round(random.uniform(20, 60), 1),
                "pm10": round(random.uniform(30, 100), 1),
                "mq135_raw": random.randint(250, 550),
                "mq135_ppm": round(random.uniform(0.8, 2.5), 2)
            }
            
            try:
                response = requests.post(esp32_endpoint, json=data, timeout=5)
                if response.status_code == 200:
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    print(f"[{timestamp}] 📡 Data sent: PM2.5={data['pm25']}, MQ135={data['mq135_raw']}, Temp={data['temperature']}°C")
                else:
                    print(f"❌ Error: {response.status_code}")
            except Exception as e:
                print(f"❌ Connection error: {e}")
            
            time.sleep(30)  # Send data every 30 seconds
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping data stream")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--continuous":
        test_continuous_data()
    else:
        test_esp32_endpoint()
        print("\n💡 To test continuous data stream, run: python test_esp32_connection.py --continuous")