import { logoHeight, type SafeArea } from "./rules.ts";

export type Box = { left: number; top: number; width: number; height: number };

/** Rendered size of the text block at scale 1 in a column of a given width; `overflowX` = a word is wider than the column. */
export type TextMeasure = { height: number; overflowX: boolean };

const BAND_RATIO = 0.38;
const BAND_MAX_RATIO = 0.5;
const CLEAR_RATIO = 0.5;

/**
 * Size of a `LogoRow` (main logo, optionally followed by a divider and the unit logo).
 * @param o.aspects width/height ratio of each logo in the row (1 or 2 entries)
 * @param o.requested requested logo height in px (before the minimum-size rule)
 * @param o.canvasShort short side of the canvas in px
 * @returns row size in px
 */
export const logoRowSize = (o: { aspects: readonly number[]; requested: number; canvasShort: number }): { width: number; height: number } => {
  const px = o.aspects.map((aspect) => logoHeight({ requested: o.requested, canvasShort: o.canvasShort, aspect }));
  const gap = o.requested * 0.35;
  const divider = o.aspects.length > 1 ? Math.max(1, o.requested * 0.02) + 2 * gap : 0;
  return { width: px.reduce((sum, h, i) => sum + h * o.aspects[i], 0) + divider, height: Math.max(...px) };
};

/** Clear space kept free around the logo on every side, in px. */
export const logoClearSpace = (logoH: number): number => logoH * CLEAR_RATIO;

/** True when two boxes share any area. */
export const intersects = (a: Box, b: Box): boolean =>
  a.left < b.left + b.width && b.left < a.left + a.width && a.top < b.top + b.height && b.top < a.top + a.height;

/** The logo box grown by its clear space; no text may touch it. */
export const clearBox = (logo: Box): Box => {
  const c = logoClearSpace(logo.height);
  return { left: logo.left - c, top: logo.top - c, width: logo.width + 2 * c, height: logo.height + 2 * c };
};

export type BandInput = {
  width: number;
  height: number;
  safe: SafeArea;
  /** 1 % of the canvas short side */
  u: number;
  logo: { width: number; height: number };
  full: TextMeasure;
  beside: TextMeasure;
};

export type BandLayout = {
  /** "beside": text sits left of the logo column; "stacked": text sits above the logo row */
  mode: "beside" | "stacked";
  bandH: number;
  topH: number;
  /** Text column; `height` is the rendered height after `textScale` */
  text: Box;
  /** Multiplier for the text unit `u` (1 = natural size) */
  textScale: number;
  logo: Box;
  clear: number;
};

/** Logo box in the bottom-right corner and the two column widths the text block can be measured at. */
export const bandColumns = (i: Pick<BandInput, "width" | "height" | "safe" | "logo">): { logo: Box; fullWidth: number; besideWidth: number } => {
  const logo: Box = {
    left: i.width - i.safe.side - i.logo.width,
    top: i.height - i.safe.bottom - i.logo.height,
    width: i.logo.width,
    height: i.logo.height,
  };
  return { logo, fullWidth: i.width - 2 * i.safe.side, besideWidth: Math.floor(logo.left - logoClearSpace(logo.height) - i.safe.side) };
};

/**
 * Lays out the band design: the logo keeps its clear-space box, the text never enters it.
 * Text goes beside the logo when it fits the base band there; otherwise it is stacked above the
 * logo row, the band grows (up to half the canvas) and the text shrinks for whatever is still missing (no lower limit: the clear space wins over legibility).
 * @param i canvas, safe area, logo row size and the measured text block (see `TextMeasure`)
 * @returns band height, text column, text scale and logo box in px
 */
export const bandLayout = (i: BandInput): BandLayout => {
  const { logo, fullWidth, besideWidth } = bandColumns(i);
  const clear = logoClearSpace(logo.height);
  const pad = 5 * i.u;
  const baseH = Math.round(i.height * BAND_RATIO);

  const baseTextTop = i.height - baseH + pad;
  if (besideWidth > 0 && !i.beside.overflowX && baseTextTop + i.beside.height <= logo.top + logo.height) {
    return {
      mode: "beside",
      bandH: baseH,
      topH: i.height - baseH,
      text: { left: i.safe.side, top: baseTextTop, width: besideWidth, height: i.beside.height },
      textScale: 1,
      logo,
      clear,
    };
  }

  const needed = Math.ceil(pad + i.full.height + clear + logo.height + i.safe.bottom);
  const bandH = Math.min(Math.max(baseH, needed), Math.round(i.height * BAND_MAX_RATIO));
  const textTop = i.height - bandH + pad;
  const room = logo.top - clear - textTop;
  const textScale = i.full.height > room ? Math.max(Math.floor((room / i.full.height) * 1000) / 1000, 0) : 1;
  return {
    mode: "stacked",
    bandH,
    topH: i.height - bandH,
    text: { left: i.safe.side, top: textTop, width: fullWidth, height: i.full.height * textScale },
    textScale,
    logo,
    clear,
  };
};
