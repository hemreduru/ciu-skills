import type { CSSProperties, FC, ReactNode } from "react";
import React, { createContext } from "react";
import { getInputProps } from "remotion";

export const LayerContext = createContext<string | undefined>(undefined);

export const LayerProvider: FC<{ value?: string; children: ReactNode }> = ({ value, children }) =>
  React.createElement(LayerContext.Provider, { value }, children);

const registeredLayers: Set<string> = new Set();
export const getRegisteredLayers = (): string[] => Array.from(registeredLayers);
export const clearRegisteredLayers = (): void => registeredLayers.clear();

export const registerLayer = (name: string): void => {
  registeredLayers.add(name);
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      __REMOTION_LAYERS__?: string[];
      __REMOTION_LOGGED_LAYERS__?: Set<string>;
    };
    if (!w.__REMOTION_LAYERS__) w.__REMOTION_LAYERS__ = [];
    if (!w.__REMOTION_LAYERS__.includes(name)) w.__REMOTION_LAYERS__.push(name);

    if (!w.__REMOTION_LOGGED_LAYERS__) w.__REMOTION_LOGGED_LAYERS__ = new Set();
    if (!w.__REMOTION_LOGGED_LAYERS__.has(name)) {
      w.__REMOTION_LOGGED_LAYERS__.add(name);
      console.log(`__LAYER__:${name}`);
    }
  }
};

export const getActiveLayer = (contextLayer?: string): string | undefined => {
  if (contextLayer) return contextLayer;
  if (typeof window !== "undefined") {
    try {
      const input = getInputProps() as { exportLayer?: string } | undefined;
      return input?.exportLayer;
    } catch {
      // server-side or outside remotion context
    }
  }
  return undefined;
};

export const resolveLayerStyle = (
  name: string,
  activeLayer?: string,
  customStyle?: CSSProperties
): { style?: CSSProperties; isHidden: boolean; shouldWrap: boolean } => {
  if (!activeLayer) {
    return { isHidden: false, shouldWrap: !!customStyle, style: customStyle ? { display: "contents", ...customStyle } : undefined };
  }
  const isHidden = activeLayer !== name;
  return {
    isHidden,
    shouldWrap: true,
    style: {
      display: customStyle?.display ?? "contents",
      ...customStyle,
      ...(isHidden ? { visibility: "hidden" } : { visibility: customStyle?.visibility ?? "visible" }),
    },
  };
};

export type LayerKind = "text" | "shape" | "image";

export type LayerProps = {
  name: string;
  kind?: LayerKind;
  children: ReactNode;
  style?: CSSProperties;
};

export type LayerMeta =
  | {
      name: string;
      kind: "text";
      text: string;
      fontName: string;
      fontFamily: string;
      fontWeight: string | number;
      fontSize: number;
      lineHeight: number;
      letterSpacing: number;
      color: { r: number; g: number; b: number };
      textAlign: string;
      rect: { left: number; top: number; right: number; bottom: number; width: number; height: number };
    }
  | {
      name: string;
      kind: "shape";
      color: { r: number; g: number; b: number };
      borderRadius: number;
      rect: { left: number; top: number; right: number; bottom: number; width: number; height: number };
    }
  | {
      name: string;
      kind: "image";
    };

export const parseColor = (str?: string): { r: number; g: number; b: number } | null => {
  if (!str) return null;
  const rgb = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgb) {
    return { r: parseInt(rgb[1], 10), g: parseInt(rgb[2], 10), b: parseInt(rgb[3], 10) };
  }
  const hex = str.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  if (hex) {
    return { r: parseInt(hex[1], 16), g: parseInt(hex[2], 16), b: parseInt(hex[3], 16) };
  }
  return null;
};

