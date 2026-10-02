import type { FC } from "react";
import { useContext } from "react";
import {
  LayerContext,
  LayerProvider,
  createLayerElement,
  getActiveLayer,
  type LayerProps,
} from "../lib/layer";

export { LayerContext, LayerProvider, type LayerProps };

export const Layer: FC<LayerProps> = (props) => {
  const ctx = useContext(LayerContext);
  const active = getActiveLayer(ctx);
  return createLayerElement(props, active);
};
