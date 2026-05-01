# Rachit Yadav — 3D Portfolio Website

An interactive 3D portfolio built with **Three.js** showcasing data engineering and ML skills.

## Features
- Animated particle universe background (4,500 stars)
- 14 floating geometric data nodes connected by light lines
- Interactive 3D skills sphere (drag, zoom, explore)
- Smooth scroll sections, animated stat counters, custom cursor
- Career timeline, contact cards, fully responsive

## Files
- `index.html` — page structure
- `styles.css` — all styling and animations
- `app.js` — Three.js scenes (background + skills sphere)

## How to launch

The site uses **Three.js from a CDN**, so no build tools or npm install required.

### Option 1 — Open directly (simplest)
Just double-click `index.html`. It will open in your default browser.

> Note: Some browsers limit local file features. If anything looks off, use Option 2.

### Option 2 — Local web server (recommended)

**Python 3** (built-in on macOS):
```bash
cd "/path/to/folder/containing/index.html"
python3 -m http.server 8000
```
Then open http://localhost:8000 in your browser.

**Node.js** (if installed):
```bash
npx serve .
```

**VS Code:** install the "Live Server" extension, right-click `index.html` → "Open with Live Server".

## Browser support
Best in modern Chrome, Edge, Safari, or Firefox (WebGL required).

## Customizing
- Edit text/copy in `index.html`
- Tweak colors in `:root` at the top of `styles.css`
- Add/remove skills in the `skills` array near the top of the `skillsScene` function in `app.js`
