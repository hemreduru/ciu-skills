export type Size = { width: number; height: number };
export type SafeArea = { top: number; bottom: number; side: number };
export type LogoEntry = {
  id: string;
  file: string;
  kind: "main" | "unit";
  tone: "color" | "white" | "black" | "gray";
  lang: "tr" | "en" | "bi";
  aspect: number;
  label: string;
};

const ALIASES: Record<string, [number, number]> = {
  post: [1080, 1350],
  portrait: [1080, 1440],
  kare: [1080, 1080],
  square: [1080, 1080],
  story: [1080, 1920],
  reels: [1080, 1920],
  reel: [1080, 1920],
  yatay: [1920, 1080],
  landscape: [1920, 1080],
  youtube: [1920, 1080],
  linkedin: [1200, 628],
  og: [1200, 630],
};

const even = (n: number): number => n + (n % 2);

export const resolveSize = (size: string): Size => {
  const key = size.trim().toLowerCase();
  const alias = ALIASES[key];
  if (alias) return { width: alias[0], height: alias[1] };
  const m = /^(\d{2,5})x(\d{2,5})$/.exec(key);
  if (!m) throw new Error(`Bilinmeyen boyut: ${size}`);
  return { width: even(Number(m[1])), height: even(Number(m[2])) };
};

export const trUpper = (text: string, lang: "tr" | "en"): string =>
  text.toLocaleUpperCase(lang === "tr" ? "tr-TR" : "en-US");

export const findLogo = (logos: readonly LogoEntry[], id: string): LogoEntry => {
  const logo = logos.find((l) => l.id === id);
  if (!logo) throw new Error(`Logo bulunamadı: ${id}`);
  return logo;
};

const MIN_LOGO_RATIO = 0.04;
const MIN_LOGO_PX = 40;

export const logoHeight = (o: { requested: number; canvasShort: number; aspect: number; maxWidth?: number }): number => {
  const fitted = o.maxWidth ? Math.min(o.requested, o.maxWidth / o.aspect) : o.requested;
  return Math.round(Math.max(fitted, o.canvasShort * MIN_LOGO_RATIO, MIN_LOGO_PX));
};

export const safeArea = (width: number, height: number): SafeArea => {
  const edge = Math.round(Math.min(width, height) * 0.06);
  if (height / width < 1.7) return { top: edge, bottom: edge, side: edge };
  return { top: Math.round(height * 0.14), bottom: Math.round(height * 0.2), side: edge };
};
