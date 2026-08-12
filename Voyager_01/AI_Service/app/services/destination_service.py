from app.db.database import destinations_collection

async def get_destination_details(destination: str):
    # Try finding in database first (case-insensitive)
    dest = await destinations_collection.find_one({
        "destination_name": {"$regex": f"^{destination}$", "$options": "i"}
    })
    if dest:
        return {
            "city": dest.get("state", ""),
            "category": dest.get("category", ""),
            "latitude": float(dest.get("latitude", 20.5937)),
            "longitude": float(dest.get("longitude", 78.9629))
        }

    destination_db = {
        "Victoria Memorial": {
            "city": "Kolkata",
            "category": "Historical",
            "latitude": 22.5448,
            "longitude": 88.3426
        },
        "Marble Palace": {
            "city": "Kolkata",
            "category": "Historical",
            "latitude": 22.5833,
            "longitude": 88.3639
        },
        "Purulia": {
            "city": "Purulia",
            "category": "Nature",
            "latitude": 23.3322,
            "longitude": 86.3657
        },
        "Kashmir": {
            "city": "Srinagar",
            "category": "Adventure",
            "latitude": 34.0837,
            "longitude": 74.7973
        },
        "Kerala": {
            "city": "Kochi",
            "category": "Nature",
            "latitude": 9.9312,
            "longitude": 76.2673
        },
        "Delhi": {
            "city": "Delhi",
            "category": "Historical",
            "latitude": 28.6139,
            "longitude": 77.2090
        },
        "Andaman": {
            "city": "Port Blair",
            "category": "Nature",
            "latitude": 11.6234,
            "longitude": 92.7265
        },
        "Digha": {
            "city": "Digha",
            "category": "Nature",
            "latitude": 21.6259,
            "longitude": 87.5098
        },
        "Bishnupur": {
            "city": "Bishnupur",
            "category": "Historical",
            "latitude": 23.0678,
            "longitude": 87.3175
        },
        "Dooars": {
            "city": "Dooars",
            "category": "Nature",
            "latitude": 26.7454,
            "longitude": 89.0725
        }
    }

    for key, val in destination_db.items():
        if key.lower() == destination.lower():
            return val

    # Smart fallback for custom user-specified destinations
    return {
        "city": destination,
        "category": "General",
        "latitude": 20.5937,
        "longitude": 78.9629
    }