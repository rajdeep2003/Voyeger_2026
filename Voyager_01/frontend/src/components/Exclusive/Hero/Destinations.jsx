import React, { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Hero.css";

const Destinations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const leaveSlideRef = useRef(null);
  const enterSlideRef = useRef(null);

  const trendingDestinations = useMemo(
    () => [
      {
        id: 7,
        name: t("destinationSlider.trending.purulia.name"),
        location: "Purulia, India",
        brief: "RED SOIL LANDSCAPES, HILLS, AND FOLK RHYTHMS IN EVERY SUNSET.",
        path: "/purulia",
        image:
          "https://assets-news.housing.com/news/wp-content/uploads/2022/08/18073726/Purulia5.png",
      },
      {
        id: 8,
        name: t("destinationSlider.trending.kashmir.name"),
        location: "Kashmir, India",
        brief: "SNOW VALLEYS, QUIET LAKES, AND MOUNTAIN AIR THAT SLOWS TIME.",
        path: "/kashmir",
        image:
          "https://img.veenaworld.com/wp-content/uploads/2023/01/shutterstock_2044050407-scaled.jpg",
      },
      {
        id: 9,
        name: t("destinationSlider.trending.delhi.name"),
        location: "Delhi, India",
        brief: "IMPERIAL STREETS, OLD BAZAARS, AND MODERN ENERGY IN ONE FRAME.",
        path: "/delhi",
        image:
          "https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg",
      },
      {
        id: 10,
        name: t("destinationSlider.trending.paris.name"),
        location: "Paris, France",
        brief: "RIVER LIGHTS, STONE BRIDGES, AND CLASSIC SKYLINES BUILT FOR EVENINGS.",
        path: "/paris",
        image:
          "https://plus.unsplash.com/premium_photo-1661919210043-fd847a58522d?w=1600&auto=format&fit=crop&q=80",
      },
      {
        id: 11,
        name: t("destinationSlider.trending.kerala.name"),
        location: "Kerala, India",
        brief: "BACKWATERS, MONSOON GREENS, AND CALM SHORES WITH SLOW TRAVEL VIBES.",
        path: "/kerala",
        image:
          "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: 12,
        name: t("destinationSlider.trending.andaman.name"),
        location: "Andaman, India",
        brief: "CORAL WATERS, OPEN HORIZONS, AND ISLAND MORNINGS FULL OF BLUE.",
        path: "/andaman",
        image:
          "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1600&q=80",
      },
    ],
    [t]
  );

  useEffect(() => {
    if (isAnimating || trendingDestinations.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setIncomingIndex((prev) => {
        if (prev !== null) {
          return prev;
        }
        return (activeIndex + 1) % trendingDestinations.length;
      });
      setIsAnimating(true);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [activeIndex, isAnimating, trendingDestinations.length]);

  useEffect(() => {
    if (!isAnimating || incomingIndex === null) {
      return;
    }

    const leavingSlide = leaveSlideRef.current;
    const enteringSlide = enterSlideRef.current;

    if (!leavingSlide || !enteringSlide) {
      return;
    }

    const leavingImage = leavingSlide.querySelector(".destinations-image");
    const enteringImage = enteringSlide.querySelector(".destinations-image");
    const nextIndex = incomingIndex;

    const timeline = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        gsap.set(leavingSlide, { xPercent: 0, autoAlpha: 1 });
        gsap.set(enteringSlide, { xPercent: 0, autoAlpha: 1 });

        if (leavingImage) {
          gsap.set(leavingImage, { xPercent: 0, scale: 1 });
        }
        if (enteringImage) {
          gsap.set(enteringImage, { xPercent: 0, scale: 1 });
        }

        setActiveIndex(nextIndex);
        setIncomingIndex(null);
        setIsAnimating(false);
      },
    });

    timeline
      .fromTo(
        enteringSlide,
        { xPercent: 100, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: 1.05 },
        0
      )
      .fromTo(
        leavingSlide,
        { xPercent: 0, autoAlpha: 1 },
        { xPercent: -32, autoAlpha: 0, duration: 1.05 },
        0
      );

    if (enteringImage && leavingImage) {
      timeline
        .fromTo(
          enteringImage,
          { xPercent: 14, scale: 1.08 },
          { xPercent: 0, scale: 1, duration: 1.05, ease: "power3.out" },
          0
        )
        .fromTo(
          leavingImage,
          { xPercent: 0, scale: 1 },
          { xPercent: -14, scale: 1.04, duration: 1.05, ease: "power3.in" },
          0
        );
    }

    return () => timeline.kill();
  }, [incomingIndex, isAnimating]);

  const handleOpenDestination = (path) => {
    if (path) {
      navigate(path);
    }
  };

  const activeDestination = trendingDestinations[activeIndex];
  const nextDestination =
    incomingIndex === null ? null : trendingDestinations[incomingIndex];

  return (
    <section className="destinations-trending-section" aria-label="Trending destinations">
      <div className="destinations-title-wrap" aria-hidden="true">
        <svg width="983" height="124" viewBox="0 0 983 124" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M29.76 45.824V15.872H-6.67572e-06V1.02399H79.36V15.872H49.6V45.824H29.76ZM84.002 45.824V1.02399H147.81C152.375 1.02399 155.874 2.048 158.306 4.096C160.738 6.10133 161.954 8.87466 161.954 12.416C161.954 15.1467 161.122 17.3653 159.458 19.072C157.794 20.7787 155.191 21.952 151.65 22.592V23.872C155.533 24.2133 158.455 25.3227 160.418 27.2C162.381 29.0347 163.362 31.424 163.362 34.368V45.824H142.626V35.008C142.626 34.24 142.391 33.6213 141.922 33.152C141.453 32.6827 140.813 32.448 140.002 32.448H103.842V45.824H84.002ZM103.842 20.288H138.722C139.533 20.288 140.173 20.032 140.642 19.52C141.111 19.008 141.346 18.3253 141.346 17.472C141.346 16.5333 141.09 15.8293 140.578 15.36C140.066 14.8907 139.447 14.656 138.722 14.656H103.842V20.288ZM169.127 45.824V1.02399H248.487V13.952H188.967V17.92H241.575V28.928H188.967V32.896H248.487V45.824H169.127ZM254.689 45.824V1.02399H274.273L314.209 25.728V1.02399H334.049V45.824H314.465L274.529 21.12V45.824H254.689ZM341.502 45.824V1.02399H394.558C399.891 1.02399 404.521 1.91999 408.446 3.71199C412.414 5.50399 415.465 8.04266 417.598 11.328C419.774 14.6133 420.862 18.5173 420.862 23.04V23.808C420.862 28.3307 419.774 32.2347 417.598 35.52C415.465 38.8053 412.414 41.344 408.446 43.136C404.521 44.928 399.891 45.824 394.558 45.824H341.502ZM361.342 31.36H392.638C394.899 31.36 396.713 30.6987 398.078 29.376C399.443 28.0107 400.126 26.1547 400.126 23.808V23.04C400.126 20.6933 399.443 18.8587 398.078 17.536C396.713 16.1707 394.899 15.488 392.638 15.488H361.342V31.36ZM424.417 45.824V30.976H454.177V15.872H424.417V1.02399H503.777V15.872H474.017V30.976H503.777V45.824H424.417ZM510.252 45.824V1.02399H529.836L569.772 25.728V1.02399H589.612V45.824H570.028L530.092 21.12V45.824H510.252ZM629.838 46.848C624.804 46.848 620.153 46.3147 615.886 45.248C611.62 44.1813 607.908 42.6453 604.75 40.64C601.593 38.6347 599.14 36.224 597.39 33.408C595.641 30.5493 594.766 27.3493 594.766 23.808V23.04C594.766 18.304 596.388 14.208 599.63 10.752C602.873 7.296 607.46 4.65066 613.39 2.81599C619.364 0.938662 626.361 -3.8147e-06 634.382 -3.8147e-06C644.068 -3.8147e-06 652.26 1.216 658.958 3.64799C665.657 6.03733 670.692 9.40799 674.062 13.76L654.158 19.648C652.452 17.856 649.956 16.4907 646.67 15.552C643.428 14.5707 639.332 14.08 634.382 14.08C628.153 14.08 623.246 14.8907 619.662 16.512C616.078 18.0907 614.286 20.2667 614.286 23.04V23.808C614.286 26.5813 616.078 28.7787 619.662 30.4C623.246 31.9787 628.153 32.768 634.382 32.768C636.857 32.768 639.417 32.64 642.062 32.384C644.708 32.0853 647.204 31.68 649.55 31.168C651.897 30.6133 653.838 29.952 655.374 29.184H634.19V21.504H674.062V45.824H658.702L659.342 36.224H658.126C656.676 38.4427 654.564 40.3413 651.79 41.92C649.017 43.4987 645.753 44.7147 641.998 45.568C638.286 46.4213 634.233 46.848 629.838 46.848ZM2.75199 122.824V78.024H55.808C61.1413 78.024 65.7707 78.92 69.696 80.712C73.664 82.504 76.7147 85.0427 78.848 88.328C81.024 91.6133 82.112 95.5173 82.112 100.04V100.808C82.112 105.331 81.024 109.235 78.848 112.52C76.7147 115.805 73.664 118.344 69.696 120.136C65.7707 121.928 61.1413 122.824 55.808 122.824H2.75199ZM22.592 108.36H53.888C56.1493 108.36 57.9627 107.699 59.328 106.376C60.6933 105.011 61.376 103.155 61.376 100.808V100.04C61.376 97.6933 60.6933 95.8587 59.328 94.536C57.9627 93.1707 56.1493 92.488 53.888 92.488H22.592V108.36ZM87.6895 122.824V78.024H167.049V90.952H107.529V94.92H160.137V105.928H107.529V109.896H167.049V122.824H87.6895ZM214.212 123.848C209.007 123.848 203.759 123.507 198.468 122.824C193.177 122.184 188.121 121.331 183.3 120.264C178.479 119.155 174.191 117.96 170.436 116.68L176.388 106.248C183.556 108.936 190.383 110.685 196.868 111.496C203.396 112.264 209.647 112.648 215.62 112.648C220.057 112.648 223.407 112.477 225.668 112.136C227.929 111.752 229.06 111.155 229.06 110.344C229.06 109.619 228.228 109.107 226.564 108.808C224.943 108.509 222.745 108.339 219.972 108.296C217.199 108.211 214.105 108.125 210.692 108.04C207.321 107.955 203.823 107.805 200.196 107.592C196.612 107.379 193.135 106.995 189.764 106.44C186.393 105.843 183.364 104.989 180.676 103.88C177.988 102.771 175.833 101.299 174.212 99.464C172.633 97.6293 171.844 95.3253 171.844 92.552C171.844 89.6507 172.74 87.1973 174.532 85.192C176.367 83.1867 178.863 81.5867 182.02 80.392C185.177 79.1973 188.783 78.344 192.836 77.832C196.932 77.2773 201.22 77 205.7 77C209.711 77 213.743 77.192 217.796 77.576C221.892 77.9173 225.86 78.408 229.7 79.048C233.54 79.6453 237.103 80.3493 240.388 81.16C243.673 81.9707 246.489 82.824 248.836 83.72L242.884 94.152C239.257 92.872 235.247 91.8053 230.852 90.952C226.5 90.056 221.977 89.3947 217.284 88.968C212.591 88.4987 207.94 88.264 203.332 88.264C196.207 88.264 192.644 89.0107 192.644 90.504C192.644 91.1867 193.476 91.6773 195.14 91.976C196.804 92.2747 199.023 92.4667 201.796 92.552C204.612 92.5947 207.705 92.6587 211.076 92.744C214.404 92.8293 217.86 92.9787 221.444 93.192C225.071 93.4053 228.548 93.7893 231.876 94.344C235.247 94.8987 238.276 95.7307 240.964 96.84C243.695 97.9067 245.849 99.336 247.428 101.128C249.007 102.92 249.796 105.16 249.796 107.848C249.796 110.792 248.815 113.288 246.852 115.336C244.932 117.384 242.308 119.048 238.98 120.328C235.652 121.565 231.855 122.461 227.588 123.016C223.321 123.571 218.863 123.848 214.212 123.848ZM280.947 122.824V92.872H251.187V78.024H330.548V92.872H300.787V122.824H280.947ZM334.229 122.824V107.976H363.989V92.872H334.229V78.024H413.59V92.872H383.829V107.976H413.59V122.824H334.229ZM420.064 122.824V78.024H439.648L479.584 102.728V78.024H499.424V122.824H479.84L439.904 98.12V122.824H420.064ZM502.781 122.824L530.749 78.024H554.237L582.141 122.824H560.829L556.989 115.848H528.125L524.093 122.824H502.781ZM536.637 101L534.461 104.84H550.909L548.797 101L543.485 90.12H542.205L536.637 101ZM598.947 122.824V92.872H569.187V78.024H648.548V92.872H618.787V122.824H598.947ZM652.229 122.824V107.976H681.989V92.872H652.229V78.024H731.59V92.872H701.829V107.976H731.59V122.824H652.229ZM774.509 123.848C766.402 123.848 759.362 122.931 753.389 121.096C747.458 119.219 742.872 116.552 739.629 113.096C736.429 109.64 734.829 105.544 734.829 100.808V100.04C734.829 95.2613 736.429 91.1653 739.629 87.752C742.872 84.296 747.458 81.6507 753.389 79.816C759.362 77.9387 766.402 77 774.509 77C782.658 77 789.698 77.9387 795.629 79.816C801.56 81.6507 806.125 84.296 809.325 87.752C812.568 91.1653 814.189 95.2613 814.189 100.04V100.808C814.189 105.544 812.568 109.64 809.325 113.096C806.125 116.552 801.56 119.219 795.629 121.096C789.698 122.931 782.658 123.848 774.509 123.848ZM774.509 109.128C780.354 109.128 784.962 108.403 788.333 106.952C791.746 105.459 793.453 103.411 793.453 100.808V100.04C793.453 97.4373 791.746 95.4107 788.333 93.96C784.962 92.4667 780.354 91.72 774.509 91.72C768.706 91.72 764.098 92.4667 760.685 93.96C757.272 95.4107 755.565 97.4373 755.565 100.04V100.808C755.565 103.411 757.272 105.459 760.685 106.952C764.098 108.403 768.706 109.128 774.509 109.128ZM819.314 122.824V78.024H838.898L878.834 102.728V78.024H898.674V122.824H879.09L839.154 98.12V122.824H819.314ZM947.087 123.848C941.882 123.848 936.634 123.507 931.343 122.824C926.052 122.184 920.996 121.331 916.175 120.264C911.354 119.155 907.066 117.96 903.311 116.68L909.263 106.248C916.431 108.936 923.258 110.685 929.743 111.496C936.271 112.264 942.522 112.648 948.495 112.648C952.932 112.648 956.282 112.477 958.543 112.136C960.804 111.752 961.935 111.155 961.935 110.344C961.935 109.619 961.103 109.107 959.439 108.808C957.818 108.509 955.62 108.339 952.847 108.296C950.074 108.211 946.98 108.125 943.567 108.04C940.196 107.955 936.698 107.805 933.071 107.592C929.487 107.379 926.01 106.995 922.639 106.44C919.268 105.843 916.239 104.989 913.551 103.88C910.863 102.771 908.708 101.299 907.087 99.464C905.508 97.6293 904.719 95.3253 904.719 92.552C904.719 89.6507 905.615 87.1973 907.407 85.192C909.242 83.1867 911.738 81.5867 914.895 80.392C918.052 79.1973 921.658 78.344 925.711 77.832C929.807 77.2773 934.095 77 938.575 77C942.586 77 946.618 77.192 950.671 77.576C954.767 77.9173 958.735 78.408 962.575 79.048C966.415 79.6453 969.978 80.3493 973.263 81.16C976.548 81.9707 979.364 82.824 981.711 83.72L975.759 94.152C972.132 92.872 968.122 91.8053 963.727 90.952C959.375 90.056 954.852 89.3947 950.159 88.968C945.466 88.4987 940.815 88.264 936.207 88.264C929.082 88.264 925.519 89.0107 925.519 90.504C925.519 91.1867 926.351 91.6773 928.015 91.976C929.679 92.2747 931.898 92.4667 934.671 92.552C937.487 92.5947 940.58 92.6587 943.951 92.744C947.279 92.8293 950.735 92.9787 954.319 93.192C957.946 93.4053 961.423 93.7893 964.751 94.344C968.122 94.8987 971.151 95.7307 973.839 96.84C976.57 97.9067 978.724 99.336 980.303 101.128C981.882 102.92 982.671 105.16 982.671 107.848C982.671 110.792 981.69 113.288 979.727 115.336C977.807 117.384 975.183 119.048 971.855 120.328C968.527 121.565 964.73 122.461 960.463 123.016C956.196 123.571 951.738 123.848 947.087 123.848Z" fill="#323232"/>
        </svg>
      </div>

      <div className="destinations-content-row">
        <div className="destinations-divider" aria-hidden="true" />

        <div className="destinations-stage" role="region" aria-live="polite">
          <button
            type="button"
            className="destinations-slide destinations-slide--active"
            onClick={() => handleOpenDestination(activeDestination.path)}
            ref={leaveSlideRef}
            aria-label={`${t("destinationSlider.defaultDescription")} - ${activeDestination.name}`}
          >
            <img
              className="destinations-image"
              src={activeDestination.image}
              alt={activeDestination.name}
              loading="lazy"
            />
            <div className="destinations-meta">
              <h3>{activeDestination.name}</h3>
              <p>{activeDestination.location}</p>
            </div>
          </button>

          {nextDestination && (
            <button
              type="button"
              className="destinations-slide destinations-slide--incoming"
              onClick={() => handleOpenDestination(nextDestination.path)}
              ref={enterSlideRef}
              aria-label={`${t("destinationSlider.defaultDescription")} - ${nextDestination.name}`}
            >
              <img
                className="destinations-image"
                src={nextDestination.image}
                alt={nextDestination.name}
                loading="lazy"
              />
              <div className="destinations-meta">
                <h3>{nextDestination.name}</h3>
                <p>{nextDestination.location}</p>
              </div>
            </button>
          )}
        </div>

        <aside className="destinations-brief" aria-live="polite">
          <div className="destinations-brief-content">
            <p className="destinations-brief-kicker">Trending Insight</p>
            <p className="destinations-brief-text">{activeDestination.brief}</p>
            <p className="destinations-brief-place">{activeDestination.location.toUpperCase()}</p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Destinations;
