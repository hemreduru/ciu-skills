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
- Mapping for this skill: deep panel → `wine`, `ink` or the `panels.*` token (the sampled values above) that matches the photo; highlight bars and stat boxes → `orange`; kicker bars and caption bands → `wine`/`red`. This follows the observed roles while keeping the brand.md rule of no ad-hoc hex values.

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


## Layout patterns and logo placement per type
Layout patterns (with logo position and size for each format) live in a per-type file. Read the one that matches the request: `style-etkinlik.md` (events, conferences), `style-duyuru.md` (announcements, rankings, data tables), `style-kampanya.md` (campaigns, scholarship carousels), `style-reels.md` (reels, video), `style-haber.md` (news covers), `style-diger.md` (greetings, collages, corporate template, anything else).

## Logo placement
- The emblem with the three-line logotype stacked to its right is the default on social designs (`official-ciu-<tone>-3lines-<tr|en>` in logos.json). The language matches the design: TR lockup on Turkish posts (`x-01`, `web-07`), EN lockup on English posts (`web-01`, `x-03`).
- White is the dominant tone. The full-color lockup appears only on light backgrounds (sky in `x-03-duyuru.jpg`, white in `web-10-diger.jpg`).
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
- **16–30 voice (captions and image text):** the first line is the hook and must work alone (it is all that shows before "devamı"): a fact or a question, ≤ ~12 words. Body 1–2 short sentences, ≈ 15–35 words (shorter than the 25–50 observed above: this audience reads less). Friendly but still a university: "sen", plain verbs, at most one exclamation mark per caption. Avoid brochure phrases (banned list: `paylasim.md`) and slang that ages ("kanka", "slay"). 1–2 emoji, never inside the image.
- **Copy on the image is short:** a headline of up to about 8 words, an optional subtitle, and facts only (date, time, venue, speakers, organizer). Sentences and CTAs stay in the caption.

## Hashtags & handles
- Hashtags go on the last line in CamelCase. Counts, the fixed brand tags and per-platform use live in `paylasim.md` (one place); observed brand tags: `#WeAreCIU` (7 of 12 Instagram posts), `#CIU` (5 of 12).
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
- X mirrors the Instagram designs with a shortened single-block caption (platform limits: `paylasim.md`).

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
