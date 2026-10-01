#!/usr/bin/env node
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchRules } from "./remotion-rules.mjs";
import { restoreDesign } from "./revise.mjs";

const SKILL = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLAUDEAI = { in: "/mnt/user-data/uploads", out: "/mnt/user-data/outputs", data: "/tmp/ciu-design" };
const KNOWN_CHROMES = ["/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"];

const fail = (code, err) => {
  const detail = String(err?.stderr || err?.message || "").trim().split("\n").slice(-3).join(" | ");
  console.log(`ERROR=${code}\nDETAIL=${detail}`);
  process.exit(1);
};
const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: ["ignore", "pipe", "pipe"] }).toString();

// check.mjs runs rules.ts directly, which needs Node's built-in type stripping (22.18+)
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 18)) fail("NODE_TOO_OLD", { message: process.versions.node });

const env = existsSync("/mnt/user-data") ? "claudeai" : "local";
const data = env === "claudeai" ? CLAUDEAI.data : process.env.CLAUDE_PLUGIN_DATA || join(homedir(), ".cache", "ciu-design");
const inDir = env === "claudeai" ? CLAUDEAI.in : join(process.cwd(), "girdiler");
const outDir = env === "claudeai" ? CLAUDEAI.out : join(process.cwd(), "ciktilar");
const work = join(data, "remotion");
// claude.ai has no persistent folder: the memory file travels with the outputs and comes back as an upload.
const memory = join(env === "claudeai" ? outDir : data, "ciu-hafiza.md");
let lock;
try {
  [data, inDir, outDir].forEach((d) => mkdirSync(d, { recursive: true }));
  if (!existsSync(memory) && existsSync(join(inDir, "ciu-hafiza.md"))) cpSync(join(inDir, "ciu-hafiza.md"), memory);
  rmSync(join(work, "src"), { recursive: true, force: true });
  rmSync(join(work, "public"), { recursive: true, force: true });
  cpSync(join(SKILL, "remotion"), work, { recursive: true, filter: (src) => basename(src) !== "node_modules" });
  lock = readFileSync(join(work, "package-lock.json"), "utf8");
} catch (e) {
  fail("SETUP_FAILED", e);
}
let firstRun = false;
const stamp = join(work, "node_modules", ".ciu-lock");
if (!existsSync(stamp) || readFileSync(stamp, "utf8") !== lock) {
  try {
    sh("npm ci --omit=dev --no-audit --no-fund --loglevel=error", work);
    writeFileSync(stamp, lock);
    firstRun = true;
  } catch (e) {
    fail("NPM_INSTALL_FAILED", e);
  }
}

let chrome = process.env.CIU_CHROME || "";
try {
  sh("npx remotion browser ensure", work);
} catch (e) {
  chrome ||= KNOWN_CHROMES.find((p) => existsSync(p)) || "";
  if (!chrome) fail("BROWSER_DOWNLOAD_FAILED", e);
}

let rules = join(SKILL, "vendor", "remotion");
let rulesWarning = "";
if (!existsSync(rules)) {
  rules = join(data, "remotion-skills");
  if (!existsSync(join(rules, "remotion-best-practices"))) {
    try {
      fetchRules(rules);
    } catch {
      rulesWarning = "Remotion kuralları indirilemedi; yalnızca hazır kompozisyonları kullan.";
    }
  }
}

const revArg = process.argv.find((a) => a.startsWith("--revise"));
let revise = "";
if (revArg) {
  try {
    const r = restoreDesign(outDir, work, revArg.split("=")[1]);
    revise = `REVISE_DIR=${r.dir}\nREVISED=${r.restored.join(",") || "yok (yerleşik şablon)"}`;
  } catch (e) {
    revise = `REVISE_ERROR=${e.message}`;
  }
}

console.log([
  `ENV=${env}`, `IN=${inDir}`, `OUT=${outDir}`, `WORK=${work}`, `DATA=${data}`, `MEMORY=${memory}`, existsSync(memory) && "MEMORY_EXISTS=1", `REMOTION_RULES=${rules}`, `CHROME=${chrome}`,
  rulesWarning && `RULES_WARNING=${rulesWarning}`,
  firstRun && "FIRST_RUN=1",
  revise,
].filter(Boolean).join("\n"));
