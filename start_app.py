#!/usr/bin/env python3
"""
AQI Dashboard Startup Script
This script starts the Flask backend and provides instructions for the frontend.
"""

import subprocess
import sys
import os
import webbrowser
import time
from pathlib import Path

def main():
    print("🚀 Starting AQI Dashboard Application...")
    print("=" * 50)
    
    # Change to the AQI_learning directory
    aqi_dir = Path(__file__).parent / "AQI_learning"
    os.chdir(aqi_dir)
    
    print(f"📁 Working directory: {os.getcwd()}")
    print("🔧 Starting Flask backend...")
    print("=" * 50)
    
    try:
        # Start the Flask application
        subprocess.run([sys.executable, "app.py"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Application stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting application: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
