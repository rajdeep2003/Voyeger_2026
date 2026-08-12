import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
  </div>
);

const MapPage = () => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [touristSpots, setTouristSpots] = useState([]);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [spotsError, setSpotsError] = useState(null);
  const spotsContainerRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location permission denied.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            setError("The request to get your location timed out.");
            break;
          default:
            setError("An unknown error occurred while getting location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Fetch suggestions from Nominatim
  useEffect(() => {
    if (search.length < 3) {
      setSuggestions([]);
      return;
    }
    setSearchLoading(true);
    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        search
      )}&addressdetails=1&limit=5`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        setSuggestions(data);
        setSearchLoading(false);
      })
      .catch(() => setSearchLoading(false));
    return () => controller.abort();
  }, [search]);

  // Fetch nearby popular tourist spots from Overpass API
  useEffect(() => {
    if (!coords) return;

    setSpotsLoading(true);
    setSpotsError(null);
    const controller = new AbortController();

    // This query looks for tourist spots that have a Wikidata tag,
    // which is a good proxy for notability/popularity. It returns up to 10 results.
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["tourism"]["wikidata"](around:15000,${coords.lat},${coords.lng});
        way["tourism"]["wikidata"](around:15000,${coords.lat},${coords.lng});
        relation["tourism"]["wikidata"](around:15000,${coords.lat},${coords.lng});
      );
      out center;
    `;

    fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        overpassQuery
      )}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        const spots = data.elements
          .filter((element) => element.tags && element.tags.name)
          .map((element) => ({
            id: element.id,
            name: element.tags.name,
            lat: element.lat || element.center?.lat,
            lon: element.lon || element.center?.lon,
          }))
          .filter((spot) => spot.lat && spot.lon);

        const uniqueSpots = spots
          .filter(
            (spot, index, self) =>
              index === self.findIndex((s) => s.name === spot.name)
          )
          .slice(0, 10); // Take the top 10 unique spots

        setTouristSpots(uniqueSpots);
        if (uniqueSpots.length === 0) {
          setSpotsError("No popular tourist spots found nearby.");
        }
        setSpotsLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setSpotsError("Could not fetch popular tourist spots.");
        }
        setSpotsLoading(false);
      });

    return () => controller.abort();
  }, [coords]);

  const handleSuggestionClick = (suggestion) => {
    setCoords({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    });
    setSearch("");
    setSuggestions([]);
    setError(null);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    }
  };

  const SmallSpinner = () => (
    <div className="flex items-center justify-center h-16">
      <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  const scrollSpots = (direction) => {
    if (!spotsContainerRef.current) return;

    spotsContainerRef.current.scrollBy({
      left: direction === "next" ? 280 : -280,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-[#ebebeb]">
      <div className="bg-transparent rounded-xl shadow-lg p-2 md:p-4 w-[98vw] h-[90vh] mx-auto flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl mb-4">
          <svg
            width="1440"
            height="159"
            viewBox="0 0 1440 159"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block w-full h-auto max-w-[980px] mx-auto"
          >
            <path d="M29.504 61V44.872L-0.256 16.2H24.512L39.424 30.984L54.336 16.2H79.104L49.344 44.872V61H29.504ZM110.782 62.024C102.675 62.024 95.6348 61.1067 89.6615 59.272C83.7308 57.3947 79.1442 54.728 75.9015 51.272C72.7015 47.816 71.1015 43.72 71.1015 38.984V38.216C71.1015 33.4373 72.7015 29.3413 75.9015 25.928C79.1442 22.472 83.7308 19.8267 89.6615 17.992C95.6348 16.1147 102.675 15.176 110.782 15.176C118.931 15.176 125.971 16.1147 131.902 17.992C137.832 19.8267 142.398 22.472 145.598 25.928C148.84 29.3413 150.462 33.4373 150.462 38.216V38.984C150.462 43.72 148.84 47.816 145.598 51.272C142.398 54.728 137.832 57.3947 131.902 59.272C125.971 61.1067 118.931 62.024 110.782 62.024ZM110.782 47.304C116.627 47.304 121.235 46.5787 124.606 45.128C128.019 43.6347 129.726 41.5867 129.726 38.984V38.216C129.726 35.6133 128.019 33.5867 124.606 32.136C121.235 30.6427 116.627 29.896 110.782 29.896C104.979 29.896 100.371 30.6427 96.9575 32.136C93.5442 33.5867 91.8375 35.6133 91.8375 38.216V38.984C91.8375 41.5867 93.5442 43.6347 96.9575 45.128C100.371 46.5787 104.979 47.304 110.782 47.304ZM194.685 62.024C168.232 62.024 155.005 53.512 155.005 36.488V16.2H174.845V35.848C174.845 43.4853 181.458 47.304 194.685 47.304C207.912 47.304 214.525 43.4853 214.525 35.848V16.2H234.365V36.488C234.365 53.512 221.138 62.024 194.685 62.024ZM240.962 61V16.2H304.77C309.335 16.2 312.834 17.224 315.266 19.272C317.698 21.2773 318.914 24.0507 318.914 27.592C318.914 30.3227 318.082 32.5413 316.418 34.248C314.754 35.9547 312.151 37.128 308.61 37.768V39.048C312.493 39.3893 315.415 40.4987 317.378 42.376C319.341 44.2107 320.322 46.6 320.322 49.544V61H299.586V50.184C299.586 49.416 299.351 48.7973 298.882 48.328C298.413 47.8587 297.773 47.624 296.962 47.624H260.802V61H240.962ZM260.802 35.464H295.682C296.493 35.464 297.133 35.208 297.602 34.696C298.071 34.184 298.306 33.5013 298.306 32.648C298.306 31.7093 298.05 31.0053 297.538 30.536C297.026 30.0667 296.407 29.832 295.682 29.832H260.802V35.464ZM345.525 61V16.2H365.365V46.152H424.885V61H345.525ZM465.594 62.024C457.487 62.024 450.447 61.1067 444.474 59.272C438.543 57.3947 433.957 54.728 430.714 51.272C427.514 47.816 425.914 43.72 425.914 38.984V38.216C425.914 33.4373 427.514 29.3413 430.714 25.928C433.957 22.472 438.543 19.8267 444.474 17.992C450.447 16.1147 457.487 15.176 465.594 15.176C473.743 15.176 480.783 16.1147 486.714 17.992C492.645 19.8267 497.21 22.472 500.41 25.928C503.653 29.3413 505.274 33.4373 505.274 38.216V38.984C505.274 43.72 503.653 47.816 500.41 51.272C497.21 54.728 492.645 57.3947 486.714 59.272C480.783 61.1067 473.743 62.024 465.594 62.024ZM465.594 47.304C471.439 47.304 476.047 46.5787 479.418 45.128C482.831 43.6347 484.538 41.5867 484.538 38.984V38.216C484.538 35.6133 482.831 33.5867 479.418 32.136C476.047 30.6427 471.439 29.896 465.594 29.896C459.791 29.896 455.183 30.6427 451.77 32.136C448.357 33.5867 446.65 35.6133 446.65 38.216V38.984C446.65 41.5867 448.357 43.6347 451.77 45.128C455.183 46.5787 459.791 47.304 465.594 47.304ZM548.218 62.024C540.196 62.024 533.199 61.0853 527.226 59.208C521.295 57.3307 516.708 54.6853 513.466 51.272C510.223 47.816 508.602 43.72 508.602 38.984V38.216C508.602 33.48 510.223 29.4053 513.466 25.992C516.708 22.536 521.295 19.8693 527.226 17.992C533.199 16.1147 540.196 15.176 548.218 15.176C557.903 15.176 566.095 16.5627 572.794 19.336C579.492 22.0667 584.527 25.9067 587.898 30.856L567.994 36.744C566.287 34.5253 563.791 32.84 560.506 31.688C557.263 30.4933 553.167 29.896 548.218 29.896C544.463 29.896 541.156 30.2373 538.298 30.92C535.482 31.6027 533.284 32.5627 531.706 33.8C530.127 35.0373 529.338 36.5093 529.338 38.216V38.984C529.338 40.6907 530.127 42.184 531.706 43.464C533.284 44.7013 535.482 45.6613 538.298 46.344C541.156 46.984 544.463 47.304 548.218 47.304C553.167 47.304 557.263 46.728 560.506 45.576C563.791 44.3813 566.287 42.6747 567.994 40.456L587.898 46.344C584.527 51.2933 579.492 55.1547 572.794 57.928C566.095 60.6587 557.903 62.024 548.218 62.024ZM583.741 61L611.709 16.2H635.197L663.101 61H641.789L637.949 54.024H609.085L605.053 61H583.741ZM617.597 39.176L615.421 43.016H631.869L629.757 39.176L624.445 28.296H623.165L617.597 39.176ZM679.908 61V31.048H650.148V16.2H729.508V31.048H699.748V61H679.908ZM733.19 61V46.152H762.95V31.048H733.19V16.2H812.55V31.048H782.79V46.152H812.55V61H733.19ZM855.469 62.024C847.362 62.024 840.322 61.1067 834.349 59.272C828.418 57.3947 823.832 54.728 820.589 51.272C817.389 47.816 815.789 43.72 815.789 38.984V38.216C815.789 33.4373 817.389 29.3413 820.589 25.928C823.832 22.472 828.418 19.8267 834.349 17.992C840.322 16.1147 847.362 15.176 855.469 15.176C863.618 15.176 870.658 16.1147 876.589 17.992C882.52 19.8267 887.085 22.472 890.285 25.928C893.528 29.3413 895.149 33.4373 895.149 38.216V38.984C895.149 43.72 893.528 47.816 890.285 51.272C887.085 54.728 882.52 57.3947 876.589 59.272C870.658 61.1067 863.618 62.024 855.469 62.024ZM855.469 47.304C861.314 47.304 865.922 46.5787 869.293 45.128C872.706 43.6347 874.413 41.5867 874.413 38.984V38.216C874.413 35.6133 872.706 33.5867 869.293 32.136C865.922 30.6427 861.314 29.896 855.469 29.896C849.666 29.896 845.058 30.6427 841.645 32.136C838.232 33.5867 836.525 35.6133 836.525 38.216V38.984C836.525 41.5867 838.232 43.6347 841.645 45.128C845.058 46.5787 849.666 47.304 855.469 47.304ZM900.275 61V16.2H919.859L959.795 40.904V16.2H979.635V61H960.051L920.115 36.296V61H900.275ZM1044.16 62.024C1036.05 62.024 1029.01 61.1067 1023.04 59.272C1017.11 57.3947 1012.52 54.728 1009.28 51.272C1006.08 47.816 1004.48 43.72 1004.48 38.984V38.216C1004.48 33.4373 1006.08 29.3413 1009.28 25.928C1012.52 22.472 1017.11 19.8267 1023.04 17.992C1029.01 16.1147 1036.05 15.176 1044.16 15.176C1052.31 15.176 1059.35 16.1147 1065.28 17.992C1071.21 19.8267 1075.77 22.472 1078.97 25.928C1082.22 29.3413 1083.84 33.4373 1083.84 38.216V38.984C1083.84 43.72 1082.22 47.816 1078.97 51.272C1075.77 54.728 1071.21 57.3947 1065.28 59.272C1059.35 61.1067 1052.31 62.024 1044.16 62.024ZM1044.16 47.304C1050 47.304 1054.61 46.5787 1057.98 45.128C1061.39 43.6347 1063.1 41.5867 1063.1 38.984V38.216C1063.1 35.6133 1061.39 33.5867 1057.98 32.136C1054.61 30.6427 1050 29.896 1044.16 29.896C1038.35 29.896 1033.75 30.6427 1030.33 32.136C1026.92 33.5867 1025.21 35.6133 1025.21 38.216V38.984C1025.21 41.5867 1026.92 43.6347 1030.33 45.128C1033.75 46.5787 1038.35 47.304 1044.16 47.304ZM1088.96 61V16.2H1108.55L1148.48 40.904V16.2H1168.32V61H1148.74L1108.8 36.296V61H1088.96ZM1195.21 61V16.2H1224.84L1234.89 35.592L1244.94 16.2H1274.57V61H1255.37V33.48L1255.31 33.672L1241.1 61H1228.68L1214.48 33.672L1214.41 33.48V61H1195.21ZM1277.93 61L1305.9 16.2H1329.38L1357.29 61H1335.98L1332.14 54.024H1303.27L1299.24 61H1277.93ZM1311.78 39.176L1309.61 43.016H1326.06L1323.94 39.176L1318.63 28.296H1317.35L1311.78 39.176ZM1360.59 61V16.2H1421.32C1427.51 16.2 1432.05 17.4587 1434.96 19.976C1437.86 22.4507 1439.31 26.2267 1439.31 31.304C1439.31 34.7173 1438.67 37.7467 1437.39 40.392C1436.15 43.0373 1434.21 45.128 1431.56 46.664C1428.92 48.1573 1425.5 48.904 1421.32 48.904H1380.43V61H1360.59ZM1415.95 29.832H1380.43V35.464H1415.95C1416.76 35.464 1417.4 35.208 1417.87 34.696C1418.34 34.184 1418.57 33.5013 1418.57 32.648C1418.57 31.752 1418.32 31.0693 1417.8 30.6C1417.33 30.088 1416.72 29.832 1415.95 29.832Z" fill="#323232" />
          </svg>
          <p className="max-w-3xl px-2 mx-auto mt-1 text-sm leading-relaxed text-center sm:px-0 sm:text-base text-black/65 sm:-mt-3">
            Explore your surroundings and discover nearby tourist spots with our interactive map. Search for any location and find popular attractions around you!
          </p>
        </div>
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl mb-2">
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Search for a location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
          {searchLoading && (
            <div className="absolute w-4 h-4 border-2 border-blue-400 rounded-full right-3 top-3 border-t-transparent animate-spin"></div>
          )}
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 z-10 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg max-h-60">
              {suggestions.map((s, idx) => (
                <li
                  key={s.place_id}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </form>

        {/* Tourist Spots Section */}
        <div className="w-full max-w-xl mb-4">
          <h3 className="mb-2 text-xl font-bold text-center text-gray-800">
            Nearby Tourist Spots
          </h3>
          {spotsLoading ? (
            <SmallSpinner />
          ) : spotsError && touristSpots.length === 0 ? (
            <p className="text-center text-gray-500">{spotsError}</p>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous tourist spots"
                onClick={() => scrollSpots("prev")}
                className="inline-flex items-center justify-center text-gray-700 transition bg-white border border-gray-300 rounded-full shadow-sm h-9 w-9 shrink-0 hover:bg-gray-100"
              >
                <ChevronLeft size={18} />
              </button>

              <div
                ref={spotsContainerRef}
                className="flex flex-1 space-x-4 overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {touristSpots.map((spot) => (
                  <div
                    key={spot.id}
                    className="flex-shrink-0 p-3 transition-all bg-gray-100 border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md hover:bg-blue-50"
                    onClick={() => setCoords({ lat: spot.lat, lng: spot.lon })}
                  >
                    <p className="font-semibold text-gray-700 whitespace-nowrap">
                      {spot.name}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                aria-label="Next tourist spots"
                onClick={() => scrollSpots("next")}
                className="inline-flex items-center justify-center text-gray-700 transition bg-white border border-gray-300 rounded-full shadow-sm h-9 w-9 shrink-0 hover:bg-gray-100"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {error ? (
          <div className="w-full px-4 py-4 text-center text-red-600 rounded-lg bg-red-50">
            <h3 className="mb-1 text-lg font-semibold">Error</h3>
            <p>{error}</p>
          </div>
        ) : coords ? (
          <div className="flex-1 w-full overflow-hidden border border-gray-200 rounded-lg">
            <iframe
              className="w-full h-full"
              src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
              allowFullScreen
              loading="lazy"
              title="User Location Map"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <Spinner />
            <p className="mt-4 text-lg text-center text-gray-600">Fetching your location...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;