import type { FC } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontCss } from "../brand";
import { BrandCard } from "../components/BrandCard";
import { PhotoFrame } from "../components/PhotoFrame";
import { enter, exit, STAGGER } from "../lib/motion";
import { safeArea } from "../lib/rules";
import type { CustomProps } from "../schema";

// Building blocks only; every export here becomes a Composition (duration = props.seconds).
const Scene: FC<CustomProps & { frames: number }> = ({ lang, photos = [], text, frames }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  return (
    <AbsoluteFill lang={lang} style={{ backgroundColor: colors.ink }}>
      {photos[0] && <PhotoFrame photo={photos[0]} zoomFrames={frames} />}
      <div style={{ position: "absolute", left: safe.side, bottom: safe.bottom, ...exit(frame, frames) }}>
        {[text.title, text.subtitle].filter(Boolean).map((line, i) => (
          <div key={line} style={{ ...enter(frame, fps, 6 + i * STAGGER), display: "flex" }}>
            <div style={{ backgroundColor: colors.wine, color: colors.white, fontFamily: fontCss.heading, fontWeight: 700, fontSize: 6 * u, padding: `0 ${2 * u}px`, marginTop: u }}>{line}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const StarterVideo: FC<CustomProps> = (p) => {
  const { fps } = useVideoConfig();
  const total = Math.round((p.seconds ?? 6) * fps);
  const outro = 3 * fps;
  return (
    <>
      <Sequence durationInFrames={total - outro}>
        <Scene {...p} frames={total - outro} />
      </Sequence>
      <Sequence from={total - outro}>
        <BrandCard logoId={p.cardLogoId ?? p.logoId} />
      </Sequence>
    </>
  );
};
