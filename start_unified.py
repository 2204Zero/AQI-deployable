#!/usr/bin/env python3
"""
Unified Startup Script for AQI Dashboard
This script:
1. Builds the frontend (if not already built)
2. Starts the Flask backend
3. Opens the frontend in the browser
"""

import subprocess
import sys
import os
import webbrowser
import time
import socket
from pathlib import Path

def check_port(port, host='localhost'):
    """Check if a port is available"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex((host, port))
    sock.close()
    return result != 0

def find_free_port(start_port=5008):
    """Find a free port starting from start_port"""
    for port in range(start_port, start_port + 100):
        if check_port(port):
            return port
    return None

def build_frontend(frontend_dir):
    """Build the frontend React app"""
    print("🔨 Building frontend...")
    print("=" * 60)
    
    dist_dir = os.path.join(frontend_dir, 'dist')
    
    # Check if dist already exists and is recent
    if os.path.exists(dist_dir):
        print(f"ℹ️  Frontend build directory exists at {dist_dir}")
        print("   Skipping build. Delete 'dist' folder to force rebuild.")
        return True
    
    # Check if node_modules exists
    node_modules = os.path.join(frontend_dir, 'node_modules')
    if not os.path.exists(node_modules):
        print("📦 Installing frontend dependencies...")
        try:
            subprocess.run(['npm', 'install'], cwd=frontend_dir, check=True, 
                         stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            print("✅ Dependencies installed")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install dependencies: {e}")
            return False
        except FileNotFoundError:
            print("❌ npm not found. Please install Node.js and npm first.")
            return False
    
    # Build the frontend
    print("🔨 Running build command...")
    try:
        result = subprocess.run(['npm', 'run', 'build'], cwd=frontend_dir, 
                              check=True, capture_output=True, text=True)
        print("✅ Frontend built successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Build failed: {e}")
        print(f"   stdout: {e.stdout}")
        print(f"   stderr: {e.stderr}")
        return False
    except FileNotFoundError:
        print("❌ npm not found. Please install Node.js and npm first.")
        return False

def start_backend(backend_dir, port):
    """Start the Flask backend"""
    print("🚀 Starting Flask backend...")
    print("=" * 60)
    
    os.chdir(backend_dir)
    
    # Save port to config file
    port_config_path = os.path.join(backend_dir, 'port_config.txt')
    with open(port_config_path, 'w') as f:
        f.write(str(port))
    
    try:
        # Set PORT environment variable
        env = os.environ.copy()
        env['PORT'] = str(port)
        
        # Start Flask app
        subprocess.run([sys.executable, 'app.py'], env=env, check=True)
    except KeyboardInterrupt:
        print("\n🛑 Application stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting backend: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def main():
    print("=" * 60)
    print("🌟 AQI Dashboard - Unified Startup")
    print("=" * 60)
    
    # Get project root directory
    project_root = Path(__file__).parent.absolute()
    frontend_dir = project_root / 'air-monitor-hub-11501-main'
    backend_dir = project_root / 'AQI_learning'
    
    # Check if directories exist
    if not frontend_dir.exists():
        print(f"❌ Frontend directory not found: {frontend_dir}")
        return
    
    if not backend_dir.exists():
        print(f"❌ Backend directory not found: {backend_dir}")
        return
    
    # Find available port
    port = find_free_port(5008)
    if not port:
        print("❌ Could not find an available port")
        return
    
    print(f"📡 Backend will run on port: {port}")
    print("=" * 60)
    
    # Build frontend
    frontend_built = build_frontend(str(frontend_dir))
    
    if not frontend_built:
        print("⚠️  Frontend build failed, but continuing with backend startup...")
        print("   You can build manually later with: cd air-monitor-hub-11501-main && npm run build")
    
    print("=" * 60)
    
    # Wait a moment for build to complete
    time.sleep(1)
    
    # Start backend (this will block)
    start_backend(str(backend_dir), port)

if __name__ == "__main__":
    main()




