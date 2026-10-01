import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RULES_SHA, RULES_TARBALL } from "./remotion-rules.mjs";
import { restoreDesign } from "./revise.mjs";

const run = (script, ...args) => spawnSync("node", [join(import.meta.dirname, script), ...args], { encoding: "utf8" });
const tmp = () => mkdtempSync(join(tmpdir(), "ciu-"));
const W = "official-ciu-white-1line-tr";
const good = { size: "post", lang: "tr", layout: "overlay", title: "Başlık", meta: "15.10.2026 14:00", logoId: W };

test("rules tarball is pinned to a commit, not a branch", () => {
  assert.match(RULES_SHA, /^[0-9a-f]{40}$/);
  assert.ok(RULES_TARBALL.endsWith(RULES_SHA));
});

test("check.mjs: OK on clean design, Turkish errors + exit 1 otherwise", () => {
  const d = tmp();
  writeFileSync(join(d, "ok.json"), JSON.stringify(good));
  const ok = run("check.mjs", join(d, "ok.json"));
  assert.equal(ok.status, 0);
  assert.equal(ok.stdout.trim(), "OK");

  writeFileSync(join(d, "bad.json"), JSON.stringify({ ...good, logoId: "yok", meta: "15.10.2026 | 14:00" }));
  const bad = run("check.mjs", join(d, "bad.json"));
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /Logo bulunamadı: yok/);
  assert.match(bad.stdout, /Tarih\/saat biçimi hatalı/);

  assert.equal(run("check.mjs", join(d, "nope.json")).status, 1);
});

test("logo.mjs: tone/lang filter and unit search", () => {
  const r = run("logo.mjs", "--tone", "white", "--lang", "en");
  assert.equal(r.status, 0);
  const ids = r.stdout.split("\n").filter((l) => l.startsWith("official-"));
  assert.ok(ids.length > 0 && ids.every((l) => l.includes("white") && l.includes(", en,")));
  assert.match(run("logo.mjs", "--tone", "color", "--lang", "tr", "--unit", "Bilgisayar").stdout, /clubs-club-bilgisayar/);
  assert.equal(run("logo.mjs", "--tone", "red", "--lang", "tr").status, 2);
});

test("restoreDesign: latest folder by default, named folder on request, restores custom + inputs", () => {
  const out = tmp(), work = tmp();
  for (const [name, code] of [["20261001-1000-a", "A"], ["20261002-1000-b", "B"]]) {
    mkdirSync(join(out, name, "input"), { recursive: true });
    writeFileSync(join(out, name, "stills.tsx"), code);
    writeFileSync(join(out, name, "input", `${code}.jpg`), "x");
  }
  writeFileSync(join(out, "dosya.txt"), "not a folder");

  const latest = restoreDesign(out, work);
  assert.deepEqual(latest.restored, ["stills.tsx"]);
  assert.equal(readFileSync(join(work, "src", "custom", "stills.tsx"), "utf8"), "B");
  assert.ok(existsSync(join(work, "public", "input", "B.jpg")));

  restoreDesign(out, work, "20261001-1000-a");
  assert.equal(readFileSync(join(work, "src", "custom", "stills.tsx"), "utf8"), "A");
  assert.throws(() => restoreDesign(out, work, "yok"), /bulunamadı/);
  assert.throws(() => restoreDesign(tmp(), work), /bulunamadı/);
});

test("music pack: index, files and CREDITS agree; CC0 only; under 8 MB", async () => {
  const { readdirSync, statSync } = await import("node:fs");
  const dir = join(import.meta.dirname, "..", "remotion", "public", "music");
  const index = JSON.parse(readFileSync(join(dir, "index.json"), "utf8"));
  const credits = readFileSync(join(dir, "CREDITS.md"), "utf8");
  const mp3 = readdirSync(dir).filter((f) => f.endsWith(".mp3")).sort();
  assert.deepEqual(index.map((t) => `${t.id}.mp3`).sort(), mp3);
  assert.ok(index.length >= 4 && index.length <= 6);
  for (const t of index) assert.ok(credits.includes(t.source) && credits.includes(`${t.id}.mp3`), t.id);
  assert.match(credits, /CC0 1\.0/);
  assert.ok(mp3.reduce((sum, f) => sum + statSync(join(dir, f)).size, 0) < 8 * 1048576);
  const listed = run("music.mjs").stdout;
  index.forEach((t) => assert.ok(listed.includes(t.id)));
});

test("check.mjs --work: missing user file and unknown musicTrack are reported; input.mjs rejects bad types", () => {
  const d = tmp();
  const work = join(import.meta.dirname, "..", "remotion");
  const design = { size: "reels", lang: "tr", slides: [{ photo: { src: "yok-yok.jpg" }, seconds: 2 }], bugLogoId: W, cardLogoId: "official-ciu-color-1line-bilingual-tr", outro: ["x"], musicTrack: "yok" };
  writeFileSync(join(d, "m.json"), JSON.stringify(design));
  const r = run("check.mjs", join(d, "m.json"), "--work", work);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /yok-yok\.jpg" bulunamadı/);
  assert.match(r.stdout, /musicTrack bulunamadı/);
  writeFileSync(join(d, "a.exe"), "x");
  const bad = run("input.mjs", join(d, "a.exe"), "--work", d);
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /desteklenmiyor/);
});
