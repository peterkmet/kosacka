# PRD — Vector Drawing Tool for Mower Zones

Date: 2026-06-19
Status: Implemented and deployed (GitHub Pages)

## 1. Purpose

A static single-page tool to draw polygons over a background image and export them as
vectors. The polygons represent areas where a robotic mower is allowed to mow. The user
selects a reference image, sets a coordinate scale, draws named colored polygons by
clicking, and exports the result as a JSON file. The same JSON can be loaded back to
restore the scale, image, and polygons.

## 2. Goals

- Draw closed polygons by clicking points, with or without a background image.
- Each polygon has a name and a color chosen from a fixed palette.
- Select a background image from a predefined list (bundled in `assets/`).
- Configure the coordinate scale via `x-max` and `y-max`.
- Export polygons to a single `.json` file.
- Import that `.json` to restore scale, image, and polygons.
- Delete an existing polygon.
- Show each polygon's name centered inside it.

## 3. Non-Goals

- Uploading arbitrary images (selection is limited to the bundled `assets/` entries).
- Embedding the image in the export (the export stores the image path, not base64).
- Editing existing polygon points (drag/move). Possible future work.
- Renaming or recoloring an existing polygon.
- Zoom / pan of the canvas. Possible future work.
- Server / persistence beyond local file download.

## 4. Coordinate System and Canvas

- Origin top-left, SVG convention. `x` grows right, `y` grows down.
- The canvas uses the `xMax` : `yMax` aspect ratio, fitted into the available area.
  The canvas — not the image — defines the coordinate space.
- A selected background image is scaled into the canvas box, preserving its own aspect
  ratio (`object-fit: contain`). If no image is selected, the canvas is blank (white).
- Stored point values are in `xMax` / `yMax` scale, not raw pixels:
  - `coordX = pixelX / canvasWidth * xMax`
  - `coordY = pixelY / canvasHeight * yMax`
- The inverse is used to render stored polygons back onto the canvas.

## 5. Data Format

Export and import use one `.json` file:

```json
{
  "xMax": 500,
  "yMax": 375,
  "image": "assets/podklad-nakres.jpg",
  "zones": [
    { "name": "Predok", "color": "#10b981", "points": "22,80 145,80 145,250 22,250" }
  ]
}
```

- `points` is an SVG-style string: `"x,y x,y x,y ..."`, values in `xMax`/`yMax` scale.
- `image` is the relative path of the selected asset, or `""` for no image.
- The app both reads and writes this exact shape.

## 6. Configuration

Constants at the top of `logic.js`:

- `CLOSE_THRESHOLD_PX` — pixel radius around the first point that closes the polygon (default 12).
- `PALETTE` — 16 predefined colors offered when creating a polygon.
- `DEFAULT_X_MAX`, `DEFAULT_Y_MAX` — initial scale values.

The selectable background images are defined in the `ASSETS` list inside `index.html`
(directory listing is not possible when served from `file://`).

## 7. Architecture

- `index.html` — UI, SVG canvas, and all DOM/event wiring. Loads `logic.js` as a
  classic script so the app runs from `file://` without a server.
- `logic.js` — pure functions, no DOM. Loaded as a classic script in the browser; also
  exports via `module.exports` for the Vitest test runner.
- No build step. Vitest is a dev dependency for tests only.

### Pure functions (unit-tested with Vitest)

- `pixelToCoord(pixel, displaySize, max)` / `coordToPixel(coord, displaySize, max)`
- `pointsToString(points)` / `parsePoints(str)`
- `isNearFirstPoint(point, firstPoint, thresholdPx)`
- `serialize(state)` / `deserialize(json)`

### Manual verification only

- Mouse clicking, point placement, SVG rendering, polygon selection, image scaling.

## 8. Rendering

- SVG layer on top of the `<img>` background; both sized to the canvas box.
- Completed polygons render as `<polygon>` with their color (filled, semi-transparent).
- Each polygon's name renders as centered `<text>` (centroid of its points) in a dark
  font, with `pointer-events: none` so it does not block selection.
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
    When I set x-max to 500 and y-max to 375
    Then the canvas uses that aspect ratio
    And newly drawn points are stored in the 0..500 and 0..375 ranges
```

### Epic: Select background image

```gherkin
Feature: Background image
  As a user
  I want to choose a reference image from a list
  So that I can trace mowable areas over it

  Scenario: Pick an image
    Given the app is loaded
    When I choose an image from the dropdown
    Then the image is scaled into the canvas, preserving its aspect ratio

  Scenario: No image
    Given the app is loaded
    When I choose the "none" entry
    Then the canvas is blank and I can still draw
```

### Epic: Draw a polygon

```gherkin
Feature: Draw polygon
  As a user
  I want to draw a named colored polygon by clicking
  So that I define a mowable zone

  Scenario: Start a new polygon
    Given the app is loaded
    When I click "New polygon"
    Then I am asked for a name
    And the color palette becomes available

  Scenario: Choose color for the current polygon
    Given I started a new polygon
    When I click a color in the palette
    Then the polygon currently being drawn uses that color

  Scenario: Add points
    Given I started a new polygon
    When I click on the canvas
    Then a point is added at the clicked position

  Scenario: Close the polygon
    Given I am drawing a polygon with at least three points
    When I click near the first point within the close threshold
    Then the polygon is closed and stored with its name and color
    And its name is shown centered inside it

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
    And it contains xMax, yMax, the image path, and the zones array
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
    And the background image is selected and shown
    And all polygons are rendered with their names and colors
```

## 10. Deployment

- Published as a static site on GitHub Pages from the repository root
  (`main` branch, `/`).
- Live URL: https://peterkmet.github.io/kosacka/
- `.nojekyll` disables Jekyll processing. Relative paths keep the app working under the
  `/kosacka/` project subpath.

## 11. Success Criteria

- All listed pure functions have passing Vitest unit tests.
- A user can set the scale, optionally select an image, draw and close several named
  colored polygons, delete one, export to JSON, reload, import that JSON, and see the
  same result.
