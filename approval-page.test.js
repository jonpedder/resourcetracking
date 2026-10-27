"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const html = fs.readFileSync(path.join(__dirname, "approval.html"), "utf8");

test("approval page provides the Incident Approval two-pane workflow layout", function () {
  assert.match(html, /class="queue-panel"/);
  assert.match(html, /id="approval" class="approval-panel"/);
  assert.match(html, /Workflow queue/);
  assert.match(html, /Approval workspace/);
});

test("approval page is wired to ResourceRequests and Workflow Manager", function () {
  assert.match(html, /EOC_Resource_Inventory\/FeatureServer/);
  assert.match(html, /new FeatureLayer\(\{url:CFG\.featureServiceUrl\+'\/2'/);
  assert.match(html, /workflow\.arcgis\.com/);
  assert.match(html, /WFMJobId/);
  assert.match(html, /extendedProperties/);
});

test("approval decisions require a note and support approve or deny", function () {
  assert.match(html, /approval-workflow\.js/);
  assert.match(html, /label:'Approve'/);
  assert.match(html, /label:'Deny'/);
  assert.match(html, /ApprovalWorkflow\.applyDecision/);
});
