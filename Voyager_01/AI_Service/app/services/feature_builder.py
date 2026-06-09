from datetime import datetime
from app.models.internal_models import (SafetyFeatures,ScamFeatures,TourismFeatures)

def build_features(destination_data,visit_date):

    date_obj = datetime.strptime(str(visit_date),"%Y-%m-%d")

    safety_features = SafetyFeatures(
        location_id=1,
        latitude=destination_data["latitude"],
        longitude=destination_data["longitude"],
        hour=12,
        day_of_week=date_obj.isoweekday(),
        month=date_obj.month,
        crime_count_7d=8,
        crime_count_30d=20,
        violent_crime_ratio=0.2,
        accident_count_30d=10,
        rainfall_mm=25,
        temperature_c=30,
        humidity=70,
        visibility_km=8,
        is_festival_day=0,
        crowd_density=300,
        is_night=0,
        police_station_distance_km=2,
        hospital_distance_km=3,
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

    tourism_features = TourismFeatures(
        capacity=10000,
        day_of_week=date_obj.isoweekday(),
        month=date_obj.month,
        weather_score=75,
        event_count=3,
        social_media_score=65,
        tourist_interest_score=70,
        nearby_hotel_occupancy=60,
        traffic_index=55,
        tourism_season=1,
        is_festival_day=0,
        current_visitors=5500,
        avg_visitors_7d=5200,
        avg_visitors_30d=5000
    )

    return (safety_features,scam_features,tourism_features)