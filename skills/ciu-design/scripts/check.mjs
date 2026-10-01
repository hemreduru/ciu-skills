#!/usr/bin/env node
// Usage: node check.mjs <design.json> [--work <WORK>]  -> prints OK (exit 0) or Turkish error lines (exit 1)
// With --work, user files (photo, video, music, font) are looked up in <WORK>/public/input. UYARI lines never fail the check.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { probe } from "./media.mjs";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "remotion", "src");
const args = process.argv.slice(2);
const wi = args.indexOf("--work");
const work = wi >= 0 ? args.splice(wi, 2)[1] : undefined;
if (wi >= 0 && !work) (console.log("--work için klasör yolu ver."), process.exit(2));
const file = args[0];
if (!file) {
  console.log("Kullanım: node check.mjs <design.json> [--work <WORK>]");
  process.exit(2);
}
let design;
try {
  design = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.log(`design.json okunamadı: ${e.message}`);
  process.exit(1);
}
const { checkDesign, designWarnings } = await import(join(SRC, "lib", "rules.ts"));

let files;
if (work) {
  const input = (n) => join(work, "public", "input", n);
  const cache = new Map();
  const info = (n) => cache.get(n) ?? cache.set(n, probe(work, input(n))).get(n);
  let tracks = [];
  try {
    tracks = JSON.parse(readFileSync(join(work, "public", "music", "index.json"), "utf8")).map((t) => t.id);
  } catch {}
  files = {
    exists: (n) => existsSync(input(n)),
    seconds: (n) => (existsSync(input(n)) ? info(n).seconds : undefined),
    size: (n) => (existsSync(input(n)) && info(n).width ? { width: info(n).width, height: info(n).height } : undefined),
    tracks,
  };
}
const errors = checkDesign(design, JSON.parse(readFileSync(join(SRC, "logos.json"), "utf8")), files);
const warnings = designWarnings(design, files);
console.log([...(errors.length ? errors.map((e) => `- ${e}`) : ["OK"]), ...warnings].join("\n"));
process.exit(errors.length ? 1 : 0);
