from flask import Flask, request, jsonify, send_from_directory, redirect
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import mysql.connector
import time
import random
import requests
import socket
import os
import hashlib
import secrets
from werkzeug.utils import secure_filename
import uuid


app = Flask(__name__)

# Basic app configuration
app.config['JWT_SECRET_KEY'] = 'singhal08'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size
app.url_map.strict_slashes = False

# Extensions
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "*"}})

# Locate the built frontend (support both layouts used in this workspace)
def locate_frontend_dist():
    base = os.path.dirname(os.path.dirname(__file__))
    candidates = [
        os.path.join(base, 'air-monitor-hub-main', 'dist'),
        os.path.join(base, 'air-monitor-hub-main', 'air-monitor-hub-main', 'dist'),
        os.path.join(base, 'air-monitor-hub-11501-main', 'dist'),
        os.path.join(base, 'air-monitor-hub-11501-main', 'air-monitor-hub-11501-main', 'dist'),
        os.path.join(base, 'dist'),
    ]
    for p in candidates:
        if os.path.isdir(p):
            return p
    return None

FRONTEND_DIST = locate_frontend_dist()
DEV_SERVER_URL = 'http://localhost:5173'

if FRONTEND_DIST:
    print(f"✅ Frontend dist found at {FRONTEND_DIST}; serving static files from backend.")
else:
    # If no built frontend, check if Vite dev server is running and offer redirect
    try:
        resp = requests.get(DEV_SERVER_URL, timeout=1)
        if resp.status_code in (200, 307, 304):
            print(f"ℹ️ Vite dev server detected at {DEV_SERVER_URL}; backend will redirect browser requests to the dev server when appropriate.")
            FRONTEND_DIST = None
        else:
            print(f"⚠️ No frontend build found and dev server not responding at {DEV_SERVER_URL} (status {resp.status_code}).")
    except Exception:
        print(f"⚠️ No frontend build found and dev server not reachable at {DEV_SERVER_URL}.")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    # If requesting an API route, don't serve frontend
    api_prefixes = ('api', 'readings', 'health', 'register', 'login', 'upload-photo', 'remove-photo')
    if any(path.startswith(p) for p in api_prefixes):
        return jsonify({"error": "Not a frontend asset"}), 404

    # If we have a built frontend, serve files from it
    if FRONTEND_DIST:
        if path == '' or path.endswith('/'):
            return send_from_directory(FRONTEND_DIST, 'index.html')
        full_path = os.path.join(FRONTEND_DIST, path)
        if os.path.exists(full_path):
            return send_from_directory(FRONTEND_DIST, path)
        # Fallback to index.html for SPA
        return send_from_directory(FRONTEND_DIST, 'index.html')

    # No build found - if Vite dev server is available, redirect browser to it
    try:
        dev_check = requests.get(DEV_SERVER_URL, timeout=1)
        if dev_check.status_code == 200:
            # Redirect root to dev server (preserves SPA HMR and dev workflow)
            target = DEV_SERVER_URL if path == '' else f"{DEV_SERVER_URL}/{path}"
            return redirect(target)
    except Exception:
        pass

    # Last resort: return helpful message
    return jsonify({"error": "Frontend not built and dev server not running. Build the frontend or start the dev server."}), 500


# Allowed file extensions for photos
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Global variables to track database connection status and mock data
db = None
cursor = None
db_connected = False

# OpenWeatherMap API key
OWM_API_KEY = "0ed03441c5022238438f3b1788f82eb9"

def find_free_port():
    """Find a free port, preferring port 5008"""
    # Try port 5008 first, then other ports
    preferred_ports = [5008, 5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5009, 5010]
    
    for port in preferred_ports:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    return None

def save_port_config(port):
    """Save the port configuration to a file"""
    try:
        with open('port_config.txt', 'w') as f:
            f.write(str(port))
        print(f"✅ Port {port} saved to port_config.txt")
    except Exception as e:
        print(f"⚠️ Could not save port config: {e}")

