from flask import Blueprint, jsonify
from db_config import get_connection

latest_bp = Blueprint('latest_bp', __name__)  # ✅ This line is missing in your code

@latest_bp.route('/latest', methods=['GET'])
def get_latest():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1")
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify(result if result else {"error": "No data found"})
    except Exception as e:
        print("Error in /latest route:", e)
        return jsonify({"status": "error", "message": str(e)}), 500