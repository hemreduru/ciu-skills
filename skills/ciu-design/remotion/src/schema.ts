import type { Accent } from "./brand";

export type Lang = "tr" | "en";

export type Photo = { src: string; focusX?: number; focusY?: number };

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
};

export type Slide = { photo: Photo; title?: string; subtitle?: string; seconds: number };

export type MotionProps = {
  size: string;
  lang: Lang;
  slides: Slide[];
  bugLogoId: string;
  cardLogoId: string;
  outro: string[];
  music?: string;
};

export type LowerThirdItem = { name: string; role?: string; fromSec: number; toSec: number };

export type BrandedProps = {
  size: string;
  lang: Lang;
  video: string;
  videoSeconds: number;
  bugLogoId: string;
  cardLogoId: string;
  lowerThirds: LowerThirdItem[];
  srt?: string;
  outro: string[];
  music?: string;
  musicVolume?: number;
};

/** Props for compositions in src/custom/: text keys are free-form (title, date, venue, …). */
export type CustomProps = {
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
  music?: string;
};
