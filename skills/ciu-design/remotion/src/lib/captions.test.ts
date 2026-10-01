import { test } from "node:test";
import assert from "node:assert/strict";
import { activeWord, formatSrt, mergeTokens, parseSrtCues, reflowCues, textToCues, wordsToCues } from "./captions.ts";

const SRT = "﻿1\r\n00:00:01,000 --> 00:00:03,000\r\nUKÜ'ye hoş\r\ngeldiniz <i>bugün</i>\r\n\r\n2\r\n00:00:03.500 --> 00:00:05,000\r\nYeni dönem\r\n";

test("parseSrtCues: BOM, CRLF, dot decimal, multi-line, tags", () => {
  const cues = parseSrtCues(SRT);
  assert.deepEqual(cues, [
    { startMs: 1000, endMs: 3000, text: "UKÜ'ye hoş geldiniz bugün" },
    { startMs: 3500, endMs: 5000, text: "Yeni dönem" },
  ]);
});

test("formatSrt round-trips", () => {
  const cues = parseSrtCues(SRT);
  assert.deepEqual(parseSrtCues(formatSrt(cues)), cues);
});

test("reflowCues: splits long cues at word boundaries, time proportional, short cues untouched", () => {
  const out = reflowCues([{ startMs: 0, endMs: 4000, text: "Oryantasyon günleri bu hafta kampüste başlıyor" }], 20);
  assert.ok(out.length >= 2 && out.every((c) => c.text.length <= 20));
  assert.equal(out[0].startMs, 0);
  assert.equal(out.at(-1)!.endMs, 4000);
  out.slice(1).forEach((c, i) => assert.equal(c.startMs, out[i].endMs));
  assert.deepEqual(reflowCues([{ startMs: 0, endMs: 1000, text: "Kısa" }]), [{ startMs: 0, endMs: 1000, text: "Kısa" }]);
});

test("wordsToCues: groups by length, pause and sentence end", () => {
  const w = (text: string, s: number, e: number) => ({ text, startMs: s, endMs: e });
  const cues = wordsToCues([w(" Merhaba", 0, 400), w(" UKÜ.", 400, 800), w(" Yeni", 900, 1200), w(" dönem", 1200, 1600), w(" başlıyor", 3000, 3500)], 32);
  assert.deepEqual(cues.map((c) => c.text), ["Merhaba UKÜ.", "Yeni dönem", "başlıyor"]);
  assert.equal(cues[0].endMs, 800);
});

test("textToCues: plain text spread over the video length", () => {
  const cues = textToCues("Bugün oryantasyon günü. Kampüste görüşürüz, hepinizi bekliyoruz.", 10, 32);
  assert.ok(cues.every((c) => c.text.length <= 32));
  assert.equal(cues[0].startMs, 0);
  assert.equal(cues.at(-1)!.endMs, 10000);
});

test("activeWord: char-proportional, clamped", () => {
  const cue = { startMs: 0, endMs: 1000, text: "aa bbbbbb" };
  assert.equal(activeWord(cue, 0), 0);
  assert.equal(activeWord(cue, 900), 1);
  assert.equal(activeWord(cue, 5000), 1);
});

test("mergeTokens: sub-word tokens join, special tokens drop", () => {
  const t = (text: string, s: number, e: number) => ({ text, startMs: s, endMs: e });
  assert.deepEqual(mergeTokens([t("[_BEG_]", 0, 0), t(" U", 0, 100), t("KÜ", 100, 300), t(" hoş", 300, 500)]), [t("UKÜ", 0, 300), t("hoş", 300, 500)]);
});
