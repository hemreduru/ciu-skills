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

const TIME = String.raw`(?:\s*[^\d\s\-–—]?\s*(\d{1,2})[:.](\d{2})(?!\d|\.\d))?`;
const DATE_RE = new RegExp(String.raw`(?<![\d.:/-])(?:(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?![\d])|\d{1,2}[./-]\d{1,2}[./-]\d{2,4}(?![\d.]))` + TIME, "g");
const DATE_OK = /^\d{2}\.\d{2}\.\d{4}(?: \d{2}:\d{2})?$/;
const DMY_RE = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/;
const pad = (n: string) => n.padStart(2, "0");

const suggest = (m: RegExpMatchArray): string => {
  const [raw, year, month, day, hh, mm] = m;
  const dmy = year ? [day, month, year] : DMY_RE.exec(raw)!.slice(1);
  const [d, mo, y] = dmy;
  const date = `${pad(d)}.${pad(mo)}.${y.length === 2 ? "20" + y : y}`;
  return hh ? `${date} ${pad(hh)}:${mm}` : date;
};

export const dateProblems = (text: string): string[] =>
  [...text.matchAll(DATE_RE)]
    .filter((m) => !DATE_OK.test(m[0]))
    .map((m) => `Tarih/saat biçimi hatalı: "${m[0].replace(/\n/g, "↵")}". Doğrusu: ${suggest(m)} (tek satır, aralarında tek boşluk).`);

export const MAX_CAPTION_CHARS = 32;

export const srtProblems = (srt: string): string[] =>
  srt
    .split(/\r?\n\r?\n/)
    .flatMap((block) => {
      const lines = block.trim().split(/\r?\n/);
      const at = lines.findIndex((l) => l.includes("-->"));
      if (at < 0) return [];
      const textLines = lines.slice(at + 1).filter(Boolean);
      const label = `"${textLines.join(" / ").slice(0, 40)}"`;
      if (textLines.length > 1) return [`Altyazı tek satır olmalı: ${label}`];
      if (textLines[0] && textLines[0].length > MAX_CAPTION_CHARS) return [`Altyazı ${MAX_CAPTION_CHARS} karakteri geçiyor (${textLines[0].length}): ${label}`];
      return [];
    });

type Json = Record<string, any>;

const strings = (v: unknown): string[] =>
  typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];

const copyText = (d: Json): string[] =>
  strings([d.title, d.subtitle, d.meta, d.text, d.outro, d.slides?.map((s: Json) => [s.title, s.subtitle]), d.lowerThirds?.map((l: Json) => [l.name, l.role])]);

/** Lookup of user files in public/input/; omitted when the work folder is unknown (file checks are then skipped). */
export type FileInfo = {
  exists: (name: string) => boolean;
  seconds: (name: string) => number | undefined;
  size: (name: string) => { width: number; height: number } | undefined;
  tracks: readonly string[];
};

export const EXT = {
  photo: ["jpg", "jpeg", "png", "webp"],
  video: ["mp4", "mov", "webm", "m4v"],
  audio: ["mp3", "wav", "m4a", "aac", "ogg"],
  font: ["ttf", "otf", "woff2", "woff"],
} as const;
type Kind = keyof typeof EXT;
const KIND_TR: Record<Kind, string> = { photo: "fotoğraf", video: "video", audio: "müzik", font: "font" };
const MIN_PHOTO_SIDE = 1080;
const SLACK = 0.3;

const refs = (d: Json): [Kind, string, string][] => {
  const out: [Kind, string, string][] = [];
  const add = (kind: Kind, name: unknown, where: string) => typeof name === "string" && name && out.push([kind, name, where]);
  add("photo", d.photo?.src, "photo");
  (d.photos ?? []).forEach((p: Json, i: number) => add("photo", p?.src, `photos[${i}]`));
  (d.slides ?? []).forEach((s: Json, i: number) => (add("photo", s?.photo?.src, `slides[${i}].photo`), add("video", s?.video, `slides[${i}].video`)));
  add("video", d.video, "video");
  add("audio", d.music, "music");
  add("font", d.font?.file, "font");
  return out;
};

const extOf = (name: string): string => name.split(".").pop()?.toLowerCase() ?? "";

