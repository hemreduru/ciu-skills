import type { FC } from "react";
import { Audio, interpolate, staticFile, useVideoConfig } from "remotion";
import type { MusicProps } from "../schema";

const DUCK_GAIN = 0.3;

/** Fades in/out over the whole composition, loops if shorter; `duck` frames [from, to] play at low volume (speech, captions). */
export const Music: FC<MusicProps & { duck?: [number, number] }> = ({ music, musicTrack, musicVolume = 0.5, duck }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const src = music ? staticFile(`input/${music}`) : musicTrack ? staticFile(`music/${musicTrack}.mp3`) : null;
  if (!src) return null;
  const ramp = Math.round(0.4 * fps);
  const volume = (f: number): number => {
    const fade = interpolate(f, [0, Math.round(0.5 * fps), durationInFrames - Math.round(1.5 * fps), durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const gain = duck ? interpolate(f, [duck[0] - ramp, duck[0], duck[1], duck[1] + ramp], [1, DUCK_GAIN, DUCK_GAIN, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
    return musicVolume * fade * gain;
  };
  return <Audio src={src} volume={volume} loop />;
};
