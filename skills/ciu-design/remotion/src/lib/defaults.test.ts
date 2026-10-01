import { test } from "node:test";
import assert from "node:assert/strict";
import { sampleUnlessInput } from "./defaults.ts";

const sample = { title: "Örnek", subtitle: "Örnek alt başlık", photo: { src: "sample.jpg" } };

test("sampleUnlessInput: no input props -> sample shown (Studio)", () => {
  assert.deepEqual(sampleUnlessInput(sample, {}), sample);
});

test("sampleUnlessInput: input props given -> no sample field leaks into omitted fields", () => {
  const d = sampleUnlessInput(sample, { title: "Gerçek" });
  assert.deepEqual({ ...d, title: "Gerçek" }, { title: "Gerçek" });
  assert.equal((d as Record<string, unknown>).subtitle, undefined);
  assert.equal((d as Record<string, unknown>).photo, undefined);
});
