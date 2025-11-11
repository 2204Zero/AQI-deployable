from flask import Blueprint, request, jsonify
from db_config import get_connection

submit_bp = Blueprint('submit_bp', __name__)

@submit_bp.route('/submit', methods=['POST'])
def submit_data():
    try:
        data = request.get_json()
        print("Received data:", data)  # Debug print

        pm25 = data.get('pm25')
        pm10 = data.get('pm10')
        co2 = data.get('co2')

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO sensor_data (pm25, pm10, co2) VALUES (%s, %s, %s)",
            (pm25, pm10, co2)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"status": "success"})
    except Exception as e:
        print("Error in /submit route:", e)
        return jsonify({"status": "error", "message": str(e)}), 500