import React from "react";

export const TRAIL_VIEWBOX = {
  width: 1000,
  height: 560,
};

export const TRAIL_PATH_D =
  "M 85 132 C 167 77 253 73 337 94 C 427 117 514 87 604 76 C 692 66 774 105 842 100 C 897 96 944 137 953 180 C 962 221 931 257 899 294 C 865 332 832 405 772 417 C 705 429 625 418 548 414 C 471 410 400 374 330 366 C 253 357 183 417 95 427";

export const TRAIL_START_DOTS = [
  { cx: 85, cy: 132 },
  { cx: 95, cy: 427 },
];

const PathTrail = () => (
  <svg
    width={TRAIL_VIEWBOX.width}
    height={TRAIL_VIEWBOX.height}
    viewBox={`0 0 ${TRAIL_VIEWBOX.width} ${TRAIL_VIEWBOX.height}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d={TRAIL_PATH_D} fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray="12 10" />
    {TRAIL_START_DOTS.map((dot, index) => (
      <circle key={`trail-dot-${index}`} cx={dot.cx} cy={dot.cy} r="12" fill="currentColor" />
    ))}
  </svg>
);

export default PathTrail;
