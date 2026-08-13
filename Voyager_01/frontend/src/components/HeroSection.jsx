import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
const images = [
  "https://cultureandheritage.org/wp-content/uploads/2023/06/xyz-53-1200x613.jpg",
  "https://www.oyorooms.com/travel-guide/wp-content/uploads/2019/12/Generic-6-5.jpg",
  "https://assets.traveltriangle.com/blog/wp-content/uploads/2020/01/Kolkata_13th-jan.jpg",
   "https://www.trawell.in/blog/wp-content/uploads/2022/08/west_bengal-1-730x410.jpg",
  
  "https://cdn.britannica.com/68/178168-050-EED35840/Somapura-Mahavira-Paharpur-Bangladesh.jpg",
  "https://im.whatshot.in/content/2017/Sep/1504796610-body-3-cropped.jpg",
  "https://www.godigit.com/content/dam/godigit/directportal/en/contenthm/heritage-sites-in-west-bengal.jpg"
];

const HeroSection = () => {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const preloadImages = async () => {
      const promises = images.map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
        });
      });
      await Promise.all(promises);
      setLoaded(true);
    };

    preloadImages();
  }, []);

  useEffect(() => {
    if (loaded) {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loaded]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {loaded &&
        images.map((image, i) => (
          <img
            key={i}
            src={image}
            className={`absolute inset-0 w-full h-full object-fit transition-opacity duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
        <h2 className="text-6xl font-extrabold mb-6 drop-shadow-lg">
          {t("herosec.heroTitle")}
        </h2>
        <p className="text-xl font-medium max-w-3xl">
          {t("herosec.heroSubtitle")}
        </p>
        <Link
          to={user == null ? "/login" : "/explore"}
          className="bg-red-500 text-white px-6 py-3 rounded-full mt-4 hover:bg-red-700 transition duration-300"
        >
          {t("herosec.explore")}
        </Link>
      </div>
    </div>
  );
};

export default HeroSection;
