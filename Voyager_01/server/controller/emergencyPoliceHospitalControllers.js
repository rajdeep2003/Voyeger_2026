const PoliceStation = require("../models/nearby_police");
const NearbyHospital = require("../models/nearby_hospitals");

//create police stations in bulk
const createPoliceStations = async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res
        .status(400)
        .json({ error: "Expected an array of police stations" });
    }
    const policeStations = req.body; // Expecting an array of police stations
    const createdStations = await PoliceStation.insertMany(policeStations, {
      ordered: false, // so it skip bad rows and continue
    });
    res.status(201).json(createdStations);
  } catch (error) {
    console.error("Error creating police stations:", error);
    res.status(500).json({ error: "Failed to create police stations" });
  }
};

//create nearby hospitals in bulk
const createNearbyHospitals = async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res
        .status(400)
        .json({ error: "Expected an array of nearby hospitals" });
    }
    const hospitals = req.body; // Expecting an array of hospitals
    const createdHospitals = await NearbyHospital.insertMany(hospitals, {
      ordered: false,
    });
    res.status(201).json(createdHospitals);
  } catch (error) {
    console.error("Error creating nearby hospitals:", error);
    res.status(500).json({ error: "Failed to create nearby hospitals" });
  }
};

const nearbyServices = async (req, res) => {
  try {
    const { lat, long } = req.body;
    if (lat==null || long==null) {//will catch both null and undef
      return res.status(400).json({
        msg: "lat and long fields are not present",
      });
    }
    const userLocation = {
      type: "Point",
      coordinates: [long, lat],
    };
    const sortedHospitals = await NearbyHospital.aggregate([
      {
        $geoNear: {
          near: userLocation,
          distanceField: "distanceInMeters",
          spherical: true,
          maxDistance: 10000
        },
      },
      { $limit: 5 },
    ]);

    const sortedPoliceStations = await PoliceStation.aggregate([
      {
        $geoNear: {
          near: userLocation,
          distanceField: "distanceInMeters",
          spherical: true,
          maxDistance: 10000
        },
      },
      { $limit: 5 },
    ]);

    console.log("🏥 Found hospitals:", sortedHospitals.length);
    console.log("🚔 Found police stations:", sortedPoliceStations.length);

    res.status(200).json({
      hospitals: sortedHospitals,
      policeStations: sortedPoliceStations,
    });
  } catch (err) {
    console.error("❌ Emergency services error:", err);
    res.status(500).json({
      msg: "Server error fetching nearby services",
      error: err.message
    });
  }
};

module.exports = {
  createPoliceStations,
  createNearbyHospitals,
  nearbyServices
};
