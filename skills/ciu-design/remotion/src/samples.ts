import { contact } from "./brand";
import type { BrandedProps, CustomProps, MotionProps, PostProps } from "./schema";

export const LOGO_COLOR = "official-ciu-color-1line-bilingual-tr";
export const LOGO_WHITE = "official-ciu-white-1line-bilingual-tr";

export const samplePost: PostProps = {
  size: "post",
  lang: "tr",
  layout: "overlay",
  title: "Oryantasyon Günleri Başlıyor",
  subtitle: "Yeni öğrencilerimizi kampüste ağırlamaya hazırız.",
  meta: "11.09.2026 09:00 · UKÜ Kampüsü",
  photo: { src: "sample.jpg" },
  logoId: LOGO_WHITE,
};

export const sampleMotion: MotionProps = {
  size: "reels",
  lang: "tr",
  slides: [
    { photo: { src: "sample.jpg" }, title: "Yeni Dönem", subtitle: "Hoş geldiniz!", seconds: 3 },
    { photo: { src: "sample.jpg", focusX: 0.3 }, title: "Oryantasyon", seconds: 3 },
  ],
  bugLogoId: LOGO_WHITE,
  cardLogoId: LOGO_COLOR,
  outro: [contact.web, contact.instagram],
};

export const sampleBranded: BrandedProps = {
  size: "reels",
  lang: "tr",
  video: "sample.mp4",
  videoSeconds: 4,
  bugLogoId: LOGO_WHITE,
  cardLogoId: LOGO_COLOR,
  lowerThirds: [{ name: "Prof. Dr. Ad Soyad", role: "Rektör", fromSec: 0.5, toSec: 3.5 }],
  srt: "1\n00:00:00,500 --> 00:00:02,000\nUKÜ'ye hoş geldiniz\n\n2\n00:00:02,000 --> 00:00:03,800\nYeni dönemde başarılar\n",
  outro: [contact.web, contact.instagram],
};

export const sampleCustom: CustomProps = {
  size: "post",
  lang: "tr",
  logoId: LOGO_WHITE,
  cardLogoId: LOGO_COLOR,
  photos: [{ src: "sample.jpg" }],
  text: { title: "Oryantasyon Günleri Başlıyor", subtitle: "Kampüste görüşmek üzere", date: "11.09.2026 09:00" },
  seconds: 6,
};
