#!/usr/bin/env node
// Usage: node batch.mjs <liste.csv|xlsx> --work <WORK> --out <D> [--in <IN>] [--chrome <path>] [--render]
// Without --render: parses, builds a Post design per row, validates with check.mjs and prints a plan (count, first-row preview, all errors).
// With --render: renders every row (Remotion) to <D>/NN-slug.png and writes <D>/paylasim.json to fill in for paylasim.mjs.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fold } from "./text.mjs";

const SCRIPTS = dirname(fileURLToPath(import.meta.url));

// ---- CSV ------------------------------------------------------------------

/** RFC-4180-ish: quoted fields with "" and newlines, `,` `;` or tab delimiter (auto), UTF-8 BOM, CRLF/CR. Blank lines dropped. */
export const parseCsv = (input) => {
  const text = input.replace(/^﻿/, "");
  const head = text.split(/\r?\n|\r/).find((l) => l.trim()) ?? "";
  let inQ = false;
  const counts = { ",": 0, ";": 0, "\t": 0 };
  for (const ch of head) ch === '"' ? (inQ = !inQ) : !inQ && ch in counts && counts[ch]++;
  const delim = Object.keys(counts).reduce((a, b) => (counts[b] > counts[a] ? b : a));

  const rows = [];
  let row = [], cell = "", quoted = false, line = 1, start = 1;
  const endCell = () => (row.push(cell.trim()), (cell = ""));
  const endRow = () => (endCell(), row.some(Boolean) && rows.push(Object.assign(row, { line: start })), (row = []));
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') text[i + 1] === '"' ? (cell += '"', i++) : (quoted = false);
      else cell += ch;
      if (ch === "\n") line++;
    } else if (ch === '"' && !cell.trim()) (quoted = true, (cell = ""));
    else if (ch === delim) endCell();
    else if (ch === "\n" || ch === "\r") (ch === "\r" && text[i + 1] === "\n" && i++, endRow(), line++, (start = line));
    else cell += ch;
  }
  if (quoted) throw new Error(`Tırnak kapanmıyor (satır ${line} civarı): bir alanın sonundaki " işaretini kontrol et.`);
  if (cell || row.length) endRow();
  return rows;
};

const COLUMNS = {
  title: ["baslik", "title", "ana baslik", "headline"],
  subtitle: ["alt baslik", "altbaslik", "subtitle", "aciklama", "description"],
  date: ["tarih", "date"],
  time: ["saat", "time"],
  place: ["yer", "mekan", "place", "venue", "location"],
  photo: ["foto", "fotograf", "photo", "image", "gorsel", "resim"],
  size: ["boyut", "size", "format"],
  lang: ["dil", "lang", "language"],
  layout: ["duzen", "layout"],
  accent: ["vurgu", "accent"],
};
const keyOf = (header) => Object.keys(COLUMNS).find((k) => COLUMNS[k].includes(fold(header).replace(/[_-]+/g, " ").trim()));

/** Table (first row = header) to records keyed by canonical column; `line` = the row's line in the file. */
export const toRecords = (table) => {
  const [header = [], ...body] = table;
  const keys = header.map(keyOf);
  const unknown = header.filter((h, i) => h && !keys[i]);
  const records = body.map((cells) => {
    const rec = { line: cells.line };
    keys.forEach((k, c) => k && rec[k] === undefined && cells[c] && (rec[k] = cells[c]));
    return rec;
  });
  return { records, unknown, hasTitle: keys.includes("title") };
};

// ---- Row -> design --------------------------------------------------------

const pad = (n) => String(n).padStart(2, "0");
const DATE = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})$|^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/;
export const normDate = (s) => {
  const m = DATE.exec(s.trim());
  if (!m) return undefined;
  const [d, mo, y] = m[4] ? [m[6], m[5], m[4]] : [m[1], m[2], m[3].length === 2 ? `20${m[3]}` : m[3]];
  return +mo >= 1 && +mo <= 12 && +d >= 1 && +d <= 31 ? `${pad(d)}.${pad(mo)}.${y}` : undefined;
};
export const normTime = (s) => {
  const m = /^(\d{1,2})[:.](\d{2})$/.exec(s.trim());
  return m && +m[1] < 24 && +m[2] < 60 ? `${pad(m[1])}:${m[2]}` : undefined;
};
const LANGS = { tr: "tr", turkce: "tr", turkish: "tr", en: "en", ingilizce: "en", english: "en" };
const LAYOUTS = { band: "band", bant: "band", overlay: "overlay", panel: "overlay" };
const ACCENTS = ["orange", "wine", "red"];

