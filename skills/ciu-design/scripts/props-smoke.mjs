#!/usr/bin/env node
// Usage: node props-smoke.mjs <props.json> --work <WORK> [--id Post] [--chrome <path>]
// Prints the props Remotion resolves for a composition; fails if sample content (samples.ts) leaked into a field the input left out.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const arg = (n) => process.argv[process.argv.indexOf(`--${n}`) + 1];
const [file, work, id, chrome] = [process.argv[2], arg("work"), process.argv.includes("--id") ? arg("id") : "Post", process.argv.includes("--chrome") ? arg("chrome") : undefined];
if (!file || !work) (console.log("Kullanım: node props-smoke.mjs <props.json> --work <WORK> [--id Post] [--chrome <yol>]"), process.exit(2));

const req = createRequire(join(resolve(work), "package.json"));
const { bundle } = req("@remotion/bundler");
const { selectComposition } = req("@remotion/renderer");
const input = JSON.parse(readFileSync(file, "utf8"));
const serveUrl = await bundle({ entryPoint: join(resolve(work), "src", "index.ts") });
const comp = await selectComposition({ serveUrl, id, inputProps: input, ...(chrome && { browserExecutable: chrome }) });
const leaked = Object.keys(comp.props).filter((k) => !(k in input));
if (leaked.length) (console.log(`HATA: girdide olmayan alanlar örnekten doldu: ${leaked.join(", ")}`), process.exit(1));
console.log("OK: girdideki alanlar dışında bir şey yok");
process.exit(0);
