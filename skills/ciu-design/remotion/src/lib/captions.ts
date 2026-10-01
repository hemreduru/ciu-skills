export type Cue = { startMs: number; endMs: number; text: string };
export type TimedWord = { text: string; startMs: number; endMs: number };

export const MAX_CUE_CHARS = 32;
const PAUSE_MS = 700;
const SENTENCE_END = /[.!?…]$/;

const STAMP = /(\d+):(\d{2}):(\d{2})[,.](\d{1,3})/;
const toMs = (s: string): number => {
  const m = STAMP.exec(s.trim());
  return m ? ((+m[1] * 60 + +m[2]) * 60 + +m[3]) * 1000 + Number(m[4].padEnd(3, "0")) : NaN;
};
const stamp = (ms: number): string => {
  const p = (n: number, w = 2) => String(Math.floor(n)).padStart(w, "0");
  return `${p(ms / 3600000)}:${p((ms / 60000) % 60)}:${p((ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

export const parseSrtCues = (srt: string): Cue[] =>
  srt
    .replace(/^﻿/, "")
    .split(/\r?\n\s*\r?\n/)
    .flatMap((block) => {
      const lines = block.trim().split(/\r?\n/);
      const at = lines.findIndex((l) => l.includes("-->"));
      if (at < 0) return [];
      const [a, b] = lines[at].split("-->");
      const text = lines.slice(at + 1).join(" ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      const cue = { startMs: toMs(a), endMs: toMs(b), text };
      return text && Number.isFinite(cue.startMs) && Number.isFinite(cue.endMs) ? [cue] : [];
    });

export const formatSrt = (cues: readonly Cue[]): string =>
  cues.map((c, i) => `${i + 1}\n${stamp(c.startMs)} --> ${stamp(c.endMs)}\n${c.text}\n`).join("\n");

/** Greedy one-line chunks of at most `max` chars, never splitting a word. */
const chunk = (text: string, max: number): string[] => {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (line && (line + " " + word).length > max) (out.push(line), (line = word));
    else line = line ? `${line} ${word}` : word;
    if (SENTENCE_END.test(word)) (out.push(line), (line = ""));
  }
  if (line) out.push(line);
  return out;
};

/** Splits cues that are too long into one-line cues; the cue's time is shared by character count. */
export const reflowCues = (cues: readonly Cue[], max = MAX_CUE_CHARS): Cue[] =>
  cues.flatMap((c) => {
    const parts = chunk(c.text, max);
    if (parts.length <= 1) return [{ ...c, text: parts[0] ?? c.text }];
    const total = parts.reduce((n, p) => n + p.length, 0);
    let done = 0;
    return parts.map((text) => {
      const startMs = Math.round(c.startMs + ((c.endMs - c.startMs) * done) / total);
      done += text.length;
      return { startMs, endMs: Math.round(c.startMs + ((c.endMs - c.startMs) * done) / total), text };
    });
  });

/** Whisper emits sub-word tokens; a token starting with a space begins a new word. Special tokens like [_BEG_] are dropped. */
export const mergeTokens = (tokens: readonly TimedWord[]): TimedWord[] => {
  const words: TimedWord[] = [];
  for (const t of tokens) {
    if (!t.text.trim() || /^\s*\[_.*_\]\s*$/.test(t.text)) continue;
    const last = words.at(-1);
    if (last && !/^\s/.test(t.text)) (last.text += t.text), (last.endMs = t.endMs);
    else words.push({ ...t, text: t.text.trim() });
  }
  return words;
};

/** Whisper words (with real timings) to one-line cues: new cue on length, pause or sentence end. */
export const wordsToCues = (words: readonly TimedWord[], max = MAX_CUE_CHARS): Cue[] => {
  const cues: Cue[] = [];
  let cur: Cue | undefined;
  for (const w of words) {
    const text = w.text.trim();
    if (!text) continue;
    const breaks = cur && (`${cur.text} ${text}`.length > max || w.startMs - cur.endMs > PAUSE_MS || SENTENCE_END.test(cur.text));
    if (cur && !breaks) (cur.text += ` ${text}`), (cur.endMs = w.endMs);
    else (cur && cues.push(cur), (cur = { startMs: w.startMs, endMs: w.endMs, text }));
  }
  if (cur) cues.push(cur);
  return cues;
};

/** Plain text without timings: spread evenly (by characters) over `seconds`. */
export const textToCues = (text: string, seconds: number, max = MAX_CUE_CHARS): Cue[] =>
  reflowCues([{ startMs: 0, endMs: Math.round(seconds * 1000), text: text.replace(/\s+/g, " ").trim() }], max);

/** Index of the word being spoken at `ms`; SRT has no word times, so they are estimated by length. */
export const activeWord = (cue: Cue, ms: number): number => {
  const weights = cue.text.split(" ").map((w) => w.length + 1);
  const t = ((ms - cue.startMs) / Math.max(1, cue.endMs - cue.startMs)) * weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let i = 0; i < weights.length; i++) if (t < (acc += weights[i])) return i;
  return weights.length - 1;
};
