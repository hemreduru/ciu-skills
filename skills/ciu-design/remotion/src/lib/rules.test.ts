import { test } from "node:test";
import assert from "node:assert/strict";
import { findLogo, logoHeight, resolveSize, safeArea, trUpper } from "./rules.ts";

test("resolveSize: aliases, WxH, even rounding, unknown", () => {
  assert.deepEqual(resolveSize("story"), { width: 1080, height: 1920 });
  assert.deepEqual(resolveSize("Post"), { width: 1080, height: 1350 });
  assert.deepEqual(resolveSize("1200x627"), { width: 1200, height: 628 });
  assert.deepEqual(resolveSize(" 1080X1080 "), { width: 1080, height: 1080 });
  assert.throws(() => resolveSize("büyük"), /Bilinmeyen boyut/);
});

test("trUpper: Turkish dotted/dotless i", () => {
  assert.equal(trUpper("istanbul ılık", "tr"), "İSTANBUL ILIK");
  assert.equal(trUpper("istanbul", "en"), "ISTANBUL");
});

test("logoHeight: minimum size wins, maxWidth shrinks", () => {
  assert.equal(logoHeight({ requested: 10, canvasShort: 1080, aspect: 3 }), 43);
  assert.equal(logoHeight({ requested: 200, canvasShort: 1080, aspect: 3 }), 200);
  assert.equal(logoHeight({ requested: 300, canvasShort: 1080, aspect: 4, maxWidth: 800 }), 200);
  assert.equal(logoHeight({ requested: 300, canvasShort: 1080, aspect: 40, maxWidth: 800 }), 43);
});

test("findLogo: unknown id throws", () => {
  const logo = { id: "a", file: "logos/a.png", kind: "main", tone: "color", lang: "bi", aspect: 2, label: "a" } as const;
  assert.equal(findLogo([logo], "a").file, "logos/a.png");
  assert.throws(() => findLogo([logo], "x"), /Logo bulunamadı: x/);
});

test("safeArea: tall formats reserve platform UI zones", () => {
  assert.deepEqual(safeArea(1080, 1920), { top: 269, bottom: 384, side: 65 });
  assert.deepEqual(safeArea(1080, 1350), { top: 65, bottom: 65, side: 65 });
  assert.deepEqual(safeArea(1920, 1080), { top: 65, bottom: 65, side: 65 });
});
