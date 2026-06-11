import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  ArrowLeftRight,
  Backpack,
  CalendarDays,
  CloudRain,
  CloudSun,
  Gauge,
  Loader2,
  MapPin,
  Search,
  Sun,
  Thermometer,
  Umbrella,
  Wind,
  Droplets,
} from "lucide-react";

const OPEN_WEATHER_KEY =
  import.meta.env.VITE_OPENWEATHER_API_KEY || "d1913710720b5095ce7b6763b3f46e71";

const WEATHER_ICON = "https://openweathermap.org/img/wn";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const titleCase = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const safeParseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const tr = (t, key, fallback, options) => {
  const translated = t(key, options);
  return translated === key ? fallback : translated;
};

const stripEmoji = (value = "") =>
  value.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "").trim();

export const getEvidenceBasedPacking = ({ temp, uvIndex, rainfall }) => {
  const items = [];

  if (typeof temp === "number") {
    if (temp < -10) {
      items.push("Thermal underwear", "Insulated boots", "Heavy coat");
    } else if (temp < 0) {
      items.push("Scarf", "Gloves", "Waterproof boots");
    } else if (temp < 10) {
      items.push("Warm jacket", "Long pants", "Light scarf");
    } else if (temp < 30) {
      items.push("T-shirt", "Light pants", "Comfortable shoes");
    } else if (temp < 35) {
      items.push("Lightweight clothing", "Hydration pack", "Sunscreen");
    } else {
      items.push("Avoid sun from 12-4PM", "Stay hydrated", "UV-protective gear");
    }
  }

  if (typeof uvIndex === "number") {
    if (uvIndex >= 3) {
      items.push("Sunscreen (SPF 30+)", "Sunglasses", "Sunhat");
    }
    if (uvIndex >= 6) {
      items.push("Seek shade", "Cover skin");
    }
    if (uvIndex >= 8) {
      items.push("Avoid direct sunlight", "Full coverage clothing");
    }
  }

  if (typeof rainfall === "number") {
    if (rainfall > 50) {
      items.push("Waterproof boots", "Raincoat", "Rainproof backpack cover");
    } else if (rainfall > 10) {
      items.push("Umbrella", "Water-resistant jacket");
    }
  }

  return Array.from(new Set(items));
};

const getCoordinates = async (city) => {
  const query = encodeURIComponent(`${city},India`);
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
  );

  if (!response.ok) return null;

  const data = await safeParseJson(response);
  if (!Array.isArray(data) || data.length === 0) return null;

  return { lat: Number(data[0].lat), lon: Number(data[0].lon) };
};

const fetchOpenMeteo = async (lat, lon) => {
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current_weather: "true",
      hourly: "uv_index,precipitation",
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) return { uvIndex: null, rainfall: null };

    const data = await safeParseJson(response);
    if (!data?.hourly?.time) return { uvIndex: null, rainfall: null };

    const now = new Date();
    const hourString = now.toISOString().slice(0, 13);
    const hourIndex = data.hourly.time.findIndex((timePoint) =>
      timePoint.startsWith(hourString)
    );

    return {
      uvIndex: hourIndex !== -1 ? data.hourly.uv_index?.[hourIndex] ?? null : null,
      rainfall: hourIndex !== -1 ? data.hourly.precipitation?.[hourIndex] ?? null : null,
    };
  } catch {
    return { uvIndex: null, rainfall: null };
  }
};

const fetchWeatherByCity = async (city) => {
  const params = new URLSearchParams({
    units: "metric",
    q: city,
    appid: OPEN_WEATHER_KEY,
  });

  return fetch(`https://api.openweathermap.org/data/2.5/weather?${params.toString()}`);
};

const fetchWeatherByCoords = async ({ lat, lon }) => {
  const params = new URLSearchParams({
    units: "metric",
    lat: String(lat),
    lon: String(lon),
    appid: OPEN_WEATHER_KEY,
  });

  return fetch(`https://api.openweathermap.org/data/2.5/weather?${params.toString()}`);
};

