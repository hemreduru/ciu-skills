import type { FC } from "react";
import { Img, staticFile, useVideoConfig } from "remotion";
import logos from "../logos.json";
import { findLogo, logoHeight, type LogoEntry } from "../lib/rules";

const ALL = logos as LogoEntry[];

export const Logo: FC<{ id: string; height: number; maxWidth?: number }> = ({ id, height, maxWidth }) => {
  const { width: w, height: h } = useVideoConfig();
  const logo = findLogo(ALL, id);
  const px = logoHeight({ requested: height, canvasShort: Math.min(w, h), aspect: logo.aspect, maxWidth });
  return <Img src={staticFile(`brand/${logo.file}`)} style={{ display: "block", height: px, width: px * logo.aspect }} />;
};

export const LogoRow: FC<{ logoId: string; unitLogoId?: string; height: number; divider: string }> = ({
  logoId,
  unitLogoId,
  height,
  divider,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: height * 0.35 }}>
    <Logo id={logoId} height={height} />
    {unitLogoId && <div style={{ width: Math.max(1, height * 0.02), height: height * 0.8, backgroundColor: divider }} />}
    {unitLogoId && <Logo id={unitLogoId} height={height} />}
  </div>
);
