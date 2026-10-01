import type { FC } from "react";
import { fontCss, typography } from "../brand";
import { trUpper } from "../lib/rules";
import type { Lang } from "../schema";

type Props = {
  title: string;
  subtitle?: string;
  meta?: string;
  lang: Lang;
  color: string;
  accent: string;
  u: number;
  titleScale?: number;
};

export const TextBlock: FC<Props> = ({ title, subtitle, meta, lang, color, accent, u, titleScale = 1 }) => (
  <div lang={lang} style={{ color, fontFamily: fontCss.body }}>
    <div style={{ width: 12 * u, height: 0.8 * u, backgroundColor: accent, marginBottom: 2.5 * u }} />
    <div style={{ fontFamily: fontCss.heading, fontSize: 7 * u * titleScale, fontWeight: 700, lineHeight: 1.05 }}>
      {typography.titleUpper ? trUpper(title, lang) : title}
    </div>
    {subtitle && <div style={{ fontSize: 3.6 * u, marginTop: 2 * u, lineHeight: 1.25 }}>{subtitle}</div>}
    {meta && <div style={{ fontSize: 3 * u, fontWeight: 600, marginTop: 3 * u }}>{meta}</div>}
  </div>
);
