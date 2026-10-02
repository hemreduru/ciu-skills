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
  return {
    bundler: req("@remotion/bundler"),
    renderer: req("@remotion/renderer"),
    agPsd: req("ag-psd"),
    pngjs: req("pngjs"),
  };
};

export const initPsd = (agPsd) => {
  agPsd.initializeCanvas(
    undefined,
    (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) })
  );
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
    children.push({
      name: layer.name,
      imageData: imgData,
    });
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

  return agPsd.writePsdBuffer(psd);
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
        const layerStill = await renderer.renderStill({
          composition: comp,
          serveUrl: bundleLocation,
          imageFormat: "png",
          inputProps: {
            ...design,
            exportLayer: layerName,
          },
        });
        const png = pngjs.PNG.sync.read(layerStill.buffer);
        layerEntries.push({
          name: layerName,
          imageData: { width: png.width, height: png.height, data: png.data },
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

const main = async () => {
  const args = process.argv.slice(2);
  const arg = (n) => {
    const i = args.indexOf(`--${n}`);
    return i < 0 ? undefined : args[i + 1];
  };

  const mode = args[0] && !args[0].startsWith("--") && !args[0].endsWith(".json") ? args[0].toLowerCase() : "both";
  const fileArg = args.find((a) => a.endsWith(".json") && !a.startsWith("--")) ?? (args[0] && args[0].endsWith(".json") ? args[0] : args[1]);

  if (!fileArg || !["psd", "pdf", "both"].includes(mode)) {
    console.log("Kullanım: node export.mjs <psd|pdf|both> <design.json> --id <CompositionId> --work <WORK> --out <OUT> [--name <name>]");
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

  if (mode === "pdf" || mode === "both") {
    const pdfName = nameArg && mode === "pdf" ? nameArg : "final.pdf";
    const res = await exportPdf({ design, id, work, out, name: pdfName, modules });
    console.log(`OK\nPDF=${res.path}`);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error("HATA:", e.message || e);
    process.exit(1);
  });
}
