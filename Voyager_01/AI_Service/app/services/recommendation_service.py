def get_recommendation(destination,crowd_level):
    if crowd_level != "Overcrowded":
        return destination

    recommendations = {
        "Victoria Memorial":
            "Marble Palace"
    }

    return recommendations.get(destination,destination)