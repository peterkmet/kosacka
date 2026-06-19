# Vector Drawing Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page HTML tool to draw, export, and import named colored polygons over a background image, representing mower zones.

**Architecture:** One `index.html` for UI and SVG canvas, plus a DOM-free `logic.js` ES module holding all testable pure functions. `index.html` imports `logic.js`. No build step. Vitest runs the unit tests against `logic.js`.

**Tech Stack:** Vanilla JavaScript (ES modules), SVG, Vitest.

## Global Constraints

- All code, comments, and docs in English.
- No build step for the app itself; `index.html` runs directly in a browser.
- Coordinate origin is top-left (SVG convention); `x` grows right, `y` grows down.
- Stored point values are in `xMax`/`yMax` scale, not raw pixels.
- Export/import file shape: `{ "xMax": number, "yMax": number, "image": string, "zones": [{ "name": string, "color": string, "points": "x,y x,y ..." }] }`.
- Internal zone representation uses `points` as an array `[[x, y], ...]`; only the file format uses the `"x,y x,y"` string.

---

### Task 1: Scaffold + points string conversion

**Files:**
- Create: `package.json`
- Create: `logic.js`
- Test: `logic.test.js`

**Interfaces:**
- Produces:
  - `CLOSE_THRESHOLD_PX: number` (12)
  - `PALETTE: string[]` (16 hex colors)
  - `DEFAULT_X_MAX: number` (100), `DEFAULT_Y_MAX: number` (80)
  - `pointsToString(points: number[][]): string` — `[[28,26],[621,26]]` → `"28,26 621,26"`, each value rounded to 2 decimals.
  - `parsePoints(str: string): number[][]` — inverse of `pointsToString`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "kosacka",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Install Vitest**

Run: `npm install`
Expected: `node_modules` created, `vitest` available.

- [ ] **Step 3: Write the failing test**

Create `logic.test.js`:

```javascript
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
```

Note: `1.005` rounds to `1` here because of float representation; the assertion documents actual behavior.

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `logic.js` has no such exports.

- [ ] **Step 5: Write `logic.js`**

```javascript
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
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json logic.js logic.test.js
git commit -m "Add scaffold and points string conversion"
```

---

### Task 2: Pixel/coordinate scaling

**Files:**
- Modify: `logic.js`
- Test: `logic.test.js`

**Interfaces:**
- Produces:
  - `pixelToCoord(pixel: number, displaySize: number, max: number): number` — `(pixel / displaySize) * max`.
  - `coordToPixel(coord: number, displaySize: number, max: number): number` — `(coord / max) * displaySize`.

- [ ] **Step 1: Write the failing test**

Append to `logic.test.js`:

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — exports not defined.

- [ ] **Step 3: Add implementation to `logic.js`**

```javascript
// Map a pixel value (within the displayed image) to the xMax/yMax scale.
export function pixelToCoord(pixel, displaySize, max) {
  return (pixel / displaySize) * max;
}

// Map a scaled coordinate back to a pixel value within the displayed image.
export function coordToPixel(coord, displaySize, max) {
  return (coord / max) * displaySize;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add logic.js logic.test.js
git commit -m "Add pixel/coordinate scaling"
```

---

### Task 3: Close-polygon detection

**Files:**
- Modify: `logic.js`
- Test: `logic.test.js`

**Interfaces:**
- Produces:
  - `isNearFirstPoint(point: number[], firstPoint: number[], thresholdPx: number): boolean` — true when Euclidean distance ≤ threshold. Inputs are pixel-space points.

- [ ] **Step 1: Write the failing test**

Append to `logic.test.js`:

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — export not defined.

- [ ] **Step 3: Add implementation to `logic.js`**

```javascript
// True when point is within thresholdPx (Euclidean) of firstPoint.
export function isNearFirstPoint(point, firstPoint, thresholdPx) {
  return Math.hypot(point[0] - firstPoint[0], point[1] - firstPoint[1]) <= thresholdPx;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add logic.js logic.test.js
git commit -m "Add close-polygon detection"
```

