import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  clearRegisteredLayers,
  createLayerElement,
  getRegisteredLayers,
  resolveLayerStyle,
} from "./layer.ts";

test("resolveLayerStyle: without activeLayer renders normally without wrapper", () => {
  const res = resolveLayerStyle("baslik", undefined);
  assert.equal(res.isHidden, false);
  assert.equal(res.shouldWrap, false);
  assert.equal(res.style, undefined);
});

test("resolveLayerStyle: with matching activeLayer is visible", () => {
  const res = resolveLayerStyle("baslik", "baslik");
  assert.equal(res.isHidden, false);
  assert.equal(res.shouldWrap, true);
  assert.equal(res.style?.visibility, "visible");
  assert.equal(res.style?.display, "contents");
});

test("resolveLayerStyle: with non-matching activeLayer is hidden", () => {
  const res = resolveLayerStyle("arka-plan", "baslik");
  assert.equal(res.isHidden, true);
  assert.equal(res.shouldWrap, true);
  assert.equal(res.style?.visibility, "hidden");
  assert.equal(res.style?.display, "contents");
});

test("createLayerElement: unwrapped when no exportLayer, wrapped with visibility when exportLayer set", () => {
  clearRegisteredLayers();

  // No active layer -> Fragment with no container div
  const elNormal = createLayerElement({ name: "baslik", children: React.createElement("h1", null, "Test") });
  const htmlNormal = renderToStaticMarkup(elNormal);
  assert.equal(htmlNormal, "<h1>Test</h1>");

  // Matching active layer
  const elActive = createLayerElement({ name: "baslik", children: React.createElement("h1", null, "Test") }, "baslik");
  const htmlActive = renderToStaticMarkup(elActive);
  assert.ok(htmlActive.includes('data-layer="baslik"'));
  assert.ok(htmlActive.includes("visibility:visible"));

  // Non-matching active layer
  const elHidden = createLayerElement({ name: "arka-plan", children: React.createElement("div", null, "bg") }, "baslik");
  const htmlHidden = renderToStaticMarkup(elHidden);
  assert.ok(htmlHidden.includes('data-layer="arka-plan"'));
  assert.ok(htmlHidden.includes("visibility:hidden"));

  assert.deepEqual(getRegisteredLayers(), ["baslik", "arka-plan"]);
});
