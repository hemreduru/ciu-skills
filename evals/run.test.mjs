import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { grade, loadTranscript, parseFrontmatter } from "./run.mjs";

const line = (o) => JSON.stringify(o);
const jsonl = [
  line({ type: "assistant", message: { content: [{ type: "tool_use", name: "Skill", input: { skill: "ciu-skills:ciu-design" } }] } }),
  line({ type: "assistant", message: { content: [{ type: "tool_use", name: "Bash", input: { command: "node setup.mjs" } }] } }),
  line({ type: "user", message: { content: [{ type: "tool_result", content: [{ type: "text", text: "ENV=local\nOK\n" }] }] } }),
  line({ type: "assistant", message: { content: [{ type: "tool_use", name: "Bash", input: { command: "npx remotion still a preview-a.png" } }] } }),
  line({ type: "assistant", message: { content: [{ type: "tool_use", name: "Bash", input: { command: "npx remotion still a final.png" } }] } }),
  line({ type: "assistant", message: { content: [{ type: "text", text: "Hazır: size 1080x1350" }] } }),
  line({ type: "result", result: "Hazır: size 1080x1350", num_turns: 5, duration_ms: 1000, is_error: false }),
].join("\n");
const tx = loadTranscript(jsonl);

test("frontmatter: skalar, liste, harita", () => {
  const { meta, body } = parseFrontmatter("---\ntype: tool_used\ntool: Bash\nmin: 0\nflags: i\nfocus: { source: file, path: eval-final.png }\nallowed_tools: [Read, Bash]\npattern: 'a\\.b'\n---\n\ngövde\n");
  assert.deepEqual(meta, { type: "tool_used", tool: "Bash", min: 0, flags: "i", focus: { source: "file", path: "eval-final.png" }, allowed_tools: ["Read", "Bash"], pattern: "a\\.b" });
  assert.equal(body.trim(), "gövde");
});

test("transkript: araçlar, son mesaj, tur sayısı", () => {
  assert.equal(tx.tools.length, 4);
  assert.equal(tx.lastMessage, "Hazır: size 1080x1350");
  assert.equal(tx.turns, 5);
});

test("tool_used: eşleşme, min ve max", () => {
  assert.equal(grade({ type: "tool_used", tool: "Skill", input_match: "ciu-design" }, { tx }).pass, true);
  assert.equal(grade({ type: "tool_used", tool: "Bash", input_match: "final\\.png" }, { tx }).pass, true);
  assert.equal(grade({ type: "tool_used", tool: "Bash", input_match: "batch\\.mjs" }, { tx }).pass, false);
  assert.equal(grade({ type: "tool_used", tool: "Bash", input_match: "final\\.png", min: 0, max: 0 }, { tx }).pass, false);
  assert.equal(grade({ type: "tool_used", tool: "Bash", input_match: "batch\\.mjs", min: 0, max: 0 }, { tx }).pass, true);
});

test("tool_order: önce preview sonra final", () => {
  const b = { tool: "Bash", input_match: "preview-a" }, a = { tool: "Bash", input_match: "final\\.png" };
  assert.equal(grade({ type: "tool_order", before: b, after: a }, { tx }).pass, true);
  assert.equal(grade({ type: "tool_order", before: a, after: b }, { tx }).pass, false);
});

test("regex: trace, last_message, negate", () => {
  assert.equal(grade({ type: "regex", pattern: "(?m)^OK$", target: "trace" }, { tx }).pass, true);
  assert.equal(grade({ type: "regex", pattern: "SIZE\\W{1,3}1080", target: "last_message", flags: "i" }, { tx }).pass, true);
  assert.equal(grade({ type: "regex", pattern: "OK", target: "last_message" }, { tx }).pass, false);
  assert.equal(grade({ type: "regex", pattern: "Ramazan", target: "last_message", negate: true }, { tx }).pass, true);
});

test("file_exists / file_regex: glob, adet, içerik", () => {
  const dir = mkdtempSync(join(tmpdir(), "evrun-"));
  mkdirSync(join(dir, "ciktilar", "x"), { recursive: true });
  writeFileSync(join(dir, "ciktilar", "x", "a.png"), "1");
  writeFileSync(join(dir, "ciktilar", "x", "b.png"), "2");
  writeFileSync(join(dir, "ciktilar", "x", "paylasim.md"), "#WeAreCIU #CIU");
  assert.equal(grade({ type: "file_exists", path: "**/ciktilar/*/*.png", min: 2 }, { tx, workDir: dir }).pass, true);
  assert.equal(grade({ type: "file_exists", path: "**/ciktilar/*/*.png", min: 3 }, { tx, workDir: dir }).pass, false);
  assert.equal(grade({ type: "file_regex", path: "**/paylasim.md", pattern: "#WeAreCIU" }, { tx, workDir: dir }).pass, true);
  assert.equal(grade({ type: "file_regex", path: "**/paylasim.md", pattern: "stay tuned", flags: "i", negate: true }, { tx, workDir: dir }).pass, true);
  assert.equal(grade({ type: "file_regex", path: "**/yok.md", pattern: "x" }, { tx, workDir: dir }).pass, false);
});

test("llm: otomatik değerlendirilmez (pass=null)", () => {
  assert.equal(grade({ type: "llm" }, { tx }).pass, null);
});
