#!/usr/bin/env node
// Eval runner + grader (no dependencies).
//   node evals/run.mjs run   <skill>/<case>... [--run N] [--parallel 2] [--model m] [--grade-only]
//   node evals/run.mjs report [--run N]        (markdown table from /tmp/w4-runs/<N>)
// Each case runs in /tmp/w4-runs/<N>/<skill>/<case>/ (work/, data/, transcript.jsonl, grade.json).
// regex / tool_used / tool_order / file_exists / file_regex are graded here; llm graders are left for a human (verdicts.json).
import { spawn, spawnSync } from "node:child_process";
import { existsSync, globSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RUNS = process.env.CIU_EVAL_RUNS || "/tmp/w4-runs";

const parseValue = (v) => {
  v = v.trim();
  if (/^'.*'$/s.test(v)) return v.slice(1, -1).replace(/''/g, "'");
  if (/^".*"$/s.test(v)) return JSON.parse(v);
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v === "true" || v === "false") return v === "true";
  if (v.startsWith("[") && v.endsWith("]")) return splitTop(v.slice(1, -1)).map(parseValue);
  if (v.startsWith("{") && v.endsWith("}")) return Object.fromEntries(splitTop(v.slice(1, -1)).map((kv) => { const i = kv.indexOf(":"); return [kv.slice(0, i).trim(), parseValue(kv.slice(i + 1))]; }));
  return v;
};
const splitTop = (s) => {
  const out = []; let depth = 0, q = "", cur = "";
  for (const c of s) {
    if (q) { if (c === q) q = ""; }
    else if (c === "'" || c === '"') q = c;
    else if ("[{".includes(c)) depth++;
    else if ("]}".includes(c)) depth--;
    if (c === "," && !depth && !q) { out.push(cur); cur = ""; } else cur += c;
  }
  return cur.trim() ? [...out, cur] : out;
};

export const parseFrontmatter = (text) => {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const l of m[1].split("\n")) {
    const i = l.indexOf(":");
    if (i > 0 && !l.startsWith("#")) meta[l.slice(0, i).trim()] = parseValue(l.slice(i + 1));
  }
  return { meta, body: m[2] };
};

const textOf = (c) => (typeof c === "string" ? c : Array.isArray(c) ? c.map((x) => x.text ?? "").join("\n") : "");
export const loadTranscript = (jsonl) => {
  const tx = { tools: [], texts: [], results: [], lastMessage: "", turns: 0, durationMs: 0, isError: false, trace: "" };
  for (const l of jsonl.split("\n")) {
    let e;
    try { e = JSON.parse(l); } catch { continue; }
    const content = e.message?.content;
    if (e.type === "assistant" && Array.isArray(content))
      for (const b of content) {
        if (b.type === "tool_use") tx.tools.push({ tool: b.name, input: b.input ?? {} });
        if (b.type === "text") tx.texts.push(b.text);
      }
    if (e.type === "user" && Array.isArray(content)) for (const b of content) if (b.type === "tool_result") tx.results.push(textOf(b.content));
    if (e.type === "result") Object.assign(tx, { lastMessage: e.result ?? "", turns: e.num_turns ?? 0, durationMs: e.duration_ms ?? 0, isError: !!e.is_error });
  }
  if (!tx.lastMessage) tx.lastMessage = tx.texts.at(-1) ?? "";
  tx.trace = [...tx.texts, ...tx.tools.map((t) => flat(t.input)), ...tx.results].join("\n");
  return tx;
};
const flat = (o) => (typeof o === "object" && o ? Object.values(o).map(flat).join(" ") : String(o));

const re = (pattern, flags = "") => {
  const inline = /^\(\?([a-z]+)\)/.exec(pattern);
  return new RegExp(inline ? pattern.slice(inline[0].length) : pattern, flags + (inline ? inline[1] : ""));
};
const matches = (tx, { tool, input_match }) => tx.tools.map((t, i) => ({ ...t, i })).filter((t) => t.tool === tool && (!input_match || re(input_match).test(flat(t.input))));
const files = (workDir, pattern) => globSync(pattern, { cwd: workDir }).filter((f) => statSync(join(workDir, f)).isFile());

