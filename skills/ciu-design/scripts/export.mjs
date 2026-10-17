#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(SCRIPT_DIR, "..");
export const DEFAULT_WORK = join(SKILL_DIR, "remotion");

export const getModules = (workDir = DEFAULT_WORK) => {
  const targetPkg = existsSync(join(workDir, "package.json"))
    ? join(workDir, "package.json")
    : join(DEFAULT_WORK, "package.json");
  const req = createRequire(targetPkg);
  let bundler;
  let renderer;
  let agPsd;
  let pngjs;
  return {
    get bundler() {
      return (bundler ??= req("@remotion/bundler"));
    },
    get renderer() {
      return (renderer ??= req("@remotion/renderer"));
    },
    get agPsd() {
      return (agPsd ??= req("ag-psd"));
    },
    get pngjs() {
      return (pngjs ??= req("pngjs"));
    },
  };
};

export const initPsd = (agPsd) => {
  agPsd.initializeCanvas(
    undefined,
    (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) })
  );
};

export const parseColor = (color) => {
  if (!color) return null;
  if (typeof color === "object" && typeof color.r === "number") {
    return { r: color.r, g: color.g, b: color.b };
  }
  if (typeof color === "string") {
    const rgb = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgb) {
      return { r: parseInt(rgb[1], 10), g: parseInt(rgb[2], 10), b: parseInt(rgb[3], 10) };
    }
    const hex = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
    if (hex) {
      return { r: parseInt(hex[1], 16), g: parseInt(hex[2], 16), b: parseInt(hex[3], 16) };
    }
  }
  return null;
};

