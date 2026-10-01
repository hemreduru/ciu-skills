import { test } from "node:test";
import assert from "node:assert/strict";
import { findLogo, logoHeight, resolveSize, safeArea, trUpper } from "./rules.ts";

test("resolveSize: aliases, WxH, even rounding, unknown", () => {
  assert.deepEqual(resolveSize("story"), { width: 1080, height: 1920 });
  assert.deepEqual(resolveSize("Post"), { width: 1080, height: 1350 });
  assert.deepEqual(resolveSize("1200x627"), { width: 1200, height: 628 });
  assert.deepEqual(resolveSize(" 1080X1080 "), { width: 1080, height: 1080 });
  assert.throws(() => resolveSize("büyük"), /Bilinmeyen boyut/);
});

test("trUpper: Turkish dotted/dotless i", () => {
  assert.equal(trUpper("istanbul ılık", "tr"), "İSTANBUL ILIK");
  assert.equal(trUpper("istanbul", "en"), "ISTANBUL");
});

test("logoHeight: minimum size wins, maxWidth shrinks", () => {
  assert.equal(logoHeight({ requested: 10, canvasShort: 1080, aspect: 3 }), 43);
  assert.equal(logoHeight({ requested: 200, canvasShort: 1080, aspect: 3 }), 200);
  assert.equal(logoHeight({ requested: 300, canvasShort: 1080, aspect: 4, maxWidth: 800 }), 200);
  assert.equal(logoHeight({ requested: 300, canvasShort: 1080, aspect: 40, maxWidth: 800 }), 43);
});

test("findLogo: unknown id throws", () => {
  const logo = { id: "a", file: "logos/a.png", kind: "main", tone: "color", lang: "bi", aspect: 2, label: "a" } as const;
  assert.equal(findLogo([logo], "a").file, "logos/a.png");
  assert.throws(() => findLogo([logo], "x"), /Logo bulunamadı: x/);
});

test("safeArea: tall formats reserve platform UI zones", () => {
  assert.deepEqual(safeArea(1080, 1920), { top: 269, bottom: 384, side: 65 });
  assert.deepEqual(safeArea(1080, 1350), { top: 65, bottom: 65, side: 65 });
  assert.deepEqual(safeArea(1920, 1080), { top: 65, bottom: 65, side: 65 });
});

import { checkDesign, dateProblems, srtProblems, toneFitsSurface } from "./rules.ts";

const L = (id: string, tone: "color" | "white", kind: "main" | "unit" = "main") =>
  ({ id, file: `${id}.png`, kind, tone, lang: "tr", aspect: 2, label: id }) as const;
const LOGOS = [L("w", "white"), L("c", "color"), L("u", "color", "unit")];
const post = { size: "post", lang: "tr", layout: "overlay", title: "Başlık", logoId: "w" };

test("toneFitsSurface: dark takes white only, light takes the rest", () => {
  assert.equal(toneFitsSurface("white", "dark"), true);
  assert.equal(toneFitsSurface("color", "dark"), false);
  assert.equal(toneFitsSurface("color", "light"), true);
  assert.equal(toneFitsSurface("white", "light"), false);
});

test("dateProblems: only 15.10.2026 14:00 form passes", () => {
  assert.deepEqual(dateProblems("15.10.2026 14:00 · Kampüs"), []);
  assert.deepEqual(dateProblems("15.10.2026"), []);
  assert.equal(dateProblems("15.10.2026 | 14:00").length, 1);
  assert.equal(dateProblems("15.10.2026\n14:00").length, 1);
  assert.equal(dateProblems("15.10.2026 14.00").length, 1);
  assert.equal(dateProblems("5.10.2026").length, 1);
  assert.equal(dateProblems("15/10/2026").length, 1);
  assert.deepEqual(dateProblems("Sürüm 2.5 çıktı"), []);
  assert.deepEqual(dateProblems("Saat 10.00-12.00 arası"), []);
});

