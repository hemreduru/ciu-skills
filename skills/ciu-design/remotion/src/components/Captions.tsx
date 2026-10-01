import { parseSrt } from "@remotion/captions";
import { useMemo, type FC } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontCss } from "../brand";
import { safeArea } from "../lib/rules";

export const Captions: FC<{ srt: string }> = ({ srt }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const captions = useMemo(() => parseSrt({ input: srt }).captions, [srt]);
  const ms = (frame / fps) * 1000;
  const current = captions.find((c) => c.startMs <= ms && ms < c.endMs);
  if (!current) return null;
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  return (
    <div style={{ position: "absolute", left: safe.side, right: safe.side, bottom: safe.bottom, textAlign: "center" }}>
      <span style={{ backgroundColor: `${colors.ink}CC`, color: colors.white, fontFamily: fontCss.body, fontWeight: 600, fontSize: 3.4 * u, lineHeight: 1.5, padding: `${0.4 * u}px ${1.2 * u}px`, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>
        {current.text.trim()}
      </span>
    </div>
  );
};
