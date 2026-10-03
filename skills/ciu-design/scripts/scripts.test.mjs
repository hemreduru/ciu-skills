import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RULES_SHA, RULES_TARBALL } from "./remotion-rules.mjs";
import { designFromRecord, normDate, normTime, parseCsv, toRecords } from "./batch.mjs";
import { importCues, protectNames } from "./captions.mjs";
import { apply, formatMemory, parseMemory, personalData } from "./hafiza.mjs";
import { lintSection, loadRules, renderPack } from "./paylasim.mjs";
import { restoreDesign } from "./revise.mjs";
import { assemblePsd, exportAi, exportPdf, getModules, readPsdLayers } from "./export.mjs";

const run = (script, ...args) => spawnSync("node", [join(import.meta.dirname, script), ...args], { encoding: "utf8" });
const tmp = () => mkdtempSync(join(tmpdir(), "ciu-"));
const W = "official-ciu-white-1line-tr";
const good = { size: "post", lang: "tr", layout: "overlay", title: "Başlık", meta: "15.10.2026 14:00", logoId: W };

test("rules tarball is pinned to a commit, not a branch", () => {
  assert.match(RULES_SHA, /^[0-9a-f]{40}$/);
  assert.ok(RULES_TARBALL.endsWith(RULES_SHA));
});

test("check.mjs: OK on clean design, Turkish errors + exit 1 otherwise", () => {
  const d = tmp();
  writeFileSync(join(d, "ok.json"), JSON.stringify(good));
  const ok = run("check.mjs", join(d, "ok.json"));
  assert.equal(ok.status, 0);
  assert.equal(ok.stdout.trim(), "OK");

  writeFileSync(join(d, "bad.json"), JSON.stringify({ ...good, logoId: "yok", meta: "15.10.2026 | 14:00" }));
  const bad = run("check.mjs", join(d, "bad.json"));
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /Logo bulunamadı: yok/);
  assert.match(bad.stdout, /Tarih\/saat biçimi hatalı/);

  assert.equal(run("check.mjs", join(d, "nope.json")).status, 1);
});

test("logo.mjs: tone/lang filter and unit search", () => {
  const r = run("logo.mjs", "--tone", "white", "--lang", "en");
  assert.equal(r.status, 0);
  const ids = r.stdout.split("\n").filter((l) => l.startsWith("official-"));
  assert.ok(ids.length > 0 && ids.every((l) => l.includes("white") && l.includes(", en,")));
  assert.match(run("logo.mjs", "--tone", "color", "--lang", "tr", "--unit", "Bilgisayar").stdout, /clubs-club-bilgisayar/);
  assert.equal(run("logo.mjs", "--tone", "red", "--lang", "tr").status, 2);
});

test("restoreDesign: latest folder by default, named folder on request, restores custom + inputs", () => {
  const out = tmp(), work = tmp();
  for (const [name, code] of [["20261001-1000-a", "A"], ["20261002-1000-b", "B"]]) {
    mkdirSync(join(out, name, "input"), { recursive: true });
    writeFileSync(join(out, name, "stills.tsx"), code);
    writeFileSync(join(out, name, "input", `${code}.jpg`), "x");
  }
  writeFileSync(join(out, "dosya.txt"), "not a folder");

  const latest = restoreDesign(out, work);
  assert.deepEqual(latest.restored, ["stills.tsx"]);
  assert.equal(readFileSync(join(work, "src", "custom", "stills.tsx"), "utf8"), "B");
  assert.ok(existsSync(join(work, "public", "input", "B.jpg")));

  restoreDesign(out, work, "20261001-1000-a");
  assert.equal(readFileSync(join(work, "src", "custom", "stills.tsx"), "utf8"), "A");
  assert.throws(() => restoreDesign(out, work, "yok"), /bulunamadı/);
  assert.throws(() => restoreDesign(tmp(), work), /bulunamadı/);
});