def load_port_config():
    """Load port configuration from file"""
    try:
        if os.path.exists('port_config.txt'):
            with open('port_config.txt', 'r') as f:
                port = int(f.read().strip())
                # Verify port is still free
                try:
                    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                        s.bind(('localhost', port))
                        return port
                except OSError:
                    print(f"⚠️ Saved port {port} is no longer available, finding new port...")
                    return None
    except Exception as e:
        print(f"⚠️ Could not load port config: {e}")
    return None

def hash_password(password):
    """Hash password with salt"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}:{password_hash.hex()}"

def verify_password(password, stored_hash):
    """Verify password against stored hash"""
    try:
        salt, password_hash_hex = stored_hash.split(':')
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return password_hash.hex() == password_hash_hex
    except:
        return False

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
mock_reading = {
    'id': 1,
    'pm10': 35.2,
    'pm25': 12.8,
    'co2': 450,
    'humidity': 65.5,
    'temperature': 24.3,
    'username': 'Lakshya',
    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
}

# Try to connect to MySQL
try:
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="singhal08",
        database="aqi_data",
        connect_timeout=3  # Short timeout to avoid long waits
    )
    cursor = db.cursor()

    # Ensure the readings table exists and has expected columns
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS sensor_readings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pm10 FLOAT NULL,
            pm25 FLOAT NULL,
            co2 FLOAT NULL,
            humidity FLOAT NULL,
            temperature FLOAT NULL,
            username VARCHAR(100) NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    
    # Create users table for multi-user support
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(100) UNIQUE,
            city VARCHAR(100) DEFAULT 'Delhi',
            profile_photo VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    db.commit()

    # Try ensure username column exists for older tables
    try:
        cursor.execute("ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS username VARCHAR(100) NULL")
        db.commit()
    except Exception:
        pass
    
    db_connected = True
    print("✅ Database connected successfully")
except mysql.connector.Error as err:
    print(f"❌ Database connection failed: {err}")
    print("⚠️ Running in mock data mode")

# Health endpoints for connectivity checks
@app.route('/api-status', methods=['GET'])
def api_status():
    return jsonify(status='ok')

@app.route('/health', methods=['GET'])
def health():
    return jsonify(ok=True)

# ✅ User Registration Route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    email = data.get('email', '').strip()
    city = data.get('city', 'Delhi').strip()
    
    # Validation
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400
    
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    if db_connected:
        try:
            # Check if username already exists
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cursor.fetchone():
                return jsonify({"error": "Username already exists"}), 400
            
            # Check if email already exists (if provided)
            if email:
                cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
                if cursor.fetchone():
                    return jsonify({"error": "Email already exists"}), 400
            
            # Hash password and create user
            password_hash = hash_password(password)
            cursor.execute(
                "INSERT INTO users (username, password, email, city) VALUES (%s, %s, %s, %s)",
                (username, password_hash, email, city)
            )
            db.commit()
            
            return jsonify({"message": "User registered successfully"}), 201
            
        except Exception as e:
            print(f"Database error during registration: {e}")
            return jsonify({"error": "Registration failed"}), 500
    else:
        return jsonify({"error": "Database not available"}), 500

# ✅ Login Route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    if db_connected:
        try:
            # Get user from database
            cursor.execute("SELECT id, username, password, email, city FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            
            if user and verify_password(password, user[2]):
                # Create JWT token with user info
                user_data = {
                    'id': user[0],
                    'username': user[1],
                    'email': user[3],
                    'city': user[4]
                }
                token = create_access_token(identity=user_data)
                return jsonify({
                    "access_token": token,
                    "user": user_data
                })
            else:
                return jsonify({"error": "Invalid credentials"}), 401
                
        except Exception as e:
            print(f"Database error during login: {e}")
            return jsonify({"error": "Login failed"}), 500
    else:
        # Fallback for when database is not available
        if username == 'admin' and password == 'pass':
            token = create_access_token(identity={'username': 'admin', 'city': 'Delhi'})
            return jsonify({"access_token": token, "user": {"username": "admin", "city": "Delhi"}})
        return jsonify({"error": "Invalid credentials"}), 401

# ✅ Update User City Route
@app.route('/update-city', methods=['POST'])
@jwt_required()
def update_city():
    data = request.get_json()
    new_city = data.get('city', '').strip()
    
    if not new_city:
        return jsonify({"error": "City is required"}), 400
    
    if db_connected:
        try:
            # Get current user identity from JWT
            current_user = get_jwt_identity()
            user_id = None
            if isinstance(current_user, dict):
                user_id = current_user.get('id')
            # If JWT stored a username instead, try to look it up
            if not user_id and isinstance(current_user, str):
                # Attempt to look up user id by username
                try:
                    cursor.execute("SELECT id FROM users WHERE username = %s", (current_user,))
                    row = cursor.fetchone()
                    if row:
                        user_id = row[0]
                except Exception:
                    pass
            
            if not user_id:
                return jsonify({"error": "User not found"}), 400
            
            # Update user's city
            cursor.execute("UPDATE users SET city = %s WHERE id = %s", (new_city, user_id))
            db.commit()
            
            return jsonify({"message": "City updated successfully", "city": new_city}), 200
            
        except Exception as e:
            print(f"Database error updating city: {e}")
            return jsonify({"error": "Failed to update city"}), 500
    else:
        return jsonify({"error": "Database not available"}), 500

@app.route('/upload-photo', methods=['POST'])
@jwt_required()
def upload_photo():
    """Upload user profile photo"""
    try:
        # Check if photo file is present
        if 'photo' not in request.files:
            return jsonify({"error": "No photo file provided"}), 400
        
        file = request.files['photo']
        username = request.form.get('username', '').strip()
        
        if not username:
            return jsonify({"error": "Username is required"}), 400
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WEBP"}), 400
        
        # Generate unique filename
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{username}_{uuid.uuid4().hex}.{file_extension}"
        
        # Ensure upload directory exists
        upload_dir = os.path.join(app.config['UPLOAD_FOLDER'])
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # Generate URL for the uploaded file
        image_url = f"/static/uploads/{unique_filename}"
        
        # Update user's profile photo in database
        if db_connected:
            try:
                cursor.execute("UPDATE users SET profile_photo = %s WHERE username = %s", (image_url, username))
                db.commit()
                print(f"✅ Profile photo updated for user: {username}")
            except Exception as e:
                print(f"❌ Database error updating profile photo: {e}")
        
        return jsonify({
            "message": "Photo uploaded successfully",
            "imageUrl": image_url,
            "filename": unique_filename
        })
        
    except Exception as e:
        print(f"❌ Photo upload error: {e}")
        return jsonify({"error": "Failed to upload photo"}), 500

@app.route('/remove-photo', methods=['POST'])
@jwt_required()
def remove_photo():
    """Remove user profile photo"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        
        if not username:
            return jsonify({"error": "Username is required"}), 400
        
        # Get current profile photo path
        current_photo = None
        if db_connected:
            try:
                cursor.execute("SELECT profile_photo FROM users WHERE username = %s", (username,))
                result = cursor.fetchone()
                if result:
                    current_photo = result[0]
            except Exception as e:
                print(f"❌ Database error getting profile photo: {e}")
        
        # Remove photo file if it exists
        if current_photo and current_photo.startswith('/static/uploads/'):
            photo_path = current_photo[1:]  # Remove leading slash
            full_path = os.path.join(app.root_path, photo_path)
            if os.path.exists(full_path):
                os.remove(full_path)
                print(f"✅ Profile photo file removed: {full_path}")
        
        # Update database to remove photo reference
        if db_connected:
            try:
                cursor.execute("UPDATE users SET profile_photo = NULL WHERE username = %s", (username,))
                db.commit()
                print(f"✅ Profile photo removed for user: {username}")
            except Exception as e:
                print(f"❌ Database error removing profile photo: {e}")
        
        return jsonify({"message": "Photo removed successfully"})
        
    except Exception as e:
        print(f"❌ Photo remove error: {e}")
        return jsonify({"error": "Failed to remove photo"}), 500

