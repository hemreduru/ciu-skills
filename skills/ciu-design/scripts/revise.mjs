#!/usr/bin/env node
// Usage: node revise.mjs <OUT> <WORK> [tasarım-klasör-adı]  (varsayılan: en son)
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const CUSTOM = ["stills.tsx", "videos.tsx"];

export const listDesigns = (out) =>
  existsSync(out) ? readdirSync(out).filter((d) => statSync(join(out, d)).isDirectory()).sort() : [];

export const restoreDesign = (out, work, name) => {
  const designs = listDesigns(out);
  const picked = name ?? designs.at(-1);
  if (!picked || !designs.includes(picked)) throw new Error(`Tasarım klasörü bulunamadı: ${name ?? "(hiç yok)"}`);
  const dir = join(out, picked);
  const restored = CUSTOM.filter((f) => existsSync(join(dir, f)));
  mkdirSync(join(work, "src", "custom"), { recursive: true });
  restored.forEach((f) => cpSync(join(dir, f), join(work, "src", "custom", f)));
  if (existsSync(join(dir, "input"))) cpSync(join(dir, "input"), join(work, "public", "input"), { recursive: true });
  return { dir, restored, designs };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [out, work, name] = process.argv.slice(2);
  try {
    const r = restoreDesign(out, work, name);
    console.log(`REVISE_DIR=${r.dir}\nRESTORED=${r.restored.join(",") || "yok (yerleşik şablon)"}`);
  } catch (e) {
    console.log(`ERROR=NO_DESIGN\nDETAIL=${e.message}`);
    process.exit(1);
  }
}
