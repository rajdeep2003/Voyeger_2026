import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaSignInAlt, FaSyncAlt, FaUserPlus, FaWhatsapp } from "react-icons/fa";
import { MdStopCircle } from "react-icons/md";
import hospitalData from "../../../assets/nearby_hospitals.json";
import policeData from "../../../assets/nearby_police.json";
import { useAppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import useLiveLocation from "../../../hooks/useLiveLocation";
import { getUserIdFromToken } from "../../../utils/jwtUtils";
import {
    getWhatsappLink,
    getWhatsappLinkWithTracking,
} from "../../../utils/whatsappUtils";

const parseCoordinate = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon1 - lon2);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const normalizeFacility = (item, type) => {
    const phone = Array.isArray(item?.phone)
        ? item.phone.find(Boolean) || ""
        : item?.phone || item?.["Phone Number"] || "";

    const distanceInMeters =
        typeof item?.distanceInMeters === "number"
            ? item.distanceInMeters
            : typeof item?.distance === "number"
                ? item.distance * 1000
                : null;

    return {
        name:
            item?.name ||
            item?.["Hospital Name"] ||
            item?.["Police Station Name"] ||
            type,
        address: item?.Address || item?.address || "Address unavailable",
        phone,
        distanceInMeters,
    };
};

const buildFallbackNearbyData = (lat, lng) => {
    const hospitals = hospitalData
        .filter((item) => item.Latitude && item.Longitude)
        .map((item) => {
            const itemLat = parseCoordinate(item.Latitude);
            const itemLng = parseCoordinate(item.Longitude);

            return {
                ...normalizeFacility(item, "Hospital"),
                distanceInMeters:
                    itemLat !== null && itemLng !== null
                        ? haversineDistance(lat, lng, itemLat, itemLng) * 1000
                        : null,
            };
        })
        .sort((a, b) => (a.distanceInMeters || Infinity) - (b.distanceInMeters || Infinity))
        .slice(0, 5);

    const policeStations = policeData
        .filter((item) => item.Latitude && item.Longitude)
        .map((item) => {
            const itemLat = parseCoordinate(item.Latitude);
            const itemLng = parseCoordinate(item.Longitude);

            return {
                ...normalizeFacility(item, "Police Station"),
                distanceInMeters:
                    itemLat !== null && itemLng !== null
                        ? haversineDistance(lat, lng, itemLat, itemLng) * 1000
                        : null,
            };
        })
        .sort((a, b) => (a.distanceInMeters || Infinity) - (b.distanceInMeters || Infinity))
        .slice(0, 5);

    return { hospitals, policeStations };
};

const formatDistance = (distanceInMeters) => {
    if (typeof distanceInMeters !== "number" || Number.isNaN(distanceInMeters)) {
        return "Distance unavailable";
    }

    if (distanceInMeters < 1000) {
        return `${distanceInMeters.toFixed(0)} m away`;
    }

    return `${(distanceInMeters / 1000).toFixed(2)} km away`;
};