/** Builds a Post design from a record; returns { design, errors } (errors in Turkish). Photo is resolved by the caller. */
export const designFromRecord = (rec, logos) => {
  const errors = [];
  if (!rec.title) errors.push("Başlık boş.");
  const lang = rec.lang ? LANGS[fold(rec.lang)] : "tr";
  if (!lang) errors.push(`Dil anlaşılamadı: "${rec.lang}" (tr ya da en yaz).`);
  const layout = rec.layout ? LAYOUTS[fold(rec.layout)] : "overlay";
  if (!layout) errors.push(`Düzen anlaşılamadı: "${rec.layout}" (overlay ya da band yaz).`);
  if (rec.accent && !ACCENTS.includes(fold(rec.accent))) errors.push(`Vurgu rengi anlaşılamadı: "${rec.accent}" (${ACCENTS.join(", ")}).`);
  let date, time;
  if (rec.date && !(date = normDate(rec.date))) errors.push(`Tarih anlaşılamadı: "${rec.date}" (örnek: 15.10.2026).`);
  if (rec.time && !(time = normTime(rec.time))) errors.push(`Saat anlaşılamadı: "${rec.time}" (örnek: 14:00).`);
  if (time && !date) errors.push("Saat var ama tarih yok.");
  const logoId = `official-ciu-${layout === "band" ? "color" : "white"}-3lines-${lang}`;
  if (lang && layout && !logos.some((l) => l.id === logoId)) errors.push(`Logo bulunamadı: ${logoId}`);
  const meta = [[date, time].filter(Boolean).join(" "), rec.place].filter(Boolean).join(" · ");
  const design = {
    size: rec.size || "post", lang, layout, title: rec.title, ...(rec.subtitle && { subtitle: rec.subtitle }), ...(meta && { meta }), logoId,
    ...(rec.accent && { accent: fold(rec.accent) }),
  };
  return { design, errors };
};

// ---- xlsx -----------------------------------------------------------------

const XLSX_TO_CSV = `
import sys, csv, datetime
from openpyxl import load_workbook
ws = load_workbook(sys.argv[1], data_only=True).active
w = csv.writer(sys.stdout)
def f(v):
    if isinstance(v, datetime.datetime): return v.strftime("%d.%m.%Y" if (v.hour, v.minute) == (0, 0) else "%d.%m.%Y %H:%M")
    if isinstance(v, datetime.time): return v.strftime("%H:%M")
    return "" if v is None else str(v)
for r in ws.iter_rows(values_only=True): w.writerow([f(c) for c in r])
`;
export const readTable = (file) => {
  if (/\.xlsx$/i.test(file)) {
    const r = spawnSync("python3", ["-c", XLSX_TO_CSV, file], { encoding: "utf8", maxBuffer: 1 << 26 });
    if (r.status !== 0) throw new Error("Excel dosyası okunamadı (ortamda python3 + openpyxl yok ya da dosya bozuk). Excel'de Dosya → Farklı Kaydet → CSV UTF-8 ile kaydedip onu ver.");
    return parseCsv(r.stdout);
  }
  return parseCsv(readFileSync(file, "utf8"));
};

// ---- CLI ------------------------------------------------------------------

const slug = (s) => fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "gorsel";
const platformOf = (size) => ({ post: "Instagram feed", portrait: "Instagram feed", kare: "Instagram / Facebook", square: "Instagram / Facebook", story: "Instagram / TikTok story", reels: "Instagram / TikTok story", yatay: "YouTube / X", landscape: "YouTube / X", youtube: "YouTube", linkedin: "LinkedIn", og: "Web / X" })[fold(size)] ?? size;

const platformKey = (size) => ({ linkedin: "linkedin", yatay: "x", landscape: "x", og: "x", youtube: "x" })[fold(size)] ?? "instagram";

