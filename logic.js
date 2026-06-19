// Configuration
export const CLOSE_THRESHOLD_PX = 12;
export const DEFAULT_X_MAX = 100;
export const DEFAULT_Y_MAX = 80;
export const PALETTE = [
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
export function pointsToString(points) {
  return points.map(([x, y]) => `${round2(x)},${round2(y)}`).join(" ");
}

// Convert an SVG-style "x,y x,y" string back to a points array.
export function parsePoints(str) {
  const trimmed = str.trim();
  if (trimmed === "") return [];
  return trimmed.split(/\s+/).map((pair) => pair.split(",").map(Number));
}

// Map a pixel value (within the displayed image) to the xMax/yMax scale.
export function pixelToCoord(pixel, displaySize, max) {
  return (pixel / displaySize) * max;
}

// Map a scaled coordinate back to a pixel value within the displayed image.
export function coordToPixel(coord, displaySize, max) {
  return (coord / max) * displaySize;
}

// True when point is within thresholdPx (Euclidean) of firstPoint.
export function isNearFirstPoint(point, firstPoint, thresholdPx) {
  return Math.hypot(point[0] - firstPoint[0], point[1] - firstPoint[1]) <= thresholdPx;
}
