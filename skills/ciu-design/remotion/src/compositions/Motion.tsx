import type { FC } from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../brand";
import { BrandCard } from "../components/BrandCard";
import { Captions, captionReserve } from "../components/Captions";
import { Logo } from "../components/Logo";
import { PhotoFrame } from "../components/PhotoFrame";
import { Music } from "../components/Music";
import { VideoFrame } from "../components/VideoFrame";
import { enter, ease, exit, STAGGER, wipe } from "../lib/motion";
import { safeArea } from "../lib/rules";
import { useUserFont } from "../lib/useUserFont";
import type { FontChoice, Lang, MotionProps, Slide } from "../schema";

const OUTRO_SECONDS = 3;

export const motionSeconds = (p: MotionProps): number => p.slides.reduce((sum, s) => sum + s.seconds, 0) + OUTRO_SECONDS;

const SlideView: FC<{ slide: Slide; lang: Lang; frames: number; index: number; font?: FontChoice }> = ({ slide, lang, frames, index, font }) => {
  const fonts = useUserFont(font);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const fade = interpolate(frame, [0, 0.4 * fps], [0, 1], { extrapolateRight: "clamp" });
  const bars = [
    { text: slide.title, bg: colors.wine, size: 11, weight: 900 },
    { text: slide.subtitle, bg: colors.orange, size: 5.5, weight: 600 },
  ].filter((b) => b.text);
  return (
    <AbsoluteFill lang={lang} style={{ opacity: fade }}>
      {slide.video ? (
        <VideoFrame file={slide.video} trimStartSec={slide.trimStartSec} trimEndSec={slide.trimEndSec} sound={slide.videoSound} />
      ) : (
        slide.photo && <PhotoFrame photo={slide.photo} zoomFrames={frames} />
      )}
      <div style={{ position: "absolute", left: safe.side - 2.5 * u, width: 2, top: safe.top, bottom: safe.bottom, backgroundColor: "rgba(255,255,255,0.5)", transformOrigin: "top", transform: `scaleY(${interpolate(frame, [0, 0.6 * fps], [0, 1], { extrapolateRight: "clamp", easing: ease.out })})` }} />
      <div style={{ position: "absolute", left: safe.side, right: safe.side, bottom: safe.bottom + (slide.video && slide.srt ? captionReserve(u) : 0), transform: "rotate(-3deg)", ...exit(frame, frames) }}>
        {bars.map((b, i) => (
          <div key={i} style={{ display: "flex", marginLeft: i * 6 * u, marginTop: 1.2 * u, ...(index % 2 ? enter(frame, fps, 8 + i * STAGGER) : wipe(frame, fps, 8 + i * STAGGER)) }}>
            <div style={{ backgroundColor: b.bg, color: colors.white, fontFamily: fonts.heading, fontWeight: b.weight, fontSize: b.size * u, lineHeight: 1.1, letterSpacing: "-0.02em", padding: `${0.6 * u}px ${2.4 * u}px` }}>
              {b.text}
            </div>
          </div>
        ))}
      </div>
      {slide.video && slide.srt && <Captions srt={slide.srt} offsetSec={slide.trimStartSec} />}
    </AbsoluteFill>
  );
};

export const Motion: FC<MotionProps> = (p) => {
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const f = (s: number) => Math.round(s * fps);
  const starts = p.slides.map((_, i) => p.slides.slice(0, i).reduce((sum, s) => sum + f(s.seconds), 0));
  const slidesEnd = p.slides.reduce((sum, s) => sum + f(s.seconds), 0);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink }}>
      {p.slides.map((slide, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={f(slide.seconds)}>
          <SlideView slide={slide} lang={p.lang} frames={f(slide.seconds)} index={i} font={p.font} />
        </Sequence>
      ))}
      <Sequence durationInFrames={slidesEnd}>
        <div style={{ position: "absolute", top: safe.top, left: safe.side }}>
          <Logo id={p.bugLogoId} height={7 * u} />
        </div>
      </Sequence>
      <Sequence from={slidesEnd} durationInFrames={f(OUTRO_SECONDS)}>
        <BrandCard logoId={p.cardLogoId} lines={p.outro} />
      </Sequence>
      <Music {...p} duck={p.slides.some((s) => s.videoSound) ? [0, slidesEnd] : undefined} />
    </AbsoluteFill>
  );
};
