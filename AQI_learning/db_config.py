import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="singhal08",  # ← Replace with your actual password
        database="aqi_data",
        port=3306
    )