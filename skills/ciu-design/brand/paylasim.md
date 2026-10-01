# Paylaşım paketi (`paylasim.md`) — şablon ve kurallar

Every delivery ships a `paylasim.md` next to the final files: captions, hashtags, alt text, file list, posting time. Do not write the Markdown by hand. Fill a `paylasim.json` (shape below) and run
`node <skill>/scripts/paylasim.mjs <D>/paylasim.json --out <D>/paylasim.md` — it checks the rules and writes the file. Fix every `-` line and run again. Batch runs (`batch.mjs --render`) create the `paylasim.json` skeleton for you.

Copy tone, length, emoji and hook rules are **style.md "Copy tone" and "16–30 voice"** (not repeated here); topic-tag ideas are in style.md "Hashtags & handles". This file only adds what a delivery needs: the fixed tags, per-platform limits, alt text and posting time. The block below is read by the script — edit numbers there, nowhere else.

```json
{
  "fixedTags": ["#WeAreCIU", "#CIU"],
  "tagsTotal": [5, 10],
  "platforms": {
    "instagram": { "tags": 10, "maxChars": 2200 },
    "linkedin": { "tags": 4, "maxChars": 3000 },
    "x": { "tags": 2, "maxChars": 280 },
    "tiktok": { "tags": 5, "maxChars": 2200 }
  },
  "maxWords": 45,
  "maxAltChars": 300,
  "banned": ["mutluluk duyarız", "bilgilerinize sunarız", "geleceğe adım at", "hayallerine ulaş", "fırsatları keşfet", "excellence in education", "we are thrilled", "we are excited to announce", "stay tuned", "kurumsal iletişim"],
  "postTime": "Genel öneri (hesabın kendi istatistiği önceliklidir; KKTC saati): hafta içi 12:00–13:00 ya da 19:00–21:00; LinkedIn salı–perşembe 09:00–11:00; story ve Reels akşam 19:00–22:00."
}
```

## Platform rules (one line each)
- **instagram** — hook line first (it is all that shows before "devamı"), 1–2 short sentences, the full tag set on the last line.
- **linkedin** — a bit more formal and factual (what, when, where, who it is for), no slang, fewer tags, first-person plural for UKÜ ("biz"/"we") is fine.
- **x** — one short block that fits the limit including tags, no emoji row.
- **tiktok** — the hook is the caption: one line, few tags (include the fixed tags), no link.

Fixed tags always come first; the rest (topic tags) are specific to the post (event name, unit, topic), CamelCase, no spaces. The whole set is 5–10; "Bu platformda" in the output shows the first N for that platform.

## Alt text
One per image, in **both** TR and EN: say what the image shows (scene, people, setting) and **every word printed on it** (title, date, place). 1–2 sentences, ≤ 300 characters, no "Görsel:" / "Image of" prefix, no hashtags. For a video: the key moments and "altyazılı" if captions are burned in.

## `paylasim.json` shape
```json
{ "sections": [ {
  "title": "Oryantasyon Günleri",
  "platform": "instagram",
  "caption": { "tr": "…", "en": "…" },
  "topicTags": ["#Oryantasyon", "#YeniDönem", "#KampüsHayatı"],
  "files": [ { "file": "final.png", "platform": "Instagram feed 1080×1350", "alt": { "tr": "…", "en": "…" } } ]
} ] }
```
One section per post (a batch has one per row). `platform` is `instagram`, `linkedin`, `x` or `tiktok`; `files[].platform` is free text for the file list. Optional top-level `"time"` replaces `postTime` for this delivery.
