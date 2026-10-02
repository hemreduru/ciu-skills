import type { FC } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { colors, fontCss } from "../brand";
import { Layer, LayerProvider } from "../components/Layer";
import { Logo } from "../components/Logo";
import { PhotoFrame } from "../components/PhotoFrame";
import { safeArea } from "../lib/rules";
import type { CustomProps } from "../schema";

// Building blocks only; every export here becomes a Still with the export name as id.
export const Starter: FC<CustomProps> = ({ lang, logoId, photos = [], text, exportLayer }) => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  return (
    <LayerProvider value={exportLayer}>
      <AbsoluteFill lang={lang}>
        <Layer name="arka-plan">
          <AbsoluteFill style={{ backgroundColor: colors.wine }} />
        </Layer>
        {photos[0] && (
          <Layer name="foto">
            <div style={{ position: "absolute", inset: 0, bottom: "40%" }}>
              <PhotoFrame photo={photos[0]} />
            </div>
          </Layer>
        )}
        <div style={{ position: "absolute", left: safe.side, right: safe.side, bottom: safe.bottom, color: colors.white }}>
          <Layer name="baslik">
            <div style={{ fontFamily: fontCss.heading, fontWeight: 700, fontSize: 7 * u, lineHeight: 1.05 }}>{text.title}</div>
          </Layer>
          {text.date && (
            <Layer name="metin">
              <div style={{ fontFamily: fontCss.body, fontSize: 3.4 * u, marginTop: 2 * u }}>{text.date}</div>
            </Layer>
          )}
          <Layer name="logo">
            <div style={{ marginTop: 5 * u }}>
              <Logo id={logoId} height={7 * u} />
            </div>
          </Layer>
        </div>
      </AbsoluteFill>
    </LayerProvider>
  );
};