export const fileProblems = (d: Json, files: FileInfo): string[] => {
  const errors: string[] = [];
  for (const [kind, name, where] of refs(d)) {
    if (!(EXT[kind] as readonly string[]).includes(extOf(name))) errors.push(`${where}: "${name}" ${KIND_TR[kind]} dosyası olamaz. Desteklenen türler: ${EXT[kind].join(", ")}.`);
    else if (!files.exists(name)) errors.push(`${where}: "${name}" bulunamadı. Dosyayı çalışma klasöründeki public/input içine kopyala.`);
    else if (kind === "video" && files.seconds(name) === undefined) errors.push(`${where}: "${name}" okunamadı (bozuk dosya ya da desteklenmeyen codec). Dosyayı mp4 (H.264) olarak yeniden kodla.`);
  }
  if (d.music && d.musicTrack) errors.push("music ve musicTrack birlikte olamaz: kendi müziğin ya da paketten bir parça seç.");
  if (d.musicTrack && !files.tracks.includes(d.musicTrack)) errors.push(`musicTrack bulunamadı: ${d.musicTrack}. Geçerli id'ler: ${files.tracks.join(", ")}.`);
  if (d.font && !["title", "all", undefined].includes(d.font.use)) errors.push(`font.use "title" ya da "all" olmalı, gelen: ${d.font.use}`);

  (d.slides ?? []).forEach((s: Json, i: number) => {
    if (!s.photo && !s.video) errors.push(`slides[${i}]: fotoğraf (photo) ya da video gerekli.`);
    if (s.photo && s.video) errors.push(`slides[${i}]: photo ve video birlikte olamaz.`);
    const total = s.video ? files.seconds(s.video) : undefined;
    if (total === undefined) return;
    const from = s.trimStartSec ?? 0;
    const to = s.trimEndSec ?? total;
    if (to > total + SLACK) errors.push(`slides[${i}]: kırpma bitişi (${to} sn) videonun süresinden (${total.toFixed(1)} sn) uzun.`);
    else if (to - from < s.seconds - SLACK) errors.push(`slides[${i}]: videonun kullanılan kısmı ${(to - from).toFixed(1)} sn, slayt süresi ${s.seconds} sn. Süreyi kısalt ya da kırpmayı genişlet.`);
  });
  if (d.video && typeof d.videoSeconds === "number") {
    const total = files.seconds(d.video);
    if (total !== undefined && Math.abs(total - d.videoSeconds) > SLACK) errors.push(`videoSeconds ${d.videoSeconds} sn ama videonun gerçek süresi ${total.toFixed(1)} sn. videoSeconds'ı gerçek süreye eşitle.`);
  }
  return errors;
};

/** Non-blocking notes the designer should hear about. */
export const designWarnings = (d: Json, files?: FileInfo): string[] => {
  const warnings: string[] = [];
  (d.slides ?? []).forEach((s: Json, i: number) => s.srt && !s.videoSound && warnings.push(`UYARI: slides[${i}] altyazılı ama videonun sesi kapalı (videoSound). Konuşma duyulmayacaksa altyazı yalnızca metin gibi görünür.`));
  if (d.font) warnings.push("UYARI: Marka fontu (Poppins / Source Sans 3) dışında bir font kullanılıyor. Fontun lisansı sende; marka rehberinden sapıyor.");
  if (files)
    for (const [kind, name, where] of refs(d)) {
      const dim = kind === "photo" ? files.size(name) : undefined;
      if (dim && Math.min(dim.width, dim.height) < MIN_PHOTO_SIDE) warnings.push(`UYARI: ${where} "${name}" düşük çözünürlüklü (${dim.width}×${dim.height}); kısa kenar ${MIN_PHOTO_SIDE} px altında, bulanık çıkabilir.`);
    }
  return warnings;
};

export const checkDesign = (d: Json, logos: readonly LogoEntry[], files?: FileInfo): string[] => {
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
  } else if (d.text) {
    need("logoId");
    logo("logoId", d.logoSurface);
    logo("unitLogoId", d.logoSurface);
    logo("cardLogoId", "light");
  } else errors.push("Tasarım türü anlaşılamadı: layout (Post), slides (Motion), video (Branded) ya da text (özel kompozisyon) alanı olmalı.");

  if (files) errors.push(...fileProblems(d, files));
  if (d.srt) errors.push(...srtProblems(d.srt));
  (d.slides ?? []).forEach((s: Json, i: number) => s.srt && errors.push(...srtProblems(s.srt).map((e) => `slides[${i}]: ${e}`)));
  for (const s of copyText(d)) errors.push(...dateProblems(s));
  return errors;
};