export const grade = (g, { tx, workDir }) => {
  const r = (pass, detail) => ({ pass, detail });
  switch (g.type) {
    case "tool_used": {
      const n = matches(tx, g).length, min = g.min ?? 1;
      return r(n >= min && n <= (g.max ?? Infinity), `${g.tool} ${g.input_match ?? ""}: ${n}×`);
    }
    case "tool_order": {
      const b = matches(tx, g.before)[0], a = matches(tx, g.after)[0];
      return r(!!b && !!a && b.i < a.i, `before=${b?.i ?? "yok"} after=${a?.i ?? "yok"}`);
    }
    case "regex": {
      const hit = re(g.pattern, g.flags).test(g.target === "last_message" ? tx.lastMessage : tx.trace);
      return r(g.negate ? !hit : hit, `/${g.pattern}/ ${g.target ?? "trace"} ${hit ? "bulundu" : "yok"}`);
    }
    case "file_exists": {
      const n = files(workDir, g.path).length;
      return r(n >= (g.min ?? 1), `${g.path}: ${n} dosya`);
    }
    case "file_regex": {
      const fs = files(workDir, g.path);
      const hit = fs.length > 0 && fs.some((f) => re(g.pattern, g.flags).test(readFileSync(join(workDir, f), "utf8")));
      return r(fs.length > 0 && (g.negate ? !hit : hit), `${g.path}: ${fs.length ? (hit ? "eşleşti" : "eşleşmedi") : "dosya yok"} /${g.pattern}/`);
    }
    case "llm": return r(null, "elle değerlendirilir");
    default: return r(false, `bilinmeyen tür: ${g.type}`);
  }
};

const graderFiles = (caseDir) => (existsSync(join(caseDir, "graders")) ? readdirSync(join(caseDir, "graders")).filter((f) => f.endsWith(".md")).sort() : []);

// PNG boyutu, MP4 süre/boyut (remotion ffprobe), PPTX check.py: mekanik çıktı kontrolü
const inspectOutputs = (workDir, env) => {
  const out = [];
  for (const f of globSync("**/ciktilar/**/*.{png,mp4,pptx}", { cwd: workDir })) {
    const p = join(workDir, f);
    if (f.endsWith(".png")) { const b = readFileSync(p); out.push(`${f}: PNG ${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`); }
    else if (f.endsWith(".mp4")) {
      const w = join(env.CLAUDE_PLUGIN_DATA, "remotion");
      const s = spawnSync("npx", ["remotion", "ffprobe", "-v", "error", "-show_entries", "stream=width,height:format=duration", "-of", "csv=p=0", p], { cwd: w, encoding: "utf8" });
      out.push(`${f}: MP4 ${(s.stdout || s.stderr).trim().replace(/\n/g, " ")}`);
    } else {
      const s = spawnSync(env.CIU_PYTHON || "python3", [join(ROOT, "skills/ciu-slides/scripts/check.py"), p], { encoding: "utf8" });
      out.push(`${f}: check.py → ${(s.stdout || s.stderr).trim().split("\n")[0]}`);
    }
  }
  return out;
};

const gradeRun = (dir, caseDir, env) => {
  const tx = loadTranscript(readFileSync(join(dir, "transcript.jsonl"), "utf8"));
  const graders = graderFiles(caseDir).map((f) => {
    const { meta, body } = parseFrontmatter(readFileSync(join(caseDir, "graders", f), "utf8"));
    const res = grade(meta, { tx, workDir: join(dir, "work") });
    return { name: f.replace(/\.md$/, ""), type: meta.type, ...res, ...(meta.type === "llm" ? { criteria: body.trim(), focus: meta.focus } : {}) };
  });
  const result = { turns: tx.turns, durationMs: tx.durationMs, isError: tx.isError, graders, outputs: inspectOutputs(join(dir, "work"), env) };
  writeFileSync(join(dir, "grade.json"), JSON.stringify(result, null, 2));
  return result;
};