---

### Task 4: Serialize / deserialize state

**Files:**
- Modify: `logic.js`
- Test: `logic.test.js`

**Interfaces:**
- Consumes: `pointsToString`, `parsePoints`.
- Produces:
  - `serialize(state): string` — `state` is `{ xMax, yMax, image, zones: [{ name, color, points: number[][] }] }`. Returns pretty JSON string with `points` as strings.
  - `deserialize(text: string): state` — inverse; `points` parsed back to `number[][]`.

- [ ] **Step 1: Write the failing test**

Append to `logic.test.js`:

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — exports not defined.

- [ ] **Step 3: Add implementation to `logic.js`**

```javascript
// Convert app state to the export JSON string (points as "x,y x,y" strings).
export function serialize(state) {
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
export function deserialize(text) {
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add logic.js logic.test.js
git commit -m "Add serialize/deserialize for export/import"
```

---

### Task 5: index.html UI wiring

> **No automated test for this task.** It is pure DOM/SVG/event wiring that depends on a live browser (file upload, mouse clicks, keyboard). Per CLAUDE.md this is flagged: all logic is already covered by Vitest in Tasks 1-4; this task is verified manually. Confirm before skipping the automated test.

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: every export from `logic.js`.

**Manual verification checklist (run in browser):**
- Load an image → it appears as background.
- Set x-max / y-max.
- "New polygon" → prompt for name → pick a color from the 16-color palette → click points → click near first point closes it.
- Esc removes the last placed point.
- Click a finished polygon selects it; Delete removes it.
- "Export" downloads a `.json` with `xMax`, `yMax`, base64 `image`, and `zones`.
- "Import" of that `.json` restores image, scale, and all polygons.

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mower Zones — Vector Drawing</title>
  <style>
    body { font-family: sans-serif; margin: 0; display: flex; height: 100vh; }
    #sidebar { width: 240px; padding: 12px; box-sizing: border-box; border-right: 1px solid #ccc; overflow-y: auto; }
    #stage { flex: 1; position: relative; overflow: auto; background: #eef; }
    #stage img { display: block; max-width: none; }
    #svg { position: absolute; top: 0; left: 0; }
    .row { margin-bottom: 10px; }
    label { display: block; font-size: 12px; margin-bottom: 2px; }
    input[type="number"] { width: 70px; }
    button { display: block; width: 100%; margin-bottom: 6px; padding: 6px; cursor: pointer; }
    #palette { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
    .swatch { height: 28px; border: 2px solid transparent; cursor: pointer; border-radius: 4px; }
    .swatch.selected { border-color: #000; }
    #zoneList li { font-size: 13px; cursor: pointer; padding: 2px 4px; }
    #zoneList li.selected { background: #ddf; }
    polygon { cursor: pointer; }
  </style>
</head>
<body>
  <div id="sidebar">
    <div class="row">
      <label>Background image</label>
      <input type="file" id="imageInput" accept="image/*" />
    </div>
    <div class="row">
      <label>x-max</label><input type="number" id="xMax" />
      <label>y-max</label><input type="number" id="yMax" />
    </div>
    <button id="newPolygon">New polygon</button>
    <div class="row" id="paletteRow" style="display:none;">
      <label>Pick color</label>
      <div id="palette"></div>
    </div>
    <button id="exportBtn">Export</button>
    <button id="importBtn">Import</button>
    <input type="file" id="importInput" accept="application/json" style="display:none;" />
    <div class="row">
      <label>Zones</label>
      <ul id="zoneList" style="padding-left:16px;"></ul>
    </div>
    <div class="row" style="font-size:12px;color:#666;">
      Esc: remove last point · Delete: remove selected zone
    </div>
  </div>
  <div id="stage">
    <img id="bg" alt="" />
    <svg id="svg"></svg>
  </div>

  <script type="module">
    import {
      CLOSE_THRESHOLD_PX, PALETTE, DEFAULT_X_MAX, DEFAULT_Y_MAX,
      pixelToCoord, coordToPixel, isNearFirstPoint, serialize, deserialize,
    } from "./logic.js";

    const SVGNS = "http://www.w3.org/2000/svg";
    const state = { xMax: DEFAULT_X_MAX, yMax: DEFAULT_Y_MAX, image: "", zones: [] };
    let drawing = null;          // { name, color, points: number[][] (coord scale) }
    let pendingColor = PALETTE[0];
    let selectedIndex = -1;

    const els = {
      imageInput: document.getElementById("imageInput"),
      xMax: document.getElementById("xMax"),
      yMax: document.getElementById("yMax"),
      newPolygon: document.getElementById("newPolygon"),
      paletteRow: document.getElementById("paletteRow"),
      palette: document.getElementById("palette"),
      exportBtn: document.getElementById("exportBtn"),
      importBtn: document.getElementById("importBtn"),
      importInput: document.getElementById("importInput"),
      zoneList: document.getElementById("zoneList"),
      bg: document.getElementById("bg"),
      svg: document.getElementById("svg"),
      stage: document.getElementById("stage"),
    };

    els.xMax.value = state.xMax;
    els.yMax.value = state.yMax;
    els.xMax.addEventListener("change", () => { state.xMax = Number(els.xMax.value); });
    els.yMax.addEventListener("change", () => { state.yMax = Number(els.yMax.value); });

    function displaySize() {
      return { w: els.bg.clientWidth, h: els.bg.clientHeight };
    }

    function syncSvgSize() {
      const { w, h } = displaySize();
      els.svg.setAttribute("width", w);
      els.svg.setAttribute("height", h);
    }

    function setImage(dataUrl) {
      state.image = dataUrl;
      els.bg.src = dataUrl;
    }
    els.bg.addEventListener("load", () => { syncSvgSize(); render(); });

    els.imageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    });

    // Build palette swatches.
    PALETTE.forEach((color) => {
      const sw = document.createElement("div");
      sw.className = "swatch";
      sw.style.background = color;
      sw.addEventListener("click", () => {
        pendingColor = color;
        [...els.palette.children].forEach((c) => c.classList.remove("selected"));
        sw.classList.add("selected");
      });
      els.palette.appendChild(sw);
    });

    els.newPolygon.addEventListener("click", () => {
      const name = prompt("Polygon name:");
      if (name === null || name.trim() === "") return;
      els.paletteRow.style.display = "block";
      drawing = { name: name.trim(), color: pendingColor, points: [] };
      selectedIndex = -1;
      render();
    });

    // Convert a mouse event to coord-scale point.
    function eventToCoord(e) {
      const rect = els.bg.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const { w, h } = displaySize();
      return [pixelToCoord(px, w, state.xMax), pixelToCoord(py, h, state.yMax)];
    }

    els.svg.addEventListener("click", (e) => {
      if (!drawing) return;
      const coord = eventToCoord(e);
      const { w, h } = displaySize();
      if (drawing.points.length >= 3) {
        const firstPx = [
          coordToPixel(drawing.points[0][0], w, state.xMax),
          coordToPixel(drawing.points[0][1], h, state.yMax),
        ];
        const clickPx = [coordToPixel(coord[0], w, state.xMax), coordToPixel(coord[1], h, state.yMax)];
        if (isNearFirstPoint(clickPx, firstPx, CLOSE_THRESHOLD_PX)) {
          state.zones.push({ name: drawing.name, color: drawing.color, points: drawing.points });
          drawing = null;
          els.paletteRow.style.display = "none";
          render();
          return;
        }
      }
      drawing.points.push(coord);
      render();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawing) {
        drawing.points.pop();
        render();
      } else if (e.key === "Delete" && selectedIndex >= 0) {
        state.zones.splice(selectedIndex, 1);
        selectedIndex = -1;
        render();
      }
    });

    function coordPointsToPixelString(points) {
      const { w, h } = displaySize();
      return points
        .map(([x, y]) => `${coordToPixel(x, w, state.xMax)},${coordToPixel(y, h, state.yMax)}`)
        .join(" ");
    }

    function render() {
      els.svg.innerHTML = "";
      state.zones.forEach((zone, i) => {
        const poly = document.createElementNS(SVGNS, "polygon");
        poly.setAttribute("points", coordPointsToPixelString(zone.points));
        poly.setAttribute("fill", zone.color);
        poly.setAttribute("fill-opacity", i === selectedIndex ? "0.6" : "0.35");
        poly.setAttribute("stroke", zone.color);
        poly.setAttribute("stroke-width", i === selectedIndex ? "3" : "1.5");
        poly.addEventListener("click", (ev) => {
          ev.stopPropagation();
          if (drawing) return;
          selectedIndex = i;
          render();
        });
        els.svg.appendChild(poly);
      });

      if (drawing && drawing.points.length > 0) {
        const line = document.createElementNS(SVGNS, "polyline");
        line.setAttribute("points", coordPointsToPixelString(drawing.points));
        line.setAttribute("fill", "none");
        line.setAttribute("stroke", drawing.color);
        line.setAttribute("stroke-width", "2");
        els.svg.appendChild(line);
        const { w, h } = displaySize();
        drawing.points.forEach(([x, y]) => {
          const c = document.createElementNS(SVGNS, "circle");
          c.setAttribute("cx", coordToPixel(x, w, state.xMax));
          c.setAttribute("cy", coordToPixel(y, h, state.yMax));
          c.setAttribute("r", "4");
          c.setAttribute("fill", drawing.color);
          els.svg.appendChild(c);
        });
      }

      renderZoneList();
    }

    function renderZoneList() {
      els.zoneList.innerHTML = "";
      state.zones.forEach((zone, i) => {
        const li = document.createElement("li");
        li.textContent = zone.name;
        li.style.color = zone.color;
        if (i === selectedIndex) li.classList.add("selected");
        li.addEventListener("click", () => { selectedIndex = i; render(); });
        els.zoneList.appendChild(li);
      });
    }

    els.exportBtn.addEventListener("click", () => {
      state.xMax = Number(els.xMax.value);
      state.yMax = Number(els.yMax.value);
      const blob = new Blob([serialize(state)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "zones.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });

    els.importBtn.addEventListener("click", () => els.importInput.click());
    els.importInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const loaded = deserialize(reader.result);
        state.xMax = loaded.xMax;
        state.yMax = loaded.yMax;
        state.zones = loaded.zones;
        els.xMax.value = state.xMax;
        els.yMax.value = state.yMax;
        selectedIndex = -1;
        drawing = null;
        els.paletteRow.style.display = "none";
        setImage(loaded.image);
      };
      reader.readAsText(file);
    });

    window.addEventListener("resize", () => { syncSvgSize(); render(); });
  </script>
</body>
</html>
```

- [ ] **Step 2: Manual verification**

Run: `npx serve .` (or open `index.html` via any static server) and walk the manual verification checklist above.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add index.html UI for drawing, export and import"
```

---

## Self-Review Notes

- **Spec coverage:** scale (Tasks 2, 5), image load + base64 (Task 5), draw/close/Esc (Tasks 3, 5), delete (Task 5), export/import (Tasks 4, 5), palette of 16 (Task 1, 5), data format (Tasks 1, 4). All covered.
- **Type consistency:** internal `points` is `number[][]` everywhere; file format is the `"x,y x,y"` string, converted only in `serialize`/`deserialize` and at render time. Names match across tasks.
- **Flagged:** Task 5 has no automated test (browser DOM/SVG). Confirm before skipping.
