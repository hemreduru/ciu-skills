import type { CSSProperties } from "react";
import { Easing, interpolate, spring } from "remotion";

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
};

export const STAGGER = 4;

/** Entrance: fade + rise + slight scale on a damped spring; `delay` in frames. */
export const enter = (frame: number, fps: number, delay = 0, distance = 40): CSSProperties => {
  const t = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.7 } });
  return { opacity: t, transform: `translateY(${(1 - t) * distance}px) scale(${0.96 + 0.04 * t})` };
};

/** Exit over `frames` ending at `end`, faster than the entrance. */
export const exit = (frame: number, end: number, frames = 8, distance = 24): CSSProperties => {
  const t = interpolate(frame, [end - frames, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.in });
  return { opacity: 1 - t, transform: `translateY(${-t * distance}px)` };
};

/** Horizontal wipe-in for label bars (clip-path reveal from the left). */
export const wipe = (frame: number, fps: number, delay = 0): CSSProperties => {
  const t = interpolate(frame - delay, [0, 0.5 * fps], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  return { clipPath: `inset(0 ${100 - t}% 0 0)` };
};

/** Idle sine drift so held elements never freeze; returns px. */
export const breathe = (frame: number, fps: number, amplitude = 4, seconds = 4): number =>
  Math.sin((frame / (seconds * fps)) * Math.PI * 2) * amplitude;
