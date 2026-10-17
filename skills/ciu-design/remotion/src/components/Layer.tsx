import type { FC } from "react";
import { useContext, useEffect, useRef } from "react";
import { continueRender, delayRender } from "remotion";
import {
  LayerContext,
  LayerProvider,
  createLayerElement,
  getActiveLayer,
  inspectLayer,
  type LayerProps,
  type LayerKind,
  type LayerMeta,
} from "../lib/layer";

export { LayerContext, LayerProvider, type LayerProps, type LayerKind, type LayerMeta };

export const Layer: FC<LayerProps> = (props) => {
  const ctx = useContext(LayerContext);
  const active = getActiveLayer(ctx);
  const ref = useRef<HTMLDivElement>(null);
  const kind = props.kind ?? "image";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (active !== props.name) return;
    if (kind !== "text" && kind !== "shape") return;

    let handle: number | null = null;
    try {
      handle = delayRender(`layer-meta-${props.name}`);
    } catch {}

    const done = () => {
      if (handle !== null) {
        try {
          continueRender(handle);
        } catch {}
      }
    };

    const runIntrospection = () => {
      try {
        const el = ref.current;
        if (!el) {
          done();
          return;
        }

        let curr: HTMLElement | null = el;
        let isMeasurement = false;
        while (curr) {
          if (curr.style?.opacity === "0" || window.getComputedStyle(curr).opacity === "0") {
            isMeasurement = true;
            break;
          }
          curr = curr.parentElement;
        }
        if (isMeasurement) {
          done();
          return;
        }

        const meta = inspectLayer(props.name, kind, el);
        if (meta) {
          console.log(`__LAYER_META__:${JSON.stringify(meta)}`);
        }
      } catch (err) {
        console.warn(`Layer introspection error for ${props.name}:`, err);
      } finally {
        done();
      }
    };

    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(runIntrospection, runIntrospection);
    } else {
      setTimeout(runIntrospection, 20);
    }
  }, [props.name, kind, active]);

  return createLayerElement(props, active, ref);
};
