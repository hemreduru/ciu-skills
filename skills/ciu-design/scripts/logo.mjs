#!/usr/bin/env node
// Usage: node logo.mjs --tone white|color --lang tr|en [--unit <arama>]
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const logos = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "remotion", "src", "logos.json"), "utf8"));
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i < 0 ? undefined : process.argv[i + 1];
};
const tone = arg("tone");
const lang = arg("lang");
const unit = arg("unit")?.toLocaleLowerCase("tr-TR");
if (!["white", "color"].includes(tone) || !["tr", "en"].includes(lang)) {
  console.log("Kullanım: node logo.mjs --tone white|color --lang tr|en [--unit <arama>]");
  process.exit(2);
}

const fold = (s) => s.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/\p{M}/gu, "").replace(/ı/g, "i");
const show = (l) => `${l.id}  (${l.kind}, ${l.tone}, ${l.lang}, ${l.aspect})`;
const mains = logos.filter((l) => l.kind === "main" && l.tone === tone);
const sameLang = mains.filter((l) => l.lang === lang);
console.log(`# Ana logo (${tone}, ${lang})${sameLang.length ? "" : " — bu dilde yok, ton öncelikli; diğer dil:"}`);
(sameLang.length ? sameLang : mains).forEach((l) => console.log(show(l)));

if (unit) {
  const hits = logos.filter((l) => l.kind === "unit" && fold(`${l.id} ${l.label}`).includes(fold(unit)));
  const best = hits.filter((l) => l.lang === lang);
  console.log(`# Birim logosu "${unit}" (yalnızca açık zemin, renkli)${hits.length ? "" : " — bulunamadı"}`);
  (best.length ? best : hits).slice(0, 8).forEach((l) => console.log(show(l)));
}