const main = () => {
  const arg = (n) => {
    const i = process.argv.indexOf(`--${n}`);
    return i < 0 ? undefined : process.argv[i + 1];
  };
  const file = process.argv[2];
  const [work, out] = [arg("work"), arg("out")];
  if (!file || file.startsWith("--") || !work || !out) (console.log("Kullanım: node batch.mjs <liste.csv|xlsx> --work <WORK> --out <klasör> [--in <IN>] [--chrome <yol>] [--render]"), process.exit(2));
  const fail = (m) => (console.log(`HATA: ${m}`), process.exit(1));

  let table;
  try {
    table = readTable(file);
  } catch (e) {
    fail(e.message);
  }
  const { records, unknown, hasTitle } = toRecords(table);
  if (!hasTitle) fail("CSV'de başlık sütunu yok. İlk satırda sütun adları olmalı: Başlık, Alt Başlık, Tarih, Saat, Yer, Foto, Boyut, Dil (ya da EN karşılıkları).");
  if (!records.length) fail("CSV'de veri satırı yok.");

  const logos = JSON.parse(readFileSync(join(SCRIPTS, "..", "remotion", "src", "logos.json"), "utf8"));
  const inDir = join(work, "public", "input");
  const photoCache = new Map();
  const bringPhoto = (name) => {
    if (photoCache.has(name)) return photoCache.get(name);
    let r;
    if (existsSync(join(inDir, name)) && !/^https?:/i.test(name)) r = { file: name, warn: [] };
    else {
      const src = /^https?:/i.test(name) ? name : [isAbsolute(name) && name, resolve(dirname(file), name), arg("in") && join(arg("in"), name)].find((p) => p && existsSync(p));
      if (!src) r = { error: `Fotoğraf bulunamadı: "${name}" (CSV'nin yanına ya da girdiler klasörüne koy).` };
      else {
        const p = spawnSync("node", [join(SCRIPTS, "input.mjs"), src, "--work", work], { encoding: "utf8" });
        const lines = p.stdout.split("\n");
        r = p.status === 0 ? { file: lines.find((l) => l.startsWith("FILE="))?.slice(5), warn: lines.filter((l) => l.startsWith("UYARI")) } : { error: `Fotoğraf alınamadı: "${name}" — ${lines.find((l) => l.startsWith("HATA"))?.slice(6) ?? "bilinmeyen hata"}` };
      }
    }
    photoCache.set(name, r);
    return r;
  };

  const dir = join(out, "tasarimlar");
  mkdirSync(dir, { recursive: true });
  const rows = records.map((rec, i) => {
    const base = `${pad(i + 1)}-${slug(rec.title ?? "")}`;
    const { design, errors } = designFromRecord(rec, logos);
    const warns = [];
    if (rec.photo) {
      const ph = bringPhoto(rec.photo);
      ph.error ? errors.push(ph.error) : ((design.photo = { src: ph.file }), warns.push(...ph.warn));
    }
    const designFile = join(dir, `${base}.json`);
    if (!errors.length) {
      writeFileSync(designFile, JSON.stringify(design, null, 2));
      const c = spawnSync("node", [join(SCRIPTS, "check.mjs"), designFile, "--work", work], { encoding: "utf8" });
      c.stdout.split("\n").forEach((l) => (l.startsWith("- ") ? errors.push(l.slice(2)) : l.startsWith("UYARI") && warns.push(l)));
    }
    return { rec, design, base, designFile, errors, warns };
  });

  const bad = rows.filter((r) => r.errors.length);
  const lines = [`SATIR=${rows.length}`, `GORSEL=${rows.length - bad.length}`];
  if (unknown.length) lines.push(`UYARI: Tanınmayan sütunlar yok sayıldı: ${unknown.join(", ")}`);
  rows.forEach((r) => r.warns.forEach((w) => lines.push(`${w} (satır ${r.rec.line})`)));
  if (bad.length) {
    lines.push(`HATALI_SATIR=${bad.length}`);
    bad.forEach((r) => r.errors.forEach((e) => lines.push(`- Satır ${r.rec.line} (${r.rec.title ?? "başlıksız"}): ${e}`)));
    console.log(lines.join("\n"));
    process.exit(1);
  }
  const first = rows[0];
  lines.push(`ONIZLEME (satır ${first.rec.line}): ${JSON.stringify(first.design)}`);
  if (!process.argv.includes("--render")) (console.log(lines.join("\n")), process.exit(0));

  const chrome = arg("chrome");
  const sections = [];
  const failed = [];
  for (const r of rows) {
    const png = join(out, `${r.base}.png`);
    const p = spawnSync("npx", ["remotion", "still", "src/index.ts", "Post", png, `--props=${r.designFile}`, ...(chrome ? [`--browser-executable=${chrome}`] : [])], { cwd: work, encoding: "utf8" });
    if (p.status !== 0 || !existsSync(png)) failed.push(`- Satır ${r.rec.line} (${r.rec.title}): render alınamadı: ${p.stderr.trim().split("\n").at(-1)}`);
    else sections.push({ title: r.rec.title, platform: platformKey(r.design.size), caption: { tr: "", en: "" }, topicTags: [], files: [{ file: basename(png), platform: platformOf(r.design.size), alt: { tr: "", en: "" } }] });
  }
  writeFileSync(join(out, "paylasim.json"), JSON.stringify({ sections }, null, 2));
  lines.push(`RENDER=${sections.length}`, `PAYLASIM_JSON=${join(out, "paylasim.json")}`, ...failed);
  console.log(lines.join("\n"));
  process.exit(failed.length ? 1 : 0);
};

if (import.meta.url === `file://${process.argv[1]}`) main();
