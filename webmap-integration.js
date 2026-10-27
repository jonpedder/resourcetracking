(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.WebMapIntegration = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function normalizeUrl(url) {
    return String(url || "").replace(/\/+$/, "").toLowerCase();
  }

  function findLayer(collection, expectedUrl, expectedTitle) {
    const layers = collection && typeof collection.toArray === "function"
      ? collection.toArray()
      : Array.from(collection || []);
    const url = normalizeUrl(expectedUrl);
    return layers.find(function (layer) { return normalizeUrl(layer && layer.url) === url; }) ||
      layers.find(function (layer) {
        return String(layer && layer.title || "").toLowerCase() === String(expectedTitle || "").toLowerCase();
      }) || null;
  }

  function applyApplicationProperties(target, source) {
    if (!target || !source) return target;
    ["outFields", "renderer", "popupTemplate", "labelingInfo", "labelsVisible"].forEach(function (name) {
      if (source[name] != null) target[name] = source[name];
    });
    return target;
  }

  return {
    normalizeUrl: normalizeUrl,
    findLayer: findLayer,
    applyApplicationProperties: applyApplicationProperties
  };
});
