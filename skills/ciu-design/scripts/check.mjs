#!/usr/bin/env node
// Usage: node check.mjs <design.json>   -> prints OK (exit 0) or Turkish error lines (exit 1)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "remotion", "src");
const file = process.argv[2];
if (!file) {
  console.log("Kullanım: node check.mjs <design.json>");
  process.exit(2);
}
let design;
try {
  design = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.log(`design.json okunamadı: ${e.message}`);
  process.exit(1);
}
const { checkDesign } = await import(join(SRC, "lib", "rules.ts"));
const errors = checkDesign(design, JSON.parse(readFileSync(join(SRC, "logos.json"), "utf8")));
console.log(errors.length ? errors.map((e) => `- ${e}`).join("\n") : "OK");
process.exit(errors.length ? 1 : 0);
