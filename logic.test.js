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

import { pixelToNorm, normToPixel } from "./logic.js";

describe("normalized mapping", () => {
  it("maps a pixel to a 0..1 fraction of the canvas", () => {
    expect(pixelToNorm(300, 600)).toBe(0.5);
  });

  it("maps a 0..1 fraction back to pixels", () => {
    expect(normToPixel(0.5, 600)).toBe(300);
  });

  it("round-trips", () => {
    expect(normToPixel(pixelToNorm(123, 600), 600)).toBeCloseTo(123);
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
    image: "assets/podklad-nakres.jpg",
    zones: [{ name: "Predok", color: "#22c55e", points: [[0.1, 0.25], [0.3, 0.5], [0.1, 0.5]] }],
  };

  it("scales normalized points by xMax/yMax into the export string", () => {
    const obj = JSON.parse(serialize(state));
    expect(obj.zones[0].points).toBe("10,20 30,40 10,40");
    expect(obj.xMax).toBe(100);
    expect(obj.image).toBe("assets/podklad-nakres.jpg");
  });

  it("round-trips through serialize then deserialize", () => {
    expect(deserialize(serialize(state))).toEqual(state);
  });

  it("re-exports the same fractions at a different scale", () => {
    const rescaled = { ...state, xMax: 200, yMax: 160 };
    const obj = JSON.parse(serialize(rescaled));
    expect(obj.zones[0].points).toBe("20,40 60,80 20,80");
  });
});
