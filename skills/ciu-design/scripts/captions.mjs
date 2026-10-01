#!/usr/bin/env node
// Usage:
//   node captions.mjs plan --data <DATA>
//   node captions.mjs transcribe <video|audio> --work <WORK> --data <DATA> --out <x.srt> [--lang tr] [--names "A,B"] [--install]
//   node captions.mjs import <x.srt|x.txt> --out <y.srt> [--seconds <video length>]
// Speech-to-text only on request: whisper.cpp + model go to <DATA>/whisper (outside WORK) and are fetched only with --install.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fold } from "./text.mjs";
import { formatSrt, mergeTokens, parseSrtCues, reflowCues, textToCues, wordsToCues } from "../remotion/src/lib/captions.ts";

export const WHISPER_VERSION = "1.5.5";
export const MODEL = "small";
export const MODEL_MB = 465;
const NAMES = ["UKÜ", "CIU", "Uluslararası Kıbrıs Üniversitesi", "Cyprus International University"];

const core = (w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

/** Puts known proper names (UKÜ, department names) back in their canonical spelling, ignoring case and diacritics. */
export const protectNames = (text, names = []) => {
  const words = text.split(" ");
  for (const name of [...NAMES, ...names].map((n) => n.trim()).filter(Boolean)) {
    const target = name.split(/\s+/);
    for (let i = 0; i + target.length <= words.length; i++) {
      const win = words.slice(i, i + target.length);
      if (!win.every((w, k) => fold(core(w)) === fold(target[k]))) continue;
      target.forEach((t, k) => (words[i + k] = words[i + k].replace(core(words[i + k]), t)));
    }
  }
  return words.join(" ");
};

export const buildSrt = (cues, names) => formatSrt(cues.map((c) => ({ ...c, text: protectNames(c.text, names) })));

/** User SRT or plain text to clean one-line cues. */
export const importCues = (raw, seconds) => {
  const cues = parseSrtCues(raw);
  if (cues.length) return reflowCues(cues);
  if (!seconds) throw new Error("Düz metin için videonun süresi (--seconds) gerekir.");
  return textToCues(raw, seconds);
};

const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i < 0 ? undefined : process.argv[i + 1];
};
const have = (bin) => !spawnSync(bin, ["--version"], { stdio: "ignore" }).error;

const plan = (data) => {
  const dir = join(data, "whisper");
  const ready = existsSync(join(dir, "whisper.cpp")) && existsSync(join(dir, `ggml-${MODEL}.bin`)) && statSync(join(dir, `ggml-${MODEL}.bin`)).size > 1e8;
  const canBuild = process.platform !== "win32" && existsSync("/mnt/user-data") === false && ["git", "make", "g++"].every(have);
  if (ready) return { status: "ready", lines: [] };
  if (!canBuild) return { status: "unavailable", lines: ["UYARI: Bu ortamda konuşmayı yazıya çevirme kurulamıyor (derleme araçları ya da ağ yok). Kullanıcıdan SRT dosyası ya da konuşma metni iste: captions.mjs import."] };
  return {
    status: "needs-install",
    lines: [`UYARI: İlk altyazı için konuşma tanıma kurulacak: yaklaşık ${MODEL_MB} MB model indirilecek ve derlenecek (internet hızına göre 5–10 dakika). Sonraki seferlerde bekleme yok; 1 dakikalık konuşma bilgisayarda yaklaşık 1–2 dakikada yazıya dönüşür. Kullanıcıdan onay al, sonra --install ile çalıştır.`],
  };
};

const main = async () => {
  const [cmd, input] = process.argv.slice(2);
  const die = (m, code = 1) => (console.log(`HATA: ${m}`), process.exit(code));
  if (cmd === "plan") {
    const data = arg("data") ?? die("--data gerekli", 2);
    const p = plan(data);
    console.log([`WHISPER=${p.status}`, `MODEL=${MODEL}`, `DOWNLOAD_MB=${p.status === "needs-install" ? MODEL_MB : 0}`, ...p.lines].join("\n"));
    return;
  }
  if (cmd === "import") {
    const out = arg("out") ?? die("--out gerekli", 2);
    if (!input || input.startsWith("--")) die("Kullanım: captions.mjs import <dosya> --out <x.srt> [--seconds N]", 2);
    let cues;
    try {
      cues = importCues(readFileSync(input, "utf8"), Number(arg("seconds")) || undefined);
    } catch (e) {
      die(e.message);
    }
    writeFileSync(out, buildSrt(cues, (arg("names") ?? "").split(",")));
    console.log(`SRT=${out}\nCUES=${cues.length}`);
    return;
  }
  if (cmd === "transcribe") {
    const [work, data, out] = ["work", "data", "out"].map((n) => resolve(arg(n) ?? die(`--${n} gerekli`, 2)));
    if (!input || !existsSync(input)) die(`Dosya bulunamadı: ${input}`);
    const media = resolve(input);
    const p = plan(data);
    if (p.status === "unavailable") die(p.lines[0], 3);
    if (p.status === "needs-install" && !process.argv.includes("--install")) (console.log(["WHISPER=needs-install", ...p.lines].join("\n")), process.exit(3));

    const require = createRequire(join(work, "package.json"));
    const { installWhisperCpp, downloadWhisperModel, transcribe, toCaptions } = require("@remotion/install-whisper-cpp");
    const dir = join(data, "whisper");
    const names = (arg("names") ?? "").split(",").map((n) => n.trim()).filter(Boolean);
    const tmp = mkdtempSync(join(tmpdir(), "ciu-whisper-"));
    try {
      await installWhisperCpp({ version: WHISPER_VERSION, to: join(dir, "whisper.cpp"), printOutput: false });
      await downloadWhisperModel({ model: MODEL, folder: dir, printOutput: false });
      const wav = join(tmp, "audio.wav");
      const ff = spawnSync("npx", ["remotion", "ffmpeg", "-y", "-i", media, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav], { cwd: work, encoding: "utf8" });
      if (!existsSync(wav)) die(`Ses çıkarılamadı (videoda ses olmayabilir): ${ff.stderr.trim().split("\n").at(-1)}`);
      process.chdir(tmp); // whisper writes its tmp json to cwd; all paths above are absolute
      const json = await transcribe({
        inputPath: wav, whisperPath: join(dir, "whisper.cpp"), whisperCppVersion: WHISPER_VERSION, model: MODEL, modelFolder: dir,
        tokenLevelTimestamps: true, language: arg("lang") ?? "tr", printOutput: false,
        additionalArgs: [["--prompt", [...NAMES, ...names].join(", ")]],
      });
      const cues = wordsToCues(mergeTokens(toCaptions({ whisperCppOutput: json }).captions));
      if (!cues.length) die("Konuşma bulunamadı (ses boş ya da çok sessiz). Kullanıcıdan SRT ya da metin iste.");
      writeFileSync(out, buildSrt(cues, names));
      console.log(`SRT=${out}\nCUES=${cues.length}\n---\n${readFileSync(out, "utf8")}`);
    } catch (e) {
      die(`Konuşma yazıya çevrilemedi: ${String(e.message).split("\n")[0]}. Kullanıcıdan SRT ya da metin iste.`);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
    return;
  }
  die("Kullanım: captions.mjs plan|transcribe|import ...", 2);
};

if (import.meta.url === `file://${process.argv[1]}`) await main();
