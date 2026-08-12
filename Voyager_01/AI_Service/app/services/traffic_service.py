from dotenv import load_dotenv
import os
import requests
import logging

load_dotenv()

TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY")

logger = logging.getLogger(__name__)

def get_traffic_index(lat: float, lon: float) -> float:
    """
    Retrieves real-time traffic index (0 to 100) using TomTom Flow Segment Data API.
    Falls back to a default value if API request fails.
    """
    if not TOMTOM_API_KEY:
        logger.warning("TOMTOM_API_KEY is not set. Using default traffic index.")
        return 50.0

    url = (
        f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
        f"?key={TOMTOM_API_KEY}"
        f"&point={lat},{lon}"
    )

    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            flow_data = data.get("flowSegmentData", {})
            current_speed = flow_data.get("currentSpeed")
            free_flow_speed = flow_data.get("freeFlowSpeed")
            
            if current_speed is not None and free_flow_speed is not None and free_flow_speed > 0:
                # Calculate congestion level: 0 is free flow, 100 is complete standstill
                congestion = (1 - (current_speed / free_flow_speed)) * 100
                return max(0.0, min(100.0, float(congestion)))
            
            # Fallback if fields are missing
            return 45.0
        else:
            logger.warning(
                f"TomTom API returned status code {response.status_code}. "
                f"Using default traffic index. Response: {response.text}"
            )
            return 50.0
    except Exception as e:
        logger.error(f"Error fetching traffic data: {e}. Using default traffic index.")
        return 50.0
