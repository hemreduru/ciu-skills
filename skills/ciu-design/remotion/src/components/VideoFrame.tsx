import type { FC } from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useVideoConfig } from "remotion";

/** Full-bleed user clip; trims in seconds, muted unless `sound`. */
export const VideoFrame: FC<{ file: string; trimStartSec?: number; trimEndSec?: number; sound?: boolean }> = ({ file, trimStartSec, trimEndSec, sound }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(`input/${file}`)}
        trimBefore={trimStartSec ? Math.round(trimStartSec * fps) : undefined}
        trimAfter={trimEndSec ? Math.round(trimEndSec * fps) : undefined}
        muted={!sound}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};