@app.route('/get-profile-photo/<username>', methods=['GET'])
def get_profile_photo(username):
    """Get user profile photo URL"""
    try:
        if db_connected:
            cursor.execute("SELECT profile_photo FROM users WHERE username = %s", (username,))
            result = cursor.fetchone()
            if result and result[0]:
                return jsonify({"imageUrl": result[0]})
        
        return jsonify({"imageUrl": None})
        
    except Exception as e:
        print(f"❌ Error getting profile photo: {e}")
        return jsonify({"imageUrl": None})

# Disabled unauthenticated sensor ingestion endpoint to prevent anonymous writes.
# The original quick-test route has been intentionally removed. To accept device
# uploads (ESP32), re-enable here only after adding authentication (API key or JWT)
# or other protections. Example (disabled):
#
# @app.route('/api/sensor-data', methods=['POST'])
# def receive_sensor_data():
#     data = request.get_json()
#     print("Received sensor data:", data)
#     return jsonify({"status": "disabled"}), 403

# ✅ Create unified readings endpoints expected by the frontend
# POST /readings endpoint has been disabled to prevent unauthenticated external writes
# (This was a 'Postman hole' allowing anyone to inject readings). If you need to re-enable
# controlled ingestion later, implement authentication or a secured endpoint.
#
# @app.route('/readings', methods=['POST'])
# def create_reading():
#     data = request.get_json(silent=True) or {}
#     pm10 = data.get('pm10')
#     pm25 = data.get('pm25')
#     co2 = data.get('co2')
#     humidity = data.get('humidity')
#     temperature = data.get('temperature')
#     username = data.get('username')
#     # Function intentionally disabled. To accept readings, re-implement with proper auth.
#     return jsonify({"error": "POST /readings is disabled on this server"}), 403