const EmergencyPage = () => {
    const navigate = useNavigate();
    const {
        location,
        setLocation,
        address,
        setAddress,
        currentcity,
        setCurrentcity,
        emergencyContacts,
        user,
    } = useAppContext();

    const userId = getUserIdFromToken();
    const { isTracking, startTracking, stopTracking } = useLiveLocation(userId);

    const [loading, setLoading] = useState(true);
    const [nearbyHospitals, setNearbyHospitals] = useState([]);
    const [nearbyPoliceStations, setNearbyPoliceStations] = useState([]);
    const [locationError, setLocationError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const formatAddress = () => {
        if (!address) return "Coordinates only available";

        const parts = [
            address.city || address.town || address.village || currentcity || "",
            address.state || "",
            address.postcode || "",
        ].filter(Boolean);

        return parts.length > 0 ? parts.join(", ") : "Coordinates only available";
    };

    const getDetails = async (lat, lng) => {
        try {
            const res = await fetch(
                `https://voyeger2026-backend.onrender.com/api/loc-get-details/reverse-geocode?lat=${lat}&lon=${lng}`
            );

            if (!res.ok) throw new Error("Geocode failed");

            const data = await res.json();
            setAddress(data.address);
            setCurrentcity(
                data.address?.city || data.address?.town || data.address?.village || ""
            );
        } catch (error) {
            console.error("Address fetch failed:", error);
            setLocationError("Address fetch failed");
        }
    };

    const getNearbyData = async (lat, lng) => {
        try {
            const response = await fetch(
                "https://voyeger2026-backend.onrender.com/api/emergency/get-nearby-services",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ lat, long: lng }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch nearby services");
            }

            const data = await response.json();
            const hospitals = Array.isArray(data?.hospitals)
                ? data.hospitals.map((item) => normalizeFacility(item, "Hospital"))
                : [];
            const policeStations = Array.isArray(data?.policeStations)
                ? data.policeStations.map((item) =>
                        normalizeFacility(item, "Police Station")
                    )
                : [];

            setNearbyHospitals(hospitals);
            setNearbyPoliceStations(policeStations);
        } catch (error) {
            console.error("Error fetching nearby services:", error);
            const fallback = buildFallbackNearbyData(lat, lng);
            setNearbyHospitals(fallback.hospitals);
            setNearbyPoliceStations(fallback.policeStations);
        }
    };

    useEffect(() => {
        const requestLocation = () => {
            if (!navigator.geolocation) {
                setLocationError("Geolocation is not supported by your browser.");
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(userCoords, showError, {
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: 0,
            });
        };

        requestLocation();
    }, [retryCount]);

    const userCoords = async (position) => {
        try {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            setLocation({ lat: userLat, lng: userLng });

            await Promise.all([getNearbyData(userLat, userLng), getDetails(userLat, userLng)]);
            setLocationError(null);
        } catch (error) {
            setLocationError("Failed to process location");
        } finally {
            setLoading(false);
        }
    };

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
            const trackingStarted = startTracking();

            if (trackingStarted) {
                const whatsappUrl = getWhatsappLinkWithTracking(
                    phoneNumber,
                    userId,
                    location?.lat,
                    location?.lng
                );

                window.open(whatsappUrl, "_blank");
                toast.success(`Live tracking started! WhatsApp opened for ${contactType}`);
            }
        } catch (error) {
            console.error("Error starting emergency tracking:", error);
            toast.error("Failed to start emergency tracking");
        }
    };

    const handleRetry = () => {
        setLoading(true);
        setLocationError(null);
        setRetryCount((previousCount) => previousCount + 1);
    };

    const renderFacilityList = (items, emptyMessage, tone) => {
        if (!items.length) {
            return <p className="text-base font-normal text-slate-600">{emptyMessage}</p>;
        }

        return (
            <div className="max-h-[19rem] overflow-y-auto rounded-2xl border border-slate-200 bg-white/80 divide-y divide-slate-200">
                {items.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h4 className="text-xl font-semibold leading-tight text-slate-900">{item.name}</h4>
                                <p className="mt-1 text-base font-normal leading-tight text-slate-600">{item.address}</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${tone.badge}`}>{formatDistance(item.distanceInMeters)}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-3">
                            <span className="text-sm font-normal text-slate-500">{item.phone || "No phone listed"}</span>
                            <a
                                href={getWhatsappLink(item.phone, location?.lat, location?.lng)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center rounded-full px-4 py-2 text-base font-medium text-white transition ${tone.button}`}
                            >
                                <FaWhatsapp className="mr-2" />
                                WhatsApp
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const titleSvg = (
        <svg width="747" height="47" viewBox="0 0 747 47" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-auto mt-4 w-full max-w-[747px]">
        <path d="M2.14577e-06 45.824V1.024H79.36V13.952H19.84V17.92H72.448V28.928H19.84V32.896H79.36V45.824H2.14577e-06ZM85.5625 45.824V1.024H115.195L125.243 20.416L135.291 1.024H164.923V45.824H145.723V18.304L145.659 18.496L131.451 45.824H119.035L104.827 18.496L104.763 18.304V45.824H85.5625ZM172.375 45.824V1.024H251.735V13.952H192.215V17.92H244.823V28.928H192.215V32.896H251.735V45.824H172.375ZM257.938 45.824V1.024H321.746C326.311 1.024 329.81 2.048 332.242 4.096C334.674 6.10134 335.89 8.87467 335.89 12.416C335.89 15.1467 335.058 17.3653 333.394 19.072C331.73 20.7787 329.127 21.952 325.586 22.592V23.872C329.468 24.2133 332.391 25.3227 334.354 27.2C336.316 29.0347 337.298 31.424 337.298 34.368V45.824H316.562V35.008C316.562 34.24 316.327 33.6213 315.858 33.152C315.388 32.6827 314.748 32.448 313.938 32.448H277.778V45.824H257.938ZM277.778 20.288H312.658C313.468 20.288 314.108 20.032 314.578 19.52C315.047 19.008 315.282 18.3253 315.282 17.472C315.282 16.5333 315.026 15.8293 314.514 15.36C314.002 14.8907 313.383 14.656 312.658 14.656H277.778V20.288ZM375.274 46.848C370.239 46.848 365.589 46.3147 361.322 45.248C357.055 44.1813 353.343 42.6453 350.186 40.64C347.029 38.6347 344.575 36.224 342.826 33.408C341.077 30.5493 340.202 27.3493 340.202 23.808V23.04C340.202 18.304 341.823 14.208 345.066 10.752C348.309 7.296 352.895 4.65067 358.826 2.816C364.799 0.93867 371.797 3.8147e-06 379.818 3.8147e-06C389.503 3.8147e-06 397.695 1.216 404.394 3.648C411.093 6.03734 416.127 9.408 419.498 13.76L399.594 19.648C397.887 17.856 395.391 16.4907 392.106 15.552C388.863 14.5707 384.767 14.08 379.818 14.08C373.589 14.08 368.682 14.8907 365.098 16.512C361.514 18.0907 359.722 20.2667 359.722 23.04V23.808C359.722 26.5813 361.514 28.7787 365.098 30.4C368.682 31.9787 373.589 32.768 379.818 32.768C382.293 32.768 384.853 32.64 387.498 32.384C390.143 32.0853 392.639 31.68 394.986 31.168C397.333 30.6133 399.274 29.952 400.81 29.184H379.626V21.504H419.498V45.824H404.138L404.778 36.224H403.562C402.111 38.4427 399.999 40.3413 397.226 41.92C394.453 43.4987 391.189 44.7147 387.434 45.568C383.722 46.4213 379.669 46.848 375.274 46.848ZM425.75 45.824V1.024H505.11V13.952H445.59V17.92H498.198V28.928H445.59V32.896H505.11V45.824H425.75ZM511.313 45.824V1.024H530.897L570.833 25.728V1.024H590.673V45.824H571.089L531.153 21.12V45.824H511.313ZM635.443 46.848C627.422 46.848 620.424 45.9093 614.451 44.032C608.52 42.1547 603.934 39.5093 600.691 36.096C597.448 32.64 595.827 28.544 595.827 23.808V23.04C595.827 18.304 597.448 14.2293 600.691 10.816C603.934 7.36 608.52 4.69334 614.451 2.816C620.424 0.93867 627.422 3.8147e-06 635.443 3.8147e-06C645.128 3.8147e-06 653.32 1.38667 660.019 4.16C666.718 6.89067 671.752 10.7307 675.123 15.68L655.219 21.568C653.512 19.3493 651.016 17.664 647.731 16.512C644.488 15.3173 640.392 14.72 635.443 14.72C631.688 14.72 628.382 15.0613 625.523 15.744C622.707 16.4267 620.51 17.3867 618.931 18.624C617.352 19.8613 616.563 21.3333 616.563 23.04V23.808C616.563 25.5147 617.352 27.008 618.931 28.288C620.51 29.5253 622.707 30.4853 625.523 31.168C628.382 31.808 631.688 32.128 635.443 32.128C640.392 32.128 644.488 31.552 647.731 30.4C651.016 29.2053 653.512 27.4987 655.219 25.28L675.123 31.168C671.752 36.1173 666.718 39.9787 660.019 42.752C653.32 45.4827 645.128 46.848 635.443 46.848ZM696.917 45.824V29.696L667.157 1.024H691.925L706.837 15.808L721.749 1.024H746.517L716.757 29.696V45.824H696.917Z" fill="#f05608"/>
        </svg>
    );//className="h-auto -mt-4 w-full max-w-[416px]"

    const typographySvg = (
        <svg width="416" height="720" viewBox="0 0 416 720" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25.728 26.24V10.56L33.088 0H43.648L36.48 10.88H45.568V26.24H25.728ZM3.07197 26.24V10.56L10.432 0H20.992L13.824 10.88H22.912V26.24H3.07197ZM4.09597 121.8V77H67.904C72.512 77 76.0106 78.0453 78.4 80.136C80.832 82.184 82.048 84.936 82.048 88.392C82.048 91.1227 81.216 93.3413 79.552 95.048C77.888 96.7547 75.2853 97.928 71.744 98.568V99.848C75.5413 100.189 78.4426 101.277 80.448 103.112C82.4533 104.904 83.456 107.315 83.456 110.344C83.456 113.757 82.24 116.531 79.808 118.664C77.4186 120.755 74.1333 121.8 69.952 121.8H4.09597ZM23.936 94.472H59.072C59.8826 94.472 60.5226 94.2373 60.992 93.768C61.4613 93.2987 61.696 92.68 61.696 91.912C61.696 91.1013 61.44 90.4827 60.928 90.056C60.4586 89.5867 59.84 89.352 59.072 89.352H23.936V94.472ZM23.936 109.448H60.096C60.9066 109.448 61.5466 109.213 62.016 108.744C62.4853 108.275 62.72 107.656 62.72 106.888C62.72 106.077 62.464 105.459 61.952 105.032C61.4826 104.563 60.864 104.328 60.096 104.328H23.936V109.448ZM88.721 121.8V77H168.081V89.928H108.561V93.896H161.169V104.904H108.561V108.872H168.081V121.8H88.721ZM31.104 198.8V168.848H1.34397V154H80.704V168.848H50.944V198.8H31.104ZM85.346 198.8V154H105.186V168.656H144.866V154H164.706V198.8H144.866V182.864H105.186V198.8H85.346ZM172.158 198.8V154H251.518V166.928H191.998V170.896H244.606V181.904H191.998V185.872H251.518V198.8H172.158ZM4.09597 275.8V231H83.456V245.848H23.936V251.096H76.544V264.664H23.936V275.8H4.09597ZM87.4485 275.8V260.952H117.208V245.848H87.4485V231H166.808V245.848H137.048V260.952H166.808V275.8H87.4485ZM173.283 275.8V231H237.091C241.657 231 245.155 232.024 247.587 234.072C250.019 236.077 251.235 238.851 251.235 242.392C251.235 245.123 250.403 247.341 248.739 249.048C247.075 250.755 244.473 251.928 240.931 252.568V253.848C244.814 254.189 247.737 255.299 249.699 257.176C251.662 259.011 252.643 261.4 252.643 264.344V275.8H231.907V264.984C231.907 264.216 231.673 263.597 231.203 263.128C230.734 262.659 230.094 262.424 229.283 262.424H193.123V275.8H173.283ZM193.123 250.264H228.003C228.814 250.264 229.454 250.008 229.923 249.496C230.393 248.984 230.627 248.301 230.627 247.448C230.627 246.509 230.371 245.805 229.859 245.336C229.347 244.867 228.729 244.632 228.003 244.632H193.123V250.264ZM299.368 276.824C294.163 276.824 288.915 276.483 283.624 275.8C278.334 275.16 273.278 274.307 268.456 273.24C263.635 272.131 259.347 270.936 255.592 269.656L261.544 259.224C268.712 261.912 275.539 263.661 282.024 264.472C288.552 265.24 294.803 265.624 300.776 265.624C305.214 265.624 308.563 265.453 310.824 265.112C313.086 264.728 314.216 264.131 314.216 263.32C314.216 262.595 313.384 262.083 311.72 261.784C310.099 261.485 307.902 261.315 305.128 261.272C302.355 261.187 299.262 261.101 295.848 261.016C292.478 260.931 288.979 260.781 285.352 260.568C281.768 260.355 278.291 259.971 274.92 259.416C271.55 258.819 268.52 257.965 265.832 256.856C263.144 255.747 260.99 254.275 259.368 252.44C257.79 250.605 257 248.301 257 245.528C257 242.627 257.896 240.173 259.688 238.168C261.523 236.163 264.019 234.563 267.176 233.368C270.334 232.173 273.939 231.32 277.992 230.808C282.088 230.253 286.376 229.976 290.856 229.976C294.867 229.976 298.899 230.168 302.952 230.552C307.048 230.893 311.016 231.384 314.856 232.024C318.696 232.621 322.259 233.325 325.544 234.136C328.83 234.947 331.646 235.8 333.992 236.696L328.04 247.128C324.414 245.848 320.403 244.781 316.008 243.928C311.656 243.032 307.134 242.371 302.44 241.944C297.747 241.475 293.096 241.24 288.488 241.24C281.363 241.24 277.8 241.987 277.8 243.48C277.8 244.163 278.632 244.653 280.296 244.952C281.96 245.251 284.179 245.443 286.952 245.528C289.768 245.571 292.862 245.635 296.232 245.72C299.56 245.805 303.016 245.955 306.6 246.168C310.227 246.381 313.704 246.765 317.032 247.32C320.403 247.875 323.432 248.707 326.12 249.816C328.851 250.883 331.006 252.312 332.584 254.104C334.163 255.896 334.952 258.136 334.952 260.824C334.952 263.768 333.971 266.264 332.008 268.312C330.088 270.36 327.464 272.024 324.136 273.304C320.808 274.541 317.011 275.437 312.744 275.992C308.478 276.547 304.019 276.824 299.368 276.824ZM366.104 275.8V245.848H336.344V231H415.704V245.848H385.944V275.8H366.104ZM31.104 352.8V322.848H1.34397V308H80.704V322.848H50.944V352.8H31.104ZM121.415 353.824C113.309 353.824 106.269 352.907 100.295 351.072C94.3648 349.195 89.7781 346.528 86.5355 343.072C83.3355 339.616 81.7355 335.52 81.7355 330.784V330.016C81.7355 325.237 83.3355 321.141 86.5355 317.728C89.7781 314.272 94.3648 311.627 100.295 309.792C106.269 307.915 113.309 306.976 121.415 306.976C129.565 306.976 136.605 307.915 142.535 309.792C148.466 311.627 153.031 314.272 156.231 317.728C159.474 321.141 161.095 325.237 161.095 330.016V330.784C161.095 335.52 159.474 339.616 156.231 343.072C153.031 346.528 148.466 349.195 142.535 351.072C136.605 352.907 129.565 353.824 121.415 353.824ZM121.415 339.104C127.261 339.104 131.869 338.379 135.239 336.928C138.653 335.435 140.359 333.387 140.359 330.784V330.016C140.359 327.413 138.653 325.387 135.239 323.936C131.869 322.443 127.261 321.696 121.415 321.696C115.613 321.696 111.005 322.443 107.591 323.936C104.178 325.387 102.471 327.413 102.471 330.016V330.784C102.471 333.387 104.178 335.435 107.591 336.928C111.005 338.379 115.613 339.104 121.415 339.104ZM4.09597 429.8V385H67.904C72.4693 385 75.968 386.024 78.4 388.072C80.832 390.077 82.048 392.851 82.048 396.392C82.048 399.123 81.216 401.341 79.552 403.048C77.888 404.755 75.2853 405.928 71.744 406.568V407.848C75.6266 408.189 78.5493 409.299 80.512 411.176C82.4746 413.011 83.456 415.4 83.456 418.344V429.8H62.72V418.984C62.72 418.216 62.4853 417.597 62.016 417.128C61.5466 416.659 60.9066 416.424 60.096 416.424H23.936V429.8H4.09597ZM23.936 404.264H58.816C59.6266 404.264 60.2666 404.008 60.736 403.496C61.2053 402.984 61.44 402.301 61.44 401.448C61.44 400.509 61.184 399.805 60.672 399.336C60.16 398.867 59.5413 398.632 58.816 398.632H23.936V404.264ZM85.125 429.8L113.093 385H136.581L164.485 429.8H143.173L139.333 422.824H110.469L106.437 429.8H85.125ZM118.981 407.976L116.805 411.816H133.253L131.141 407.976L125.829 397.096H124.549L118.981 407.976ZM166.448 429.8V414.952H196.208V399.848H166.448V385H245.808V399.848H216.048V414.952H245.808V429.8H166.448ZM293.243 430.824C288.038 430.824 282.79 430.483 277.499 429.8C272.209 429.16 267.153 428.307 262.331 427.24C257.51 426.131 253.222 424.936 249.467 423.656L255.419 413.224C262.587 415.912 269.414 417.661 275.899 418.472C282.427 419.24 288.678 419.624 294.651 419.624C299.089 419.624 302.438 419.453 304.699 419.112C306.961 418.728 308.091 418.131 308.091 417.32C308.091 416.595 307.259 416.083 305.595 415.784C303.974 415.485 301.777 415.315 299.003 415.272C296.23 415.187 293.137 415.101 289.723 415.016C286.353 414.931 282.854 414.781 279.227 414.568C275.643 414.355 272.166 413.971 268.795 413.416C265.425 412.819 262.395 411.965 259.707 410.856C257.019 409.747 254.865 408.275 253.243 406.44C251.665 404.605 250.875 402.301 250.875 399.528C250.875 396.627 251.771 394.173 253.563 392.168C255.398 390.163 257.894 388.563 261.051 387.368C264.209 386.173 267.814 385.32 271.867 384.808C275.963 384.253 280.251 383.976 284.731 383.976C288.742 383.976 292.774 384.168 296.827 384.552C300.923 384.893 304.891 385.384 308.731 386.024C312.571 386.621 316.134 387.325 319.419 388.136C322.705 388.947 325.521 389.8 327.867 390.696L321.915 401.128C318.289 399.848 314.278 398.781 309.883 397.928C305.531 397.032 301.009 396.371 296.315 395.944C291.622 395.475 286.971 395.24 282.363 395.24C275.238 395.24 271.675 395.987 271.675 397.48C271.675 398.163 272.507 398.653 274.171 398.952C275.835 399.251 278.054 399.443 280.827 399.528C283.643 399.571 286.737 399.635 290.107 399.72C293.435 399.805 296.891 399.955 300.475 400.168C304.102 400.381 307.579 400.765 310.907 401.32C314.278 401.875 317.307 402.707 319.995 403.816C322.726 404.883 324.881 406.312 326.459 408.104C328.038 409.896 328.827 412.136 328.827 414.824C328.827 417.768 327.846 420.264 325.883 422.312C323.963 424.36 321.339 426.024 318.011 427.304C314.683 428.541 310.886 429.437 306.619 429.992C302.353 430.547 297.894 430.824 293.243 430.824ZM333.908 429.8V385H413.268V397.928H353.748V401.896H406.356V412.904H353.748V416.872H413.268V429.8H333.908ZM-2.78354e-05 506.8L27.968 462H51.456L79.36 506.8H58.048L54.208 499.824H25.344L21.312 506.8H-2.78354e-05ZM33.856 484.976L31.68 488.816H48.128L46.016 484.976L40.704 474.096H39.424L33.856 484.976ZM82.6585 506.8V462H102.242L142.178 486.704V462H162.018V506.8H142.434L102.498 482.096V506.8H82.6585ZM4.09597 583.8V539H83.456V551.928H23.936V555.896H76.544V566.904H23.936V570.872H83.456V583.8H4.09597ZM89.6585 583.8V539H119.29L129.338 558.392L139.386 539H169.018V583.8H149.818V556.28L149.754 556.472L135.546 583.8H123.13L108.922 556.472L108.858 556.28V583.8H89.6585ZM176.471 583.8V539H255.831V551.928H196.311V555.896H248.919V566.904H196.311V570.872H255.831V583.8H176.471ZM262.033 583.8V539H325.841C330.407 539 333.905 540.024 336.337 542.072C338.769 544.077 339.985 546.851 339.985 550.392C339.985 553.123 339.153 555.341 337.489 557.048C335.825 558.755 333.223 559.928 329.681 560.568V561.848C333.564 562.189 336.487 563.299 338.449 565.176C340.412 567.011 341.393 569.4 341.393 572.344V583.8H320.657V572.984C320.657 572.216 320.423 571.597 319.953 571.128C319.484 570.659 318.844 570.424 318.033 570.424H281.873V583.8H262.033ZM281.873 558.264H316.753C317.564 558.264 318.204 558.008 318.673 557.496C319.143 556.984 319.377 556.301 319.377 555.448C319.377 554.509 319.121 553.805 318.609 553.336C318.097 552.867 317.479 552.632 316.753 552.632H281.873V558.264ZM37.12 661.824C32.0853 661.824 27.4346 661.291 23.168 660.224C18.9013 659.157 15.1893 657.621 12.032 655.616C8.87464 653.611 6.42131 651.2 4.67197 648.384C2.92264 645.525 2.04797 642.325 2.04797 638.784V638.016C2.04797 633.28 3.66931 629.184 6.91197 625.728C10.1546 622.272 14.7413 619.627 20.672 617.792C26.6453 615.915 33.6426 614.976 41.664 614.976C51.3493 614.976 59.5413 616.192 66.24 618.624C72.9386 621.013 77.9733 624.384 81.344 628.736L61.44 634.624C59.7333 632.832 57.2373 631.467 53.952 630.528C50.7093 629.547 46.6133 629.056 41.664 629.056C35.4346 629.056 30.528 629.867 26.944 631.488C23.36 633.067 21.568 635.243 21.568 638.016V638.784C21.568 641.557 23.36 643.755 26.944 645.376C30.528 646.955 35.4346 647.744 41.664 647.744C44.1386 647.744 46.6986 647.616 49.344 647.36C51.9893 647.061 54.4853 646.656 56.832 646.144C59.1786 645.589 61.12 644.928 62.656 644.16H41.472V636.48H81.344V660.8H65.984L66.624 651.2H65.408C63.9573 653.419 61.8453 655.317 59.072 656.896C56.2986 658.475 53.0346 659.691 49.28 660.544C45.568 661.397 41.5146 661.824 37.12 661.824ZM87.596 660.8V616H166.956V628.928H107.436V632.896H160.044V643.904H107.436V647.872H166.956V660.8H87.596ZM173.158 660.8V616H192.742L232.678 640.704V616H252.518V660.8H232.934L192.998 636.096V660.8H173.158ZM297.289 661.824C289.268 661.824 282.27 660.885 276.297 659.008C270.366 657.131 265.78 654.485 262.537 651.072C259.294 647.616 257.673 643.52 257.673 638.784V638.016C257.673 633.28 259.294 629.205 262.537 625.792C265.78 622.336 270.366 619.669 276.297 617.792C282.27 615.915 289.268 614.976 297.289 614.976C306.974 614.976 315.166 616.363 321.865 619.136C328.564 621.867 333.598 625.707 336.969 630.656L317.065 636.544C315.358 634.325 312.862 632.64 309.577 631.488C306.334 630.293 302.238 629.696 297.289 629.696C293.534 629.696 290.228 630.037 287.369 630.72C284.553 631.403 282.356 632.363 280.777 633.6C279.198 634.837 278.409 636.309 278.409 638.016V638.784C278.409 640.491 279.198 641.984 280.777 643.264C282.356 644.501 284.553 645.461 287.369 646.144C290.228 646.784 293.534 647.104 297.289 647.104C302.238 647.104 306.334 646.528 309.577 645.376C312.862 644.181 315.358 642.475 317.065 640.256L336.969 646.144C333.598 651.093 328.564 654.955 321.865 657.728C315.166 660.459 306.974 661.824 297.289 661.824ZM358.763 660.8V644.672L329.003 616H353.771L368.683 630.784L383.595 616H408.363L378.603 644.672V660.8H358.763ZM27.52 719.24L34.688 708.36H25.6V693H45.44V708.68L38.08 719.24H27.52ZM4.86397 719.24L12.032 708.36H2.94397V693H22.784V708.68L15.424 719.24H4.86397Z" fill="#323232"/>
        </svg>
    );

    return (
        <div className="min-h-screen px-4 py-8 text-black bg-[#ebebeb] sm:px-6 lg:px-10">
            <div className="mx-auto max-w-[1600px]">
                <div className="flex flex-row items-start gap-3 sm:gap-4 lg:gap-6">
                    <div className="flex items-start pt-2 shrink-0 sm:pt-4 lg:pt-10">
                        <svg width="1" height="70" viewBox="0 0 1 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <line x1="0.5" x2="0.5" y2="70" stroke="black" />
                        </svg>
                    </div>

                    <div className="w-full max-w-[760px] pt-0 sm:pt-1 lg:pt-6">
                        {titleSvg}
                    </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_72px_416px] lg:items-start">
                    <section className="relative min-h-[42rem] overflow-hidden rounded-[28px] border border-slate-200 bg-[#edf3fb] ">
                        <div className="relative z-10 h-full p-4 sm:p-6 lg:p-8">
                            {loading ? (
                                <div className="flex min-h-[38rem] items-center justify-center">
                                    <div className="text-center">
                                        <div className="mx-auto mb-4 border-4 rounded-full h-14 w-14 animate-spin border-black/20 border-t-black" />
                                        <p className="text-lg font-normal tracking-wide text-slate-700">Finding location...</p>
                                    </div>
                                </div>
                            ) : locationError ? (
                                <div className="flex min-h-[38rem] items-center justify-center p-6">
                                    <div className="max-w-xl p-6 text-center">
                                        <h2 className="text-3xl font-medium text-red-700">Emergency location unavailable</h2>
                                        <p className="mt-3 text-lg text-red-700/90">{locationError}</p>
                                        
                                        {/* Show auth buttons if user is not logged in */}
                                        {!user || !userId ? (
                                            <div className="mt-6 space-y-3">
                                                <p className="text-lg text-zinc-600">
                                                    Please sign in to use emergency services and enable location tracking
                                                </p>
                                                <div className="flex flex-col justify-center gap-3 mt-4 sm:flex-row">
                                                    <button
                                                        onClick={() => navigate("/login")}
                                                        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-base font-medium text-white transition hover:bg-blue-700"
                                                    >
                                                        <FaSignInAlt className="mr-2" />
                                                        Login
                                                    </button>
                                                    <button
                                                        onClick={() => navigate("/register")}
                                                        className="inline-flex items-center justify-center rounded-full bg-green-600 px-6 py-2.5 text-base font-medium text-white transition hover:bg-green-700"
                                                    >
                                                        <FaUserPlus className="mr-2" />
                                                        Sign Up
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleRetry}
                                                className="mt-5 inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-base font-medium text-white transition hover:bg-red-700"
                                            >
                                                Retry
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 text-slate-800">
                                    <div className="p-4 border rounded-2xl border-slate-200 bg-white/75 sm:p-6">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-medium uppercase tracking-[0.22em] text-red-600">Live emergency dashboard</p>
                                                <h2 className="mt-1 text-3xl font-semibold leading-none text-slate-900">Your current location</h2>
                                                <p className="mt-2 text-base font-normal text-slate-600">{formatAddress()}</p>
                                            </div>
                                            <div className="px-4 py-3 text-right bg-white border rounded-xl border-slate-200">
                                                <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">City</p>
                                                <p className="text-2xl font-semibold leading-none text-slate-900">{currentcity || "Detecting"}</p>
                                            </div>
                                        </div>

                                        <div className="my-5 border-t border-slate-200" />

                                        <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr] xl:divide-x xl:divide-slate-200">
                                            <div className="pr-0 xl:pr-5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <h3 className="text-2xl font-semibold text-slate-900">Coordinates</h3>
                                                    <span className="px-3 py-1 text-sm font-medium text-white rounded-full bg-slate-900">
                                                        {isTracking ? "Tracking active" : "Tracking idle"}
                                                    </span>
                                                </div>
                                                <div className="grid gap-3 mt-4 sm:grid-cols-2">
                                                    <div className="p-4 bg-white border rounded-xl border-slate-200">
                                                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Latitude</p>
                                                        <p className="mt-1 text-2xl font-semibold leading-none text-slate-900">{location?.lat?.toFixed(6) || "--"}</p>
                                                    </div>
                                                    <div className="p-4 bg-white border rounded-xl border-slate-200">
                                                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Longitude</p>
                                                        <p className="mt-1 text-2xl font-semibold leading-none text-slate-900">{location?.lng?.toFixed(6) || "--"}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-3 mt-4">
                                                    <a
                                                        href={`https://www.google.com/maps?q=${location?.lat},${location?.lng}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-base font-medium text-white transition hover:bg-slate-700"
                                                    >
                                                        <FaMapMarkerAlt className="mr-2" />
                                                        Open in Maps
                                                    </a>
                                                    {isTracking && (
                                                        <button
                                                            onClick={stopTracking}
                                                            className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-base font-medium text-white transition hover:bg-red-700"
                                                        >
                                                            <MdStopCircle className="mr-2 text-lg" />
                                                            Stop Live Tracking
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pl-0 xl:pl-5">
                                                <h3 className="text-2xl font-semibold text-slate-900">Notify contacts</h3>
                                                <p className="mt-1 text-base font-normal text-slate-600">Starts live tracking and shares a WhatsApp link.</p>
                                                <div className="flex flex-wrap gap-3 mt-4">
                                                    {emergencyContacts ? (
                                                        <>
                                                            {emergencyContacts.mom && (
                                                                <button
                                                                    onClick={() => handleEmergencyContact("Mom", emergencyContacts.mom)}
                                                                    disabled={isTracking}
                                                                    className="px-4 py-2 text-base font-medium text-white transition rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
                                                                >
                                                                    {isTracking ? (
                                                                        <span className="inline-flex items-center">
                                                                            <FaSyncAlt className="mr-2 animate-spin" />
                                                                            Tracking Active
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center">
                                                                            <FaWhatsapp className="mr-2" />
                                                                            Mom
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            )}
                                                            {emergencyContacts.dad && (
                                                                <button
                                                                    onClick={() => handleEmergencyContact("Dad", emergencyContacts.dad)}
                                                                    disabled={isTracking}
                                                                    className="px-4 py-2 text-base font-medium text-white transition rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
                                                                >
                                                                    {isTracking ? (
                                                                        <span className="inline-flex items-center">
                                                                            <FaSyncAlt className="mr-2 animate-spin" />
                                                                            Tracking Active
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center">
                                                                            <FaWhatsapp className="mr-2" />
                                                                            Dad
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            )}
                                                            {emergencyContacts.friend && (
                                                                <button
                                                                    onClick={() => handleEmergencyContact("Best Friend", emergencyContacts.friend)}
                                                                    disabled={isTracking}
                                                                    className="px-4 py-2 text-base font-medium text-white transition rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
                                                                >
                                                                    {isTracking ? (
                                                                        <span className="inline-flex items-center">
                                                                            <FaSyncAlt className="mr-2 animate-spin" />
                                                                            Tracking Active
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center">
                                                                            <FaWhatsapp className="mr-2" />
                                                                            Best Friend
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p className="text-base font-normal text-slate-500">Add emergency contacts in your profile settings.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border rounded-2xl border-slate-200 bg-white/75 sm:p-6">
                                        <div className="mb-4">
                                            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Nearby Assistance</p>
                                        </div>
                                        <div className="grid gap-6 xl:grid-cols-2 xl:divide-x xl:divide-slate-200">
                                            <div className="pr-0 xl:pr-5">
                                                <div className="flex items-center justify-between gap-3 mb-4">
                                                    <h3 className="text-2xl font-semibold text-red-700">Nearest hospitals</h3>
                                                    <span className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-full">Top nearby</span>
                                                </div>
                                                {renderFacilityList(nearbyHospitals, "No hospitals found nearby.", {
                                                    badge: "bg-red-100 text-red-700",
                                                    button: "bg-emerald-600 hover:bg-emerald-700",
                                                })}
                                            </div>

                                            <div className="pl-0 xl:pl-5">
                                                <div className="flex items-center justify-between gap-3 mb-4">
                                                    <h3 className="text-2xl font-semibold text-blue-700">Nearest police stations</h3>
                                                    <span className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-full">Top nearby</span>
                                                </div>
                                                {renderFacilityList(nearbyPoliceStations, "No police stations found nearby.", {
                                                    badge: "bg-blue-100 text-blue-700",
                                                    button: "bg-sky-600 hover:bg-sky-700",
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="justify-center hidden h-full -pt-10 lg:flex">
                        <svg width="1" height="768" viewBox="0 0 1 768" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <line x1="0.5" x2="0.5" y2="768" stroke="black" />
                        </svg>
                    </div>

                    <aside className="hidden pt-4 lg:block">
                        {typographySvg}
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default EmergencyPage;
