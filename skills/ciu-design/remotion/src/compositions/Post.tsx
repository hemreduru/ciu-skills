import type { FC } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { colors } from "../brand";
import { LogoRow } from "../components/Logo";
import { PhotoFrame } from "../components/PhotoFrame";
import { TextBlock } from "../components/TextBlock";
import { safeArea } from "../lib/rules";
import type { PostProps } from "../schema";

export const Post: FC<PostProps> = (p) => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const text = { title: p.title, subtitle: p.subtitle, meta: p.meta, lang: p.lang, accent: colors[p.accent ?? "red"], u, titleScale: p.titleScale };

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
      {!p.transparent && (
        <AbsoluteFill style={{ background: `linear-gradient(to top, ${colors.ink}E6 0%, ${colors.ink}00 65%)` }} />
      )}
      <div style={{ position: "absolute", top: safe.top, left: safe.side }}>
        <LogoRow logoId={p.logoId} unitLogoId={p.unitLogoId} height={8 * u} divider={colors.white} />
      </div>
      <div style={{ position: "absolute", left: safe.side, right: safe.side, bottom: safe.bottom }}>
        <TextBlock {...text} color={colors.white} />
      </div>
    </AbsoluteFill>
  );
};