test("music pack: index, files and CREDITS agree; CC0 only; under 8 MB", async () => {
  const { readdirSync, statSync } = await import("node:fs");
  const dir = join(import.meta.dirname, "..", "remotion", "public", "music");
  const index = JSON.parse(readFileSync(join(dir, "index.json"), "utf8"));
  const credits = readFileSync(join(dir, "CREDITS.md"), "utf8");
  const mp3 = readdirSync(dir).filter((f) => f.endsWith(".mp3")).sort();
  assert.deepEqual(index.map((t) => `${t.id}.mp3`).sort(), mp3);
  assert.ok(index.length >= 4 && index.length <= 6);
  for (const t of index) assert.ok(credits.includes(t.source) && credits.includes(`${t.id}.mp3`), t.id);
  assert.match(credits, /CC0 1\.0/);
  assert.ok(mp3.reduce((sum, f) => sum + statSync(join(dir, f)).size, 0) < 8 * 1048576);
  const listed = run("music.mjs").stdout;
  index.forEach((t) => assert.ok(listed.includes(t.id)));
});

test("check.mjs --work: missing user file and unknown musicTrack are reported; input.mjs rejects bad types", () => {
  const d = tmp();
  const work = join(import.meta.dirname, "..", "remotion");
  const design = { size: "reels", lang: "tr", slides: [{ photo: { src: "yok-yok.jpg" }, seconds: 2 }], bugLogoId: W, cardLogoId: "official-ciu-color-1line-bilingual-tr", outro: ["x"], musicTrack: "yok" };
  writeFileSync(join(d, "m.json"), JSON.stringify(design));
  const r = run("check.mjs", join(d, "m.json"), "--work", work);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /yok-yok\.jpg" bulunamadı/);
  assert.match(r.stdout, /musicTrack bulunamadı/);
  writeFileSync(join(d, "a.exe"), "x");
  const bad = run("input.mjs", join(d, "a.exe"), "--work", d);
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /desteklenmiyor/);
});

// ---- W2b: captions, batch, paylasim, hafiza -------------------------------

const LOGOS = JSON.parse(readFileSync(join(import.meta.dirname, "..", "remotion", "src", "logos.json"), "utf8"));

test("captions: SRT import normalizes BOM/CRLF/2-line/long cues; plain text needs a length; names are protected", () => {
  const srt = "\uFEFF1\r\n00:00:00,000 --> 00:00:04,000\r\nuku'ye hoş geldiniz, yeni dönem\r\nbugün başlıyor\r\n";
  const cues = importCues(srt);
  assert.ok(cues.length >= 2 && cues.every((c) => c.text.length <= 32 && !c.text.includes("\n")));
  assert.equal(cues.at(-1).endMs, 4000);
  assert.throws(() => importCues("Sadece metin"), /süresi/);
  assert.equal(importCues("Sadece metin", 5).at(-1).endMs, 5000);
  assert.equal(protectNames("ciu ve uku, bilgisayar mühendisliği bölümü", ["Bilgisayar Mühendisliği"]), "CIU ve UKÜ, Bilgisayar Mühendisliği bölümü");
});

test("captions.mjs import -> Motion design with slide captions passes check.mjs", () => {
  const d = tmp();
  writeFileSync(join(d, "in.srt"), "1\n00:00:00,500 --> 00:00:03,500\nBugün UKÜ'de oryantasyon günü ve hepsi başlıyor\n");
  const r = run("captions.mjs", "import", join(d, "in.srt"), "--out", join(d, "out.srt"));
  assert.equal(r.status, 0);
  assert.equal(r.stderr, "", "Node uyarısı kullanıcıya görünmez");
  const srt = readFileSync(join(d, "out.srt"), "utf8");
  const design = { size: "reels", lang: "tr", slides: [{ video: "k.mp4", seconds: 3, videoSound: true, srt }], bugLogoId: W, cardLogoId: "official-ciu-color-1line-bilingual-tr", outro: ["x"] };
  writeFileSync(join(d, "m.json"), JSON.stringify(design));
  assert.equal(run("check.mjs", join(d, "m.json")).stdout.trim(), "OK");
  assert.equal(run("captions.mjs", "plan", "--data", d).status, 0);
  assert.match(run("captions.mjs", "transcribe", join(d, "in.srt"), "--work", d, "--data", d, "--out", join(d, "x.srt")).stdout, /WHISPER=(needs-install|unavailable)|HATA/);
});

