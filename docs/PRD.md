# PRD — Vector Drawing Tool for Mower Zones

Date: 2026-06-19
Status: Approved design, pending implementation plan

## 1. Purpose

A single-page HTML tool to draw polygons over a background image and export them as
vectors. The polygons represent areas where a robotic mower is allowed to mow. The user
loads a reference image (e.g. an aerial sketch of the property), sets a coordinate scale,
draws named colored polygons by clicking, and exports the result as a JSON file. The same
JSON can be loaded back to restore the image and all polygons.

## 2. Goals

- Draw closed polygons over a background image by clicking points.
- Each polygon has a name and a color chosen from a fixed palette.
- Configure the coordinate scale via `x-max` and `y-max`.
- Export polygons (with image) to a single `.json` file.
- Import that `.json` to restore image, scale, and polygons.
- Delete an existing polygon.

## 3. Non-Goals (MVP)

- Editing existing polygon points (drag/move). Planned for the future.
- Renaming or recoloring an existing polygon.
- Multiple background images at once.
- Server / persistence beyond local file download.
- Mobile / touch optimization.

## 4. Coordinate System

- Origin top-left, SVG convention. `x` grows right, `y` grows down.
- Stored point values are scaled to `xMax` / `yMax`, not raw pixels.
- Mapping is linear against the displayed image area:
  - `coordX = pixelX / displayedWidth * xMax`
  - `coordY = pixelY / displayedHeight * yMax`
- The inverse is used to render stored polygons back onto the image.

## 5. Data Format

Export and import use one `.json` file:

```json
{
  "xMax": 100,
  "yMax": 80,
  "image": "data:image/png;base64,....",
  "zones": [
    { "name": "Pod záhradou", "color": "#34d399", "points": "28,26 621,26 621,116 28,116" }
  ]
}
```

- `points` is an SVG-style string: `"x,y x,y x,y ..."`, values in `xMax`/`yMax` scale.
- `image` is the background stored as a base64 data URL.
- The app both reads and writes this exact shape.

## 6. Configuration

Constants at the top of `logic.js`:

- `CLOSE_THRESHOLD_PX` — pixel radius around the first point that closes the polygon (default 12).
- `PALETTE` — 16 predefined colors offered when creating a polygon.
- `DEFAULT_X_MAX`, `DEFAULT_Y_MAX` — initial scale values.

## 7. Architecture

- `index.html` — UI and SVG canvas. Loads `logic.js` as an ES module.
- `logic.js` — pure functions, no DOM, importable by both the page and Vitest.
- No build step. Vitest is a dev dependency for tests only.

### Pure functions (unit-tested with Vitest)

- `pixelToCoord(pixel, displaySize, max)` / `coordToPixel(coord, displaySize, max)`
- `pointsToString(points)` / `parsePoints(str)`
- `isNearFirstPoint(point, firstPoint, thresholdPx)`
- `serialize(state)` / `deserialize(json)`

### Manual verification only

- Mouse clicking, point placement, SVG rendering, polygon selection.

## 8. Rendering

- SVG layer on top of the `<img>` background.
- Completed polygons render as `<polygon>` with their color (filled, semi-transparent).
- The in-progress polygon renders as a `<polyline>` plus point markers.
- A selected polygon is visually highlighted.

## 9. Epics (Gherkin)

### Epic: Set up coordinate scale

```gherkin
Feature: Coordinate scale
  As a user
  I want to set x-max and y-max
  So that exported points are in my chosen scale

  Scenario: Default scale on load
    Given the app has just loaded
    Then x-max and y-max show their default values

  Scenario: Change scale
    Given the app is loaded
    When I set x-max to 100 and y-max to 80
    Then newly drawn points are stored in the 0..100 and 0..80 ranges
```

### Epic: Load background image

```gherkin
Feature: Background image
  As a user
  I want to load a reference image
  So that I can trace mowable areas over it

  Scenario: Upload an image
    Given the app is loaded
    When I choose an image file
    Then the image is shown as the drawing background
    And the image is kept as a base64 data URL
```

### Epic: Draw a polygon

```gherkin
Feature: Draw polygon
  As a user
  I want to draw a named colored polygon by clicking
  So that I define a mowable zone

  Scenario: Start a new polygon
    Given an image is loaded
    When I click "New polygon"
    Then I am asked for a name and a color from the palette

  Scenario: Add points
    Given I started a new polygon with a name and color
    When I click on the canvas
    Then a point is added at the clicked position

  Scenario: Close the polygon
    Given I am drawing a polygon with at least three points
    When I click near the first point within the close threshold
    Then the polygon is closed and stored with its name and color

  Scenario: Undo the last point
    Given I am drawing a polygon
    When I press Esc
    Then the last placed point is removed
```

### Epic: Delete a polygon

```gherkin
Feature: Delete polygon
  As a user
  I want to delete a finished polygon
  So that I can remove a mistake

  Scenario: Select and delete
    Given a finished polygon exists
    When I click on the polygon
    Then it becomes selected
    When I press Delete
    Then the polygon is removed
```

### Epic: Export zones

```gherkin
Feature: Export
  As a user
  I want to export the result as a JSON file
  So that I can reuse the zones elsewhere

  Scenario: Export to file
    Given at least one polygon exists
    When I click "Export"
    Then a .json file is downloaded
    And it contains xMax, yMax, the image as base64, and the zones array
```

### Epic: Import zones

```gherkin
Feature: Import
  As a user
  I want to load a previously exported JSON
  So that I can continue working

  Scenario: Import from file
    Given a valid exported .json file
    When I import it
    Then x-max and y-max are restored
    And the background image is shown
    And all polygons are rendered with their names and colors
```

## 10. Success Criteria

- All listed pure functions have passing Vitest unit tests.
- A user can load an image, draw and close several named colored polygons, delete one,
  export to JSON, reload the page, import that JSON, and see the same result.
