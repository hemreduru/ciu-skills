#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLAUDEAI = { in: "/mnt/user-data/uploads", out: "/mnt/user-data/outputs", data: "/tmp/ciu-slides" };

const fail = (code, err) => {
  const detail = String(err?.stderr || err?.message || "").trim().split("\n").slice(-3).join(" | ");
  console.log(`ERROR=${code}\nDETAIL=${detail}`);
  process.exit(1);
};
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"], ...opts }).toString();
const works = (cmd) => {
  try {
    run(cmd, ["-c", "import pptx"]);
    return true;
  } catch {
    return false;
  }
};
const has = (cmd) => {
  try {
    run(cmd, ["--version"]);
    return true;
  } catch {
    return false;
  }
};

const env = existsSync("/mnt/user-data") ? "claudeai" : "local";
const data = env === "claudeai" ? CLAUDEAI.data : process.env.CLAUDE_PLUGIN_DATA || join(homedir(), ".cache", "ciu-slides");
const inDir = env === "claudeai" ? CLAUDEAI.in : join(process.cwd(), "girdiler");
const outDir = env === "claudeai" ? CLAUDEAI.out : join(process.cwd(), "ciktilar");
const tplDir = join(data, "sablon");
[data, inDir, outDir].forEach((d) => mkdirSync(d, { recursive: true }));

// 1. Python + python-pptx (claude.ai'de hazır; yerelde sabit sürümle venv)
let python = process.env.CIU_PYTHON || ["python3", "python"].find((c) => works(c)) || "";
let firstRun = false;
if (!python || !works(python)) {
  const py = ["python3", "python"].find((c) => has(c));
  if (!py) fail("PYTHON_MISSING", { message: "python3 bulunamadı" });
  const venv = join(data, "venv");
  python = join(venv, "bin", "python");
  if (!existsSync(python) || !works(python)) {
    try {
      run(py, ["-m", "venv", venv]);
      run(python, ["-m", "pip", "install", "-q", "--disable-pip-version-check", "-r", join(SKILL, "requirements.txt")]);
      firstRun = true;
    } catch (e) {
      fail("PYTHON_SETUP_FAILED", e);
    }
  }
}

// 2. Şablonlar her çalıştırmada indirilir; olmazsa önbellekteki son kopya
const cached = [1, 2, 3].every((n) => existsSync(join(tplDir, `sablon-${n}.pptx`)));
let status = "fresh";
let warning = "";
try {
  run(python, [join(SKILL, "scripts", "fetch_template.py"), tplDir], { timeout: 300000 });
} catch (e) {
  const detail = String(e.stderr || e.message).trim().split("\n").pop();
  status = cached ? "cached" : "missing";
  warning = cached
    ? "Şablon indirilemedi; son indirilen kopya kullanılıyor, güncel olmayabilir."
    : "Şablon indirilemedi ve önbellekte kopya yok; kullanıcıdan şablonu (.pptx) yüklemesini iste.";
  warning += ` (${detail})`;
}

let soffice = "";
try {
  soffice = run("which", ["soffice"]).trim();
} catch {}

console.log([
  `ENV=${env}`, `IN=${inDir}`, `OUT=${outDir}`, `DATA=${data}`, `PYTHON=${python}`, `TEMPLATES=${tplDir}`,
  `TEMPLATE_STATUS=${status}`, warning && `TEMPLATE_WARNING=${warning}`,
  `SOFFICE=${soffice}`, firstRun && "FIRST_RUN=1",
].filter(Boolean).join("\n"));
