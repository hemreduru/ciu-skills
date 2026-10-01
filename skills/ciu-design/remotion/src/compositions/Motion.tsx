import type { FC } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontCss } from "../brand";
import { BrandCard } from "../components/BrandCard";
import { Logo } from "../components/Logo";
import { PhotoFrame } from "../components/PhotoFrame";
import { exit, STAGGER, wipe } from "../lib/motion";
import { safeArea } from "../lib/rules";
import type { Lang, MotionProps, Slide } from "../schema";

const OUTRO_SECONDS = 3;

export const motionSeconds = (p: MotionProps): number => p.slides.reduce((sum, s) => sum + s.seconds, 0) + OUTRO_SECONDS;

const SlideView: FC<{ slide: Slide; lang: Lang; frames: number }> = ({ slide, lang, frames }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const fade = interpolate(frame, [0, 0.4 * fps], [0, 1], { extrapolateRight: "clamp" });
  const bars = [
    { text: slide.title, bg: colors.wine, size: 9 },
    { text: slide.subtitle, bg: colors.orange, size: 6 },
  ].filter((b) => b.text);
  return (
    <AbsoluteFill lang={lang} style={{ opacity: fade }}>
      <PhotoFrame photo={slide.photo} zoomFrames={frames} />
      <div style={{ position: "absolute", left: safe.side, right: safe.side, bottom: safe.bottom, transform: "rotate(-3deg)", ...exit(frame, frames) }}>
        {bars.map((b, i) => (
          <div key={i} style={{ display: "flex", marginLeft: i * 6 * u, marginTop: 1.2 * u, ...wipe(frame, fps, 8 + i * STAGGER) }}>
            <div style={{ backgroundColor: b.bg, color: colors.white, fontFamily: fontCss.heading, fontWeight: 700, fontSize: b.size * u, lineHeight: 1.15, padding: `${0.6 * u}px ${2.4 * u}px` }}>
              {b.text}
            </div>
          </div>
        ))}
      </div>
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
          <SlideView slide={slide} lang={p.lang} frames={f(slide.seconds)} />
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
