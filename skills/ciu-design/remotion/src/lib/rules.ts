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

export type Surface = "light" | "dark";

export const toneFitsSurface = (tone: LogoEntry["tone"], surface: Surface): boolean =>
  surface === "dark" ? tone === "white" : tone !== "white";

const DATE_RE = /\d{1,2}[./-]\d{1,2}[./-]\d{2,4}(?:\s*[^\d\s]?\s*\d{1,2}[:.]\d{2})?/g;
const DATE_OK = /^\d{2}\.\d{2}\.\d{4}(?: \d{2}:\d{2})?$/;

export const dateProblems = (text: string): string[] =>
  (text.match(DATE_RE) ?? []).filter((d) => !DATE_OK.test(d)).map((d) => `Tarih/saat biçimi hatalı: "${d.replace(/\n/g, "↵")}". Doğrusu: 15.10.2026 14:00 (tek satır, aralarında tek boşluk).`);

export const MAX_CAPTION_CHARS = 32;

export const srtProblems = (srt: string): string[] =>
  srt
    .split(/\r?\n\r?\n/)
    .flatMap((block) => {
      const lines = block.trim().split(/\r?\n/);
      const textLines = lines.slice(lines.findIndex((l) => l.includes("-->")) + 1).filter(Boolean);
      const label = `"${textLines.join(" / ").slice(0, 40)}"`;
      if (textLines.length > 1) return [`Altyazı tek satır olmalı: ${label}`];
      if (textLines[0] && textLines[0].length > MAX_CAPTION_CHARS) return [`Altyazı ${MAX_CAPTION_CHARS} karakteri geçiyor (${textLines[0].length}): ${label}`];
      return [];
    });

type Json = Record<string, any>;

const strings = (v: unknown): string[] =>
  typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];

export const checkDesign = (d: Json, logos: readonly LogoEntry[]): string[] => {
  const errors: string[] = [];
  const need = (...keys: string[]) => keys.forEach((k) => (d[k] == null || d[k] === "" ) && errors.push(`Zorunlu alan eksik: ${k}`));
  const logo = (key: string, surface?: Surface) => {
    const id = d[key];
    if (!id) return;
    const entry = logos.find((l) => l.id === id);
    if (!entry) return void errors.push(`Logo bulunamadı: ${id} (${key}). logo.mjs ile doğru id'yi seç.`);
    if (surface && !toneFitsSurface(entry.tone, surface))
      errors.push(surface === "dark" ? `${key}: koyu zeminde beyaz logo gerekir, bu logo "${entry.tone}" tonunda (${id}).` : `${key}: açık zeminde renkli logo gerekir, bu logo "${entry.tone}" tonunda (${id}).`);
  };

  need("size", "lang");
  if (d.lang && d.lang !== "tr" && d.lang !== "en") errors.push(`lang "tr" ya da "en" olmalı, gelen: ${d.lang}`);
  if (d.size) {
    try {
      resolveSize(String(d.size));
    } catch {
      errors.push(`Bilinmeyen boyut: ${d.size}. post, kare, story, reels, yatay, linkedin, og ya da 1080x1350 gibi yaz.`);
    }
  }

  if (d.layout) {
    need("title", "logoId");
    const surface: Surface | undefined = d.transparent ? undefined : d.layout === "band" ? "light" : "dark";
    logo("logoId", surface);
    if (surface === "dark" && d.unitLogoId) {
      logo("unitLogoId");
      errors.push("unitLogoId: birim logoları yalnızca renkli; koyu zeminde (overlay) kullanılamaz. band düzenini seç ya da birim logosunu çıkar.");
    } else logo("unitLogoId", surface);
  } else if (d.slides) {
    need("bugLogoId", "cardLogoId", "outro");
    if (!d.slides.length) errors.push("Zorunlu alan eksik: slides (en az bir slayt)");
    logo("bugLogoId");
    logo("cardLogoId", "light");
  } else if (d.video) {
    need("videoSeconds", "bugLogoId", "cardLogoId", "lowerThirds", "outro");
    logo("bugLogoId");
    logo("cardLogoId", "light");
    for (const l of d.lowerThirds ?? [])
      if (!(l.fromSec >= 0 && l.toSec > l.fromSec && l.toSec <= d.videoSeconds)) errors.push(`İsim bandı "${l.name}" için süre hatalı: ${l.fromSec}–${l.toSec} sn, video ${d.videoSeconds} sn.`);
    if (d.srt) errors.push(...srtProblems(d.srt));
  } else if (d.text) {
    need("logoId");
    logo("logoId", d.logoSurface);
    logo("unitLogoId", d.logoSurface);
    logo("cardLogoId", "light");
  } else errors.push("Tasarım türü anlaşılamadı: layout (Post), slides (Motion), video (Branded) ya da text (özel kompozisyon) alanı olmalı.");

  for (const s of strings({ ...d, srt: undefined })) errors.push(...dateProblems(s));
  return errors;
};