test("srtProblems: one line, <= 32 chars per cue", () => {
  assert.deepEqual(srtProblems("1\n00:00:00,500 --> 00:00:02,000\nKısa altyazı\n"), []);
  assert.equal(srtProblems("1\n00:00:00,500 --> 00:00:02,000\n" + "a".repeat(33) + "\n").length, 1);
  assert.equal(srtProblems("1\n00:00:00,500 --> 00:00:02,000\nbir\niki\n").length, 1);
});

test("checkDesign: file names are not scanned for dates; srt checked on any design", () => {
  assert.deepEqual(checkDesign({ ...post, photo: { src: "IMG_15.10.26.jpg" } }, LOGOS), []);
  const custom = { size: "post", lang: "tr", logoId: "w", text: { title: "T" } };
  assert.match(checkDesign({ ...custom, srt: "1\n00:00:00,500 --> 00:00:02,000\n" + "a".repeat(40) }, LOGOS).join(), /32/);
});

test("srtProblems: block without timing line is ignored", () => {
  assert.deepEqual(srtProblems("7\n"), []);
});

test("checkDesign: clean post is OK", () => {
  assert.deepEqual(checkDesign(post, LOGOS), []);
});

test("checkDesign: unknown logo, bad size, missing field, wrong tone", () => {
  assert.match(checkDesign({ ...post, logoId: "x" }, LOGOS)[0], /x/);
  assert.match(checkDesign({ ...post, size: "büyük" }, LOGOS).join(), /boyut/i);
  assert.match(checkDesign({ ...post, title: "" }, LOGOS).join(), /title/);
  assert.match(checkDesign({ ...post, logoId: "c" }, LOGOS).join(), /koyu/);
  assert.match(checkDesign({ ...post, layout: "band", logoId: "w" }, LOGOS).join(), /açık/);
  assert.match(checkDesign({ ...post, unitLogoId: "u" }, LOGOS).join(), /koyu/);
  assert.deepEqual(checkDesign({ ...post, transparent: true, logoId: "c" }, LOGOS), []);
});

test("checkDesign: dates in any text, captions, card logo, lower thirds", () => {
  assert.match(checkDesign({ ...post, meta: "15.10.2026 | 14:00" }, LOGOS).join(), /15\.10\.2026/);
  const branded = { size: "reels", lang: "tr", video: "a.mp4", videoSeconds: 4, bugLogoId: "w", cardLogoId: "c", outro: [], lowerThirds: [{ name: "A", fromSec: 1, toSec: 3 }] };
  assert.deepEqual(checkDesign(branded, LOGOS), []);
  assert.match(checkDesign({ ...branded, cardLogoId: "w" }, LOGOS).join(), /açık/);
  assert.match(checkDesign({ ...branded, srt: "1\n00:00:00,500 --> 00:00:02,000\n" + "a".repeat(40) }, LOGOS).join(), /32/);
  assert.match(checkDesign({ ...branded, lowerThirds: [{ name: "A", fromSec: 3, toSec: 9 }] }, LOGOS).join(), /süre|saniye/i);
});

test("checkDesign: custom needs text; motion needs slides; unknown shape", () => {
  const custom = { size: "post", lang: "tr", logoId: "w", logoSurface: "dark", text: { title: "T", date: "15.10.2026 14:00" } };
  assert.deepEqual(checkDesign(custom, LOGOS), []);
  assert.match(checkDesign({ ...custom, logoId: "c" }, LOGOS).join(), /koyu/);
  assert.match(checkDesign({ ...custom, text: { date: "15.10.26" } }, LOGOS).join(), /15\.10\.26/);
  assert.match(checkDesign({ size: "reels", lang: "tr", slides: [], bugLogoId: "w", cardLogoId: "c", outro: [] }, LOGOS).join(), /slides/);
  assert.match(checkDesign({ size: "post" }, LOGOS).join(), /tür/i);
});
