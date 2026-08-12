import React, { useEffect, useState } from "react";
import hospitalData from "../assets/nearby_hospitals.json";
import policeData from "../assets/nearby_police.json";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import useLiveLocation from "../hooks/useLiveLocation";
import { getUserIdFromToken } from "../utils/jwtUtils";
import { getWhatsappLinkWithTracking } from "../utils/whatsappUtils";

// Calculate great-circle distance between two coordinates using Haversine formula (in km)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon1 - lon2);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Emergency page: shows current location, nearby facilities, and lets user notify contacts with live tracking
const Emergency = () => {
  const {
    location,
    setLocation,
    address,
    setAddress,
    currentcity,
    setCurrentcity,
    emergencyContacts,
  } = useAppContext();

  // Extract authenticated user's ID from JWT stored locally
  const userId = getUserIdFromToken();

  // Hook to manage live location tracking session for the user
  const { isTracking, startTracking, stopTracking } = useLiveLocation(userId);

  // Local UI state
  const [loading, setLoading] = useState(true); // shows spinner while obtaining location
  const [nearbyHospitals, setNearbyHospitals] = useState([]); // processed hospital list sorted by distance
  const [nearbyPoliceStations, setNearbyPoliceStations] = useState([]); // processed police stations list
  const [locationError, setLocationError] = useState(null); // geolocation or reverse geocode errors
  const [retryCount, setRetryCount] = useState(0); // increments to trigger re-fetch of geolocation

  const { t } = useTranslation(); // i18n support (not heavily used here yet)

  useEffect(() => {
    // Request browser geolocation; on success -> userCoords, on error -> showError
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(userCoords, showError, {
          //the usercoords returns a big obj, in which is present the position and this contains the lat and long
          enableHighAccuracy: false, // prefer speed over precision
          timeout: 15000, // fail if location not acquired within 15s
          maximumAge: 0, // do not use cached position
        });
      } else {
        setLocationError("Geolocation is not supported by your browser.");
        setLoading(false);
      }
    };
    getLocation();
  }, [retryCount]); // re-run when user presses Retry

  // Handler when geolocation returns coordinates
  const userCoords = async (position) => {
    try {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Save coordinates in global app context for UI usage only
      setLocation({ lat: userLat, lng: userLng });

      // Populate nearby facilities based on current coords
      getNearbyData(userLat, userLng); //--> hospitals, police

      // Call backend API to reverse-geocode coordinates -> human-readable address
      getDetails(userLat, userLng);

      setLocationError(null);
    } catch (err) {
      setLocationError("Failed to process location");
    } finally {
      setLoading(false);
    }
  };

  // Map geolocation errors to user-friendly messages
  const showError = (error) => {
    let errorMessage = "";
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "Location permission denied.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        errorMessage = "Location request timed out.";
        break;
      default:
        errorMessage = "An unknown error occurred.";
    }
    setLocationError(errorMessage);
    setLoading(false);
  };

  // Reverse geocode current coordinates via backend API to get address details
  // API: GET /api/loc-get-details/reverse-geocode?lat={lat}&lon={lng}
  const getDetails = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://voyeger2026-backend.onrender.com/api/loc-get-details/reverse-geocode?lat=${lat}&lon=${lng}`
      );

      if (!res.ok) throw new Error("Geocode failed");

      const data = await res.json();

      // Save structured address and derive current city
      setAddress(data.address);
      setCurrentcity(
        data.address?.city || data.address?.town || data.address?.village || ""
      );
    } catch (err) {
      console.error("Address fetch failed:", err);
      setLocationError("Address fetch failed");
    }
  };

  // Build lists of nearest hospitals and police stations using static JSON datasets

  // const getNearbyData = (lat, lng) => {
  //   try {
  //     console.log("Finding nearby facilities for:", lat, lng);
  //     const hospitals = hospitalData
  //       .filter((item) => item.Latitude && item.Longitude)
  //       .map((item) => ({
  //         ...item,
  //         // compute distance from user to facility
  //         distance: haversineDistance(
  //           lat,
  //           lng,
  //           parseFloat(item.Latitude),
  //           parseFloat(item.Longitude)
  //         ),
  //       }))
  //       .sort((a, b) => a.distance - b.distance) // nearest first
  //       .slice(0, 5); // show top 5

  //     const police = policeData
  //       .filter((item) => item.Latitude && item.Longitude)
  //       .map((item) => ({
  //         ...item,
  //         distance: haversineDistance(
  //           lat,
  //           lng,
  //           parseFloat(item.Latitude),
  //           parseFloat(item.Longitude)
  //         ),
  //       }))
  //       .sort((a, b) => a.distance - b.distance)
  //       .slice(0, 5);

  //     setNearbyHospitals(hospitals);
  //     setNearbyPoliceStations(police);
  //   } catch (error) {
  //     console.error("Error processing nearby data:", error);
  //     setLocationError("Error finding facilities.");
  //   }
  // };

  const getNearbyData = async (lat, lng) => {
    const long = lng // Adjusted to match backend expected parameter name
    try {
      const res = await fetch(
        "https://voyeger2026-backend.onrender.com/api/emergency/get-nearby-services",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ lat, long }),
        }
      );

      if (!res.ok) throw new Error("Failed to fetch nearby services");

      const data = await res.json();
      console.log("Nearby services data:", data);

      const hospitals = data.hospitals;
      const police = data.policeStations;
      setNearbyHospitals(hospitals);
      setNearbyPoliceStations(police);
    } catch (error) {
      console.error("Error fetching nearby services:", error);
      setLocationError("Error fetching nearby services");
    }
  };

  // Notify selected emergency contact via WhatsApp and start live tracking
  const handleEmergencyContact = async (contactType, phoneNumber) => {
    if (!userId) {
      toast.error("Please log in to use emergency tracking");
      return;
    }

    if (!phoneNumber) {
      toast.error(`Please add ${contactType}'s phone number in settings`);
      return;
    }

    try {
      // Initiate backend-linked live tracking; hook manages state and server updates
      const trackingStarted = startTracking();

      if (trackingStarted) {
        // Compose WhatsApp deep link including tracking URL tied to userId and coords
        const whatsappUrl = getWhatsappLinkWithTracking(
          phoneNumber,
          userId,
          location?.lat,
          location?.lng
        );

        // Open WhatsApp chat in a new tab
        window.open(whatsappUrl, "_blank");

        toast.success(
          `Live tracking started! WhatsApp opened for ${contactType}`
        );
      }
    } catch (error) {
      console.error("Error starting emergency tracking:", error);
      toast.error("Failed to start emergency tracking");
    }
  };

  // Simple WhatsApp link with static coordinates (legacy fallback)
  const getWhatsappLink = (phone, lat = location?.lat, lng = location?.lng) => {
    const digitsOnly = phone.replace(/[^0-9]/g, "");
    if (!digitsOnly) return "#";
    const message = `Emergency! I need help at this location: https://maps.google.com/?q=${lat},${lng}`;
    return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
  };

  // Convert structured address to a brief human-readable string
  const formatAddress = () => {
    if (!address) return "Coordinates only available";
    return `${address.city || address.town || address.village || ""}, ${
      address.state || ""
    }, ${address.postcode || ""}`;
  };

  // Retry geolocation: flips state to trigger useEffect and clears previous errors
  const handleRetry = () => {
    setLoading(true);
    setLocationError(null);
    setRetryCount((prev) => prev + 1);
  };

  return (
    // Page container: gradient background, centers content
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 mt-20 bg-gradient-to-br from-pink-100 to-purple-100">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-red-700 mb-4 text-center drop-shadow">
        🚨 Emergency
      </h1>

      {/* Notify Contacts section: quick actions to message Mom/Dad/Friend */}
      <div className="bg-yellow-50 p-6 rounded-2xl shadow border border-yellow-200 mb-6 w-full max-w-4xl text-center">
        <h3 className="text-xl font-bold text-yellow-800 mb-4">
          🧑‍🤝‍🧑 Notify Contacts
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {emergencyContacts && (
            <>
              {/* Button: notify Mom; disabled while live tracking is active */}
              {emergencyContacts.mom && (
                <button
                  onClick={() =>
                    handleEmergencyContact("Mom", emergencyContacts.mom)
                  }
                  className={`px-4 py-2 rounded transition ${
                    isTracking
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                  disabled={isTracking}
                >
                  {isTracking ? "🔄 Tracking Active" : "💬 Mom"}
                </button>
              )}
              {/* Button: notify Dad */}
              {emergencyContacts.dad && (
                <button
                  onClick={() =>
                    handleEmergencyContact("Dad", emergencyContacts.dad)
                  }
                  className={`px-4 py-2 rounded transition ${
                    isTracking
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                  disabled={isTracking}
                >
                  {isTracking ? "🔄 Tracking Active" : "💬 Dad"}
                </button>
              )}
              {/* Button: notify Best Friend */}
              {emergencyContacts.friend && (
                <button
                  onClick={() =>
                    handleEmergencyContact(
                      "Best Friend",
                      emergencyContacts.friend
                    )
                  }
                  className={`px-4 py-2 rounded transition ${
                    isTracking
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                  disabled={isTracking}
                >
                  {isTracking ? "🔄 Tracking Active" : "💬 Best Friend"}
                </button>
              )}
            </>
          )}
        </div>

        {/* Stop Tracking Button: ends live tracking session */}
        {isTracking && (
          <div className="mt-4">
            <button
              onClick={stopTracking}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              🛑 Stop Live Tracking
            </button>
          </div>
        )}
      </div>

      {/* Current Location card: shows coordinates and reverse-geocoded address */}
      {loading ? (
        <div className="flex flex-col items-center">
          <div className="text-lg text-gray-700 mb-4">Finding location...</div>
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur p-6 rounded-2xl shadow-2xl text-center space-y-4 border border-gray-200">
          {locationError ? (
            // Error card with Retry action
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg">
              <p className="font-semibold">{locationError}</p>
              <button
                onClick={handleRetry}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-800">
                📍 Your Current Location
              </h2>
              {/* Raw coordinates */}
              <p className="text-xs text-gray-600 mt-1">
                📌 Latitude: {location?.lat?.toFixed(6)}, Longitude:{" "}
                {location?.lng?.toFixed(6)}
              </p>
              {/* Human-readable address */}
              <p className="text-gray-600 text-sm md:text-base px-4">
                {formatAddress()}
              </p>
              {/* External link to open position in Google Maps */}
              <a
                href={`https://www.google.com/maps?q=${location?.lat},${location?.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow hover:scale-105 transition"
              >
                🌍 Open in Maps
              </a>
            </>
          )}
        </div>
      )}

      {/* Nearest Facilities lists based on static datasets (top 5 by distance) */}
      {!loading && !locationError && (
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Hospitals list */}
          <div className="bg-red-50 p-6 rounded-2xl shadow border border-red-200 space-y-4">
            <h3 className="text-xl font-bold text-red-700 text-center">
              🏥 Nearest Hospitals
            </h3>
            {nearbyHospitals.length > 0 ? (
              nearbyHospitals.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur rounded-xl p-4 border hover:shadow-lg transition"
                >
                  <h4 className="text-lg font-semibold">
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{item.Address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.distanceInMeters.toFixed(3)} m away
                  </p>
                  {/* Quick WhatsApp message to hospital with current coordinates */}
                  <a
                    href={getWhatsappLink(
                      item.phone[0] ? item.phone[0] : "",
                      item.phone[1] ? item.phone[1] : "",
                      item.location.coordinates[0] ? item.location.coordinates[0] : "",
                      item.location.coordinates[1] ? item.location.coordinates[1] : ""
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block bg-green-600 text-white rounded py-1.5 px-4 text-sm hover:bg-green-700 transition"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                No hospitals found nearby.
              </p>
            )}
          </div>

          {/* Police stations list */}
          <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-200 space-y-4">
            <h3 className="text-xl font-bold text-blue-700 text-center">
              🚓 Nearest Police Stations
            </h3>
            {nearbyPoliceStations.length > 0 ? (
              nearbyPoliceStations.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur rounded-xl p-4 border hover:shadow-lg transition"
                >
                  <h4 className="text-lg font-semibold">
                    {item.name || "Police Station"}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{item.Address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.distanceInMeters.toFixed(2)} m away
                  </p>
                  <a
                    href={getWhatsappLink(
                      item.phone[0] ? item.phone[0] : "",
                      item.location.coordinates[0] ? item.location.coordinates[0] : "",
                      item.location.coordinates[1] ? item.location.coordinates[1] : ""
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block bg-green-600 text-white rounded py-1.5 px-4 text-sm hover:bg-green-700 transition"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                No police stations found nearby.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Toast container placeholder (toasts managed via react-toastify) */}
      <div className="fixed bottom-4 right-4 z-50">
        <div id="toast-container"></div>
      </div>
    </div>
  );
};

export default Emergency;
