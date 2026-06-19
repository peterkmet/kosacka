import { describe, it, expect } from "vitest";
import { pointsToString, parsePoints, PALETTE } from "./logic.js";

describe("points conversion", () => {
  it("serializes points array to SVG-style string", () => {
    expect(pointsToString([[28, 26], [621, 26], [621, 116]])).toBe("28,26 621,26 621,116");
  });

  it("rounds to 2 decimals", () => {
    expect(pointsToString([[1.005, 2.5]])).toBe("1,2.5");
  });

  it("parses string back to points array", () => {
    expect(parsePoints("28,26 621,26 621,116")).toEqual([[28, 26], [621, 26], [621, 116]]);
  });

  it("round-trips", () => {
    const pts = [[10.5, 20.25], [30, 40]];
    expect(parsePoints(pointsToString(pts))).toEqual(pts);
  });
});

describe("palette", () => {
  it("has 16 colors", () => {
    expect(PALETTE).toHaveLength(16);
  });
});

import { pixelToCoord, coordToPixel } from "./logic.js";

describe("scaling", () => {
  it("maps a pixel to coordinate scale", () => {
    expect(pixelToCoord(300, 600, 100)).toBe(50);
  });

  it("maps a coordinate back to pixels", () => {
    expect(coordToPixel(50, 600, 100)).toBe(300);
  });

  it("round-trips", () => {
    expect(coordToPixel(pixelToCoord(123, 600, 100), 600, 100)).toBeCloseTo(123);
  });
});
