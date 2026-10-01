import type { FC } from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { colors } from "../brand";
import { BrandCard } from "../components/BrandCard";
import { Captions, captionReserve } from "../components/Captions";
import { Logo } from "../components/Logo";
import { LowerThird } from "../components/LowerThird";
import { Music } from "../components/Music";
import { safeArea } from "../lib/rules";
import type { BrandedProps } from "../schema";

const INTRO_SECONDS = 2;
const OUTRO_SECONDS = 3;

export const brandedSeconds = (p: BrandedProps): number => INTRO_SECONDS + p.videoSeconds + OUTRO_SECONDS;

export const Branded: FC<BrandedProps> = (p) => {
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const f = (s: number) => Math.round(s * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink }}>
      <Sequence durationInFrames={f(INTRO_SECONDS)}>
        <BrandCard logoId={p.cardLogoId} />
      </Sequence>
      <Sequence from={f(INTRO_SECONDS)} durationInFrames={f(p.videoSeconds)}>
        <OffthreadVideo src={staticFile(`input/${p.video}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", top: safe.top, right: safe.side }}>
          <Logo id={p.bugLogoId} height={6 * u} />
        </div>
        {p.lowerThirds.map((l, i) => (
          <Sequence key={i} from={f(l.fromSec)} durationInFrames={f(l.toSec - l.fromSec)}>
            <LowerThird name={l.name} role={l.role} frames={f(l.toSec - l.fromSec)} lift={p.srt ? captionReserve(u) : 0} />
          </Sequence>
        ))}
        {p.srt && <Captions srt={p.srt} />}
      </Sequence>
      <Sequence from={f(INTRO_SECONDS + p.videoSeconds)} durationInFrames={f(OUTRO_SECONDS)}>
        <BrandCard logoId={p.cardLogoId} lines={p.outro} />
      </Sequence>
      <Music {...p} musicVolume={p.musicVolume ?? 0.4} duck={p.musicDuck === false ? undefined : [f(INTRO_SECONDS), f(INTRO_SECONDS + p.videoSeconds)]} />
    </AbsoluteFill>
  );
};
