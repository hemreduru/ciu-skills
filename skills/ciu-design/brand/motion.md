# Motion Rules (video)

Helpers live in `remotion/src/lib/motion.ts`: `enter`, `exit`, `wipe`, `breathe`, `ease`, `STAGGER`. `enter` and `exit` both set `transform`, so apply them to nested elements (exit on the wrapper, enter on each child).

1. **No linear moves** for UI elements: springs (`enter`) or bezier easing (`ease.out` in, `ease.in` out). Linear is only for the slow Ken Burns drift.
2. **Entrances move 2–3 properties together** — opacity, translate and a slight scale. `enter` does this.
3. **Stagger** — elements enter 3–6 frames apart (`STAGGER` = 4), in reading order. Never all at once.
4. **Exits exist and are faster** — about 8 frames (`exit`), before the scene cut. Otherwise the whole scene transitions out.
5. **Photos always move** — `<PhotoFrame zoomFrames={sceneFrames}>` (1 → 1.08). Footage uses `OffthreadVideo`.
6. **Nothing freezes** — an element held longer than 1 s gets `breathe` (a 2–4 px sine drift), or the photo keeps drifting under it.
7. **Timing comes from `fps`** (seconds × fps), with no magic frame numbers. Scenes last 2–4 s; text stays readable for ≥ 1.5 s after it settles.
8. **Text reveals** — label bars `wipe` in from the left (UKÜ reels style). Headlines `enter`. Numbers may count up (`interpolate` + `Math.round`, `ease.out`, ≤ 1 s).
9. **Rhythm** — vary entrances across scenes (wipe, rise, scale) but keep one signature move for the whole video.
10. **The brand look stays flat** — no film grain, vignette, color grade, glitch, lens flare or 3D unless the user asks.
11. **Verify motion, not just layout** — besides the mid-scene storyboard, render one frame during an entrance and one during an exit to catch overlaps and clipping.
12. **Music** — use only an audio file the user provides. If the user gives a BPM, cut scenes on beats (60 / BPM × fps frames per beat).
