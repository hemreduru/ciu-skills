# Art Direction — how a UKÜ design gets its idea

brand.md and style.md are the floor: they keep a design correct. This file is how a design becomes memorable without breaking them. Every design gets a concept before any code, and the layout follows the concept — never the other way round.

## 1. Concept (before composing; show it to the user with the previews in 2–3 lines)
- **Idea** — one sentence drawn from the subject's own world: its objects, materials, vocabulary, numbers. Career fair → CV, name badge, handshake distance, "2026"; engineering → grid paper, measurements, blueprints; graduation → caps, tassels, the four-year arc; sustainability → leaf veins, the GreenMetric rank. Not "university" in general.
- **Hero** — the one element people will remember: a giant number, an extreme crop, a single word, a shape. Spend boldness in one place; everything else stays quiet and disciplined.
- **Skeleton** — pick one from §3 (or invent one) and name it.
- **Register** — *calm* (events, academic, announcements, condolences) or *loud* (campaigns, reels, student life, greetings). style.md describes both.
- **Subtle reference** (optional) — a quiet nod insiders catch: campus building rhythm in a crop, the emblem's torch curve echoed by an arch, red–white for national days. Never literal clip-art.

## 2. Levers inside the brand
Colors and fonts are fixed, so distinctiveness comes from these:
- **Scale contrast** — the hero is ≥ 3× the next element. Giant numbers are 25–45 % of canvas height (Poppins 900, line-height 0.85, letter-spacing −0.04em). Timid 1.3× steps look templated.
- **Crop** — crop into the photo (hands, a face, a detail at 150–250 %) instead of showing the whole scene small. Steer with `focusX`/`focusY`.
- **Negative space** — keep ≥ 30 % of the canvas calm; the logo lives there.
- **One axis** — one strong alignment line (left edge, center, a column) that everything hangs on. White hairlines (2 px, 40–60 % opacity) make the grid visible, as in UKÜ event designs.
- **Photo treatment** — none · single-hue tint at 75–85 % (`panels.*` or `wine`) · duotone via `<PhotoFrame duotone={[shadow, highlight]}>` e.g. `[colors.wine, colors.orange]`, `[panels.navy, colors.white]` · cutout in an arch or circle · split.
- **Color field** — one deep field (`wine`, `ink`, or the `panels.*` token that matches the photo's mood) plus at most one accent (`orange`), used small: bars, numbers, rules.
- **Weight range** — Poppins 300/400/600/700/900 and 900 italic; Source Sans 3 200–900. Pair extremes (900 hero + 300/400 support), not 700 everywhere.
- **Grid breaking** — keep one strong grid, then break it once on purpose: one element bleeds off the canvas edge (3–8 % cut off), overlaps the photo seam, or sits off the shared axis. Break it for the hero only, never for the logo or the info row.
- **Contrast floor** — text vs. its ground ≥ 4.5:1 (white on `wine`/`ink`/`panels.*` passes; white on `orange` only for large bold type ≥ 5 % of height). Hierarchy needs at least three clearly different sizes (hero / support / info) and two weights.
- **Color split** — roughly 60 % calm ground (photo or deep field), 30 % second tone (photo tint, white), ≤ 10 % `orange`/`red` accent.
- **Hook** — a still must be understood in 1 s: the hero is readable at thumbnail size (phone feed, ≈ 300 px wide). Video: the hero or a bold first line is on screen within the first second.
- **Rhythm** — repeat one element (bars, tiles, photo strips, hairlines) and break the repetition once, on purpose.

## 3. Skeletons — choose by content, not habit
| Skeleton | Best for | Build |
|---|---|---|
| Event band | calm events (`web-01`…`05`) | photo top ≈ 45 %; deep panel below; title; info row date \| rule \| venue; hairline footer with organizer + logo |
| Framed box | talks, seminars (`web-06`, `07`) | full-bleed photo + tint; thin white 3-cell box: date I time / title / venue |
| Hero number | scholarships, rankings, stats, anniversaries (`x-01`…`03`) | the number is 25–45 % of height; one supporting line; photo small or cut out |
| Label bars | reels, campaigns (`youtube-01`) | each line on its own bar; `wine` lead-in, `orange` key word; stack rotated −3°, staggered horizontally |
| Type poster | announcements without a good photo, quotes, greetings | the words are the image: 2–5 words at 12–20 % of height, leading 0.95, one color field, no photo or a tiny one |
| Asymmetric split | speakers, profiles, programs | 60/40 or 70/30; photo cropped tight on one side, text column on the other; hairline at the seam |
| Extreme crop | campus life, features | one detail fills the canvas; short text on a small flat block in the calm corner |
| Arch cutout | program and department promos (`x-01`) | solid ground; photo in an arch (`borderTopLeftRadius`/`borderTopRightRadius` = half the width, `overflow: hidden`); pill label; optional line-icon pattern at 6–10 % opacity |
| Mosaic | recaps, "a week at CIU" (`x-04`) | 3–5 photos on a strict grid; one cell is a color swatch that carries the text |
| Duotone | greetings, national and international days, campaigns | full-bleed duotone photo + one big line |
| White corporate | formal statements, rector messages (`web-10`) | white ground, orange→wine rule on the left edge, `ink` text. Condolences: `ink`/`gray` only, no orange, no treatment |

Two variants must use **different skeletons** — never one layout in two colors.

## 4. Reference image mode
If the user shares a design they like ("bunun gibi", "şu tarzda", a Pinterest or Behance image), it is a reference, not material. Describe its structure in 2–3 lines (grid, scale ratios, alignment, color roles, type contrast, photo treatment), then rebuild that structure with UKÜ assets. Never copy its text, logos, illustrations or photos. On any conflict brand.md wins.

## 5. Building it
- Write stills in `$WORK/src/custom/stills.tsx`, videos in `$WORK/src/custom/videos.tsx`. Every export becomes a composition whose id is the export name (PascalCase, letters and digits only); export nothing else from these files.
- Props are `CustomProps` (`schema.ts`). Put all copy in `text` with keys you choose (`title`, `date`, `venue`, …) so revisions and EN versions only edit design.json.
- Required in every custom composition: `<Logo id>` with ids from logos.json; colors only from `colors`/`panels`; fonts via `fontCss`; margins from `safeArea`; `lang` on the root element.
- `Starter` and `StarterVideo` show the wiring — copy the imports, not the layout.
- Useful snippets:
  - Hairline: `<div style={{ position: "absolute", left: x, top: 0, bottom: 0, width: 2, backgroundColor: "rgba(255,255,255,0.5)" }} />`
  - Giant number: `{ fontFamily: fontCss.heading, fontWeight: 900, fontSize: 0.32 * height, lineHeight: 0.85, letterSpacing: "-0.04em" }`
  - Bar stack: wrapper `transform: "rotate(-3deg)"`; each line `display: "flex"` with an inner block carrying `backgroundColor` and horizontal padding.
  - Kicker caps in Turkish: `trUpper(text, lang)` from `lib/rules` (handles i → İ).
- No auto-fit: estimate the width (Poppins Bold ≈ 0.6 × font size per character), then trust the render, not the estimate.

## 6. Audience 16–30: how it should feel
Prospective and current students scroll fast and distrust brochures. Aim for *a student-run magazine with a university's discipline*, not a corporate leaflet and not trend cosplay.
- **Look like a person made it:** a real campus or student photo, cropped with intent, beats a perfect stock scene. Imperfect-but-real is fine; blurry is not (min short side 1080 px).
- **Big, short, specific:** 2–6 words at hero scale, a real number or a name; details in a small, quiet info row.
- **Energy from structure, not decoration:** tilted label bars (−3°), an extreme crop, one oversized number, a hard color field. No gradients, glow, grain or sticker clutter (brand: flat).
- **Calm topics stay calm:** condolences, academic announcements and formal statements ignore this section's loudness; only the "real photo, short, specific" part applies.
- **Video tempo:** scenes 1.5–3 s, first line within 1 s, cuts on the beat of the music when one is used, an end card of 3 s.
- **Not for this audience:** long paragraphs on the image, formal "sayın" register, stock handshakes, outdated memes, slang that dates in a month.
