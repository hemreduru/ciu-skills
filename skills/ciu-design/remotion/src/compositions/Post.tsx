import type { FC } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { colors } from "../brand";
import { Layer, LayerProvider } from "../components/Layer";
import { LogoRow } from "../components/Logo";
import { PhotoFrame } from "../components/PhotoFrame";
import { TextBlock } from "../components/TextBlock";
import { safeArea } from "../lib/rules";
import { useUserFont } from "../lib/useUserFont";
import type { PostProps } from "../schema";
import { BandPost } from "./BandPost";

export const Post: FC<PostProps> = (p) => (p.layout === "band" && !p.transparent ? <BandPost {...p} /> : <OverlayPost {...p} />);

const OverlayPost: FC<PostProps> = (p) => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const fonts = useUserFont(p.font);
  const text = { fonts, title: p.title, subtitle: p.subtitle, meta: p.meta, lang: p.lang, accent: colors[p.accent ?? "red"], u, titleScale: p.titleScale };

  return (
    <LayerProvider value={p.exportLayer}>
      <AbsoluteFill>
        {!p.transparent && (
          <Layer name="arka-plan">
            <AbsoluteFill style={{ backgroundColor: colors.wine }} />
          </Layer>
        )}
        {p.photo && !p.transparent && (
          <Layer name="foto">
            <PhotoFrame photo={p.photo} />
          </Layer>
        )}
        <div
          style={{
            position: "absolute",
            left: p.transparent ? safe.side : 0,
            right: p.transparent ? safe.side : safe.side * 2.5,
            bottom: safe.bottom,
            padding: p.transparent ? 0 : `${5 * u}px ${5 * u}px ${5 * u}px ${safe.side}px`,
          }}
        >
          {!p.transparent && (
            <Layer name="panel">
              <div style={{ position: "absolute", inset: 0, backgroundColor: colors.wine }} />
            </Layer>
          )}
          <div style={{ position: "relative" }}>
            <Layer name="logo">
              <div style={{ marginBottom: 5 * u }}>
                <LogoRow logoId={p.logoId} unitLogoId={p.unitLogoId} height={7 * u} divider={colors.white} />
              </div>
            </Layer>
            <TextBlock {...text} accent={colors[p.accent ?? "orange"]} color={colors.white} />
          </div>
        </div>
      </AbsoluteFill>
    </LayerProvider>
  );
};