test("parseCsv: delimiters, quotes, escaped quotes, newline in field, BOM, CRLF, blank lines, trailing delimiter", () => {
  assert.deepEqual([...parseCsv("\uFEFFa;b;c\r\n1;\"x;y\";3\r\n\r\n")].map((r) => [...r]), [["a", "b", "c"], ["1", "x;y", "3"]]);
  assert.deepEqual([...parseCsv('a,b\n"he said ""hi""","two\nlines"\n')[1]], ['he said "hi"', "two\nlines"]);
  assert.deepEqual([...parseCsv("a\tb\n1\t2")[1]], ["1", "2"]);
  assert.deepEqual([...parseCsv("a,b,\n1,2,\n")[1]], ["1", "2", ""]);
  assert.deepEqual([...parseCsv("a,b\r1,2")[1]], ["1", "2"]);
  assert.equal(parseCsv("a,b\n\n\n1,2")[1].line, 4);
  assert.throws(() => parseCsv('a,b\n"açık,2'), /Tırnak kapanmıyor/);
});

test("batch: TR and EN column names, date/time normalization, design built, bad rows reported with reasons", () => {
  const { records, unknown, hasTitle } = toRecords(parseCsv("Başlık;ALT_BAŞLIK;Date;Time;Venue;Language;Renk\nA;b;2026-10-05;9.30;Salon;İngilizce;x"));
  assert.ok(hasTitle);
  assert.deepEqual(unknown, ["Renk"]);
  const { design, errors } = designFromRecord(records[0], LOGOS);
  assert.deepEqual(errors, []);
  assert.deepEqual([design.meta, design.lang, design.logoId, design.subtitle], ["05.10.2026 09:30 · Salon", "en", "official-ciu-white-3lines-en", "b"]);
  assert.equal(normDate("5/3/26"), "05.03.2026");
  assert.equal(normDate("31.02.x"), undefined);
  assert.equal(normTime("25:00"), undefined);
  const bad = designFromRecord({ line: 3, date: "yarın", time: "14:00", lang: "fr" }, LOGOS).errors;
  assert.equal(bad.length, 4);
  assert.match(bad.join("\n"), /Başlık boş[\s\S]*Dil anlaşılamadı[\s\S]*Tarih anlaşılamadı[\s\S]*Saat var ama tarih yok/);
});

test("batch.mjs: plan prints count + first-row preview; every bad row is reported together; nothing is skipped", () => {
  const d = tmp();
  const csv = join(d, "l.csv");
  const plan = () => run("batch.mjs", csv, "--work", d, "--out", join(d, "o"));
  writeFileSync(csv, "Başlık,Tarih,Yer\nİlk Etkinlik,15.10.2026,Salon\nİkinci,16.10.2026,Kampüs\n");
  const ok = plan();
  assert.equal(ok.status, 0);
  assert.match(ok.stdout, /^SATIR=2\nGORSEL=2\n/);
  assert.match(ok.stdout, /ONIZLEME \(satır 2\).*15\.10\.2026 · Salon/);
  assert.ok(!existsSync(join(d, "o")), "önizleme çıktı klasörüne hiçbir şey yazmaz");
  writeFileSync(csv, "Başlık,Tarih,Dil\nİyi,15.10.2026,tr\n,bozuk,tr\nÜç,16.10.2026,fr\nDört,x,tr\n");
  const bad = plan();
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /HATALI_SATIR=3/);
  for (const l of [3, 4, 5]) assert.match(bad.stdout, new RegExp(`- Satır ${l} `));
  assert.ok(!existsSync(join(d, "o")), "önizleme/hata modu çıktı klasörüne hiçbir şey yazmaz");
  writeFileSync(csv, "Ad,Gün\nx,y\n");
  assert.match(plan().stdout, /başlık sütunu yok/);
  writeFileSync(join(d, "e.xlsx"), "not a workbook");
  assert.match(run("batch.mjs", join(d, "e.xlsx"), "--work", d, "--out", d).stdout, /CSV UTF-8/);
});

