# UKÜ Social Media Style (observed 01.10.2026, sources: Instagram/Facebook/X/YouTube/web)

LinkedIn is behind a login wall and was not observed. References live in `references/` (≤ 540 px copies). "Event template" means the house template on ciu.edu.tr event pages; "carousel" means the 1080×1350 Instagram/X campaign slides.

## Overall feel
- Most designs are built around a photo. Over 80% of observed designs are either a real campus/student photo or a stock photo with flat color laid over it. Pure flat-color designs are rare (`facebook-01-kampanya.jpg` is the only one).
- There are two registers. Events and announcements are calm and orderly (thin hairline grid, generous flat panels, white type: `web-01-etkinlik.jpg` … `web-07-etkinlik.jpg`). Campaigns and reels are loud and youthful (saturated colors, big numbers, stickers, brush lettering, tilted text bars: `x-01-kampanya.jpg`, `instagram-02-reels.jpg`, `youtube-01-reels.jpg`).
- Every event design shows an achievement badge: the THE World University Rankings badge ("TOP 601–800", newer: "TOP 651–700") sits next to the logo. The sustainability message is repeated through UN SDG goal tiles on event designs (`web-01`…`web-07`) and through GreenMetric posts (`instagram-01-duyuru.jpg`, `x-04-diger.jpg`).
- The audience is international. Event designs are mostly English. Turkish-market campaigns (YKS scholarships) are Turkish only. Corporate posts are bilingual.
- Sizes observed:
  - Event template: 2250×1675 (≈4:3 landscape).
  - Feed posts: 1080×1350 (4:5).
  - Reels/Shorts: 9:16.
  - News covers: 1110×391.
  - Presentation template: 16:9.

## Color usage
- The brand tokens are used as accents, not as backgrounds:
  - `orange` fills the Facebook/X cover (`facebook-01-kampanya.jpg`), the key-word bars and stat boxes in reels (`youtube-01-reels.jpg`, `youtube-03-reels.jpg`) and the underline swoosh on "WELCOME TO CIU" (`instagram-03-reels.jpg`).
  - `wine`/`red` appear as kicker bars and caption bands in reels (`youtube-01`, `youtube-02`, `youtube-04`), as the "CIU" wordmark and brush lettering (`instagram-02`, `instagram-03`), as the social-icon circles in the corporate template, and in the orange→wine vertical rule (`web-10-diger.jpg`).
- Event panels do NOT use brand colors. Each event gets a deep, muted color chosen to match its photo. Sampled values:
  - blues: navy `#0B274E`, royal `#12318E`, slate `#425D70`
  - greens: forest `#21482B`, sage `#548D60`, olive `#3B4500`
  - teal `#0B3F4A`; ochre `#AB884E`; terracotta `#BA410A`
  - maroon `#5E0E19`, the closest to `wine`
  - grays: `#444444`, `#636268`
  - Examples: `web-01` navy, `web-02` terracotta, `web-03` royal blue, `web-04` olive, `web-05` maroon.
- Scholarship carousels also use one non-brand color per program, with no relation to the brand palette: `#F8B75B` yellow-orange, `#9D5FC0` purple, `#56C97C` green, `#3C999E` teal, `#9D3939` brick, `#006D88` petrol (`x-01-kampanya.jpg`, `x-02-kampanya.jpg`).
- Photo treatments:
  - Flat solid panel under a photo (event template).
  - Full-bleed photo with a single-hue tint at about 75–85% opacity: red-brown in `web-06-etkinlik.jpg`, indigo in `web-07-etkinlik.jpg`, pink-red over video in `youtube-03-reels.jpg`.
  - A translucent rounded panel over a photo (`instagram-01-duyuru.jpg`).
- Text on color or on a photo is white almost everywhere. Dark `ink` text appears only on the white corporate template (`web-10-diger.jpg`). In tables, lime text (≈`#C5DE78`) alternates with white text (`instagram-01-duyuru.jpg`).
- No decorative gradients were observed (the only gradient is inside the third-party THE badge). Colors are flat; depth comes from photos.
- Mapping for this skill: deep panel → `wine` or `ink`; highlight bars and stat boxes → `orange`; kicker bars and caption bands → `wine`/`red`. This follows the observed roles while keeping the brand.md rule of no ad-hoc hex values.

