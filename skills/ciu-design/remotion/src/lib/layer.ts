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

export type LayerProps = {
  name: string;
  children: ReactNode;
  style?: CSSProperties;
};

export const createLayerElement = (props: LayerProps, activeLayer?: string): React.ReactElement => {
  registerLayer(props.name);
  const resolved = resolveLayerStyle(props.name, activeLayer, props.style);
  if (!resolved.shouldWrap) {
    return React.createElement(React.Fragment, null, props.children);
  }
  return React.createElement(
    "div",
    {
      "data-layer": props.name,
      style: resolved.style,
    },
    props.children
  );
};
