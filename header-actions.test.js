"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

test("header shows Assets immediately left of Request Approval", function () {
  assert.match(html, /id="assetsBtn"[^>]*>Assets<\/button>\s*<button id="newRequestBtn"[^>]*>Request Approval<\/button>/);
});

test("Assets opens the main app in a new tab", function () {
  assert.match(html, /getElementById\("assetsBtn"\)\.addEventListener[\s\S]*?window\.open\("\.\/index\.html", "_blank", "noopener"\)/);
});

test("legacy saved request labels migrate to Request Approval", function () {
  assert.match(html, /newRequestButton = "Request Approval"/);
  assert.match(html, /newRequestButton: "Request Approval"/);
});
