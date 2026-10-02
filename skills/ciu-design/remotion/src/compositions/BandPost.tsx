import { useEffect, useRef, useState, type FC } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, useVideoConfig } from "remotion";
import { colors } from "../brand";
import { Layer, LayerProvider } from "../components/Layer";
import { LogoRow } from "../components/Logo";
import { PhotoFrame } from "../components/PhotoFrame";
import { TextBlock } from "../components/TextBlock";
import { bandColumns, bandLayout, logoRowSize, type TextMeasure } from "../lib/bandLayout";
import { findLogo, safeArea, type LogoEntry } from "../lib/rules";
import { useUserFont } from "../lib/useUserFont";
import logos from "../logos.json";
import type { PostProps } from "../schema";

const ALL = logos as LogoEntry[];

type Measures = { full: TextMeasure; beside: TextMeasure };

const NOT_MEASURED: Measures = { full: { height: 0, overflowX: false }, beside: { height: 0, overflowX: false } };

const MEASURE_STYLE = { position: "absolute", left: 0, top: 0, opacity: 0, pointerEvents: "none", display: "flow-root" } as const;

/** Layout size of a rendered element in px (unaffected by CSS transforms such as the Studio zoom). */
const read = (el: HTMLElement): TextMeasure => ({ height: el.offsetHeight + 1, overflowX: el.scrollWidth > el.clientWidth });

/** Band layout: white band under the photo/panel. The logo keeps its clear space; the text goes beside or above it, see `bandLayout`. */
export const BandPost: FC<PostProps> = (p) => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const fonts = useUserFont(p.font);
  const text = { fonts, title: p.title, subtitle: p.subtitle, meta: p.meta, lang: p.lang, accent: colors[p.accent ?? "red"], u, titleScale: p.titleScale, color: colors.ink };

  const aspects = [p.logoId, p.unitLogoId].filter((id): id is string => !!id).map((id) => findLogo(ALL, id).aspect);
  const logo = logoRowSize({ aspects, requested: 8 * u, canvasShort: Math.min(width, height) });
  const cols = bandColumns({ width, height, safe, logo });

  const fullRef = useRef<HTMLDivElement>(null);
  const besideRef = useRef<HTMLDivElement>(null);
  const [measures, setMeasures] = useState<Measures>(NOT_MEASURED);
  const [first] = useState(() => delayRender("band text measure"));
  const pending = useRef<number[]>([first]);

  // Release the render hold only after the measured layout is committed to the DOM.
  useEffect(() => {
    if (measures !== NOT_MEASURED) pending.current.splice(0).forEach((h) => continueRender(h));
  }, [measures]);

  useEffect(() => {
    if (!fonts.loaded) return;
    let cancelled = false;
    const handle = delayRender("band text re-measure");
    pending.current.push(handle);
    const faces = [`900 16px ${fonts.heading}`, `300 16px ${fonts.body}`, `600 16px ${fonts.body}`];
    Promise.all(faces.map((f) => document.fonts.load(f)))
      .then(() => document.fonts.ready)
      .then(() => {
        if (cancelled || !fullRef.current || !besideRef.current) return;
        setMeasures({ full: read(fullRef.current), beside: read(besideRef.current) });
      }, cancelRender);
    return () => {
      cancelled = true;
    };
  }, [fonts.loaded, fonts.heading, fonts.body, p.title, p.subtitle, p.meta, p.lang, p.titleScale, width, height, cols.fullWidth, cols.besideWidth]);

  const layout = bandLayout({ width, height, safe, u, logo, ...measures });

  return (
    <LayerProvider value={p.exportLayer}>
      <AbsoluteFill>
        <Layer name="arka-plan">
          <AbsoluteFill style={{ backgroundColor: colors.white }} />
        </Layer>
        <Layer name="panel">
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: layout.topH, backgroundColor: colors.wine }} />
        </Layer>
        {p.photo && (
          <Layer name="foto">
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: layout.topH, overflow: "hidden" }}>
              <PhotoFrame photo={p.photo} />
            </div>
          </Layer>
        )}
        <div style={{ position: "absolute", left: layout.text.left, top: layout.text.top, width: layout.text.width }}>
          <TextBlock {...text} u={u * layout.textScale} />
        </div>
        <Layer name="logo">
          <div style={{ position: "absolute", right: safe.side, bottom: safe.bottom }}>
            <LogoRow logoId={p.logoId} unitLogoId={p.unitLogoId} height={8 * u} divider={colors.gray} />
          </div>
        </Layer>
        <div ref={fullRef} style={{ ...MEASURE_STYLE, width: cols.fullWidth }}>
          <TextBlock {...text} />
        </div>
        <div ref={besideRef} style={{ ...MEASURE_STYLE, width: Math.max(cols.besideWidth, 1) }}>
          <TextBlock {...text} />
        </div>
      </AbsoluteFill>
    </LayerProvider>
  );
};
