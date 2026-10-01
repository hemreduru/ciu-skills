import type { FC } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import type { Photo } from "../schema";

type Props = {
  photo: Photo;
  zoomFrames?: number;
  /** [shadow, highlight] colors: maps photo darks → first, lights → second. */
  duotone?: [string, string];
};

export const PhotoFrame: FC<Props> = ({ photo, zoomFrames, duotone }) => {
  const frame = useCurrentFrame();
  const scale = zoomFrames ? interpolate(frame, [0, zoomFrames], [1, 1.08], { extrapolateRight: "clamp" }) : 1;
  const pos = `${(photo.focusX ?? 0.5) * 100}% ${(photo.focusY ?? 0.5) * 100}%`;
  return (
    <AbsoluteFill style={{ overflow: "hidden", isolation: "isolate" }}>
      <Img
        src={staticFile(`input/${photo.src}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: pos,
          transform: `scale(${scale})`,
          transformOrigin: pos,
          filter: duotone ? "grayscale(1) contrast(1.15)" : undefined,
        }}
      />
      {duotone && <AbsoluteFill style={{ backgroundColor: duotone[1], mixBlendMode: "multiply" }} />}
      {duotone && <AbsoluteFill style={{ backgroundColor: duotone[0], mixBlendMode: "lighten" }} />}
    </AbsoluteFill>
  );
};
