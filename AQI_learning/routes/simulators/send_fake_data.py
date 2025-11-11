import requests
import time
import random

while True:
    payload = {
        "pm25": round(random.uniform(10, 100), 2),
        "pm10": round(random.uniform(20, 150), 2),
        "co2": round(random.uniform(300, 600), 2)
    }
    try:
        response = requests.post("http://127.0.0.1:5050/submit", json=payload)
        print("Sent:", payload, "| Response:", response.json())
    except Exception as e:
        print("Error sending data:", e)
    time.sleep(10)