export const resolvePostScriptName = (fontFamily, fontWeight, fontStyle) => {
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

export const buildTextLayerData = (meta) => {
  if (!meta || !meta.text) return null;
  const fontSize = meta.fontSize || 24;
  const tracking = meta.fontSize && meta.letterSpacing
    ? Math.round((meta.letterSpacing / meta.fontSize) * 1000)
    : 0;

  let justification = "left";
  if (meta.textAlign === "center") justification = "center";
  else if (meta.textAlign === "right") justification = "right";
  else if (meta.textAlign === "justify") justification = "justifyLeft";

  const rect = meta.rect || { left: 0, top: 0, width: 100, height: 50 };
  let tx = Math.round(rect.left);
  if (justification === "center") tx = Math.round(rect.left + rect.width / 2);
  else if (justification === "right") tx = Math.round(rect.right);

  const ty = Math.round(rect.top + fontSize);
  const fontName = meta.fontName || resolvePostScriptName(meta.fontFamily, meta.fontWeight, meta.fontStyle);
  const fillColor = parseColor(meta.color) || { r: 0, g: 0, b: 0 };

  return {
    text: String(meta.text).replace(/\r\n|\n/g, "\r"),
    transform: [1, 0, 0, 1, tx, ty],
    style: {
      font: { name: fontName },
      fontSize,
      fillColor,
      ...(meta.lineHeight ? { leading: meta.lineHeight } : {}),
      ...(tracking !== 0 ? { tracking } : {}),
    },
    paragraphStyle: {
      justification,
    },
  };
};

export const buildShapeLayerData = (meta) => {
  if (!meta || !meta.rect) return null;
  const color = parseColor(meta.color);
  if (!color) return null;

  const { left, top, right, bottom } = meta.rect;
  const r = Math.min(meta.borderRadius || 0, (right - left) / 2, (bottom - top) / 2);

  let knots;
  if (r > 0) {
    const k = 0.5522847498307935 * r;
    knots = [
      { linked: true, points: [left + r, top, left + r, top, left + r - k, top] },
      { linked: true, points: [left, top + r - k, left, top + r, left, top + r] },
      { linked: true, points: [left, bottom - r, left, bottom - r, left, bottom - r + k] },
      { linked: true, points: [left + r - k, bottom, left + r, bottom, left + r, bottom] },
      { linked: true, points: [right - r, bottom, right - r, bottom, right - r + k, bottom] },
      { linked: true, points: [right, bottom - r + k, right, bottom - r, right, bottom - r] },
      { linked: true, points: [right, top + r, right, top + r, right, top + r - k] },
      { linked: true, points: [right - r + k, top, right - r, top, right - r, top] },
    ];
  } else {
    knots = [
      { linked: true, points: [left, top, left, top, left, top] },
      { linked: true, points: [right, top, right, top, right, top] },
      { linked: true, points: [right, bottom, right, bottom, right, bottom] },
      { linked: true, points: [left, bottom, left, bottom, left, bottom] },
    ];
  }

  return {
    vectorFill: {
      type: "color",
      color,
    },
    vectorMask: {
      paths: [
        {
          open: false,
          operation: "combine",
          fillRule: "non-zero",
          knots,
        },
      ],
    },
  };
};

export const assemblePsd = ({ width, height, layers, composite, agPsd, pngjs }) => {
  initPsd(agPsd);
  const children = [];
  for (const layer of layers) {
    let imgData = layer.imageData;
    if (!imgData && layer.pngBuffer) {
      const png = pngjs.PNG.sync.read(layer.pngBuffer);
      imgData = { width: png.width, height: png.height, data: png.data };
    }

    let layerObj = null;
    const meta = layer.meta;

    if (meta?.kind === "text") {
      try {
        const textObj = buildTextLayerData(meta);
        if (textObj) {
          layerObj = {
            name: layer.name,
            imageData: imgData,
            text: textObj,
          };
        }
      } catch (err) {
        console.warn(`Text layer build failed for ${layer.name}:`, err);
      }
    } else if (meta?.kind === "shape") {
      try {
        const shapeObj = buildShapeLayerData(meta);
        if (shapeObj) {
          layerObj = {
            name: layer.name,
            ...shapeObj,
          };
        }
      } catch (err) {
        console.warn(`Shape layer build failed for ${layer.name}:`, err);
      }
    }

    if (!layerObj) {
      layerObj = {
        name: layer.name,
        imageData: imgData,
      };
    }

    children.push(layerObj);
  }

  let compositeData = undefined;
  if (composite) {
    if (Buffer.isBuffer(composite)) {
      const png = pngjs.PNG.sync.read(composite);
      compositeData = { width: png.width, height: png.height, data: png.data };
    } else if (composite.data && composite.width && composite.height) {
      compositeData = composite;
    }
  }

  const psd = {
    width,
    height,
    children,
    ...(compositeData ? { imageData: compositeData } : {}),
  };

  return agPsd.writePsdBuffer(psd, { invalidateTextLayers: true });
};

export const readPsdLayers = (buffer, agPsd) => {
  initPsd(agPsd);
  const res = agPsd.readPsd(buffer, { useImageData: true, skipCompositeImageData: true });
  return {
    width: res.width,
    height: res.height,
    layers: (res.children ?? []).map((c) => ({
      name: c.name,
      width: c.imageData?.width,
      height: c.imageData?.height,
    })),
  };
};

export const exportPsd = async ({ design, id = "Post", work = DEFAULT_WORK, out = process.cwd(), name = "final.psd", modules }) => {
  const resolvedOut = resolve(process.cwd(), out);
  const resolvedWork = resolve(process.cwd(), work);
  const { bundler, renderer, agPsd, pngjs } = modules ?? getModules(resolvedWork);
  mkdirSync(resolvedOut, { recursive: true });
  const entryPoint = join(resolvedWork, "src", "index.ts");
  const bundleLocation = await bundler.bundle({ entryPoint });

  try {
    const comp = await renderer.selectComposition({
      serveUrl: bundleLocation,
      id,
      inputProps: design,
    });

    const discoveredLayers = [];
    const compositeRes = await renderer.renderStill({
      composition: comp,
      serveUrl: bundleLocation,
      imageFormat: "png",
      inputProps: design,
      onBrowserLog: (log) => {
        if (typeof log.text === "string" && log.text.startsWith("__LAYER__:")) {
          discoveredLayers.push(log.text.slice(10));
        }
      },
    });

    const layerNames = [...new Set(discoveredLayers)];
    const layerEntries = [];

    if (layerNames.length === 0) {
      console.log("UYARI: Kompozisyonda hiç <Layer> bulunamadı, tek katmanlı PSD üretildi.");
      const png = pngjs.PNG.sync.read(compositeRes.buffer);
      layerEntries.push({
        name: "Katman 1",
        imageData: { width: png.width, height: png.height, data: png.data },
      });
    } else {
      for (const layerName of layerNames) {
        let meta = null;
        const layerStill = await renderer.renderStill({
          composition: comp,
          serveUrl: bundleLocation,
          imageFormat: "png",
          inputProps: {
            ...design,
            exportLayer: layerName,
          },
          onBrowserLog: (log) => {
            if (typeof log.text === "string" && log.text.startsWith("__LAYER_META__:")) {
              try {
                meta = JSON.parse(log.text.slice(15));
              } catch {}
            }
          },
        });
        const png = pngjs.PNG.sync.read(layerStill.buffer);
        layerEntries.push({
          name: layerName,
          imageData: { width: png.width, height: png.height, data: png.data },
          meta,
        });
      }
    }

    const psdBuffer = assemblePsd({
      width: comp.width,
      height: comp.height,
      layers: layerEntries,
      composite: compositeRes.buffer,
      agPsd,
      pngjs,
    });

    const outPath = join(resolvedOut, name);
    writeFileSync(outPath, psdBuffer);
    return { path: outPath, layers: layerNames, width: comp.width, height: comp.height };
  } finally {
    try {
      rmSync(bundleLocation, { recursive: true, force: true });
    } catch {}
  }
};

export const exportPdf = async ({ design, id = "Post", work = DEFAULT_WORK, out = process.cwd(), name = "final.pdf", modules }) => {
  const resolvedOut = resolve(process.cwd(), out);
  const resolvedWork = resolve(process.cwd(), work);
  const { bundler, renderer } = modules ?? getModules(resolvedWork);
  mkdirSync(resolvedOut, { recursive: true });
  const entryPoint = join(resolvedWork, "src", "index.ts");
  const bundleLocation = await bundler.bundle({ entryPoint });

  try {
    const comp = await renderer.selectComposition({
      serveUrl: bundleLocation,
      id,
      inputProps: design,
    });

    const outPath = join(resolvedOut, name);
    await renderer.renderStill({
      composition: comp,
      serveUrl: bundleLocation,
      imageFormat: "pdf",
      output: outPath,
      inputProps: design,
    });

    return { path: outPath, width: comp.width, height: comp.height };
  } finally {
    try {
      rmSync(bundleLocation, { recursive: true, force: true });
    } catch {}
  }
};

// Illustrator opens a PDF-compatible .ai natively (live text), so .ai reuses the vector PDF render.
export const exportAi = (opts) => exportPdf({ ...opts, name: opts.name ?? "final.ai" });

const MODES = ["psd", "ai", "both", "pdf"];

const main = async () => {
  const args = process.argv.slice(2);
  const arg = (n) => {
    const i = args.indexOf(`--${n}`);
    return i < 0 ? undefined : args[i + 1];
  };

  const mode = args[0] && !args[0].startsWith("--") && !args[0].endsWith(".json") ? args[0].toLowerCase() : "both";
  const fileArg = args.find((a) => a.endsWith(".json") && !a.startsWith("--")) ?? (args[0] && args[0].endsWith(".json") ? args[0] : args[1]);

  if (!fileArg || !MODES.includes(mode)) {
    console.log("Kullanım: node export.mjs <psd|ai|both> <design.json> --id <CompositionId> --work <WORK> --out <OUT> [--name <name>]");
    process.exit(2);
  }

  const work = arg("work") ?? process.env.WORK ?? DEFAULT_WORK;
  const out = arg("out") ?? process.cwd();
  const id = arg("id") ?? "Post";
  const nameArg = arg("name");

  let design;
  try {
    design = JSON.parse(readFileSync(fileArg, "utf8"));
  } catch (e) {
    console.log(`HATA: design.json okunamadı: ${e.message}`);
    process.exit(1);
  }

  const modules = getModules(resolve(process.cwd(), work));

  if (mode === "psd" || mode === "both") {
    const psdName = nameArg && mode === "psd" ? nameArg : "final.psd";
    const res = await exportPsd({ design, id, work, out, name: psdName, modules });
    console.log(`OK\nPSD=${res.path}`);
  }

  if (mode === "ai" || mode === "both") {
    const aiName = nameArg && mode === "ai" ? nameArg : "final.ai";
    const res = await exportAi({ design, id, work, out, name: aiName, modules });
    console.log(`OK\nAI=${res.path}`);
  }

  if (mode === "pdf") {
    const res = await exportPdf({ design, id, work, out, name: nameArg ?? "final.pdf", modules });
    console.log(`OK\nPDF=${res.path}`);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error("HATA:", e.message || e);
    process.exit(1);
  });
}
