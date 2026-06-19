# Kosačka — Vector Drawing Tool for Mower Zones

A static, single-page tool to draw, export, and import named colored polygons over
a background image. The polygons represent areas where a robotic mower is allowed to
mow.

## Run locally

The app is fully static. Open `index.html` directly in a browser (double-click), or
serve the folder:

```bash
npx serve .
```

`logic.js` must sit next to `index.html`, and background images must be in `assets/`.

## Usage

- **Background image** — pick one from the dropdown (entries are defined in the
  `ASSETS` list inside `index.html`), or "none" to draw on a blank canvas.
- **x-max / y-max** — the coordinate scale used only when exporting/importing the JSON.
  Changing them does not move the on-screen drawing (points are stored normalized). The
  canvas follows the image's aspect ratio, or x-max : y-max when no image is loaded.
- **New polygon** — enter a name, pick a color from the palette, then click to add
  points. Click near the first point to close the polygon. `Esc` removes the last point.
  The polygon's name is shown centered inside it.
- **Delete** — click a finished polygon to select it, then press `Delete`.
- **Export** — downloads a `.json` with `xMax`, `yMax`, `image` (path), and `zones`.
- **Import** — loads such a `.json` and restores the scale, image, and polygons.

## Export format

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

`points` is an SVG-style `"x,y x,y ..."` string, top-left origin, in the `xMax`/`yMax`
scale.

## Tests

Pure logic lives in `logic.js` and is covered by Vitest:

```bash
npm install
npm test
```

## Deployment

Published as a static site on GitHub Pages from the repository root (`main` branch, `/`).

Live: https://peterkmet.github.io/kosacka/

`.nojekyll` disables Jekyll processing; relative paths keep the app working under the
`/kosacka/` project subpath. Every push to `main` triggers a Pages rebuild.
