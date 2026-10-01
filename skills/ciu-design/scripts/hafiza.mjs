#!/usr/bin/env node
// Usage: node hafiza.mjs <MEMORY> show
//        node hafiza.mjs <MEMORY> set birim|sik "<metin>"
//        node hafiza.mjs <MEMORY> add begeni|begenmeme "<metin>"
//        node hafiza.mjs <MEMORY> seri "<ad>" [--layout x] [--vurgu x] [--logo id] [--etiketler "#A #B"] [--numara N | --sonraki]
//        node hafiza.mjs <MEMORY> unut "<metin | seri adı>" | hepsi
// ciu-hafiza.md: the user's unit, usual formats, likes/dislikes and design series. Never stores personal data or images.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fold } from "./text.mjs";

const SERIES_KEYS = { layout: "layout", vurgu: "vurgu", logo: "logo", etiketler: "etiketler", numara: "son numara" };
const PERSONAL = [/[^\s@]+@[^\s@]+\.[^\s@]+/, /\+?\d[\d\s()-]{8,}\d/, /\bTR\d{2}[\s\d]{10,}/i];

export const personalData = (text) => PERSONAL.some((re) => re.test(text));

export const parseMemory = (md) => {
  const m = { birim: "", sik: "", begeni: [], begenmeme: [], seriler: {} };
  let section = "", serie;
  for (const line of md.split(/\r?\n/)) {
    const h = /^(#{2,3})\s+(.*)$/.exec(line);
    if (h) {
      if (h[1] === "###") (section = "seriler", (serie = m.seriler[h[2].trim()] = {}));
      else (section = fold(h[2]), (serie = undefined));
      continue;
    }
    const item = /^-\s+(.*)$/.exec(line);
    const kv = /^-?\s*([^:]+):\s*(.*)$/.exec(line);
    if (section === "seriler" && serie && item && kv) serie[Object.keys(SERIES_KEYS).find((k) => SERIES_KEYS[k] === fold(kv[1]).trim()) ?? fold(kv[1])] = kv[2].trim();
    else if (!section && kv && fold(kv[1]) === "birim") m.birim = kv[2].trim();
    else if (!section && kv && fold(kv[1]).startsWith("sik")) m.sik = kv[2].trim();
    else if (item && section.startsWith("begenilen")) m.begeni.push(item[1].trim());
    else if (item && section.startsWith("begenilmeyen")) m.begenmeme.push(item[1].trim());
  }
  return m;
};

export const formatMemory = (m) =>
  [
    "# UKÜ tasarım hafızası", "",
    `Birim: ${m.birim}`, `Sık kullanılan: ${m.sik}`, "",
    "## Beğenilenler", ...m.begeni.map((x) => `- ${x}`), "",
    "## Beğenilmeyenler", ...m.begenmeme.map((x) => `- ${x}`), "",
    "## Seriler", "",
    ...Object.entries(m.seriler).flatMap(([ad, s]) => [`### ${ad}`, ...Object.keys(SERIES_KEYS).filter((k) => s[k] !== undefined && s[k] !== "").map((k) => `- ${SERIES_KEYS[k]}: ${s[k]}`), ""]),
  ].join("\n");

const findSeries = (m, ad) => Object.keys(m.seriler).find((k) => fold(k) === fold(ad));

/** Applies one command; returns { memory, say } or throws a Turkish Error. */
export const apply = (m, cmd, args, flags = {}) => {
  const value = args.join(" ").trim();
  if (cmd !== "unut" && cmd !== "show" && personalData(value + " " + Object.values(flags).join(" "))) throw new Error("Kişisel veri (telefon, e-posta, kimlik no, IBAN) hafızaya yazılmaz.");
  if (cmd === "set") {
    const key = { birim: "birim", sik: "sik" }[args[0]];
    if (!key) throw new Error("set için birim ya da sik yaz.");
    m[key] = args.slice(1).join(" ").trim();
    return { memory: m, say: `${key === "birim" ? "Birim" : "Sık kullanılan"}: ${m[key]}` };
  }
  if (cmd === "add") {
    const key = { begeni: "begeni", begenmeme: "begenmeme" }[args[0]];
    const text = args.slice(1).join(" ").trim();
    if (!key || !text) throw new Error("add için begeni ya da begenmeme ve bir metin yaz.");
    if (!m[key].some((x) => fold(x) === fold(text))) m[key].push(text);
    return { memory: m, say: `${key === "begeni" ? "Beğenilen" : "Beğenilmeyen"}: ${text}` };
  }
  if (cmd === "seri") {
    const ad = args[0]?.trim();
    if (!ad) throw new Error("Seri adı gerekli.");
    const key = findSeries(m, ad) ?? ad;
    const s = (m.seriler[key] ??= {});
    for (const k of ["layout", "vurgu", "logo", "etiketler"]) if (flags[k] !== undefined) s[k] = flags[k];
    if (flags.numara !== undefined) s.numara = String(Number(flags.numara) || 0);
    if (flags.sonraki) s.numara = String((Number(s.numara) || 0) + 1);
    return { memory: m, say: `Seri "${key}": ${Object.keys(SERIES_KEYS).filter((k) => s[k]).map((k) => `${SERIES_KEYS[k]} ${s[k]}`).join(", ")}`, numara: s.numara };
  }
  if (cmd === "unut") {
    const q = fold(value);
    if (q.length < 3) throw new Error("Neyi unutayım? Metin, seri adı ya da hepsi yaz.");
    const ser = findSeries(m, value);
    if (ser) delete m.seriler[ser];
    const before = m.begeni.length + m.begenmeme.length;
    m.begeni = m.begeni.filter((x) => !fold(x).includes(q));
    m.begenmeme = m.begenmeme.filter((x) => !fold(x).includes(q));
    for (const k of ["birim", "sik"]) if (fold(m[k]).includes(q)) m[k] = "";
    return { memory: m, say: ser ? `Seri "${ser}" silindi.` : before === m.begeni.length + m.begenmeme.length ? "Eşleşen bir kayıt bulunamadı." : `"${value}" içeren kayıtlar silindi.` };
  }
  throw new Error("Komut: show | set | add | seri | unut");
};

const main = () => {
  const [file, cmd, ...rest] = process.argv.slice(2);
  if (!file || !cmd) (console.log("Kullanım: node hafiza.mjs <MEMORY> show|set|add|seri|unut ..."), process.exit(2));
  const flags = {};
  const args = [];
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--sonraki") flags.sonraki = true;
    else if (rest[i].startsWith("--")) flags[rest[i].slice(2)] = rest[++i];
    else args.push(rest[i]);
  }
  if (cmd === "unut" && fold(args.join(" ")) === "hepsi") {
    rmSync(file, { force: true });
    console.log("HAFIZA: Tüm hafıza silindi.");
    return;
  }
  const m = existsSync(file) ? parseMemory(readFileSync(file, "utf8")) : parseMemory("");
  if (cmd === "show") return console.log(existsSync(file) ? formatMemory(m) : "(hafıza boş)");
  try {
    const r = apply(m, cmd, args, flags);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, formatMemory(r.memory));
    console.log(`HAFIZA: ${r.say}${r.numara ? `\nNUMARA=${r.numara}` : ""}`);
  } catch (e) {
    console.log(`HATA: ${e.message}`);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) main();