## Typography
- **Case:** headlines are Title Case in English ("Blockchain Unlocked: Beyond the Basics", `web-01`) and sentence or Title case in Turkish ("Kültürlerarası Yemek Farkındalığı", `web-04`; "Hayaline Ek Tercihle Ulaş,", `x-01`). ALL CAPS is used only for short kickers of 4 words or fewer:
  - "CALL FOR PAPERS" and "23rd INTERNATIONAL" (`instagram-04`)
  - "CIU PREPARES YOU FOR A GLOBAL FUTURE" (`youtube-04`)
  - "WELCOME TO CIU" (`instagram-03`)
  - In total, about 5 of the ~60 observed designs have an all-caps headline.
- **Weight:** headlines are Bold (≈700). In two-line hooks the first line is SemiBold and the second Regular ("Hayaline Ek Tercihle Ulaş, / Burs Fırsatını Yakala!", `x-02`). Date/venue rows are Bold at a smaller size. Unit labels and speaker names are Regular.
- **Hierarchy in the event template** (`web-01`…`web-05`):
  - Title ≈ 5–6% of canvas height per line, line-height ≈ 1.1, max 3 lines.
  - Date/venue row ≈ 3%.
  - Footer organizer line ≈ 2.5%.
  - Title : info : footer ≈ 2 : 1.1 : 0.9.
