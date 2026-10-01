import type { FC } from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontCss } from "../brand";
import { Logo } from "./Logo";

export const BrandCard: FC<{ logoId: string; lines?: string[] }> = ({ logoId, lines = [] }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const show = (delay: number) => spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ backgroundColor: colors.white, alignItems: "center", justifyContent: "center", gap: 3 * u }}>
      <div style={{ opacity: show(0), transform: `translateY(${(1 - show(0)) * 4 * u}px)`, marginBottom: 2 * u }}>
        <Logo id={logoId} height={20 * u} maxWidth={width * 0.8} />
      </div>
      {lines.map((line, i) => (
        <div key={line} style={{ opacity: show(10 + i * 5), fontFamily: fontCss.body, fontSize: 3.4 * u, color: colors.ink }}>
          {line}
        </div>
      ))}
    </AbsoluteFill>
  );
};
