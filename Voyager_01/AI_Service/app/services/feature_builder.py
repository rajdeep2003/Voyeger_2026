from datetime import datetime
from app.models.internal_models import (SafetyFeatures, ScamFeatures, TourismFeatures)
from app.services.weather_service import get_weather_features
from app.services.traffic_service import get_traffic_index
from app.services.maps_service import get_nearest_hospital_distance, get_nearest_police_distance

def build_features(destination_data, visit_date):
    if isinstance(visit_date, datetime):
        date_obj = visit_date
    else:
        try:
            date_obj = datetime.strptime(str(visit_date)[:10], "%Y-%m-%d")
        except Exception:
            date_obj = datetime.now()
    lat = destination_data["latitude"]
    lon = destination_data["longitude"]

    # 1. Fetch real-time weather features
    weather = get_weather_features(lat, lon)
    
    # 2. Fetch real-time traffic index
    traffic = get_traffic_index(lat, lon)
    
    # 3. Fetch real-time emergency services distances
    hospital_res = get_nearest_hospital_distance(lat, lon)
    hospital_dist = hospital_res.get("hospital_distance_km")
    if hospital_dist is None:
        hospital_dist = 2.0
    else:
        hospital_dist = min(100.0, max(0.0, float(hospital_dist)))
        
    police_res = get_nearest_police_distance(lat, lon)
    police_dist = police_res.get("police_distance_km")
    if police_dist is None:
        police_dist = 2.0
    else:
        police_dist = min(100.0, max(0.0, float(police_dist)))

    safety_features = SafetyFeatures(
        location_id=1,
        latitude=lat,
        longitude=lon,
        hour=12,
        day_of_week=date_obj.isoweekday(),
        month=date_obj.month,
        crime_count_7d=8,
        crime_count_30d=20,
        violent_crime_ratio=0.2,
        accident_count_30d=10,
        rainfall_mm=weather["rainfall_mm"],
        temperature_c=weather["temperature_c"],
        humidity=weather["humidity"],
        visibility_km=weather["visibility_km"],
        is_festival_day=0,
        crowd_density=300,
        is_night=0,
        police_station_distance_km=police_dist,
        hospital_distance_km=hospital_dist,
        road_lighting_score=80
    )

    scam_features = ScamFeatures(
        complaint_count=5,
        avg_rating=4.2,
        negative_review_ratio=0.15,
        overcharge_reports=2,
        avg_vendor_price=100,
        area_avg_price=90,
        tourist_density=500,
        repeat_offender_reports=1,
        verified_vendor=1,
        vendor_age_months=24,
        peak_season=0,
        night_time=0,
        price_ratio=1.1,
        review_risk=0.12,
        trust_score=75
    )

    # Weather score can be derived from weather features or kept as general score
    # Let's say weather score is 100 - absolute deviation from 22C, capped
    temp_dev = abs(weather["temperature_c"] - 22.0)
    weather_score = max(0.0, min(100.0, 100.0 - (temp_dev * 2) - (weather["rainfall_mm"] * 5)))

    tourism_features = TourismFeatures(
        capacity=10000,
        day_of_week=date_obj.isoweekday(),
        month=date_obj.month,
        weather_score=weather_score,
        event_count=3,
        social_media_score=65,
        tourist_interest_score=70,
        nearby_hotel_occupancy=60,
        traffic_index=traffic,
        tourism_season=1,
        is_festival_day=0,
        current_visitors=5500,
        avg_visitors_7d=5200,
        avg_visitors_30d=5000
    )

    return (safety_features, scam_features, tourism_features)