test("paylasim: lint catches style/tag/alt/limit problems; a good section renders every part", () => {
  const rules = loadRules();
  assert.deepEqual(rules.fixedTags, ["#WeAreCIU", "#CIU"]);
  const ok = {
    title: "Oryantasyon", platform: "instagram", topicTags: ["Oryantasyon", "#YeniDönem", "KampüsHayatı"],
    caption: { tr: "Yeni dönem 11 Eylül'de başlıyor 🎓\nOryantasyon günlerinde kampüste görüşürüz.", en: "The new term starts on 11 September 🎓\nSee you on campus." },
    files: [{ file: "final.png", platform: "Instagram feed 1080×1350", alt: { tr: "Bordo panelde Oryantasyon Günleri yazısı.", en: "Text on a wine panel: Orientation Days." } }],
  };
  assert.deepEqual(lintSection(ok, rules), []);
  const md = renderPack({ sections: [ok] }, rules, () => 1048576);
  for (const part of ["Caption (TR)", "Caption (EN)", "#WeAreCIU #CIU #Oryantasyon", "TR: Bordo", "EN: Text", "| final.png | 1.0 MB |", "Önerilen paylaşım saati"]) assert.ok(md.includes(part), part);
  const bad = { ...ok, platform: "x", topicTags: ["A"], caption: { tr: "Sizlerle buluşturmaktan mutluluk duyarız! Çok! 🎓🎓🎓 #etiket", en: "" }, files: [{ file: "yok.png", alt: { tr: "", en: "x" } }] };
  const out = lintSection(bad, rules, (f) => f !== "yok.png").join("\n");
  for (const re of [/etiket sayısı/, /yasaklı kalıp/, /en fazla bir ünlem/, /en fazla 2 emoji/, /içinde #/, /EN caption boş/, /dosya bulunamadı/, /TR alt text boş/]) assert.match(out, re);
});

test("paylasim.mjs: writes paylasim.md next to the files, or lists errors and writes nothing", () => {
  const d = tmp();
  writeFileSync(join(d, "final.png"), "png");
  const section = { title: "T", platform: "linkedin", topicTags: ["A", "B", "C"], caption: { tr: "Kısa ve net bir cümle.", en: "A short, clear sentence." }, files: [{ file: "final.png", alt: { tr: "a", en: "b" } }] };
  writeFileSync(join(d, "p.json"), JSON.stringify({ sections: [section] }));
  const ok = run("paylasim.mjs", join(d, "p.json"), "--out", join(d, "paylasim.md"));
  assert.equal(ok.status, 0);
  assert.match(readFileSync(join(d, "paylasim.md"), "utf8"), /## 1\. T — linkedin/);
  writeFileSync(join(d, "p.json"), JSON.stringify({ sections: [{ ...section, files: [{ file: "yok.png", alt: { tr: "a", en: "b" } }] }] }));
  rmSync(join(d, "paylasim.md"));
  assert.equal(run("paylasim.mjs", join(d, "p.json"), "--out", join(d, "paylasim.md")).status, 1);
  assert.ok(!existsSync(join(d, "paylasim.md")));
});

test("hafiza: round-trips, series counter, forget, and no personal data", () => {
  let m = parseMemory("");
  m = apply(m, "set", ["birim", "Bilgisayar Mühendisliği"]).memory;
  m = apply(m, "add", ["begeni", "düz bordo panel"]).memory;
  m = apply(m, "add", ["begeni", "Düz Bordo Panel"]).memory;
  m = apply(m, "seri", ["Haftalık Etkinlik"], { layout: "overlay", vurgu: "orange", etiketler: "#HaftalıkEtkinlik", sonraki: true }).memory;
  const r = apply(m, "seri", ["haftalık etkinlik"], { sonraki: true });
  assert.equal(r.numara, "2");
  const back = parseMemory(formatMemory(r.memory));
  assert.deepEqual(back, r.memory);
  assert.equal(back.begeni.length, 1);
  for (const pii of ["0533 123 45 67", "ad@ciu.edu.tr", "12345678901", "TR33 0006 1005 1978 6457 8413 26"]) assert.ok(personalData(pii), pii);
  assert.ok(!personalData("15.10.2026 haftalık etkinlik 3. sayı"));
  assert.throws(() => apply(m, "add", ["begeni", "beni 0533 123 45 67 ara"]), /Kişisel veri/);
  assert.match(apply(m, "unut", ["haftalık etkinlik"]).say, /silindi/);
  assert.deepEqual(Object.keys(apply(m, "unut", ["Haftalık Etkinlik"]).memory.seriler), []);
  assert.equal(apply(parseMemory(formatMemory(r.memory)), "unut", ["bordo"]).memory.begeni.length, 0);
  const d = tmp();
  const f = join(d, "ciu-hafiza.md");
  assert.equal(run("hafiza.mjs", f, "seri", "Seri", "--sonraki").status, 0);
  assert.match(run("hafiza.mjs", f, "show").stdout, /son numara: 1/);
  assert.match(run("hafiza.mjs", f, "unut", "hepsi").stdout, /silindi/);
  assert.ok(!existsSync(f));
});

test("hafiza: hand-written lines and notes survive a rewrite; personal-data filter unchanged", () => {
  const md = "# UKÜ tasarım hafızası\n\nBirim: BM\nSık kullanılan: post\nElle eklenen serbest satır\n\n## Beğenilenler\n- düz panel\n\n## Notlar\nBayram haftası logo küçük olsun.\n- madde de korunur\n\n## Seriler\n\n### S\n- layout: band\n";
  const m = apply(parseMemory(md), "add", ["begeni", "yeni"]).memory;
  const out = formatMemory(m);
  for (const keep of ["Elle eklenen serbest satır", "## Notlar", "Bayram haftası logo küçük olsun.", "- madde de korunur"]) assert.ok(out.includes(keep), keep);
  assert.deepEqual(parseMemory(out), m);
  assert.throws(() => apply(m, "add", ["begeni", "ad@ciu.edu.tr"]), /Kişisel veri/);
});

test("export: assemblePsd merges synthetic PNG layers and readPsdLayers round-trips names and dimensions", () => {
  const { agPsd, pngjs } = getModules();
  const makePng = (w, h, r, g, b, a) => {
    const p = new pngjs.PNG({ width: w, height: h });
    for (let i = 0; i < w * h; i++) {
      p.data[i * 4] = r;
      p.data[i * 4 + 1] = g;
      p.data[i * 4 + 2] = b;
      p.data[i * 4 + 3] = a;
    }
    return p;
  };

  const l1 = makePng(4, 4, 134, 38, 51, 255);
  const l2 = makePng(4, 4, 255, 255, 255, 200);
  const buf = assemblePsd({
    width: 4,
    height: 4,
    layers: [
      { name: "arka-plan", imageData: { width: 4, height: 4, data: l1.data } },
      { name: "logo", imageData: { width: 4, height: 4, data: l2.data } },
    ],
    agPsd,
    pngjs,
  });

  assert.ok(buf.length > 0);
  const back = readPsdLayers(buf, agPsd);
  assert.equal(back.width, 4);
  assert.equal(back.height, 4);
  assert.deepEqual(back.layers.map((l) => l.name), ["arka-plan", "logo"]);
  assert.equal(back.layers[0].width, 4);
  assert.equal(back.layers[1].height, 4);
});

test("paylasim.mjs: includes psd and pdf files in table if they exist next to the png", () => {
  const d = tmp();
  writeFileSync(join(d, "final.png"), "png");
  writeFileSync(join(d, "final.psd"), "psd");
  writeFileSync(join(d, "final.ai"), "ai");
  writeFileSync(join(d, "final.pdf"), "pdf");
  const section = { title: "T", platform: "linkedin", topicTags: ["A", "B", "C"], caption: { tr: "Kısa ve net bir cümle.", en: "A short, clear sentence." }, files: [{ file: "final.png", alt: { tr: "a", en: "b" } }] };
  writeFileSync(join(d, "p.json"), JSON.stringify({ sections: [section] }));
  const ok = run("paylasim.mjs", join(d, "p.json"), "--out", join(d, "paylasim.md"));
  assert.equal(ok.status, 0);
  const md = readFileSync(join(d, "paylasim.md"), "utf8");
  assert.match(md, /\| final\.png \|/);
  assert.match(md, /\| final\.psd \|.*\| PSD \(Photoshop\) \|/);
  assert.match(md, /\| final\.ai \|.*\| AI \(Illustrator\) \|/);
  assert.match(md, /\| final\.pdf \|.*\| PDF \(Illustrator\) \|/);
});

test("export: assemblePsd handles single-layer fallback and CLI reports usage", () => {
  const { agPsd, pngjs } = getModules();
  const p = new pngjs.PNG({ width: 2, height: 2 });
  p.data.fill(100);
  const buf = assemblePsd({
    width: 2,
    height: 2,
    layers: [{ name: "Katman 1", imageData: { width: 2, height: 2, data: p.data } }],
    agPsd,
    pngjs,
  });
  const back = readPsdLayers(buf, agPsd);
  assert.deepEqual(back.layers.map((l) => l.name), ["Katman 1"]);

  const badRun = run("export.mjs");
  assert.equal(badRun.status, 2);
  assert.match(badRun.stdout, /Kullanım:/);
});


test("export: PDF text is live text - brand fonts embedded as real fonts, no Type3", { timeout: 300_000 }, async () => {
  const d = tmp();
  try {
    const design = {
      size: "post",
      lang: "tr",
      layout: "band",
      title: "Kıbrıs İlim Üniversitesi Mezuniyet Töreni",
      subtitle: "2026 Akademik Yılı Mezuniyet Coşkusu",
      meta: "15.10.2026 14:00 • Kampüs Amfi Tiyatro",
      logoId: "official-ciu-color-1line-bilingual-tr",
    };
    const { path } = await exportPdf({ design, id: "Post", out: d, name: "fonts.pdf" });
    const pdf = readFileSync(path).toString("latin1");
    const type3 = pdf.match(/\/Subtype\s*\/Type3/g) ?? [];
    const baseFonts = [...pdf.matchAll(/\/BaseFont\s*\/(?:[A-Z]{6}\+)?([^\s/>\[\]]+)/g)].map((m) => m[1]);
    assert.equal(type3.length, 0, `Type3 fonts found (not editable in Illustrator): ${type3.length}`);
    assert.ok(baseFonts.some((n) => n.startsWith("Poppins")), `no Poppins BaseFont in ${baseFonts}`);
    assert.ok(baseFonts.some((n) => n.startsWith("SourceSans3")), `no SourceSans3 BaseFont in ${baseFonts}`);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
});

test("export: exportAi writes a PDF-compatible final.ai through the vector PDF pipeline", async () => {
  const d = tmp();
  const bundleDir = join(d, "bundle");
  mkdirSync(bundleDir);
  const calls = [];
  const modules = {
    bundler: { bundle: async () => bundleDir },
    renderer: {
      selectComposition: async () => ({ width: 10, height: 20 }),
      renderStill: async (opts) => {
        calls.push(opts);
        writeFileSync(opts.output, "%PDF-1.7\nmock");
      },
    },
  };
  try {
    const res = await exportAi({ design: {}, out: d, modules });
    assert.equal(res.path, join(d, "final.ai"));
    assert.ok(readFileSync(res.path).toString("latin1").startsWith("%PDF-"));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].imageFormat, "pdf");
    assert.ok(!existsSync(join(d, "final.pdf")));

    const named = await exportAi({ design: {}, out: d, name: "ozel.ai", modules });
    assert.equal(named.path, join(d, "ozel.ai"));
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
});

test("export: CLI accepts psd/ai/both/pdf and rejects other modes", () => {
  const missing = join(tmp(), "yok.json");
  for (const mode of ["psd", "ai", "both", "pdf"]) {
    const r = run("export.mjs", mode, missing);
    assert.equal(r.status, 1, `${mode} should pass mode check (fails later on the missing design file)`);
    assert.match(r.stdout, /design\.json okunamadı/);
  }
  for (const mode of ["svg", "png", "ai2"]) {
    const r = run("export.mjs", mode, missing);
    assert.equal(r.status, 2, `${mode} should be rejected`);
    assert.match(r.stdout, /Kullanım: node export\.mjs <psd\|ai\|both>/);
    assert.doesNotMatch(r.stdout, /pdf|svg/i);
  }
});
