import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import "./Hero.css";
import { TRAIL_PATH_D, TRAIL_START_DOTS, TRAIL_VIEWBOX } from "./pathtrail";

const slides = [
  { name: "Bishnupur", img: "https://assets.zeezest.com/images/PROD_bishnupur_1704899861960_thumb_800.jpeg", x: 8, y: 21 },
  { name: "Doars", img: "https://assets.zeezest.com/images/PROD_dooars%20%281%29_1704900895264_thumb_800.jpeg", x: 21, y: 20 },
  { name: "Jhargram", img: "https://assets.zeezest.com/images/PROD_jhargram_1704899616152_thumb_800.jpeg", x: 35, y: 22 },
  { name: "Kankrajhor", img: "https://imgs.search.brave.com/FoZ5fbki0Tj2No5MCGBzkUQTC5QJJ9RfOhf7raOPsOo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rYW5r/cmFqaG9yLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAyMi8w/OS9JTUctMjAyMjA5/MjAtV0EwMDE1Lmpw/Zw", x: 51, y: 18 },
  { name: "Paris", img: "https://plus.unsplash.com/premium_photo-1661919210043-fd847a58522d?w=600&auto=format&fit=crop&q=60", x: 64, y: 21 },
  { name: "Delhi", img: "https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg", x: 88, y: 22 },
  { name: "Andaman", img: "https://tse4.mm.bing.net/th?id=OIP.Vo6dXy0kKreXtnbsnzNeagHaEL&pid=Api&P=0&h=180", x: 89, y: 68 },
  { name: "Kashmir", img: "https://img.veenaworld.com/wp-content/uploads/2023/01/shutterstock_2044050407-scaled.jpg", x: 76, y: 75 },
  { name: "Kerala", img: "https://tse4.mm.bing.net/th?id=OIP.1LmC3AubOyv1mN-FzKU7BAHaE8&pid=Api&P=0&h=180", x: 62, y: 75 },
  { name: "Ayodha Pahar", img: "https://assets.zeezest.com/images/PROD_ayodhya%20pahar_1704899966106_thumb_800.jpeg", x: 43, y: 73 },
  { name: "Sandakhpu", img: "https://assets.zeezest.com/images/PROD_sandakphu_1704901003293_thumb_800.jpeg", x: 30, y: 74 },
  { name: "Jaldapara National Park", img: "https://assets.zeezest.com/images/PROD_jaldapara%20national%20park_1704900855695_thumb_800.jpeg", x: 9, y: 73 },
];

const DURATION_SECONDS = 26;
const INTRO_ANIMATION_DELAY_MS = 4200;
const PLANE_TAIL_OFFSET = 24;

gsap.registerPlugin(MotionPathPlugin);