export const resolvePostScriptName = (
  fontFamily?: string,
  fontWeight?: string | number,
  fontStyle?: string
): string => {
  const fam = String(fontFamily || "").toLowerCase();
  const weight = parseInt(String(fontWeight), 10) || 400;
  const isItalic = fontStyle === "italic";

  if (fam.includes("poppins")) {
    if (weight >= 800) return isItalic ? "Poppins-BlackItalic" : "Poppins-Black";
    if (weight >= 700) return "Poppins-Bold";
    if (weight >= 600) return "Poppins-SemiBold";
    if (weight <= 300) return "Poppins-Light";
    return "Poppins-Regular";
  }

  if (fam.includes("source sans") || fam.includes("sourcesans")) {
    if (weight >= 700) return "SourceSans3-Bold";
    if (weight >= 600) return "SourceSans3-SemiBold";
    if (weight <= 300) return "SourceSans3-Light";
    return "SourceSans3-Regular";
  }

  const clean = String(fontFamily || "").replace(/['",]/g, "").split(/\s+/)[0];
  return clean || "SourceSans3-Regular";
};

const getLinesFromTextNode = (textNode: Text): string[] => {
  const rawText = textNode.textContent || "";
  if (!rawText.trim()) return [];

  const tokens = rawText.match(/\S+|\s+/g) || [rawText];
  const lines: string[] = [];
  let currentLine = "";
  let lastTop: number | null = null;
  let charIdx = 0;
  const range = document.createRange();

  for (const token of tokens) {
    const isWs = /^\s+$/.test(token);
    const start = charIdx;
    const end = charIdx + token.length;
    charIdx = end;

    if (isWs) {
      if (currentLine) currentLine += token;
      continue;
    }

    try {
      range.setStart(textNode, start);
      range.setEnd(textNode, end);
      const rects = range.getClientRects();
      if (rects.length > 0) {
        const top = Math.round(rects[0].top);
        if (lastTop === null) {
          lastTop = top;
          currentLine = token;
        } else if (Math.abs(top - lastTop) > 4) {
          lines.push(currentLine.trim());
          currentLine = token;
          lastTop = top;
        } else {
          currentLine += token;
        }
      } else {
        currentLine += token;
      }
    } catch {
      currentLine += token;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  return lines.length > 0 ? lines : [rawText.trim()];
};

const inspectTextLayer = (name: string, el: HTMLElement): LayerMeta | null => {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.textContent && node.textContent.trim().length > 0) {
      textNodes.push(node as Text);
    }
  }

  if (textNodes.length === 0) return null;

  const allLines: string[] = [];
  let primaryEl: HTMLElement = el;
  let maxFontSize = 0;

  for (const tn of textNodes) {
    const lines = getLinesFromTextNode(tn);
    allLines.push(...lines);

    const parent = tn.parentElement || el;
    const style = window.getComputedStyle(parent);
    const sz = parseFloat(style.fontSize) || 0;
    if (sz >= maxFontSize) {
      maxFontSize = sz;
      primaryEl = parent;
    }
  }

  if (allLines.length === 0) return null;

  const comp = window.getComputedStyle(primaryEl);
  const fontSize = parseFloat(comp.fontSize) || 16;
  const lineHeight = parseFloat(comp.lineHeight) || Math.round(fontSize * 1.2);
  const letterSpacing = parseFloat(comp.letterSpacing) || 0;
  const color = parseColor(comp.color) || { r: 0, g: 0, b: 0 };
  const fontName = resolvePostScriptName(comp.fontFamily, comp.fontWeight, comp.fontStyle);

  const fullRange = document.createRange();
  fullRange.setStart(textNodes[0], 0);
  const lastNode = textNodes[textNodes.length - 1];
  fullRange.setEnd(lastNode, (lastNode.textContent || "").length);
  const fullRect = fullRange.getBoundingClientRect();

  return {
    name,
    kind: "text",
    text: allLines.join("\r"),
    fontName,
    fontFamily: comp.fontFamily,
    fontWeight: comp.fontWeight,
    fontSize: Math.round(fontSize),
    lineHeight: Math.round(lineHeight),
    letterSpacing,
    color,
    textAlign: comp.textAlign || "left",
    rect: {
      left: Math.round(fullRect.left),
      top: Math.round(fullRect.top),
      right: Math.round(fullRect.right),
      bottom: Math.round(fullRect.bottom),
      width: Math.round(fullRect.width),
      height: Math.round(fullRect.height),
    },
  };
};

const inspectShapeLayer = (name: string, el: HTMLElement): LayerMeta | null => {
  const candidates = [el, ...Array.from(el.querySelectorAll("*"))] as HTMLElement[];
  for (const cand of candidates) {
    const comp = window.getComputedStyle(cand);
    const bg = comp.backgroundColor;
    if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") continue;

    const rect = cand.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;

    const color = parseColor(bg);
    if (!color) continue;

    const borderRadius = parseFloat(comp.borderRadius) || 0;
    return {
      name,
      kind: "shape",
      color,
      borderRadius,
      rect: {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
    };
  }
  return null;
};

export const inspectLayer = (name: string, kind: LayerKind, el: HTMLElement): LayerMeta | null => {
  if (kind === "shape") return inspectShapeLayer(name, el);
  if (kind === "text") return inspectTextLayer(name, el);
  return { name, kind: "image" };
};

export const createLayerElement = (
  props: LayerProps,
  activeLayer?: string,
  ref?: React.Ref<HTMLDivElement>
): React.ReactElement => {
  registerLayer(props.name);
  const resolved = resolveLayerStyle(props.name, activeLayer, props.style);
  if (!resolved.shouldWrap) {
    return React.createElement(React.Fragment, null, props.children);
  }
  return React.createElement(
    "div",
    {
      ref,
      "data-layer": props.name,
      "data-layer-kind": props.kind ?? "image",
      style: resolved.style,
    },
    props.children
  );
};
