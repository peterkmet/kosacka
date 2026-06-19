// Configuration
const CLOSE_THRESHOLD_PX = 12;
const DEFAULT_X_MAX = 100;
const DEFAULT_Y_MAX = 80;
const PALETTE = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#ec4899", "#78716c", "#0ea5e9",
];

// Round a number to at most 2 decimals.
function round2(n) {
  return Math.round(n * 100) / 100;
}

// Convert a points array [[x, y], ...] to an SVG-style "x,y x,y" string.
function pointsToString(points) {
  return points.map(([x, y]) => `${round2(x)},${round2(y)}`).join(" ");
}

// Convert an SVG-style "x,y x,y" string back to a points array.
function parsePoints(str) {
  const trimmed = str.trim();
  if (trimmed === "") return [];
  return trimmed.split(/\s+/).map((pair) => pair.split(",").map(Number));
}

// Map a pixel value (within the displayed image) to the xMax/yMax scale.
function pixelToCoord(pixel, displaySize, max) {
  return (pixel / displaySize) * max;
}

// Map a scaled coordinate back to a pixel value within the displayed image.
function coordToPixel(coord, displaySize, max) {
  return (coord / max) * displaySize;
}

// True when point is within thresholdPx (Euclidean) of firstPoint.
function isNearFirstPoint(point, firstPoint, thresholdPx) {
  return Math.hypot(point[0] - firstPoint[0], point[1] - firstPoint[1]) <= thresholdPx;
}

// Convert app state to the export JSON string (points as "x,y x,y" strings).
function serialize(state) {
  return JSON.stringify(
    {
      xMax: state.xMax,
      yMax: state.yMax,
      image: state.image,
      zones: state.zones.map((z) => ({
        name: z.name,
        color: z.color,
        points: pointsToString(z.points),
      })),
    },
    null,
    2,
  );
}

// Parse an export JSON string back to app state (points as number arrays).
function deserialize(text) {
  const obj = JSON.parse(text);
  return {
    xMax: obj.xMax,
    yMax: obj.yMax,
    image: obj.image,
    zones: obj.zones.map((z) => ({
      name: z.name,
      color: z.color,
      points: parsePoints(z.points),
    })),
  };
}

// Export for the Vitest test runner (Node). Ignored in the browser, where this
// file loads as a classic script and the declarations above are already global.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CLOSE_THRESHOLD_PX, DEFAULT_X_MAX, DEFAULT_Y_MAX, PALETTE,
    pointsToString, parsePoints, pixelToCoord, coordToPixel,
    isNearFirstPoint, serialize, deserialize,
  };
}
