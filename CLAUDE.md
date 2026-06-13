# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Container Park Simulator (« ÉcoParc »)** — a playable browser-based 3D management
sim about running a Belgian-style recycling park (recyparc). The game's content
and UI are authored in **French** (source language), with runtime localization to
EN/NL/DE/ES/IT.

It is a **vanilla JS + Three.js** web game with **no build step**. There is no
framework, bundler, or transpiler — ES modules are served directly and Three.js is
vendored locally under `vendor/`.

## Run / develop

ES modules + the `importmap` require an HTTP server (won't work over `file://`):

```bash
python3 -m http.server 8000
# open http://localhost:8000/index.html
```

Syntax-check all modules (no test suite exists):

```bash
for f in src/*.js; do node --check "$f"; done
```

Regenerate marketing/preview screenshots (needs `playwright-core` + a Chromium
binary; Three.js must be installed via npm to refresh `vendor/`):

```bash
npm install three@0.160.0 playwright-core
python3 -m http.server 8000 &
CHROME_PATH=/path/to/chrome node scripts/shoot.mjs   # writes docs/maquette-*.png
```

## Architecture

Single-page app. `index.html` declares an `importmap` pointing `three` and
`three/addons/` at `vendor/three/`, then loads `src/game.js` as a module.

- `src/game.js` — orchestrator. Owns the `requestAnimationFrame` loop, game clock
  (`GAME_MIN_PER_REAL_SEC`), visitor spawning, day rollover, and every action the
  UI calls. **The render loop must call `this.scene.render()`** (easy to forget).
- `src/state.js` — the single mutable `state` object + localStorage save/load.
  Systems mutate `state` directly; there is no immutable store.
- `src/data.js` — all static game data (60+ waste categories, vehicles, staff,
  equipment, research tree, shop, achievements, events, weather). Start here to
  add/tune content.
- `src/systems.js` — pure-ish simulation logic over `state` (economy settlement,
  visitor generation, research, events, reputation, achievements, XP/levels).
- `src/scene3d.js` — Three.js. Builds the procedural world and all meshes from
  primitives (no external 3D assets), drives vehicle animation, day/night sun,
  weather particles, and raycasting for clicks/placement.
- `src/ui.js` — DOM UI: HUD updates, the 9 side panels (`render_<panel>()` +
  `wirePanel`), toasts, inspector, modals, build-placement pointer handling.
- `src/i18n.js` — `t(key)` lookups; FR is the source, other langs derive from it.
- `src/audio.js` — WebAudio SFX + generative music (no audio files).

## Conventions

- **Source language is French.** New player-facing strings go in `i18n.js` (add the
  key to all 6 languages, FR first) — don't hardcode UI text in `ui.js`.
- Game content is data-driven: prefer extending the arrays in `data.js` over
  branching logic in systems.
- Keep the project **dependency-free at runtime** — no CDNs, no npm packages in the
  served code. `node_modules/` is gitignored; only `vendor/` ships.
- Money is €, mass is tonnes, percentages are 0–100. IDs come from `Sys.uid()`.

## Scope note

This is an honest **prototype**, not a finished commercial Unity/Unreal title:
geometry and audio are code-generated, and the premium shop credits EcoGems
directly (no real payments). See `README.md` § "Portée & honnêteté".