- **Hierarchy in carousels:** the number is the largest element ("%80 Burs" ≈ 8–10% of height, Bold). The hook headline is ≈ 4% and the program-name pill ≈ 3% (`x-01`, `x-02`).
- **Typefaces observed:**
  - **Poppins** in campaign carousels and the GreenMetric post (`x-01`, `x-02`, `instagram-01`), and in the handle row of the official presentation template (Poppins Light). Confirmed by glyph match: single-storey "a", round "%", geometric "k/y".
  - **An unidentified tight geometric grotesk** in the event template (`web-01`…`web-07`). Its features: straight-tailed "y", spurred "G", single-storey "g", very tight spacing. The closest OFL matches are Plus Jakarta Sans ExtraBold and Instrument Sans Bold. It is probably a commercial font.
  - **A humanist sans** (Open Sans / Myriad-like) in reels captions and bars (`youtube-01`, `youtube-02`). Source Sans 3 is a close stand-in.
  - **Arial/Helvetica-like Bold** in the THE ranking post (`x-03-duyuru.jpg`).
  - **One-off display styles:** brush script (`instagram-02`), an italic serif "Merhaba" next to a bold sans "gelecek" (`facebook-01`), heavy italic caps (`youtube-04`).
  - Myriad Pro (the guide's brand face) is not visibly used for headlines.
- **Alignment:** left-aligned in the event band template. Centered in carousels, ranking posts, framed-box events and reels captions.
- **Dates:** `dd.mm.yyyy` with zero padding, and the time on its own line below the date (`web-01`: "18.05.2026 / 10.30"). The framed variant uses "08.10.2026 I 10:00" (`web-07`). The separator in the time is inconsistent (`.` or `:`). This skill uses the colon form `15.10.2026 14:00`.

## Layout patterns
- **Event band, landscape** (`web-01`…`web-05`):
  - The photo fills the top ≈ 43%. Its bottom-right corner rises in a smooth S-curve, and a narrow strip of panel color runs down the right edge.
  - Below the photo is a flat panel with the white title at ≈ 52–65% height and a 3% left margin.
  - The info row (≈ 72–80%): date over time, then a short white vertical rule, then the venue. A bilingual venue is stacked TR over EN (`web-04`). An optional speaker block goes to the right of the rule (`web-02`, `web-03`).
  - A UN SDG tile sits at the right end of the info row.
  - A white hairline crosses the full width at ≈ 87%. Below it is the footer: organizer (faculty/department, or office + club) on the left; logo + divider + THE badge on the right.
  - A white vertical hairline runs top to bottom at ≈ 90% width and is broken where it meets each row.
- **Event overlay with framed box** (`web-06`, `web-07`):
  - Full-bleed photo with a single-hue tint.
  - A thin white rectangle split into 3 stacked cells: "date I time" / title (Bold, centered, 2 lines) / venue.
  - Unit name in small type at the top-left.
  - Optional "Konuşmacılar:" column to the right of the box.
  - Logo + THE badge at the bottom-left; SDG tile at the bottom-right.
- **Scholarship/campaign carousel, 4:5** (`x-01`, `x-02`):
  - Solid color background with a low-opacity line-icon pattern tied to the program (gavels for law, beakers for science).
  - White logo at the top-center, then a 2-line hook.
  - An arch/circle photo cut-out of one student fills the middle 45%.
  - A white rounded pill with the program name in the background color, an optional second pill ("İlk 3 Tercihe"), then a huge white "%80 Burs" at the bottom.
  - One slide per program, same layout, different color.
- **Ranking / achievement announcement, 4:5** (`x-03-duyuru.jpg`):
  - Campus hero photo with sky in the top half.
  - Full-color logo and the ranking-body badge side by side at the top.
  - Centered white headline with the rank as the biggest line ("#651-700 / in the World University / Rankings / 2027").
- **Data-table announcement** (`instagram-01-duyuru.jpg`): white logo + partner logo at the top. A translucent green rounded panel holds a 2-line title row and four rows in 2 columns (label | "#55"). A small caps footer line reads "AMONG THE WORLD'S TOP SUSTAINABLE UNIVERSITIES".
- **Campus mood collage** (`x-04-diger.jpg`): a 2×2 photo grid with a centered Pantone-style swatch card ("Sürdürülebilir Kampüs / Yeşil") and the white logo at the bottom-center.
- **Reels covers:**
  - Brush-script title, torn-paper collage and stickers (camera, guitar, ball) over a student photo (`instagram-02-reels.jpg`).
  - Or one big centered wordmark over a sunny campus photo (`instagram-03-reels.jpg`).
- **Reels in-video text:**
  - Stacked label bars: each line sits on its own solid bar (wine for the lead-in, orange for the key word), rotated ≈ −3° and staggered horizontally (`youtube-01`).
  - Full-width wine caption band holding a 2-line question in the lower third (`youtube-02`).
  - A big stat in a rotated orange box (`youtube-03`).
  - Heavy italic caps on bars at the bottom-left (`youtube-04`).
  - Plain white burned-in subtitles, centered at ≈ 70% height (`youtube-05`).
- **Conference co-branding** (`instagram-04-etkinlik.jpg`): the event's own identity leads (dark, neon green). The CIU logo is one of several partner logos in a top row, separated by thin dividers.
- **Corporate 16:9 template** (`web-10-diger.jpg`, `web-11-diger.jpg`):
  - White version: orange→wine vertical rule at the left edge, full-color bilingual logo at the top-left, social-handle row at the top-right, THE badge at the bottom-right.
  - Dark version: a darkened campus photo with the same elements in white.
- **News covers** (`web-08-haber.jpg`, `web-09-haber.jpg`): photo only, 1110×391, with no text or logo overlay. The UKÜ name appears only physically in the scene (banners, backdrops) or as a partner stamp.

## Logo placement
- The emblem with the three-line logotype stacked to its right is the default on social designs (same layout as `site-ciu-logo1-*`, aspect ≈ 2.2). The language matches the design: TR lockup on Turkish posts (`x-01`, `web-07`), EN lockup on English posts (`web-01`, `x-03`).
- White is the dominant tone. The full-color lockup appears only on light backgrounds (sky in `x-03-duyuru.jpg`, white in `web-10-diger.jpg`).
- Positions and sizes by format:

| Format | Position | Logo width |
|---|---|---|
| Event band | footer, right zone, just left of the vertical hairline, followed by divider + THE badge (`web-01`…`web-05`) | ≈ 10% of canvas (with THE badge ≈ 20%) |
| Event framed | bottom-left (`web-06`, `web-07`) | same |
| Carousel | top-center, ≈ 4% from the top edge (`x-01`, `x-02`) | ≈ 30% |
| Ranking | top, paired with the partner badge (`x-03`) | ≈ 28% |
| GreenMetric | top-left, partner logo top-right (`instagram-01`) | ≈ 30% |
| Collage | bottom-center (`x-04`) | ≈ 22% |
| Presentation | top-left; bilingual one-line EN-over-TR full-color lockup with a hairline between the lines (`web-10`) | ≈ 25% |
| Cover | right third (`facebook-01`) | — |

- Reels covers and most Shorts carry no UKÜ logo in the frame (`instagram-02`, `instagram-03`, `youtube-01`…`youtube-05`). Branding comes from the colors, the "CIU" wordmark or on-campus scenes.
- The logo always sits on a calm area: flat panel, tint, sky or white. It is never placed over a busy part of a photo, never outlined, and never recolored to the panel color.
- In co-branded designs the CIU logo is the same height as the partner logos and separated by a thin vertical divider (`web-01` with THE, `instagram-04` with UNC Charlotte/IEEE).

## Copy tone
- **TR:**
  - Addresses the reader as "sen", is energetic and opportunity-driven, and opens with an exclamatory hook ("Hayaline ek tercihle ulaş, burs fırsatını yakala!", "Tercih listende yer aç, fırsatı kaçırma!", "Kulüplerimizle tanış! ✨").
  - Body is 1–2 sentences (≈ 25–50 words) and uses the full name "Uluslararası Kıbrıs Üniversitesi'nde" once, then "UKÜ".
  - Ends with an imperative CTA ("tercihini yap!", "yeni başlangıcını UKÜ'de yap!").
  - Engagement posts end with a question ("Peki sen hangi kulüptesin…? 👀👇").
- **EN:**
  - Proud and inclusive ("Proud to stand among the world's leading universities! 🌍🎓", "Your campus life, your community! 💫"). Uses "CIU" / "Cyprus International University" and "we/our".
  - About the same length as the TR text. Academic posts are more formal and factual (dates, venue, deadline, URL: the HONET caption).
- **Bilingual posts** use two full blocks separated by a blank line, not interleaved. Rankings, the first day and clubs-in-3-words put EN first; sustainable campus and meet-our-clubs put TR first. YKS scholarship posts are TR only; conference posts are EN only.
- **Emoji:**
  - Captions use 1–2 emoji at the end of the hook and of the closing line (🌍🎓 ✨ 🌱💚 🙌 👀👇 📚 ❤️ 💫).
  - Flag or emoji bullets in lists (GreenMetric: 🌍 🇪🇺 🇹🇷 🇨🇾); 📢/📅 prefixes for announcements.
  - Scholarship posts mostly use no emoji.
  - The designs themselves never contain emoji.
- No sign-off, signature or "UKÜ Kurumsal İletişim" line; the caption ends with the hashtag line.
- **Copy on the image is short:** a headline of up to about 8 words, an optional subtitle, and facts only (date, time, venue, speakers, organizer). Sentences and CTAs stay in the caption.

## Hashtags & handles
- Hashtags go on the last line, 1–6 per post, in CamelCase, and always start with a brand tag:
  - `#WeAreCIU` (7 of 12 Instagram posts)
  - `#CIU` (5 of 12)
- Recurring topic tags:
  - campus life: `#CampusLife` (3), `#StudentClubs` (2), `#StudentLife`
  - welcome/new semester: `#WelcomeToCIU`, `#FirstDay`, `#NewSemester`
  - admissions: `#TercihDönemi #YKS #YKSEk` (every scholarship post)
  - rankings: `#THEWorldUniversityRankings #HigherEducation`
  - sustainability: `#UIGreenMetric #Sustainability #SustainableCampus`
  - conference: `#HONET2026 #IEEE`
- No Turkish-language brand hashtag is used (no `#UKÜ`).
- Handles, as written on the official template's handle row (`web-10-diger.jpg`):
  - Instagram `@ciu.official`
  - Facebook `@ciuofficial`
  - X `@ciuofficial` (account `@CIUOfficial`)
  - web `www.ciu.edu.tr`, written with "www."
- Feed and reels designs carry no handle or URL. URLs go in the caption (`honet-ict.org`; `aday.ciu.edu.tr` / `prospective.ciu.edu.tr` in the pinned X post). Event designs may use a QR code with a "For registration:" label at the top-right of the panel instead of a URL.
- X mirrors the Instagram designs with a shortened single-block caption and usually no hashtags.

## Do / Don't
- **Do:**
  - Put headline text on a flat panel, a tint, a box or a bar.
  - Keep event designs to one title, one info row (date/time | venue) and one footer naming the organizer unit (`web-01`…`web-07`).
  - Use `dd.mm.yyyy`, with the time on its own line or after an "I" separator.
  - Pair the logo with achievement badges using a thin divider, and keep partner logos the same visual height.
  - In reels, put one idea per bar and highlight the key word on an `orange` bar (`youtube-01`, `youtube-03`).
  - Use one strong number as the hero element in campaigns ("%100 ÖSYM Bursu", "#55", "70%").
- **Don't:**
  - Set whole headlines in ALL CAPS; caps are reserved for short kickers.
  - Lay text directly over a busy photo with no panel, tint or bar.
  - Use decorative gradients, drop shadows on static type, or outlined text. The only soft shadow observed is on video subtitles.
  - Put emoji, hashtags or long sentences inside the image.
  - Make the logo the hero, or place it centered over a photo's subject. It stays small and anchored to an edge or the footer, and is often left out of reels entirely.
  - Mix languages line by line inside one sentence. Bilingual content is stacked TR over EN on designs (`web-04`) and in separate blocks in captions.
  - Crowd the event panel with speaker lists. Long lists move into a separate column (`web-03`, `web-07`).
