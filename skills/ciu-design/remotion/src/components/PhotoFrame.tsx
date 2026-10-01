import type { FC } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import type { Photo } from "../schema";

export const PhotoFrame: FC<{ photo: Photo; zoomFrames?: number }> = ({ photo, zoomFrames }) => {
  const frame = useCurrentFrame();
  const scale = zoomFrames ? interpolate(frame, [0, zoomFrames], [1, 1.08], { extrapolateRight: "clamp" }) : 1;
  const pos = `${(photo.focusX ?? 0.5) * 100}% ${(photo.focusY ?? 0.5) * 100}%`;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`input/${photo.src}`)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${scale})`, transformOrigin: pos }}
      />
    </AbsoluteFill>
  );
};
