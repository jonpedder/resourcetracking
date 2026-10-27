"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const integration = require("./webmap-integration.js");

test("finds the Web Map operational layer by service URL", function () {
  const resources = { title: "Resources", url: "https://example.com/FeatureServer/0/" };
  const facilities = { title: "Facilities", url: "https://example.com/FeatureServer/1" };
  const collection = { toArray: function () { return [resources, facilities]; } };
  assert.equal(integration.findLayer(collection, "https://example.com/FeatureServer/0", "Resources"), resources);
});

test("falls back to the Web Map layer title", function () {
  const resources = { title: "Resources", url: "https://example.com/other/0" };
  assert.equal(integration.findLayer([resources], "https://example.com/FeatureServer/0", "Resources"), resources);
});

test("applies app renderer, popup, labels, and fields to the Web Map layer", function () {
  const target = { title: "Resources" };
  const source = {
    outFields: ["*"], renderer: { type: "unique-value" }, popupTemplate: { title: "{ResourceName}" },
    labelingInfo: [{ labelExpressionInfo: { expression: "$feature.ResourceName" } }], labelsVisible: true
  };
  integration.applyApplicationProperties(target, source);
  assert.equal(target.renderer, source.renderer);
  assert.equal(target.popupTemplate, source.popupTemplate);
  assert.equal(target.labelingInfo, source.labelingInfo);
  assert.deepEqual(target.outFields, ["*"]);
});
