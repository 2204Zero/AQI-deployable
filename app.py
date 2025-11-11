from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
# Enable CORS for all origins to allow frontend to connect
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/weather', methods=['GET'])
def get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({"error": "City parameter is required"}), 400
    
    # Get API key from request header
    api_key = request.headers.get('X-OWM-KEY')
    if not api_key:
        return jsonify({"error": "API key is required in X-OWM-KEY header"}), 401
    
    try:
        # Call OpenWeatherMap API
        response = requests.get(
            f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={api_key}"
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            if response.status_code == 401:
                return jsonify({"error": "Invalid API key"}), 401
            elif response.status_code == 404:
                return jsonify({"error": "City not found"}), 404
            else:
                return jsonify({"error": f"Weather service error: {response.status_code}"}), response.status_code
        
        # Parse the weather data
        weather_data = response.json()
        
        # Format the response
        result = {
            "city": weather_data['name'],
            "temperature": weather_data['main']['temp'],
            "humidity": weather_data['main']['humidity'],
            "wind_speed": weather_data['wind']['speed']
        }
        
        return jsonify(result)
    
    except requests.exceptions.RequestException as e:
        # Handle network errors
        return jsonify({"error": f"Failed to connect to weather service: {str(e)}"}), 500
    except Exception as e:
        # Handle any other unexpected errors
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/readings', methods=['GET', 'POST'])
def get_readings():
    if request.method == 'POST':
        # Handle POST request
        try:
            data = request.get_json()
            # Just return success for now
            return jsonify({"status": "success", "message": "Reading stored"})
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    else:
        # Handle GET request
        mock_data = {
            'pm10': 35.2,
            'pm25': 12.8,
            'co2': 450,
            'humidity': 65.5,
            'temperature': 24.3
        }
        return jsonify(mock_data)

if __name__ == '__main__':
    app.run(port=5000, debug=True)