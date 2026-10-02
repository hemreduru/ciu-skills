import type { FC } from "react";
import { fontCss, typography } from "../brand";
import { trUpper } from "../lib/rules";
import type { Lang } from "../schema";
import { Layer } from "./Layer";

type Props = {
  title: string;
  subtitle?: string;
  meta?: string;
  lang: Lang;
  color: string;
  accent: string;
  u: number;
  titleScale?: number;
  fonts?: { heading: string; body: string };
};

export const TextBlock: FC<Props> = ({ title, subtitle, meta, lang, color, accent, u, titleScale = 1, fonts = fontCss }) => (
  <div lang={lang} style={{ color, fontFamily: fonts.body }}>
    <Layer name="baslik">
      <div style={{ width: 12 * u, height: 0.8 * u, backgroundColor: accent, marginBottom: 2.5 * u }} />
      <div style={{ fontFamily: fonts.heading, fontSize: 8 * u * titleScale, fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.02em", textWrap: "balance" }}>
        {typography.titleUpper ? trUpper(title, lang) : title}
      </div>
    </Layer>
    {(subtitle || meta) && (
      <Layer name="metin">
        {subtitle && <div style={{ fontSize: 3.6 * u, fontWeight: 300, marginTop: 2.5 * u, lineHeight: 1.25 }}>{subtitle}</div>}
        {meta && <div style={{ fontSize: 3 * u, fontWeight: 600, marginTop: 3 * u }}>{meta}</div>}
      </Layer>
    )}
  </div>
);
