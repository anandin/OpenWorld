# OpenWorld

Browser-based 3D tactical open-world shooter prototype, built with Three.js + TypeScript + Vite.

**Current milestone: M0 — Hello Terrain.** Procedural island, free-fly camera, GH Pages deploy.

## Play

Hosted on Vercel. Each push to a tracked branch auto-deploys; PRs get
preview URLs.

**One-time setup (Vercel UI, ~30 seconds):**

1. Go to <https://vercel.com/new> and sign in with GitHub.
2. Import this repo (`anandin/openworld`).
3. Vercel auto-detects Vite (`framework: vite`, output `dist/`). Click
   **Deploy**. No env vars needed.

After that the production URL is `https://<project>.vercel.app/`. Push to
the deploy branch → live in ~30s.

## Local

```sh
npm install
npm run dev          # http://localhost:5173
npm run build        # production build to dist/
npm run preview      # serve the built bundle on :4173
npm test             # vitest unit tests
npm run test:e2e     # playwright smoke (requires `npx playwright install chromium`)
npm run typecheck
```

## Controls (M0)

- Click the canvas to capture the mouse.
- WASD: move; Space / Ctrl: up / down; Shift: sprint.
- Esc: release mouse.

## Layout

```
src/
  core/      math, time, logger     (no Three deps)
  engine/    renderer, camera, input, sky, engine loop
  world/     heightfield, terrain mesh
  main.ts    bootstrap
tests/
  unit/      vitest
  e2e/       playwright
```

## Roadmap

| Milestone | Title | What you can do |
|---|---|---|
| **M0** ✅ | Hello Terrain | walk-cam over a procedural island |
| M1 | Walk the Island | physics-driven FPS, streamed chunks, water, sky |
| M2 | Shoot the Air | TPS toggle, soldier model, hitscan rifle, HUD |
| M3 | Enemies | enemy AI (BT), navmesh, damage, save |
| M4 | Stealth & Missions | suppressor, stances, mission framework |
| M5 | Polish | impostors, grass, post-FX, settings menu |
| M6 | Vehicles & Scale | drivable buggy, second region |
| M7 | MP-Ready | command-objects, snapshot spec, transport iface |

See `/root/.claude/plans/dude-i-can-code-golden-trinket.md` for the full plan.
