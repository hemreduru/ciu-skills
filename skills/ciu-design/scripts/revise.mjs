#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const CUSTOM = ["stills.tsx", "videos.tsx"];

const listDesigns = (out) =>
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
