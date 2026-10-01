# Art Direction — how a UKÜ design gets its idea

brand.md and style.md are the floor: they keep a design correct. This file is how a design becomes memorable without breaking them. Every design gets a concept before any code, and the layout follows the concept — never the other way round.

## 1. Concept (before composing; show it to the user with the previews in 2–3 lines)
- **Idea** — one sentence drawn from the subject's own world: its objects, materials, vocabulary, numbers. Career fair → CV, name badge, handshake distance, "2026"; engineering → grid paper, measurements, blueprints; graduation → caps, tassels, the four-year arc; sustainability → leaf veins, the GreenMetric rank. Not "university" in general.
- **Hero** — the one element people will remember: a giant number, an extreme crop, a single word, a shape. Spend boldness in one place; everything else stays quiet and disciplined (*sıra dışı* spends it in more places → §7).
- **Skeleton** — pick one from §3 or §7 (or invent one) and name it.
- **Register** — *kurumsal* (events, academic, announcements, condolences), *canlı* (campaigns, reels, student life, greetings) or *sıra dışı* (§7; only when the user's style choice or SKILL.md §5's default pair calls for it). style.md describes the first two as UKÜ publishes them.
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
- **Contrast floor** — text vs. its ground ≥ 4.5:1 (white on `wine`/`ink`/`panels.*` passes; white on `orange` only for bold type ≥ 5 % of the short side). Hierarchy needs at least three clearly different sizes (hero / support / info) and two weights.
- **Color split** — roughly 60 % calm ground (photo or deep field), 30 % second tone (photo tint, white), ≤ 10 % `orange`/`red` accent.
- **Hook** — a still must be understood in 1 s: the hero is readable at thumbnail size (phone feed, ≈ 300 px wide). Video: the hero or a bold first line is on screen within the first second.
- **Rhythm** — repeat one element (bars, tiles, photo strips, hairlines) and break the repetition once, on purpose.

## 3. Skeletons — choose by content, not habit
| Skeleton | Best for | Build |
|---|---|---|
| Event band | kurumsal events (`web-01`…`05`) | photo top ≈ 45 %; deep panel below; title; info row date \| rule \| venue; hairline footer with organizer + logo |
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
- **Energy from structure, not decoration:** tilted label bars (−3°), an extreme crop, one oversized number, a hard color field. No gradients, glow, grain or sticker clutter (brand: flat). *Sıra dışı* turns these levers further, within the same flat rule → §7.
- **Kurumsal topics stay kurumsal:** condolences, academic announcements and formal statements ignore this section's loudness; only the "real photo, short, specific" part applies.
- **Video tempo:** scenes 1.5–3 s, first line within 1 s, cuts on the beat of the music when one is used, an end card of 3 s.
- **Not for this audience:** long paragraphs on the image, formal "sayın" register, stock handshakes, outdated memes, slang that dates in a month.

## 7. Sıra dışı — magazine cover / festival poster
The third register, for when the user wants the feed to stop scrolling: a student magazine cover, a festival poster, a zine. It goes further than anything UKÜ has published, so it has its own rules. Where this section and §1, §2 or §6 disagree, this section wins **for sıra dışı only**; kurumsal and canlı keep the rules above unchanged.
- **When:** only from the style choice or SKILL.md §5's default pair. Never chosen automatically for condolences, formal statements, rector messages or formal academic/administrative announcements; if the user asks for it there anyway, warn once (SOFT: "Bu konu için sıra dışı tarz alışılmış değil; istersen yine de yaparım") and then do it. Picking sıra dışı is a decision, not a contradiction of style.md: the freedoms below get no SOFT warning (off-palette colors and non-brand fonts still do).
- **Conflicts resolved:** §1 "boldness in one place" → spend it in 2–3 places, but one hero still reads first. §2 scale contrast ≥ 3× → **≥ 5×**; "break the grid once" → several breaks allowed; "≥ 30 % negative space" and "60/30/10 color split" → dropped, except the logo and the info row each keep a clean, calm block. §6 "energy from structure, not decoration" → still true: the energy comes from type, crop, layers and color blocks, never from effects. §6 "no sticker clutter" → badges, labels and ribbons are allowed as flat shapes that carry a word or a fact (≤ 3), never as decoration. §6 "not trend cosplay" → still true: magazine, poster and zine are print traditions; Y2K chrome, glitch and neon stay out.
- **Flat, read for this register:** every surface is either a solid `colors`/`panels` token or a real photo. Still no gradients, glow, soft or blurred shadows, transparency washes, blur, grain, noise, halftone or scanline filters, 3D. Allowed: hard overlaps, cut-paper layers, sharp-edged photo pieces, duotone, and a solid offset block (no blur) behind a photo piece. Text never gets a shadow or outline (slop.md 14).

**Freed in this register**
- Giant type that runs off the canvas: letters cut by an edge (the word stays readable — see the skeletons).
- Rotated, vertical (`rotate(-90deg)` along the long edge) and repeated, kinetic type.
- Collage: pieces cut from the photos and overlapping layers.
- Hard color blocks in any palette tokens (`colors.*`, `panels.*`), `orange` as a large field included, at most 4 colors per design; duotone (`<PhotoFrame duotone>`).
- Patterns derived from the emblem's or brand's own geometry (the C-I-U circle arcs, the torch curve, the arch, the label bar) — never random shapes (slop.md 6).
- Badge, label and ribbon shapes (flat, carrying text).
- More than one grid break; hero ≥ 5× the next element.

