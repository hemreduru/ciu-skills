#!/usr/bin/env node
// Usage: node input.mjs <yerel dosya | URL> --work <WORK> [--name <kisa-ad>]
// Copies/downloads a user photo, video, music or font into <WORK>/public/input with an ASCII name; prints FILE/KIND and UYARI lines.
import { copyFileSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { probe } from "./media.mjs";

const EXT = {
  photo: ["jpg", "jpeg", "png", "webp"],
  video: ["mp4", "mov", "webm", "m4v"],
  audio: ["mp3", "wav", "m4a", "aac", "ogg"],
  font: ["ttf", "otf", "woff2", "woff"],
};
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i < 0 ? undefined : process.argv[i + 1];
};
const source = process.argv[2];
const work = arg("work");
if (!source || source.startsWith("--") || !work) {
  console.log("Kullanım: node input.mjs <dosya|URL> --work <WORK> [--name <kisa-ad>]");
  process.exit(2);
}
const die = (m) => (console.log(`HATA: ${m}`), process.exit(1));

const ascii = (s) => s.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD").replace(/\p{M}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "dosya";
const isUrl = /^https?:\/\//i.test(source);
const origName = basename(isUrl ? new URL(source).pathname : source);
const ext = extname(origName).slice(1).toLowerCase();
const kind = Object.keys(EXT).find((k) => EXT[k].includes(ext));
if (!kind) die(`"${origName}" desteklenmiyor. Desteklenen türler: ${Object.values(EXT).flat().join(", ")}.`);

const dir = join(work, "public", "input");
mkdirSync(dir, { recursive: true });
const name = `${arg("name") ? ascii(arg("name")) : ascii(basename(origName, extname(origName)))}.${ext}`;
const dest = join(dir, name);
try {
  if (isUrl) {
    const res = await fetch(source, { redirect: "follow", signal: AbortSignal.timeout(60000) });
    if (!res.ok) die(`İndirilemedi (${res.status}). Dosyayı yükleyip yolunu ver.`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  } else copyFileSync(source, dest);
} catch (e) {
  die(`Dosya alınamadı: ${e.message}`);
}

const out = [`FILE=${name}`, `KIND=${kind}`, `MB=${(statSync(dest).size / 1048576).toFixed(1)}`];
if (kind !== "font") {
  const m = probe(work, dest);
  if (!m.seconds && kind !== "photo") die(`"${name}" okunamadı; dosya bozuk olabilir.`);
  if (m.width) out.push(`WIDTH=${m.width}`, `HEIGHT=${m.height}`);
  if (m.seconds && kind !== "photo") out.push(`SECONDS=${m.seconds.toFixed(1)}`);
  if (kind === "photo" && !m.width) die(`"${name}" okunamadı; dosya bozuk olabilir.`);
  if (kind === "photo" && Math.min(m.width, m.height) < 1080) out.push(`UYARI: Fotoğraf düşük çözünürlüklü (${m.width}×${m.height}); kısa kenar 1080 px altında, bulanık çıkabilir.`);
  if (kind === "video" && Math.min(m.width, m.height) < 720) out.push(`UYARI: Video düşük çözünürlüklü (${m.width}×${m.height}).`);
} else out.push("UYARI: Marka fontu dışına çıkılıyor; fontun lisansı sende, marka rehberinden sapıyor.");
console.log(out.join("\n"));