const runCase = (id, { run, model, gradeOnly }) => new Promise((done) => {
  const caseDir = join(ROOT, "evals", id);
  const dir = join(RUNS, String(run), id);
  const env = { ...process.env, CLAUDE_PLUGIN_DATA: join(dir, "data"), CIU_PYTHON: process.env.CIU_PYTHON || (existsSync("/tmp/w3/venv/bin/python") ? "/tmp/w3/venv/bin/python" : "") };
  if (gradeOnly) return done(gradeRun(dir, caseDir, env));
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, "work"), { recursive: true });
  mkdirSync(env.CLAUDE_PLUGIN_DATA, { recursive: true });
  const sc = spawnSync("bash", [join(caseDir, "scaffold.sh")], { cwd: join(dir, "work"), env, encoding: "utf8" });
  if (sc.status) { writeFileSync(join(dir, "transcript.jsonl"), ""); writeFileSync(join(dir, "scaffold-error.txt"), sc.stderr); return done(gradeRun(dir, caseDir, env)); }
  const { meta, body } = parseFrontmatter(readFileSync(join(caseDir, "prompt.md"), "utf8"));
  const args = ["-p", "--model", model, "--output-format", "stream-json", "--verbose", "--max-turns", String(meta.max_turns ?? 60), "--setting-sources", "project,local", "--plugin-dir", ROOT, "--add-dir", env.CLAUDE_PLUGIN_DATA, "--allowedTools", (meta.allowed_tools ?? []).join(","), ...(meta.append_system_prompt ? ["--append-system-prompt", meta.append_system_prompt] : [])];
  const t0 = Date.now();
  const p = spawn("claude", args, { cwd: join(dir, "work"), env, stdio: ["pipe", "pipe", "pipe"] });
  let out = "", err = "";
  p.stdout.on("data", (d) => (out += d));
  p.stderr.on("data", (d) => (err += d));
  const timer = setTimeout(() => p.kill("SIGKILL"), (meta.timeout_seconds ?? 1800) * 1000);
  p.stdin.end(body.trim());
  p.on("close", (code) => {
    clearTimeout(timer);
    writeFileSync(join(dir, "transcript.jsonl"), out);
    writeFileSync(join(dir, "stderr.txt"), err);
    const res = gradeRun(dir, caseDir, env);
    res.wallSeconds = Math.round((Date.now() - t0) / 1000);
    res.exitCode = code;
    writeFileSync(join(dir, "grade.json"), JSON.stringify(res, null, 2));
    done(res);
  });
});

const summarize = (id, res) => {
  const v = res.graders.filter((g) => g.pass !== null), llm = res.graders.length - v.length;
  return `${id}: mekanik ${v.filter((g) => g.pass).length}/${v.length}${llm ? `, ${llm} llm bekliyor` : ""}${v.filter((g) => !g.pass).map((g) => `\n   KALDI ${g.name}: ${g.detail}`).join("")}`;
};

const main = async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  const opt = (k, d) => { const i = rest.indexOf(`--${k}`); return i < 0 ? d : rest[i + 1]; };
  const run = opt("run", "1");
  if (cmd === "run") {
    const skip = new Set(["--run", "--parallel", "--model"].map((k) => rest.indexOf(k)).filter((i) => i >= 0).map((i) => i + 1));
    const ids = rest.filter((a, i) => !a.startsWith("--") && !skip.has(i));
    const queue = [...ids], width = Number(opt("parallel", 2));
    const worker = async () => { for (let id; (id = queue.shift()); ) console.log(summarize(id, await runCase(id, { run, model: opt("model", "claude-sonnet-5-5"), gradeOnly: rest.includes("--grade-only") }))); };
    await Promise.all(Array.from({ length: Math.min(width, ids.length) }, worker));
  } else if (cmd === "report") {
    const base = join(RUNS, String(run));
    for (const skill of readdirSync(base)) for (const c of readdirSync(join(base, skill)).sort()) {
      const gp = join(base, skill, c, "grade.json");
      if (!existsSync(gp)) continue;
      const g = JSON.parse(readFileSync(gp, "utf8"));
      const vp = join(base, skill, c, "verdicts.json");
      const verdicts = existsSync(vp) ? JSON.parse(readFileSync(vp, "utf8")) : {};
      const all = g.graders.map((x) => ({ ...x, pass: x.pass ?? verdicts[x.name]?.pass ?? null }));
      const bad = all.filter((x) => x.pass !== true);
      console.log(`| ${skill}/${c} | ${bad.length ? "kaldı" : "geçti"} | ${all.length - bad.length}/${all.length}${bad.length ? ` (${bad.map((x) => x.name + (x.pass === null ? "?" : "")).join(", ")})` : ""} | ${g.wallSeconds ?? Math.round(g.durationMs / 1000)} sn |`);
    }
  } else console.log("kullanım: run.mjs run <skill>/<case>... | report");
};
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
