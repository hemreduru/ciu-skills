import { useMemo, type FC } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontCss } from "../brand";
import { activeWord, parseSrtCues } from "../lib/captions";
import { safeArea } from "../lib/rules";

/** Burned-in subtitles: one line in the safe area, the spoken word turns orange (no other movement). `offsetSec` = clip time at frame 0. */
export const Captions: FC<{ srt: string; offsetSec?: number }> = ({ srt, offsetSec = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cues = useMemo(() => parseSrtCues(srt), [srt]);
  const ms = (frame / fps + offsetSec) * 1000;
  const current = cues.find((c) => c.startMs <= ms && ms < c.endMs);
  if (!current) return null;
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const active = activeWord(current, ms);
  return (
    <div style={{ position: "absolute", left: safe.side, right: safe.side, bottom: safe.bottom, textAlign: "center" }}>
      <span style={{ backgroundColor: `${colors.ink}CC`, color: colors.white, fontFamily: fontCss.body, fontWeight: 600, fontSize: 4.2 * u, lineHeight: 1.5, padding: `${0.4 * u}px ${1.2 * u}px`, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>
        {current.text.split(" ").map((w, i, all) => (
          <span key={i} style={{ color: i === active ? colors.orange : undefined }}>
            {w}
            {i < all.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </div>
  );
};
