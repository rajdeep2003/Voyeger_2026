import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import "./Hero.css";
import { TRAIL_PATH_D, TRAIL_START_DOTS, TRAIL_VIEWBOX } from "./pathtrail";

const slides = [
  { name: "Bishnupur", img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop", x: 8, y: 21 },
  { name: "Doars", img: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop", x: 21, y: 20 },
  { name: "Jhargram", img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop", x: 35, y: 22 },
  { name: "Kankrajhor", img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop", x: 51, y: 18 },
  { name: "Paris", img: "https://plus.unsplash.com/premium_photo-1661919210043-fd847a58522d?w=600&auto=format&fit=crop&q=60", x: 64, y: 21 },
  { name: "Delhi", img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop", x: 88, y: 22 },
  { name: "Andaman", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop", x: 89, y: 68 },
  { name: "Kashmir", img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&auto=format&fit=crop", x: 76, y: 75 },
  { name: "Kerala", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop", x: 62, y: 75 },
  { name: "Ayodha Pahar", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop", x: 43, y: 73 },
  { name: "Sandakhpu", img: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&auto=format&fit=crop", x: 30, y: 74 },
  { name: "Jaldapara National Park", img: "https://images.unsplash.com/photo-1549643276-fdf2fab574f5?w=800&auto=format&fit=crop", x: 9, y: 73 },
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