const fetchForecast = async (city, coords = null) => {
  const params = new URLSearchParams({ units: "metric", appid: OPEN_WEATHER_KEY });
  if (coords?.lat && coords?.lon) {
    params.set("lat", String(coords.lat));
    params.set("lon", String(coords.lon));
  } else {
    params.set("q", city);
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?${params.toString()}`
  );
  if (!response.ok) return null;

  const data = await safeParseJson(response);
  if (!data?.list) return null;

  return data.list.filter((_, idx) => idx % 8 === 0).slice(0, 5);
};

const getSeasonalOutlook = (cityData, t) => {
  const month = new Date().getMonth();
  const temp = cityData.main.temp;
  const lat = cityData.coord?.lat ?? 1;
  const isNorthern = lat > 0;
  const currentTemp = Math.round(temp);

  const S = {
    spring: tr(t, "weather.seasons.spring", "Spring"),
    summer: tr(t, "weather.seasons.summer", "Summer"),
    autumn: tr(t, "weather.seasons.autumn", "Autumn"),
    winter: tr(t, "weather.seasons.winter", "Winter"),
  };

  let currentSeason;
  let nextSeason;

  if (isNorthern) {
    if (month >= 2 && month <= 4) {
      currentSeason = S.spring;
      nextSeason = S.summer;
    } else if (month >= 5 && month <= 7) {
      currentSeason = S.summer;
      nextSeason = S.autumn;
    } else if (month >= 8 && month <= 10) {
      currentSeason = S.autumn;
      nextSeason = S.winter;
    } else {
      currentSeason = S.winter;
      nextSeason = S.spring;
    }
  } else if (month >= 2 && month <= 4) {
    currentSeason = S.autumn;
    nextSeason = S.winter;
  } else if (month >= 5 && month <= 7) {
    currentSeason = S.winter;
    nextSeason = S.spring;
  } else if (month >= 8 && month <= 10) {
    currentSeason = S.spring;
    nextSeason = S.summer;
  } else {
    currentSeason = S.summer;
    nextSeason = S.autumn;
  }

  return [
    tr(t, "weather.outlook", `${currentSeason}: around ${currentTemp} C`, {
      season: currentSeason,
      description: tr(t, "weather.weatherConditions.mild", `around ${currentTemp} C`, {
        temp: currentTemp,
      }),
    }),
    tr(t, "weather.nextMonths", `Next months move toward ${nextSeason}`, {
      description: `${nextSeason}`,
    }),
  ];
};

const getBestTimeToVisit = (cityData, t) => {
  const temp = cityData.main.temp;
  const lat = cityData.coord?.lat ?? 1;
  const isNorthern = lat > 0;

  let idealMonths;
  if (isNorthern) {
    if (temp < 10) idealMonths = ["May", "June", "September"];
    else if (temp > 28) idealMonths = ["April-May", "September-October"];
    else idealMonths = ["April-June", "September-October"];
  } else if (temp < 10) {
    idealMonths = ["November-December", "March-April"];
  } else if (temp > 28) {
    idealMonths = ["March-April", "October-November"];
  } else {
    idealMonths = ["October-December", "March-May"];
  }

  return tr(t, "weather.bestTimeToVisit", `Best time: ${idealMonths.join(" or ")}`, {
    months: idealMonths.join(" or "),
  });
};

const infoCardClass =
  "border border-black/15 bg-white/70 px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.08)]";

const WeatherPage = () => {
  const { t } = useTranslation();

  const [city1, setCity1] = useState("");
  const [city2, setCity2] = useState("");
  const [weather1, setWeather1] = useState(null);
  const [weather2, setWeather2] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("single");

  const singleCityLabel = stripEmoji(tr(t, "weather.singleCity", "Single City"));
  const compareCitiesLabel = stripEmoji(tr(t, "weather.compareCities", "Compare Cities"));

  const toggleClass = (isActive) =>
    cx(
      "inline-flex items-center gap-2 border px-4 py-2 text-sm font-semibold tracking-wide transition-all",
      isActive
        ? "border-black bg-black text-[#ebebeb]"
        : "border-black/25 bg-white/40 text-black hover:bg-black/5"
    );

  const checkWeather = async () => {
    if (!city1.trim()) {
      setError(tr(t, "weather.enterCity", "Enter a city name to continue"));
      return;
    }

    if (!OPEN_WEATHER_KEY) {
      setError("Weather API key is missing. Set VITE_OPENWEATHER_API_KEY.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const requestedCity = city1.trim();
      let weatherResponse = await fetchWeatherByCity(requestedCity);
      let weatherData = null;

      if (!weatherResponse.ok) {
        const coords = await getCoordinates(requestedCity);
        if (!coords) {
          throw new Error(tr(t, "weather.cityNotFound", "City not found"));
        }

        weatherResponse = await fetchWeatherByCoords(coords);
        if (!weatherResponse.ok) {
          throw new Error(tr(t, "weather.cityNotFound", "City not found"));
        }

        weatherData = await safeParseJson(weatherResponse);
        weatherData.name = requestedCity;
      } else {
        weatherData = await safeParseJson(weatherResponse);
      }

      if (!weatherData?.main) {
        throw new Error(tr(t, "weather.cityNotFound", "City not found"));
      }

      const forecastData = await fetchForecast(requestedCity, weatherData.coord);
      const meteo = weatherData.coord
        ? await fetchOpenMeteo(weatherData.coord.lat, weatherData.coord.lon)
        : { uvIndex: null, rainfall: null };

      setWeather1({ ...weatherData, uvIndex: meteo.uvIndex, rainfall: meteo.rainfall });
      setWeather2(null);
      setForecast(forecastData);
    } catch (err) {
      setWeather1(null);
      setForecast(null);
      setError(err?.message || tr(t, "weather.cityNotFound", "Unable to fetch weather"));
    } finally {
      setLoading(false);
    }
  };

  const compareWeather = async () => {
    if (!city1.trim() || !city2.trim()) {
      setError(tr(t, "weather.enterBothCities", "Enter both city names"));
      return;
    }

    if (!OPEN_WEATHER_KEY) {
      setError("Weather API key is missing. Set VITE_OPENWEATHER_API_KEY.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [resp1, resp2] = await Promise.all([
        fetchWeatherByCity(city1.trim()),
        fetchWeatherByCity(city2.trim()),
      ]);

      if (!resp1.ok || !resp2.ok) {
        throw new Error(tr(t, "weather.cityNotFound", "One or both cities were not found"));
      }

      const [data1, data2] = await Promise.all([safeParseJson(resp1), safeParseJson(resp2)]);
      if (!data1?.main || !data2?.main) {
        throw new Error(tr(t, "weather.cityNotFound", "One or both cities were not found"));
      }

      setWeather1(data1);
      setWeather2(data2);
      setForecast(null);
    } catch (err) {
      setWeather1(null);
      setWeather2(null);
      setError(err?.message || tr(t, "weather.cityNotFound", "Unable to compare cities"));
    } finally {
      setLoading(false);
    }
  };

  const comparisonSummary = useMemo(() => {
    if (!weather1 || !weather2) return [];

    const tempDiff = weather1.main.temp - weather2.main.temp;
    const absTempDiff = Math.abs(tempDiff);
    const warmerCity = tempDiff > 0 ? weather1 : weather2;
    const coolerCity = tempDiff > 0 ? weather2 : weather1;
    const delta = Math.round(absTempDiff);

    const lines = [];

    if (absTempDiff < 3) {
      lines.push(tr(t, "weather.temperaturesSimilar", "Both cities have similar temperatures"));
    } else {
      lines.push(
        tr(t, "weather.warmerThan", `${warmerCity.name} is warmer than ${coolerCity.name} by ${delta} C`, {
          city1: warmerCity.name,
          city2: coolerCity.name,
          diff: delta,
        })
      );
    }

    if (tempDiff > 5) {
      lines.push(tr(t, "weather.preferWarmer", `Choose ${warmerCity.name} for warmer travel`, { city: warmerCity.name }));
    } else if (tempDiff < -5) {
      lines.push(tr(t, "weather.preferCooler", `Choose ${coolerCity.name} for cooler travel`, { city: coolerCity.name }));
    }

    return lines;
  }, [weather1, weather2, t]);

  return (
    <section
      className="relative min-h-screen px-4 pb-16 pt-24 text-[#323232]"
      style={{
        backgroundColor: "#ebebeb",
      }}
    >
      <div className="w-full max-w-6xl mx-auto space-y-8">
        <header className="px-1 py-1 md:px-1 md:py-1">
          <div className="w-full max-w-4xl">
            <svg
              viewBox="0 0 821 123"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto"
            >
              <path d="M25.344 44.8L-3.30806e-06 0H22.208L36.48 28.16L51.392 0H70.784L85.056 28.16L99.968 0H122.176L96.768 44.8H73.92L61.056 20.352L48.192 44.8H25.344ZM125.593 44.8V0H204.953V12.928H145.433V16.896H198.041V27.904H145.433V31.872H204.953V44.8H125.593ZM206.747 44.8L234.715 0H258.203L286.107 44.8H264.795L260.955 37.824H232.091L228.059 44.8H206.747ZM240.603 22.976L238.427 26.816H254.875L252.763 22.976L247.451 12.096H246.171L240.603 22.976ZM302.913 44.8V14.848H273.153V0H352.514V14.848H322.753V44.8H302.913ZM357.155 44.8V0H376.995V14.656H416.675V0H436.516V44.8H416.675V28.864H376.995V44.8H357.155ZM443.968 44.8V0H523.328V12.928H463.808V16.896H516.416V27.904H463.808V31.872H523.328V44.8H443.968ZM529.53 44.8V0H593.339C597.904 0 601.403 1.024 603.835 3.072C606.266 5.07734 607.482 7.85067 607.482 11.392C607.482 14.1227 606.65 16.3413 604.987 18.048C603.323 19.7547 600.72 20.928 597.178 21.568V22.848C601.061 23.1893 603.984 24.2987 605.947 26.176C607.909 28.0107 608.891 30.4 608.891 33.344V44.8H588.154V33.984C588.154 33.216 587.92 32.5973 587.451 32.128C586.981 31.6587 586.341 31.424 585.53 31.424H549.37V44.8H529.53ZM549.37 19.264H584.25C585.061 19.264 585.701 19.008 586.17 18.496C586.64 17.984 586.875 17.3013 586.875 16.448C586.875 15.5093 586.618 14.8053 586.106 14.336C585.595 13.8667 584.976 13.632 584.25 13.632H549.37V19.264ZM41.536 122.824C33.5147 122.824 26.5173 121.885 20.544 120.008C14.6133 118.131 10.0267 115.485 6.784 112.072C3.54133 108.616 1.92 104.52 1.92 99.784V99.016C1.92 94.28 3.54133 90.2053 6.784 86.792C10.0267 83.336 14.6133 80.6693 20.544 78.792C26.5173 76.9147 33.5147 75.976 41.536 75.976C51.2213 75.976 59.4133 77.3627 66.112 80.136C72.8107 82.8667 77.8453 86.7067 81.216 91.656L61.312 97.544C59.6053 95.3253 57.1093 93.64 53.824 92.488C50.5813 91.2933 46.4853 90.696 41.536 90.696C37.7813 90.696 34.4747 91.0373 31.616 91.72C28.8 92.4027 26.6027 93.3627 25.024 94.6C23.4453 95.8373 22.656 97.3093 22.656 99.016V99.784C22.656 101.491 23.4453 102.984 25.024 104.264C26.6027 105.501 28.8 106.461 31.616 107.144C34.4747 107.784 37.7813 108.104 41.536 108.104C46.4853 108.104 50.5813 107.528 53.824 106.376C57.1093 105.181 59.6053 103.475 61.312 101.256L81.216 107.144C77.8453 112.093 72.8107 115.955 66.112 118.728C59.4133 121.459 51.2213 122.824 41.536 122.824ZM122.662 122.824C114.556 122.824 107.516 121.907 101.542 120.072C95.6118 118.195 91.0252 115.528 87.7825 112.072C84.5825 108.616 82.9825 104.52 82.9825 99.784V99.016C82.9825 94.2373 84.5825 90.1413 87.7825 86.728C91.0252 83.272 95.6118 80.6267 101.542 78.792C107.516 76.9147 114.556 75.976 122.662 75.976C130.812 75.976 137.852 76.9147 143.783 78.792C149.713 80.6267 154.278 83.272 157.479 86.728C160.721 90.1413 162.342 94.2373 162.342 99.016V99.784C162.342 104.52 160.721 108.616 157.479 112.072C154.278 115.528 149.713 118.195 143.783 120.072C137.852 121.907 130.812 122.824 122.662 122.824ZM122.662 108.104C128.508 108.104 133.116 107.379 136.486 105.928C139.9 104.435 141.606 102.387 141.606 99.784V99.016C141.606 96.4133 139.9 94.3867 136.486 92.936C133.116 91.4427 128.508 90.696 122.662 90.696C116.86 90.696 112.252 91.4427 108.838 92.936C105.425 94.3867 103.718 96.4133 103.718 99.016V99.784C103.718 102.387 105.425 104.435 108.838 105.928C112.252 107.379 116.86 108.104 122.662 108.104ZM167.468 121.8V77H197.1L207.148 96.392L217.196 77H246.828V121.8H227.628V94.28L227.564 94.472L213.356 121.8H200.94L186.732 94.472L186.668 94.28V121.8H167.468ZM254.28 121.8V77H315.017C321.203 77 325.747 78.2587 328.648 80.776C331.55 83.2507 333.001 87.0267 333.001 92.104C333.001 95.5173 332.361 98.5467 331.08 101.192C329.843 103.837 327.902 105.928 325.257 107.464C322.611 108.957 319.198 109.704 315.017 109.704H274.12V121.8H254.28ZM309.64 90.632H274.12V96.264H309.64C310.451 96.264 311.091 96.008 311.561 95.496C312.03 94.984 312.264 94.3013 312.264 93.448C312.264 92.552 312.008 91.8693 311.496 91.4C311.027 90.888 310.408 90.632 309.64 90.632ZM324.622 121.8L352.59 77H376.078L403.982 121.8H382.67L378.83 114.824H349.966L345.934 121.8H324.622ZM358.478 99.976L356.302 103.816H372.75L370.638 99.976L365.326 89.096H364.046L358.478 99.976ZM407.28 121.8V77H471.089C475.654 77 479.153 78.024 481.585 80.072C484.016 82.0773 485.232 84.8507 485.232 88.392C485.232 91.1227 484.4 93.3413 482.737 95.048C481.073 96.7547 478.47 97.928 474.928 98.568V99.848C478.811 100.189 481.734 101.299 483.697 103.176C485.659 105.011 486.641 107.4 486.641 110.344V121.8H465.904V110.984C465.904 110.216 465.67 109.597 465.201 109.128C464.731 108.659 464.091 108.424 463.28 108.424H427.12V121.8H407.28ZM427.12 96.264H462C462.811 96.264 463.451 96.008 463.92 95.496C464.39 94.984 464.625 94.3013 464.625 93.448C464.625 92.5093 464.368 91.8053 463.856 91.336C463.345 90.8667 462.726 90.632 462 90.632H427.12V96.264ZM491.445 121.8V106.952H521.205V91.848H491.445V77H570.806V91.848H541.045V106.952H570.806V121.8H491.445ZM618.24 122.824C613.035 122.824 607.787 122.483 602.496 121.8C597.206 121.16 592.15 120.307 587.328 119.24C582.507 118.131 578.219 116.936 574.464 115.656L580.416 105.224C587.584 107.912 594.411 109.661 600.896 110.472C607.424 111.24 613.675 111.624 619.648 111.624C624.086 111.624 627.435 111.453 629.696 111.112C631.958 110.728 633.089 110.131 633.089 109.32C633.089 108.595 632.257 108.083 630.592 107.784C628.971 107.485 626.774 107.315 624 107.272C621.227 107.187 618.134 107.101 614.72 107.016C611.35 106.931 607.851 106.781 604.224 106.568C600.64 106.355 597.163 105.971 593.792 105.416C590.422 104.819 587.392 103.965 584.704 102.856C582.016 101.747 579.862 100.275 578.24 98.44C576.662 96.6053 575.872 94.3013 575.872 91.528C575.872 88.6267 576.768 86.1733 578.56 84.168C580.395 82.1627 582.891 80.5627 586.048 79.368C589.206 78.1733 592.811 77.32 596.864 76.808C600.96 76.2533 605.248 75.976 609.728 75.976C613.739 75.976 617.771 76.168 621.824 76.552C625.92 76.8933 629.888 77.384 633.729 78.024C637.569 78.6213 641.131 79.3253 644.416 80.136C647.702 80.9467 650.518 81.8 652.865 82.696L646.912 93.128C643.286 91.848 639.275 90.7813 634.881 89.928C630.529 89.032 626.006 88.3707 621.312 87.944C616.619 87.4747 611.968 87.24 607.36 87.24C600.235 87.24 596.672 87.9867 596.672 89.48C596.672 90.1627 597.504 90.6533 599.168 90.952C600.832 91.2507 603.051 91.4427 605.824 91.528C608.64 91.5707 611.734 91.6347 615.104 91.72C618.433 91.8053 621.889 91.9547 625.472 92.168C629.099 92.3813 632.576 92.7653 635.904 93.32C639.275 93.8747 642.305 94.7067 644.993 95.816C647.723 96.8827 649.878 98.312 651.456 100.104C653.035 101.896 653.825 104.136 653.825 106.824C653.825 109.768 652.843 112.264 650.881 114.312C648.961 116.36 646.337 118.024 643.008 119.304C639.681 120.541 635.883 121.437 631.617 121.992C627.35 122.547 622.891 122.824 618.24 122.824ZM696.537 122.824C688.431 122.824 681.391 121.907 675.417 120.072C669.487 118.195 664.9 115.528 661.657 112.072C658.457 108.616 656.857 104.52 656.857 99.784V99.016C656.857 94.2373 658.457 90.1413 661.657 86.728C664.9 83.272 669.487 80.6267 675.417 78.792C681.391 76.9147 688.431 75.976 696.537 75.976C704.687 75.976 711.727 76.9147 717.658 78.792C723.588 80.6267 728.153 83.272 731.354 86.728C734.596 90.1413 736.217 94.2373 736.217 99.016V99.784C736.217 104.52 734.596 108.616 731.354 112.072C728.153 115.528 723.588 118.195 717.658 120.072C711.727 121.907 704.687 122.824 696.537 122.824ZM696.537 108.104C702.383 108.104 706.991 107.379 710.361 105.928C713.775 104.435 715.481 102.387 715.481 99.784V99.016C715.481 96.4133 713.775 94.3867 710.361 92.936C706.991 91.4427 702.383 90.696 696.537 90.696C690.735 90.696 686.127 91.4427 682.713 92.936C679.3 94.3867 677.593 96.4133 677.593 99.016V99.784C677.593 102.387 679.3 104.435 682.713 105.928C686.127 107.379 690.735 108.104 696.537 108.104ZM741.343 121.8V77H760.927L800.863 101.704V77H820.703V121.8H801.119L761.183 97.096V121.8H741.343Z" fill="#323232" />
            </svg>
            <p className="mt-3 text-base font-normal text-black/65">
              Real-time forecasts, city comparison, and travel readiness insights.
            </p>
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button className={toggleClass(mode === "single")} onClick={() => setMode("single")}>
              <CloudSun size={16} />
              {singleCityLabel}
            </button>
            <button className={toggleClass(mode === "compare")} onClick={() => setMode("compare")}>
              <ArrowLeftRight size={16} />
              {compareCitiesLabel}
            </button>
          </div>

          {loading ? (
            <div className="inline-flex items-center gap-2 text-sm font-medium text-black/70">
              <Loader2 size={16} className="animate-spin" />
              {tr(t, "weather.loading", "Loading")}
            </div>
          ) : null}
        </div>

        <div className="border border-black/15 bg-white/60 p-4 shadow-[0_14px_30px_rgba(0,0,0,0.08)] md:p-6">
          {mode === "single" ? (
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="flex items-center gap-2 px-3 py-3 text-sm bg-white border border-black/20">
                <MapPin size={16} className="text-black/60" />
                <input
                  type="text"
                  value={city1}
                  onChange={(e) => setCity1(e.target.value)}
                  placeholder={tr(t, "weather.enterCity", "Enter city")}
                  className="w-full text-sm font-medium text-black bg-transparent outline-none placeholder:text-black/35"
                />
              </label>

              <button
                onClick={checkWeather}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 border border-black bg-black px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#ebebeb] disabled:cursor-not-allowed disabled:opacity-65"
              >
                <Search size={15} />
                {tr(t, "weather.checkWeather", "Check Weather")}
              </button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <label className="flex items-center gap-2 px-3 py-3 text-sm bg-white border border-black/20">
                <MapPin size={16} className="text-black/60" />
                <input
                  type="text"
                  value={city1}
                  onChange={(e) => setCity1(e.target.value)}
                  placeholder={tr(t, "weather.enterCity", "Enter city")}
                  className="w-full text-sm font-medium text-black bg-transparent outline-none placeholder:text-black/35"
                />
              </label>
              <label className="flex items-center gap-2 px-3 py-3 text-sm bg-white border border-black/20">
                <MapPin size={16} className="text-black/60" />
                <input
                  type="text"
                  value={city2}
                  onChange={(e) => setCity2(e.target.value)}
                  placeholder={tr(t, "weather.enterCity", "Enter city")}
                  className="w-full text-sm font-medium text-black bg-transparent outline-none placeholder:text-black/35"
                />
              </label>
              <button
                onClick={compareWeather}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 border border-black bg-black px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#ebebeb] disabled:cursor-not-allowed disabled:opacity-65"
              >
                <ArrowLeftRight size={15} />
                {tr(t, "weather.compare", "Compare")}
              </button>
            </div>
          )}

          {error ? (
            <div className="mt-4 flex items-start gap-2 border border-[#f05608]/45 bg-[#f05608]/10 px-4 py-3 text-sm text-black">
              <AlertTriangle size={18} className="mt-0.5 text-[#f05608]" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>

        {mode === "single" && weather1 && !loading ? (
          <div className="space-y-6">
            <section className="grid gap-4 border border-black/15 bg-white/60 p-4 shadow-[0_14px_30px_rgba(0,0,0,0.08)] md:grid-cols-[1.1fr_0.9fr] md:p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-black/55">Current Conditions</p>
                  <h3 className="mt-1 text-3xl font-semibold tracking-tight">{titleCase(weather1.name)}</h3>
                  <p className="text-sm text-black/55">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-4 p-4 border border-black/10 bg-white/60">
                  <img
                    src={`${WEATHER_ICON}/${weather1.weather[0].icon}@4x.png`}
                    alt={weather1.weather[0].description}
                    className="w-20 h-20"
                  />
                  <div>
                    <p className="text-4xl font-semibold">{Math.round(weather1.main.temp)} C</p>
                    <p className="text-sm uppercase tracking-[0.12em] text-black/55">
                      {titleCase(weather1.weather[0].description)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <article className={infoCardClass}>
                  <p className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-black/60">
                    <Thermometer size={14} />
                    {tr(t, "weather.feelsLike", "Feels Like")}
                  </p>
                  <p className="text-2xl font-semibold">{Math.round(weather1.main.feels_like)} C</p>
                </article>
                <article className={infoCardClass}>
                  <p className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-black/60">
                    <Droplets size={14} />
                    {tr(t, "weather.humidity", "Humidity")}
                  </p>
                  <p className="text-2xl font-semibold">{weather1.main.humidity}%</p>
                </article>
                <article className={infoCardClass}>
                  <p className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-black/60">
                    <Wind size={14} />
                    {tr(t, "weather.wind", "Wind")}
                  </p>
                  <p className="text-2xl font-semibold">{weather1.wind.speed} km/h</p>
                </article>
                <article className={infoCardClass}>
                  <p className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-black/60">
                    <Gauge size={14} />
                    {tr(t, "weather.pressure", "Pressure")}
                  </p>
                  <p className="text-2xl font-semibold">{weather1.main.pressure} hPa</p>
                </article>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <article className="border border-black/15 bg-white/60 p-5 shadow-[0_12px_26px_rgba(0,0,0,0.07)]">
                <h4 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-black/70">
                  <CalendarDays size={16} />
                  {tr(t, "weather.seasonalOutlook", "Seasonal Outlook")}
                </h4>
                <div className="mt-3 space-y-2 text-sm leading-relaxed text-black/80">
                  {getSeasonalOutlook(weather1, t).map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </article>

              <article className="border border-black/15 bg-white/60 p-5 shadow-[0_12px_26px_rgba(0,0,0,0.07)]">
                <h4 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-black/70">
                  <Backpack size={16} />
                  {tr(t, "weather.travelRecommendations", "Travel Recommendations")}
                </h4>
                <p className="mt-3 text-sm text-black/80">{getBestTimeToVisit(weather1, t)}</p>
                <ul className="grid grid-cols-1 gap-2 mt-3 text-sm text-black/80 sm:grid-cols-2">
                  {getEvidenceBasedPacking({
                    temp: weather1.main.temp,
                    uvIndex: weather1.uvIndex,
                    rainfall: weather1.rainfall,
                  }).map((item, idx) => (
                    <li key={idx} className="inline-flex items-start gap-2 px-3 py-2 border border-black/10 bg-white/70">
                      {item.toLowerCase().includes("rain") ? (
                        <Umbrella size={14} className="mt-0.5 text-black/70" />
                      ) : item.toLowerCase().includes("sun") || item.toLowerCase().includes("uv") ? (
                        <Sun size={14} className="mt-0.5 text-black/70" />
                      ) : (
                        <CloudRain size={14} className="mt-0.5 text-black/70" />
                      )}
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </section>

            {forecast ? (
              <section className="border border-black/15 bg-white/60 p-5 shadow-[0_12px_26px_rgba(0,0,0,0.07)]">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-black/70">
                  {tr(t, "weather.fiveDayForecast", "5 Day Forecast")}
                </h4>
                <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-2 lg:grid-cols-5">
                  {forecast.map((day, idx) => (
                    <article
                      key={idx}
                      className="border border-black/10 bg-white/70 p-3 text-center shadow-[0_8px_14px_rgba(0,0,0,0.06)]"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/60">
                        {new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                      <img
                        src={`${WEATHER_ICON}/${day.weather[0].icon}@2x.png`}
                        alt={day.weather[0].description}
                        className="mx-auto h-14 w-14"
                      />
                      <p className="text-sm font-semibold">
                        {Math.round(day.main.temp_max)} C / {Math.round(day.main.temp_min)} C
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.1em] text-black/55">
                        {titleCase(day.weather[0].description)}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        {mode === "compare" && weather1 && weather2 && !loading ? (
          <section className="space-y-4 border border-black/15 bg-white/60 p-5 shadow-[0_12px_26px_rgba(0,0,0,0.07)]">
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-black/70">
              {tr(t, "weather.comparisonSummary", "Comparison Summary")}
            </h4>
            <div className="grid gap-3">
              {comparisonSummary.map((line, idx) => (
                <p key={idx} className="px-3 py-2 text-sm border border-black/10 bg-white/70 text-black/80">
                  {line}
                </p>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {[weather1, weather2].map((city, idx) => (
                <article
                  key={idx}
                  className="border border-black/15 bg-white/70 p-4 shadow-[0_8px_14px_rgba(0,0,0,0.06)]"
                >
                  <p className="text-xs uppercase tracking-[0.14em] text-black/55">{titleCase(city.name)}</p>
                  <div className="flex items-center justify-between gap-3 p-3 mt-2 border border-black/10 bg-white/70">
                    <div>
                      <p className="text-3xl font-semibold">{Math.round(city.main.temp)} C</p>
                      <p className="text-sm text-black/65">{titleCase(city.weather[0].description)}</p>
                    </div>
                    <img
                      src={`${WEATHER_ICON}/${city.weather[0].icon}@2x.png`}
                      alt={city.weather[0].description}
                      className="w-16 h-16"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div className="px-3 py-2 border border-black/10 bg-white/70">
                      {tr(t, "weather.feelsLike", "Feels Like")}: {Math.round(city.main.feels_like)} C
                    </div>
                    <div className="px-3 py-2 border border-black/10 bg-white/70">
                      {tr(t, "weather.humidity", "Humidity")}: {city.main.humidity}%
                    </div>
                    <div className="px-3 py-2 border border-black/10 bg-white/70">
                      {tr(t, "weather.wind", "Wind")}: {city.wind.speed} km/h
                    </div>
                    <div className="px-3 py-2 border border-black/10 bg-white/70">
                      {tr(t, "weather.pressure", "Pressure")}: {city.main.pressure} hPa
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
};

export default WeatherPage;
