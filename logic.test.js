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

import { isNearFirstPoint } from "./logic.js";

describe("close detection", () => {
  it("is true within threshold", () => {
    expect(isNearFirstPoint([105, 100], [100, 100], 12)).toBe(true);
  });

  it("is false beyond threshold", () => {
    expect(isNearFirstPoint([100, 120], [100, 100], 12)).toBe(false);
  });

  it("is true exactly at threshold", () => {
    expect(isNearFirstPoint([100, 112], [100, 100], 12)).toBe(true);
  });
});

import { serialize, deserialize } from "./logic.js";

describe("serialize/deserialize", () => {
  const state = {
    xMax: 100,
    yMax: 80,
    image: "data:image/png;base64,abc",
    zones: [{ name: "Predok", color: "#22c55e", points: [[10, 20], [30, 40], [10, 40]] }],
  };

  it("serializes points to strings", () => {
    const obj = JSON.parse(serialize(state));
    expect(obj.zones[0].points).toBe("10,20 30,40 10,40");
    expect(obj.xMax).toBe(100);
    expect(obj.image).toBe("data:image/png;base64,abc");
  });

  it("round-trips through serialize then deserialize", () => {
    expect(deserialize(serialize(state))).toEqual(state);
  });
});
