#!/usr/bin/env node
// Usage: node paylasim.mjs <paylasim.json> --out <paylasim.md> [--dir <dosyaların klasörü>]
// Lints captions/tags/alt text against brand/paylasim.md and writes paylasim.md. Lines starting with "-" are errors (exit 1, nothing written).
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fold } from "./text.mjs";

const TEMPLATE = join(dirname(fileURLToPath(import.meta.url)), "..", "brand", "paylasim.md");
export const loadRules = (text = readFileSync(TEMPLATE, "utf8")) => JSON.parse(/```json\n([\s\S]*?)\n```/.exec(text)[1]);

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const emojis = (s) => (s.match(/\p{Extended_Pictographic}/gu) ?? []).length;
const normTags = (tags) => [...new Map(tags.map((t) => `#${String(t).trim().replace(/^#+/, "")}`).map((t) => [fold(t), t])).values()];

export const tagSet = (rules, topic = []) => normTags([...rules.fixedTags, ...topic]);

/** Returns error lines for one section (Turkish). */
export const lintSection = (s, rules, exists = () => true) => {
  const e = [];
  const at = `"${s.title ?? "?"}"`;
  const plat = rules.platforms[s.platform];
  if (!plat) e.push(`${at}: platform ${Object.keys(rules.platforms).join(" / ")} olmalı, gelen: ${s.platform}.`);
  const tags = tagSet(rules, s.topicTags ?? []);
  const [lo, hi] = rules.tagsTotal;
  if (tags.length < lo || tags.length > hi) e.push(`${at}: etiket sayısı ${lo}–${hi} olmalı (sabit etiketlerle birlikte), şu an ${tags.length}.`);
  for (const lang of ["tr", "en"]) {
    const c = s.caption?.[lang]?.trim();
    const L = lang.toUpperCase();
    if (!c) { e.push(`${at}: ${L} caption boş.`); continue; }
    if (c.includes("#")) e.push(`${at}: ${L} caption içinde # olmamalı; etiketler topicTags'te.`);
    const hook = c.split("\n")[0];
    if (words(hook) > 12) e.push(`${at}: ${L} ilk satır (kanca) 12 kelimeyi geçiyor (${words(hook)}).`);
    if (words(c) > rules.maxWords) e.push(`${at}: ${L} caption ${rules.maxWords} kelimeyi geçiyor (${words(c)}); kısalt.`);
    if ((c.match(/!/g) ?? []).length > 1) e.push(`${at}: ${L} caption'da en fazla bir ünlem olmalı.`);
    if (emojis(c) > 2) e.push(`${at}: ${L} caption'da en fazla 2 emoji olmalı (${emojis(c)}).`);
    const hit = rules.banned.find((b) => fold(c).includes(fold(b)));
    if (hit) e.push(`${at}: ${L} caption'da yasaklı kalıp: "${hit}". Somut bilgi (tarih, yer, isim) yaz.`);
    if (plat) {
      const len = `${c}\n\n${tags.slice(0, plat.tags).join(" ")}`.length;
      if (len > plat.maxChars) e.push(`${at}: ${L} caption + etiketler ${s.platform} için ${plat.maxChars} karakteri geçiyor (${len}).`);
    }
  }
  if (!s.files?.length) e.push(`${at}: dosya listesi boş.`);
  for (const f of s.files ?? []) {
    if (!exists(f.file)) e.push(`${at}: dosya bulunamadı: ${f.file}`);
    for (const lang of ["tr", "en"]) {
      const a = f.alt?.[lang]?.trim();
      if (!a) e.push(`${at}: ${f.file} için ${lang.toUpperCase()} alt text boş.`);
      else if (a.length > rules.maxAltChars) e.push(`${at}: ${f.file} ${lang.toUpperCase()} alt text ${rules.maxAltChars} karakteri geçiyor (${a.length}).`);
      else if (a.includes("#")) e.push(`${at}: ${f.file} ${lang.toUpperCase()} alt text'te # olmamalı.`);
    }
  }
  return e;
};

const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;

export const renderPack = (data, rules, sizeOf, exists = () => false) => {
  const out = ["# Paylaşım paketi", ""];
  data.sections.forEach((s, i) => {
    const tags = tagSet(rules, s.topicTags ?? []);
    const plat = rules.platforms[s.platform];
    const fileRows = [];
    const listed = new Set((s.files ?? []).map((f) => f.file));
    for (const f of s.files ?? []) {
      fileRows.push(`| ${f.file} | ${mb(sizeOf(f.file))} | ${f.platform ?? s.platform} |`);
      const stem = f.file.replace(/\.[^.]+$/, "");
      for (const [ext, label] of [[".psd", "PSD (Photoshop)"], [".ai", "AI (Illustrator)"], [".pdf", "PDF (Illustrator)"]]) {
        const extra = `${stem}${ext}`;
        if (!listed.has(extra) && exists(extra)) {
          fileRows.push(`| ${extra} | ${mb(sizeOf(extra))} | ${label} |`);
          listed.add(extra);
        }
      }
    }
    out.push(
      `## ${i + 1}. ${s.title} — ${s.platform}`, "",
      "### Caption (TR)", "", s.caption.tr.trim(), "",
      "### Caption (EN)", "", s.caption.en.trim(), "",
      "### Etiketler", "", tags.join(" "), "", `Bu platformda (${s.platform}): ${tags.slice(0, plat.tags).join(" ")}`, "",
      "### Alt text", "", ...s.files.flatMap((f) => [`- \`${f.file}\``, `  - TR: ${f.alt.tr.trim()}`, `  - EN: ${f.alt.en.trim()}`]), "",
      "### Dosyalar", "", "| Dosya | Boyut | Platform |", "|---|---|---|", ...fileRows, "",
    );
  });
  out.push("## Önerilen paylaşım saati", "", data.time ?? rules.postTime, "");
  return out.join("\n");
};

const main = () => {
  const arg = (n) => {
    const i = process.argv.indexOf(`--${n}`);
    return i < 0 ? undefined : process.argv[i + 1];
  };
  const file = process.argv[2];
  const out = arg("out");
  if (!file || file.startsWith("--") || !out) (console.log("Kullanım: node paylasim.mjs <paylasim.json> --out <paylasim.md> [--dir <klasör>]"), process.exit(2));
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    console.log(`- paylasim.json okunamadı: ${e.message}`);
    process.exit(1);
  }
  const rules = loadRules();
  const dir = arg("dir") ?? dirname(out);
  const exists = (f) => existsSync(join(dir, f));
  const errors = data.sections?.length ? data.sections.flatMap((s) => lintSection(s, rules, exists)) : ["- sections boş: en az bir paylaşım gerekir."];
  if (errors.length) (console.log(errors.map((x) => (x.startsWith("- ") ? x : `- ${x}`)).join("\n")), process.exit(1));
  writeFileSync(out, renderPack(data, rules, (f) => statSync(join(dir, f)).size, exists));
  console.log(`OK\nPAYLASIM=${out}`);
};

if (import.meta.url === `file://${process.argv[1]}`) main();
