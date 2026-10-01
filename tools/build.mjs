#!/usr/bin/env node
import { execSync } from "node:child_process";
import { cpSync, existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchRules } from "../skills/ciu-design/scripts/remotion-rules.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const sh = (cmd, cwd = ROOT) => execSync(cmd, { cwd, stdio: "inherit" });
const dirs = (p) => (existsSync(p) ? readdirSync(p).filter((d) => statSync(join(p, d)).isDirectory()) : []);

rmSync(DIST, { recursive: true, force: true });
for (const skill of dirs(join(ROOT, "skills"))) {
  const src = join(ROOT, "skills", skill);
  const stage = join(DIST, "stage", skill);
  cpSync(src, stage, { recursive: true, filter: (p) => !/node_modules|vendor|sample\.mp4$/.test(p.slice(src.length)) });
  if (existsSync(join(src, "remotion"))) {
    fetchRules(join(stage, "vendor", "remotion"));
  }
  sh(`zip -rq ../${skill}.zip ${skill}`, join(DIST, "stage"));
  console.log(`dist/${skill}.zip ${(statSync(join(DIST, `${skill}.zip`)).size / 1048576).toFixed(1)} MB`);
}
rmSync(join(DIST, "stage"), { recursive: true, force: true });