const buildProxyUrl = (url) => {
  const strippedUrl = url.replace(/^https?:\/\//, "");
  return `https://images.weserv.nl/?url=${encodeURIComponent(strippedUrl)}&w=1000&output=webp`;
};

const ImageSlider = () => {
  const overlayRef = useRef(null);
  const metricsPathRef = useRef(null);
  const revealMaskPathRef = useRef(null);
  const planeRef = useRef(null);
  const tweenRef = useRef(null);
  const startupTimerRef = useRef(null);
  const revealCursorRef = useRef(0);

  const [revealedMap, setRevealedMap] = useState(() => slides.map(() => false));

  useEffect(() => {
    const startTrailAnimation = () => {
      const overlay = overlayRef.current;
      const metricsPath = metricsPathRef.current;
      const revealMaskPath = revealMaskPathRef.current;
      const plane = planeRef.current;

      if (!overlay || !metricsPath || !revealMaskPath || !plane) {
        return;
      }

      gsap.set(overlay, { autoAlpha: 1 });

      const totalLength = metricsPath.getTotalLength();
      const sampleCount = 320;
      const step = totalLength / sampleCount;

      const sampledPath = Array.from({ length: sampleCount + 1 }, (_, index) => {
        const length = index * step;
        const point = metricsPath.getPointAtLength(length);
        return { index, length, point };
      });

      const revealOrder = slides.map((slide, index) => {
        const targetX = (slide.x / 100) * TRAIL_VIEWBOX.width;
        const targetY = (slide.y / 100) * TRAIL_VIEWBOX.height;

        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        for (let index = 0; index < sampledPath.length; index += 1) {
          const candidate = sampledPath[index];
          const distance = Math.hypot(candidate.point.x - targetX, candidate.point.y - targetY);

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        }

        return {
          index,
          length: sampledPath[nearestIndex].length,
        };
      }).sort((left, right) => left.length - right.length);

      gsap.set(revealMaskPath, {
        strokeDasharray: `${totalLength} ${totalLength}`,
        strokeDashoffset: totalLength,
      });

      gsap.set(plane, {
        xPercent: -50,
        yPercent: -50,
        autoAlpha: 1,
        transformOrigin: "50% 50%",
      });

      setRevealedMap(() => slides.map(() => false));
      revealCursorRef.current = 0;
      tweenRef.current?.kill();

      const timeline = gsap.timeline({
        onComplete: () => {
          for (let index = revealCursorRef.current; index < revealOrder.length; index += 1) {
            const revealIndex = revealOrder[index].index;
            if (revealedMap[revealIndex]) {
              continue;
            }

            setRevealedMap((previous) => {
              if (previous[revealIndex]) {
                return previous;
              }

              const next = [...previous];
              next[revealIndex] = true;
              return next;
            });
          }

          gsap.to(plane, {
            autoAlpha: 0,
            duration: 0.45,
            ease: "power1.out",
          });
        },
      });

      timeline.to(
        revealMaskPath,
        {
          strokeDashoffset: 0,
          duration: DURATION_SECONDS,
          ease: "power1.inOut",
        },
        0
      );

      timeline.to(
        plane,
        {
          motionPath: {
            path: metricsPath,
            align: metricsPath,
            autoRotate: true,
            alignOrigin: [0.5, 0.5],
          },
          duration: DURATION_SECONDS,
          ease: "power1.inOut",
        },
        0
      );

      timeline.eventCallback("onUpdate", () => {
        const currentDashOffset = Number(gsap.getProperty(revealMaskPath, "strokeDashoffset"));
        const resolvedDashOffset = Number.isFinite(currentDashOffset) ? currentDashOffset : totalLength;
        const currentLength = Math.min(totalLength, Math.max(0, totalLength - resolvedDashOffset));
        const tailLength = Math.max(0, currentLength - PLANE_TAIL_OFFSET);

        const nextReveal = revealOrder[revealCursorRef.current];

        if (!nextReveal) {
          return;
        }

        if (tailLength < nextReveal.length) {
          return;
        }

        revealCursorRef.current += 1;
        setRevealedMap((previous) => {
          if (previous[nextReveal.index]) {
            return previous;
          }

          const next = [...previous];
          next[nextReveal.index] = true;
          return next;
        });
      });

      tweenRef.current = timeline;
    };

    startupTimerRef.current = window.setTimeout(startTrailAnimation, INTRO_ANIMATION_DELAY_MS);

    return () => {
      if (startupTimerRef.current) {
        window.clearTimeout(startupTimerRef.current);
      }
      revealCursorRef.current = 0;
      tweenRef.current?.kill();
    };
  }, []);

  return (
    <div ref={overlayRef} className="hero-trail-overlay" aria-hidden="true">
      <svg
        className="hero-trail-svg"
        viewBox={`0 0 ${TRAIL_VIEWBOX.width} ${TRAIL_VIEWBOX.height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <mask id="heroTrailRevealMask">
            <path ref={revealMaskPathRef} d={TRAIL_PATH_D} className="hero-trail-reveal-mask" fill="none" />
          </mask>
        </defs>
        <path d={TRAIL_PATH_D} className="hero-trail-draw" fill="none" mask="url(#heroTrailRevealMask)" />
        <path ref={metricsPathRef} d={TRAIL_PATH_D} className="hero-trail-metrics" fill="none" />
        {TRAIL_START_DOTS.map((dot, index) => (
          <circle key={`hero-trail-dot-${index}`} cx={dot.cx} cy={dot.cy} r="13" className="hero-trail-start-dot" />
        ))}
      </svg>

      {slides.map((slide, index) => (
        <figure
          key={`${slide.name}-${index}`}
          className={`hero-trail-image ${revealedMap[index] ? "is-visible" : ""}`}
          style={{ left: `${slide.x}%`, top: `${slide.y}%` }}
        >
          <img
            src={buildProxyUrl(slide.img)}
            alt=""
            loading="lazy"
            onError={(event) => {
              if (event.currentTarget.dataset.fallbackApplied === "true") {
                return;
              }
              event.currentTarget.dataset.fallbackApplied = "true";
              event.currentTarget.src = slide.img;
            }}
          />
        </figure>
      ))}

      <img
        ref={planeRef}
        src="/images/airplane.svg"
        alt=""
        className="hero-trail-plane"
        draggable="false"
      />
    </div>
  );
};

export default ImageSlider;