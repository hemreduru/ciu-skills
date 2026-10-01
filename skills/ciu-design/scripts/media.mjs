import { spawnSync } from "node:child_process";

// Probes a media file with Remotion's bundled ffprobe; returns { seconds?, width?, height? }.
export const probe = (work, file) => {
  const r = spawnSync("npx", ["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration:stream=width,height", "-of", "json", file], { cwd: work, encoding: "utf8" });
  try {
    const j = JSON.parse(r.stdout);
    const s = (j.streams ?? []).find((x) => x.width);
    const seconds = Number(j.format?.duration);
    return { seconds: Number.isFinite(seconds) && seconds > 0 ? seconds : undefined, width: s?.width, height: s?.height };
  } catch {
    return {};
  }
};
