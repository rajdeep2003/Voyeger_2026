def get_destination_details(destination: str):
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
        }
    }

    return destination_db.get(destination)