@app.route('/readings', methods=['GET'])
def get_latest_reading():
    if db_connected:
        try:
            cursor.execute("SELECT id, pm10, pm25, co2, humidity, temperature, username, timestamp FROM sensor_readings ORDER BY timestamp DESC, id DESC LIMIT 1")
            row = cursor.fetchone()
            if not row:
                return jsonify({}), 200
            reading = {
                'id': row[0],
                'pm10': row[1],
                'pm25': row[2],
                'co2': row[3],
                'humidity': row[4],
                'temperature': row[5],
                'username': row[6],
                'timestamp': str(row[7])
            }
            return jsonify(reading)
        except Exception as e:
            print(f"Database error: {e}")
            # Fall back to mock data
            return jsonify(mock_reading)
    else:
        # Slightly randomize mock data to simulate changes
        mock_reading['pm10'] = round(mock_reading['pm10'] + random.uniform(-2, 2), 1)
        mock_reading['pm25'] = round(mock_reading['pm25'] + random.uniform(-1, 1), 1)
        mock_reading['co2'] = round(mock_reading['co2'] + random.uniform(-10, 10))
        mock_reading['humidity'] = round(mock_reading['humidity'] + random.uniform(-1, 1), 1)
        mock_reading['temperature'] = round(mock_reading['temperature'] + random.uniform(-0.5, 0.5), 1)
        mock_reading['timestamp'] = time.strftime('%Y-%m-%d %H:%M:%S')
        
        return jsonify(mock_reading)

# ✅ (Optional) Legacy protected example routes are kept for compatibility
@app.route('/dashboard-data', methods=['GET'])
@jwt_required()
def dashboard_data():
    if db_connected:
        try:
            cursor.execute("SELECT id, pm25, humidity, timestamp FROM sensor_readings ORDER BY timestamp DESC LIMIT 10")
            rows = cursor.fetchall()
            data = [
                {
                    'id': r[0],
                    'pm25': r[1],
                    'humidity': r[2],
                    'timestamp': str(r[3])
                }
                for r in rows
            ]
            return jsonify(data)
        except Exception as e:
            print(f"Database error: {e}")
            # Return mock data
            return jsonify([{
                'id': 1,
                'pm25': mock_reading['pm25'],
                'humidity': mock_reading['humidity'],
                'timestamp': mock_reading['timestamp']
            }])
    else:
        # Return mock data
        return jsonify([{
            'id': 1,
            'pm25': mock_reading['pm25'],
            'humidity': mock_reading['humidity'],
            'timestamp': mock_reading['timestamp']
        }])

# ✅ Protected Test Route
@app.route('/secure-data', methods=['GET'])
@jwt_required()
def secure_data():
    return jsonify(msg='Hello admin, this is protected data')

