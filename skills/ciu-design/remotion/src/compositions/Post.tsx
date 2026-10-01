import type { FC } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { colors } from "../brand";
import { LogoRow } from "../components/Logo";
import { PhotoFrame } from "../components/PhotoFrame";
import { TextBlock } from "../components/TextBlock";
import { safeArea } from "../lib/rules";
import { useUserFont } from "../lib/useUserFont";
import type { PostProps } from "../schema";

export const Post: FC<PostProps> = (p) => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const fonts = useUserFont(p.font);
  const text = { fonts, title: p.title, subtitle: p.subtitle, meta: p.meta, lang: p.lang, accent: colors[p.accent ?? "red"], u, titleScale: p.titleScale };

  if (p.layout === "band" && !p.transparent) {
    const bandH = Math.round(height * 0.38);
    return (
      <AbsoluteFill style={{ backgroundColor: colors.white }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: height - bandH, backgroundColor: colors.wine }}>
          {p.photo && <PhotoFrame photo={p.photo} />}
        </div>
        <div style={{ position: "absolute", left: safe.side, right: safe.side, top: height - bandH + 5 * u }}>
          <TextBlock {...text} color={colors.ink} />
        </div>
        <div style={{ position: "absolute", right: safe.side, bottom: safe.bottom }}>
          <LogoRow logoId={p.logoId} unitLogoId={p.unitLogoId} height={8 * u} divider={colors.gray} />
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: p.transparent ? undefined : colors.wine }}>
      {p.photo && !p.transparent && <PhotoFrame photo={p.photo} />}
      <div
        style={{
          position: "absolute",
          left: p.transparent ? safe.side : 0,
          right: p.transparent ? safe.side : safe.side * 2.5,
          bottom: safe.bottom,
          padding: p.transparent ? 0 : `${5 * u}px ${5 * u}px ${5 * u}px ${safe.side}px`,
          backgroundColor: p.transparent ? undefined : colors.wine,
        }}
      >
        <div style={{ marginBottom: 5 * u }}>
          <LogoRow logoId={p.logoId} unitLogoId={p.unitLogoId} height={7 * u} divider={colors.white} />
        </div>
        <TextBlock {...text} accent={colors[p.accent ?? "orange"]} color={colors.white} />
      </div>
    </AbsoluteFill>
  );
};
