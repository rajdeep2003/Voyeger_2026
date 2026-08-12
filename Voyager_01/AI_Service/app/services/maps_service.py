from dotenv import load_dotenv
import os
import requests
import math

load_dotenv()

OPENROUTE_API_KEY = os.getenv("OPENROUTE_API_KEY")

HEADERS = {
    "Authorization": OPENROUTE_API_KEY,
    "Content-Type": "application/json"
}

URL = "https://api.openrouteservice.org/pois"


def clean_nan(obj):
    if isinstance(obj, dict):
        return {k: clean_nan(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan(v) for v in obj]
    elif isinstance(obj, float) and math.isnan(obj):
        return None
    return obj


def get_nearby_places(lat: float, lon: float):
    """
    Returns all nearby POIs within 2km radius.
    Useful for debugging and exploring OpenRouteService data.
    """

    body = {
        "request": "pois",
        "geometry": {
            "geojson": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
            "buffer": 2000
        }
    }

    response = requests.post(
        URL,
        json=body,
        headers=HEADERS
    )

    data = response.json()

    return clean_nan(data)


def is_hospital(properties: dict) -> bool:
    category_ids = properties.get("category_ids", {})
    cat_list = []
    if isinstance(category_ids, dict):
        cat_list = list(category_ids.keys())
    elif isinstance(category_ids, list):
        cat_list = category_ids
    
    cat_strs = {str(c) for c in cat_list}
    
    # Category 206 is hospital, 207 is clinic, 209 is doctors/healthcare
    if "206" in cat_strs or "207" in cat_strs:
        return True
        
    # Check category_name
    if isinstance(category_ids, dict):
        for cat_info in category_ids.values():
            if isinstance(cat_info, dict):
                name = cat_info.get("category_name", "").lower()
                group = cat_info.get("category_group", "").lower()
                if "hospital" in name or "clinic" in name or group == "healthcare":
                    return True
                    
    # Check OSM tags
    osm_tags = properties.get("osm_tags", {})
    if osm_tags:
        amenity = osm_tags.get("amenity", "").lower()
        if amenity in ("hospital", "clinic", "doctors"):
            return True
        name = osm_tags.get("name", "").lower()
        if "hospital" in name or "clinic" in name:
            return True
            
    return False


def is_police(properties: dict) -> bool:
    category_ids = properties.get("category_ids", {})
    cat_list = []
    if isinstance(category_ids, dict):
        cat_list = list(category_ids.keys())
    elif isinstance(category_ids, list):
        cat_list = category_ids
        
    cat_strs = {str(c) for c in cat_list}
    
    # Category 369 is police
    if "369" in cat_strs:
        return True
        
    # Check category_name
    if isinstance(category_ids, dict):
        for cat_info in category_ids.values():
            if isinstance(cat_info, dict):
                name = cat_info.get("category_name", "").lower()
                if "police" in name:
                    return True
                    
    # Check OSM tags
    osm_tags = properties.get("osm_tags", {})
    if osm_tags:
        amenity = osm_tags.get("amenity", "").lower()
        if amenity == "police":
            return True
        name = osm_tags.get("name", "").lower()
        if "police station" in name or "police outpost" in name or "police" in name:
            return True
            
    return False


def get_nearest_hospital_distance(lat: float, lon: float):
    """
    Returns distance (km) to nearest hospital/clinic.
    """

    data = get_nearby_places(lat, lon)
    features = data.get("features", [])

    hospital_distances = []

    for feature in features:
        properties = feature.get("properties", {})
        if is_hospital(properties):
            distance = properties.get("distance")
            if distance is not None:
                hospital_distances.append(distance)

    if not hospital_distances:
        return {
            "hospital_distance_km": None,
            "message": "No hospitals found"
        }

    return {
        "hospital_distance_km": min(hospital_distances) / 1000
    }


def get_nearest_police_distance(lat: float, lon: float):
    """
    Returns distance (km) to nearest police station.
    """

    data = get_nearby_places(lat, lon)
    features = data.get("features", [])

    police_distances = []

    for feature in features:
        properties = feature.get("properties", {})
        if is_police(properties):
            distance = properties.get("distance")
            if distance is not None:
                police_distances.append(distance)

    if not police_distances:
        return {
            "police_distance_km": None,
            "message": "No police stations found"
        }

    return {
        "police_distance_km": min(police_distances) / 1000
    }

    