# ✅ Weather Route
@app.route('/weather', methods=['GET'])
def get_weather():
    """Fetch weather data from OpenWeatherMap API"""
    city = request.args.get('city')
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    # Check if city parameter or coordinates are provided
    if not city and not (lat and lon):
        return jsonify({"error": "City parameter or lat/lon coordinates are required"}), 404
    
    try:
        # Make API call to OpenWeatherMap
        url = f"http://api.openweathermap.org/data/2.5/weather"
        params = {
            'appid': OWM_API_KEY,
            'units': 'metric'
        }
        
        # Add city or coordinates to params
        if lat and lon:
            params['lat'] = lat
            params['lon'] = lon
        else:
            params['q'] = city
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 404:
            return jsonify({"error": "City not found"}), 404
        elif response.status_code == 401:
            return jsonify({"error": "Invalid API key"}), 500
        elif response.status_code != 200:
            return jsonify({"error": "Weather API error"}), 500
        
        data = response.json()
        
        # Extract required data
        weather_data = {
            "city": data.get('name', city),
            "temperature": data.get('main', {}).get('temp'),
            "humidity": data.get('main', {}).get('humidity'),
            "wind": data.get('wind', {}).get('speed')
        }
        
        return jsonify(weather_data)
        
    except requests.exceptions.Timeout:
        return jsonify({"error": "Weather API timeout"}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Weather API request failed: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

# ✅ Run Server
if __name__ == '__main__':
    # Determine port with priority: PORT env -> saved port_config.txt -> prefer 5008 -> find_free_port()
    env_port = os.environ.get('PORT')
    saved_port = load_port_config()

    final_port = None
    if env_port:
        try:
            final_port = int(env_port)
        except ValueError:
            final_port = None

    if not final_port and saved_port:
        final_port = saved_port

    # Prefer 5008 if available
    if not final_port:
        try:
            test_port = 5008
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', test_port))
            final_port = test_port
        except OSError:
            final_port = find_free_port()

    if final_port is None:
        print("❌ Could not find a free port in range 5000-5099")
        exit(1)

    # Persist chosen port
    save_port_config(final_port)
    
    print("=" * 60)
    print("🚀 AQI DASHBOARD APPLICATION STARTING")
    print("=" * 60)
    print(f"📡 Backend URL: http://localhost:{final_port}")
    print(f"🌐 Weather API: http://localhost:{final_port}/weather?city=CityName")
    print(f"🔐 Login: POST http://localhost:{final_port}/login")
    print("=" * 60)
    print("📱 FRONTEND ACCESS:")
    print(f"   Option 1: Open index.html in your browser")
    print(f"   Option 2: http://localhost:{final_port}/static/index.html")
    print("=" * 60)
    print("🔑 LOGIN CREDENTIALS:")
    print("   Username: admin")
    print("   Password: pass")
    print("=" * 60)
    print("⚡ Starting Flask server...")
    print("   Press Ctrl+C to stop the server")
    print("=" * 60)
    
    # Determine final port (allow override via PORT env var or saved port_config.txt)
    # final_port already determined above; keep it.

    # Try to open frontend automatically
    try:
        import webbrowser
        import time
        import threading
        
        def open_frontend():
            time.sleep(2)  # Wait for server to start
            try:
                # If backend found a built frontend, open the server root which serves the SPA
                if FRONTEND_DIST and os.path.isdir(FRONTEND_DIST):
                    webbrowser.open(f'http://localhost:{final_port}/')
                    print(f"🌐 Frontend opened automatically at http://localhost:{final_port}/")
                    return
                # Otherwise, look for a nearby index.html file (legacy fallback)
                frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
                if os.path.exists(frontend_path):
                    webbrowser.open(f'http://localhost:{final_port}/')
                    print(f"🌐 Frontend opened automatically at http://localhost:{final_port}/")
                    return
                print("⚠️ Frontend file not found, please open the dashboard manually in your browser")
            except Exception as e:
                print(f"⚠️ Error attempting to open browser: {e}")
        
        # Start frontend opening in a separate thread
        threading.Thread(target=open_frontend, daemon=True).start()
    except Exception as e:
        print(f"⚠️ Could not open frontend automatically: {e}")
        print("   Please open index.html manually in your browser")
    
    print(f"🔗 Open the dashboard at: http://localhost:{final_port}/")
    app.run(host='0.0.0.0', port=final_port, debug=True)