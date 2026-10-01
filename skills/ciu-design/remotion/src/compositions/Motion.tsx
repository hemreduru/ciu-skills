import type { FC } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../brand";
import { BrandCard } from "../components/BrandCard";
import { Logo } from "../components/Logo";
import { PhotoFrame } from "../components/PhotoFrame";
import { TextBlock } from "../components/TextBlock";
import { safeArea } from "../lib/rules";
import type { Lang, MotionProps, Slide } from "../schema";

const OUTRO_SECONDS = 3;

export const motionSeconds = (p: MotionProps): number => p.slides.reduce((sum, s) => sum + s.seconds, 0) + OUTRO_SECONDS;

const SlideView: FC<{ slide: Slide; lang: Lang; frames: number; accent: string }> = ({ slide, lang, frames, accent }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const fade = interpolate(frame, [0, 0.4 * fps], [0, 1], { extrapolateRight: "clamp" });
  const rise = spring({ frame: frame - 0.3 * fps, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <PhotoFrame photo={slide.photo} zoomFrames={frames} />
      {slide.title && (
        <>
          <AbsoluteFill style={{ background: `linear-gradient(to top, ${colors.ink}E6 0%, ${colors.ink}00 60%)` }} />
          <div style={{ position: "absolute", left: safe.side, right: safe.side, bottom: safe.bottom, opacity: rise, transform: `translateY(${(1 - rise) * 5 * u}px)` }}>
            <TextBlock title={slide.title} subtitle={slide.subtitle} lang={lang} color={colors.white} accent={accent} u={u} />
          </div>
        </>
      )}
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
          <SlideView slide={slide} lang={p.lang} frames={f(slide.seconds)} accent={colors[p.accent ?? "red"]} />
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
      {p.music && <Audio src={staticFile(`input/${p.music}`)} />}
    </AbsoluteFill>
  );
};
