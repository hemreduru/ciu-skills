import { test } from "node:test";
import assert from "node:assert/strict";
import { bandColumns, bandLayout, clearBox, intersects, logoRowSize, type Box, type TextMeasure } from "./bandLayout.ts";
import { safeArea } from "./rules.ts";

const SIZES: [string, number, number][] = [
  ["post", 1080, 1350],
  ["portrait", 1080, 1440],
  ["square", 1080, 1080],
  ["story", 1080, 1920],
  ["landscape", 1920, 1080],
  ["linkedin", 1200, 628],
];

const setup = (width: number, height: number, aspects: number[]) => {
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const logo = logoRowSize({ aspects, requested: 8 * u, canvasShort: Math.min(width, height) });
  return { width, height, safe, u, logo };
};

/** Natural text height grows with the number of lines; stand-in for the measured DOM height. */
const text = (height: number, overflowX = false): TextMeasure => ({ height, overflowX });

const textBox = (l: ReturnType<typeof bandLayout>): Box => l.text;

test("logoRowSize: single logo, with unit logo, minimum size", () => {
  assert.deepEqual(logoRowSize({ aspects: [5], requested: 100, canvasShort: 1080 }), { width: 500, height: 100 });
  const two = logoRowSize({ aspects: [5, 2], requested: 100, canvasShort: 1080 });
  assert.equal(two.width, 500 + 200 + 2 * 35 + 2);
  assert.equal(two.height, 100);
  assert.equal(logoRowSize({ aspects: [2], requested: 10, canvasShort: 1080 }).height, 43);
});

test("bandLayout: brief case (post, long subtitle) keeps text out of the logo clear space", () => {
  const i = { ...setup(1080, 1350, [5.0157]), full: text(451), beside: text(700, true) };
  const l = bandLayout(i);
  assert.equal(l.mode, "stacked");
  assert.equal(intersects(textBox(l), clearBox(l.logo)), false);
  assert.ok(l.text.top + l.text.height <= l.logo.top - l.clear + 1e-6);
  assert.ok(l.text.left + l.text.width <= 1080 - i.safe.side);
  assert.ok(l.text.top >= l.topH, "text stays inside the band");
});

test("bandLayout: the old layout (full-width column from topH + 5u, logo bottom-right) did collide", () => {
  const i = { ...setup(1080, 1350, [5.0157]), full: text(451), beside: text(700, true) };
  const { logo } = bandColumns(i);
  const topH = 1350 - Math.round(1350 * 0.38);
  const old: Box = { left: i.safe.side, top: topH + 5 * i.u, width: 1080 - 2 * i.safe.side, height: 451 };
  assert.equal(intersects(old, clearBox(logo)), true);
});

test("bandLayout: text fits beside the logo when it can (landscape, short copy)", () => {
  const i = { ...setup(1920, 1080, [5.0157]), full: text(250), beside: text(260) };
  const l = bandLayout(i);
  assert.equal(l.mode, "beside");
  assert.equal(l.textScale, 1);
  assert.equal(l.bandH, Math.round(1080 * 0.38));
  assert.ok(l.text.left + l.text.width <= l.logo.left - l.clear);
  assert.equal(intersects(textBox(l), clearBox(l.logo)), false);
});

test("bandLayout: a word wider than the beside column forces the stacked layout", () => {
  const i = { ...setup(1080, 1080, [5.0157]), full: text(200), beside: text(120, true) };
  assert.equal(bandLayout(i).mode, "stacked");
});

test("bandLayout: short copy is not shrunk and the band is not grown", () => {
  const i = { ...setup(1080, 1350, [5.0157]), full: text(150), beside: text(300, true) };
  const l = bandLayout(i);
  assert.equal(l.textScale, 1);
  assert.equal(l.bandH, Math.round(1350 * 0.38));
});

test("bandLayout: any text length, size and logo row never reaches the logo clear space", () => {
  for (const [name, width, height] of SIZES) {
    for (const aspects of [[5.0157], [5.0157, 3.2], [2.1]]) {
      for (const h of [0, 40, 150, 300, 451, 800, 1500, 4000]) {
        for (const overflowX of [false, true]) {
          const i = { ...setup(width, height, aspects), full: text(h), beside: text(h * 1.6, overflowX) };
          const l = bandLayout(i);
          const label = `${name} logos=${aspects.length} textH=${h} overflowX=${overflowX} mode=${l.mode}`;
          assert.equal(intersects(textBox(l), clearBox(l.logo)), false, label);
          assert.ok(l.text.left + l.text.width <= width - i.safe.side + 1e-6, label);
          assert.ok(l.text.top >= l.topH - 1e-6, label);
          assert.ok(l.bandH <= Math.round(height * 0.5) && l.bandH >= Math.round(height * 0.38), label);
          assert.ok(l.logo.left >= i.safe.side && l.logo.left + l.logo.width <= width - i.safe.side + 1e-6, label);
        }
      }
    }
  }
});
