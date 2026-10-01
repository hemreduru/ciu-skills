#!/usr/bin/env node
// Usage: node music.mjs   -> lists the bundled royalty-free (CC0) tracks: id, mood, length, feel
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const tracks = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "remotion", "public", "music", "index.json"), "utf8"));
tracks.forEach((t) => console.log(`${t.id}  (${t.mood}, ${t.seconds} sn)  ${t.feel}`));
