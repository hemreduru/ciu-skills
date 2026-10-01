# UKÜ / CIU Brand Rules

Source: Kurumsal Kimlik Kılavuzu — https://ciu.edu.tr/sites/default/files/2025-02/uku-kurumsal-kimlik-kilavuzu-TR.pdf

## Names
- TR: Uluslararası Kıbrıs Üniversitesi (UKÜ) · EN: Cyprus International University (CIU)
- Never abbreviate the name inside a logo. In body copy "UKÜ"/"CIU" is fine.

## Emblem & logos
- Emblem = letters C, I, U from a circle; evokes a torch ("aydınlık ve uygarlık"). Rounded forms.
- 8 logo layouts (logotype above/right of emblem, TR-first or EN-first, one-line or three-line, logos 7–8 with slogan).
- Logotype is Myriad Pro Regular, uppercase, black (CMYK K:100). Never re-typeset it — always use the logo file.
- Official alternates: full black (K:100), grayscale (K:45), white on dark.
- All usable files are listed in `remotion/src/logos.json` (id, tone, lang, aspect). Use only those ids.
- Unit logos (faculty, school, research center, club): faculty and research-center logos already contain the UKÜ emblem and university name → use alone as `logoId`; club logos are standalone marks without the emblem → place next to the main logo via `unitLogoId`. School/institute logos not yet seen — treat like faculty logos until verified.

## Colors
| Token | Pantone | CMYK | HEX (screen) |
|---|---|---|---|
| orange | Orange 021 C | 0 83 100 0 | #FE5000 |
| wine | 202 C | 29 94 67 33 | #862633 |
| red | 187 C | 22 100 89 15 | #A6192E |
| ink | — | K:100 | #231F20 |
| gray | — | K:45 | #9D9FA2 |
Use tokens from `remotion/src/brand.ts`, never ad-hoc hex values.

## Typography
- Brand family: Myriad Pro (Condensed, Regular, Italic) — Adobe-licensed, NOT bundled.
- Bundled substitute: Source Sans 3 (OFL, Adobe's open humanist sans, closest match).
- Special-use logo text ("Hosted by / Ev sahipliğiyle"): italic, K:55.

## Logo misuse — HARD rules (refuse, explain, offer an alternative)
1. Do not break the logo's integrity, move the logotype, or slant it.
2. Do not stretch or squash it in any direction.
3. Do not use a different font or shorten the university name.
4. Do not bold the logotype or resize individual words.
5. No outline/contour on the logo; never change logotype or emblem colors.
6. For black-and-white use, do not convert to grayscale — use the official black logo.
7. Do not add text onto the logo outside the defined special-use areas.

## Slogan logos (layouts 7–8)
- Slogan width must not exceed the logo width; slogan-to-logo distance = 2× the "e" height; centered.
