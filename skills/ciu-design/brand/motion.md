# Motion Rules (video)

Helpers live in `remotion/src/lib/motion.ts`: `enter`, `exit`, `wipe`, `breathe`, `ease`, `STAGGER`. `enter` and `exit` both set `transform`, so apply them to nested elements (exit on the wrapper, enter on each child).

1. **No linear moves** for UI elements: springs (`enter`) or bezier easing (`ease.out` in, `ease.in` out). Linear is only for the slow Ken Burns drift.
2. **Entrances move 2–3 properties together** — opacity, translate and a slight scale. `enter` does this.
3. **Stagger** — elements enter 3–6 frames apart (`STAGGER` = 4), in reading order. Never all at once.
4. **Exits exist and are faster** — about 8 frames (`exit`), before the scene cut. Otherwise the whole scene transitions out.
5. **Photos always move** — `<PhotoFrame zoomFrames={sceneFrames}>` (1 → 1.08). Footage uses `OffthreadVideo`.
6. **Nothing freezes** — an element held longer than 1 s gets `breathe` (a 2–4 px sine drift), or the photo keeps drifting under it.
7. **Timing comes from `fps`** (seconds × fps), with no magic frame numbers. Scenes last 1.5–3 s for the 16–30 audience (up to 4 s for calm topics); the first line appears within 1 s; text stays readable for ≥ 1.5 s after it settles.
8. **Text reveals** — label bars `wipe` in from the left (UKÜ reels style). Headlines `enter`. Numbers may count up (`interpolate` + `Math.round`, `ease.out`, ≤ 1 s).
9. **Rhythm** — vary entrances across scenes (wipe, rise, scale) but keep one signature move for the whole video.
10. **The brand look stays flat** — no film grain, vignette, color grade, glitch, lens flare or 3D unless the user asks.
11. **Verify motion, not just layout** — besides the mid-scene storyboard, render one frame during an entrance and one during an exit to catch overlaps and clipping.
12. **Music** — only from three sources: the bundled CC0 pack (`node <skill>/scripts/music.mjs` lists ids; design.json `"musicTrack": "<id>"`), the user's own file (`"music": "<file>"`), or none. Built-ins fade in 0.5 s, fade out the last 1.5 s, loop if shorter than the video and stop at its end; `musicVolume` (0–1, default 0.5, Branded 0.4). With speech or an unmuted clip the music ducks to 30 % (`musicDuck`; Motion ducks when a slide has `videoSound`). In custom videos add `<Music {...props} />` at the root. If the user gives a BPM, cut scenes on beats (60 / BPM × fps frames per beat). Pick the mood from the topic: sakin (graduation, condolences, academic), neşeli (campus life, welcome), enerjik (campaigns, quick cuts), sinematik (big announcements, rankings), hafif (everyday, short stories).
13. **Your own footage** — a Motion slide may use `video` (+ `trimStartSec`/`trimEndSec`, muted unless `videoSound`) instead of `photo`; the clip must cover the slide's `seconds`. In custom videos use `<VideoFrame file trimStartSec trimEndSec sound />`.
14. **Captions** — a Motion slide with `video` + `videoSound` takes `srt` (timed to the clip, 0 = clip start). One line (≤ 32 characters per cue), inside the safe area, the spoken word in `colors.orange`, nothing else moves; the slide title lifts above it. In custom videos use `<Captions srt offsetSec />`. Flow: `workflows/captions.md`.
