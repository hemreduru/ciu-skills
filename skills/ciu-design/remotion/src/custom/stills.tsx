import type { FC } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { colors, fontCss } from "../brand";
import { Logo } from "../components/Logo";
import { PhotoFrame } from "../components/PhotoFrame";
import { safeArea } from "../lib/rules";
import type { CustomProps } from "../schema";

// Building blocks only; every export here becomes a Still with the export name as id.
export const Starter: FC<CustomProps> = ({ lang, logoId, photos = [], text }) => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  return (
    <AbsoluteFill lang={lang} style={{ backgroundColor: colors.wine }}>
      {photos[0] && (
        <div style={{ position: "absolute", inset: 0, bottom: "40%" }}>
          <PhotoFrame photo={photos[0]} />
        </div>
      )}
      <div style={{ position: "absolute", left: safe.side, right: safe.side, bottom: safe.bottom, color: colors.white }}>
        <div style={{ fontFamily: fontCss.heading, fontWeight: 700, fontSize: 7 * u, lineHeight: 1.05 }}>{text.title}</div>
        <div style={{ fontFamily: fontCss.body, fontSize: 3.4 * u, marginTop: 2 * u }}>{text.date}</div>
        <div style={{ marginTop: 5 * u }}>
          <Logo id={logoId} height={7 * u} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
