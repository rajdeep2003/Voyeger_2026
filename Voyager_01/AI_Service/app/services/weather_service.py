from dotenv import load_dotenv
import os
import requests

load_dotenv()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

def get_weather_features(latitude: float, longitude: float):
    if not OPENWEATHER_API_KEY:
        return {
            "temperature_c": 25.0,
            "humidity": 60.0,
            "visibility_km": 10.0,
            "rainfall_mm": 0.0
        }

    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?lat={latitude}"
        f"&lon={longitude}"
        f"&appid={OPENWEATHER_API_KEY}"
        f"&units=metric"
    )

    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            rainfall_mm = 0.0
            if "rain" in data:
                rainfall_mm = float(data["rain"].get("1h", 0.0))
            
            return {
                "temperature_c": float(data.get("main", {}).get("temp", 25.0)),
                "humidity": float(data.get("main", {}).get("humidity", 60.0)),
                "visibility_km": float(data.get("visibility", 10000) / 1000.0),
                "rainfall_mm": rainfall_mm
            }
        else:
            return {
                "temperature_c": 25.0,
                "humidity": 60.0,
                "visibility_km": 10.0,
                "rainfall_mm": 0.0
            }
    except Exception:
        return {
            "temperature_c": 25.0,
            "humidity": 60.0,
            "visibility_km": 10.0,
            "rainfall_mm": 0.0
        }