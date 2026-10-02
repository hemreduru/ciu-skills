import type { Accent } from "./brand";

export type Lang = "tr" | "en";

export type Photo = { src: string; focusX?: number; focusY?: number };

/** User font in public/input/. `use`: only headings ("title", default) or all text ("all"). */
export type FontChoice = { file: string; use?: "title" | "all" };

/** Music: `music` = user's own file in public/input/, `musicTrack` = id from public/music/index.json. */
export type MusicProps = { music?: string; musicTrack?: string; musicVolume?: number; musicDuck?: boolean };

export type PostProps = {
  size: string;
  lang: Lang;
  layout: "band" | "overlay";
  title: string;
  subtitle?: string;
  meta?: string;
  titleScale?: number;
  photo?: Photo;
  logoId: string;
  unitLogoId?: string;
  accent?: Accent;
  transparent?: boolean;
  font?: FontChoice;
  exportLayer?: string;
};

/** `srt` is timed to the source clip (0 = clip start), so trimStartSec is applied automatically. */
export type Slide = { photo?: Photo; video?: string; trimStartSec?: number; trimEndSec?: number; videoSound?: boolean; srt?: string; title?: string; subtitle?: string; seconds: number };

export type MotionProps = MusicProps & {
  size: string;
  lang: Lang;
  slides: Slide[];
  bugLogoId: string;
  cardLogoId: string;
  outro: string[];
  font?: FontChoice;
};

export type LowerThirdItem = { name: string; role?: string; fromSec: number; toSec: number };

export type BrandedProps = MusicProps & {
  size: string;
  lang: Lang;
  video: string;
  videoSeconds: number;
  bugLogoId: string;
  cardLogoId: string;
  lowerThirds: LowerThirdItem[];
  srt?: string;
  outro: string[];
};

/** Props for compositions in src/custom/: text keys are free-form (title, date, venue, …). */
export type CustomProps = MusicProps & {
  size: string;
  lang: Lang;
  logoId: string;
  unitLogoId?: string;
  cardLogoId?: string;
  /** Zemin under logoId/unitLogoId: lets the validator check logo tone. */
  logoSurface?: "light" | "dark";
  photos?: Photo[];
  text: Record<string, string>;
  seconds?: number;
  font?: FontChoice;
  exportLayer?: string;
};