**Never loosened (every register)**
- Logo: no recolor, rescale out of proportion, frame, rotation or overlap; it sits upright on its own clean block or calm area with the right tone (`logoSurface`), never inside the collage (brand.md "Logo misuse"). It keeps its own block: it never shares a panel with the date, place or title, and no text sits over or beside it (clear space around the logo).
- Legibility and contrast: the copy that carries the message (hero, info row) ≥ 4.5:1 against what is actually behind it; where a word crosses a photo piece, that piece is duotoned or tinted dark enough, or the word sits on a solid block.
- The full date line `15.10.2026 14:00`, in one line, upright, inside the canvas — never cut, rotated or repeated as decoration. Turkish letters intact: an edge may cut a letter's body, never the İ dot, ğ breve or ş/ç cedilla.
- Palette tokens and brand fonts only (the existing SOFT warning for anything else); 9:16 safe areas (top 14 % / bottom 20 %) for every word that must be read — bleeding type may enter them, the info row and logo may not; no cropped faces (a piece may crop to a detail, never through a face); no blurry photos (short side ≥ 1080 px).
- Motion: all of motion.md, including rule 10 (flat look, no grain or glitch).

**Skeletons** (use with the §3 ones; two variants still use different skeletons)
| Skeleton | Best for | Build |
|---|---|---|
| Collage (kes-yapıştır) | campus life, festivals, club fairs, welcome week, recaps | ground: one token field; 3–5 sharp-cornered pieces, each a positioned `div` (`overflow: "hidden"`) wrapping `<PhotoFrame photo={{ ...photos[i], focusX, focusY }}>` — the same photo may give several crops; pieces 25–55 % of the width, rotated −6°…+6°, overlapping each other by 10–20 %; one piece duotone (`[colors.ink, colors.orange]`); one solid offset block behind the biggest piece. Layer order: ground → big piece → color block → small pieces → hero word (crosses ≥ 2 pieces) → label strip → logo on its own clean block |
| Kinetic type (tekrar) | reels, campaigns, deadlines, 1–2-word slogans | one word (≤ 12 characters, `trUpper` allowed) repeated in 5–9 rows filling the canvas; Poppins 900, 12–18 % of height, line-height 0.85, letter-spacing −0.04em; rows shifted by ½ word and cut by both edges; the whole block may sit at −8° or −90°. One row is the readable instance: full contrast (white on `wine`/`ink`, or on an `orange` bar); the echo rows alternate `colors.white` and a tone-on-tone token (e.g. `panels.maroon` on `wine`) — they are pattern, not copy. Info row on a solid block outside the rows. Video: rows drift in opposite directions at a constant speed (like Ken Burns, motion.md 1) |
| Bleed word | one big idea, openings, campaigns, greetings | one word at 35–60 % of canvas height, Poppins 900 or 900 italic, letter-spacing −0.05em, crossing one or two edges so 10–25 % of it is cut (at most half of the first or last letter); horizontal, or vertical along the long edge of a 9:16. A photo piece or cutout overlaps the lower 20–30 % of the word (word behind, photo in front); support line ≥ 5× smaller; info row and logo on a clean block in the opposite corner |
| Swiss grid (brutalist) | engineering, conferences for students, program promos, rankings, lists | white or `ink` ground; visible grid of 2 px rules (`ink` on white, `white` on `ink`) — 6 columns × 8 rows on 4:5, 4 × 10 on 9:16; 90° corners only (no `borderRadius`); a giant number or word flush to one column, bleeding off the opposite edge; small blocks (Source Sans 3 600, caps kickers ≤ 4 words via `trUpper`) packed into cells; exactly one `red` or `orange` cell; one photo cropped into one cell (duotone `[colors.ink, colors.white]`); density in one corner, emptiness in the rest |
| Zine (fanzin) | club calls, student-run events, workshops, open calls | photo pieces cut with a slightly irregular `clipPath: "polygon(…)"` (4–6 points off by 1–3 %); each word or line on its own strip (white, `ink` or `orange` rectangle rotated ±2–4°, staggered like taped paper); weights at the extremes (300 next to 900 italic); one high-contrast duotone photo `[colors.ink, colors.white]` for the photocopy feel — no grain or halftone; one ribbon or badge with the key fact |

**Boldness test (in SKILL.md §6, after slop.md):** set the sıra dışı preview next to what canlı would do with the same content. If they cannot be told apart at thumbnail size (≈ 300 px wide), it is not bold enough: push one more lever — bigger scale, a real bleed, more overlap, a harder color block, a rotation — and re-render. That is sharpening the concept, not adding decoration; the refine pass never removes the lever that makes it sıra dışı (remove filler instead).

**check.mjs:** it validates design.json only (logo ids and tone, date format, files, fonts); it never sees bleed, rotation or layering, so none of the freedoms above produce an error or `UYARI`. Any error or `UYARI` in sıra dışı is a real problem — fix it as usual. Set `logoSurface` for the clean block under the logo, not for the collage.
