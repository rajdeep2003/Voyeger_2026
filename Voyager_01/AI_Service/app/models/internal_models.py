from typing import Annotated
from pydantic import (BaseModel,Field,ConfigDict)

# SAFETY FEATURES

class SafetyFeatures(BaseModel):
    model_config = ConfigDict(extra="forbid")

    location_id: Annotated[int,Field(ge=0)]
    latitude: Annotated[float,Field(ge=-90, le=90)]
    longitude: Annotated[float,Field(ge=-180, le=180)]
    hour: Annotated[int,Field(ge=0, le=23)]
    day_of_week: Annotated[int,Field(ge=1, le=7)]
    month: Annotated[int,Field(ge=1, le=12)]
    crime_count_7d: Annotated[int,Field(ge=0, le=10000)]
    crime_count_30d: Annotated[int,Field(ge=0, le=50000)]
    violent_crime_ratio: Annotated[float,Field(ge=0, le=1)]
    accident_count_30d: Annotated[int,Field(ge=0, le=10000)]
    rainfall_mm: Annotated[float,Field(ge=0, le=1000)]
    temperature_c: Annotated[float,Field(ge=-20, le=60)]
    humidity: Annotated[float,Field(ge=0, le=100)]
    visibility_km: Annotated[float,Field(ge=0, le=100)]
    is_festival_day: Annotated[int,Field(ge=0, le=1)]
    crowd_density: Annotated[int,Field(ge=0, le=100000)]
    is_night: Annotated[int,Field(ge=0, le=1)]
    police_station_distance_km: Annotated[float,Field(ge=0, le=100)]
    hospital_distance_km: Annotated[float,Field(ge=0, le=100)]
    road_lighting_score: Annotated[int,Field(ge=0, le=100)]

# SCAM FEATURES

class ScamFeatures(BaseModel):
    model_config = ConfigDict(extra="forbid")

    complaint_count: Annotated[int,Field(ge=0, le=10000)]
    avg_rating: Annotated[float,Field(ge=0, le=5)]
    negative_review_ratio: Annotated[float,Field(ge=0, le=1)]
    overcharge_reports: Annotated[int,Field(ge=0, le=10000)]
    avg_vendor_price: Annotated[float,Field(ge=0)]
    area_avg_price: Annotated[float,Field(ge=0)]
    tourist_density: Annotated[int,Field(ge=0, le=100000)]
    repeat_offender_reports: Annotated[int,Field(ge=0, le=10000)]
    verified_vendor: Annotated[int,Field(ge=0, le=1)]
    vendor_age_months: Annotated[int,Field(ge=0, le=1000)]
    peak_season: Annotated[int,Field(ge=0, le=1)]
    night_time: Annotated[int,Field(ge=0, le=1)]
    price_ratio: Annotated[float,Field(ge=0, le=10)]
    review_risk: Annotated[float,Field(ge=0, le=10)]
    trust_score: Annotated[float,Field(ge=0, le=100)]

# TOURISM FEATURES

class TourismFeatures(BaseModel):
    model_config = ConfigDict(extra="forbid")

    capacity: Annotated[int,Field(gt=0, le=100000)]
    day_of_week: Annotated[int,Field(ge=1, le=7)]
    month: Annotated[int,Field(ge=1, le=12)]
    weather_score: Annotated[float,Field(ge=0, le=100)]
    event_count: Annotated[int,Field(ge=0, le=1000)]
    social_media_score: Annotated[float,Field(ge=0, le=100)]
    tourist_interest_score: Annotated[float,Field(ge=0, le=100)]
    nearby_hotel_occupancy: Annotated[float,Field(ge=0, le=100)]
    traffic_index: Annotated[float,Field(ge=0, le=100)]
    tourism_season: Annotated[int,Field(ge=0, le=1)]
    is_festival_day: Annotated[int,Field(ge=0, le=1)]
    current_visitors: Annotated[int,Field(ge=0, le=1000000)]
    avg_visitors_7d: Annotated[int,Field(ge=0, le=1000000)]
    avg_visitors_30d: Annotated[int,Field(ge=0, le=1000000)]