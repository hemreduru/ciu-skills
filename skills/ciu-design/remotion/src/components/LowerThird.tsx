import type { FC } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontCss } from "../brand";
import { safeArea } from "../lib/rules";

export const LowerThird: FC<{ name: string; role?: string; frames: number; lift?: number }> = ({ name, role, frames, lift = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const cfg = { damping: 200 };
  const p = spring({ frame, fps, config: cfg }) - spring({ frame: frame - (frames - 0.5 * fps), fps, config: cfg });
  return (
    <div style={{ position: "absolute", left: safe.side, bottom: safe.bottom + 8 * u + lift, opacity: p, transform: `translateX(${(p - 1) * 10 * u}px)`, fontFamily: fontCss.body }}>
      <div style={{ display: "inline-block", backgroundColor: colors.red, color: colors.white, fontWeight: 700, fontSize: 3.6 * u, padding: `${1.2 * u}px ${2.4 * u}px` }}>
        {name}
      </div>
      {role && (
        <div>
          <div style={{ display: "inline-block", backgroundColor: colors.white, color: colors.ink, fontSize: 2.8 * u, padding: `${0.9 * u}px ${2.4 * u}px` }}>
            {role}
          </div>
        </div>
      )}
    </div>
  );
};
