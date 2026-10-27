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

test("approval queue includes All Personas", function () {
  assert.match(html, /<option>All Personas<\/option><option>Requestor<\/option>/);
  assert.match(html, /persona==='All Personas'\?Object\.keys\(WF\.steps\)/);
});

test("approval actions are loaded and completed from Workflow Manager", function () {
  assert.match(html, /wf\('diagrams\/'\+encodeURIComponent\(WFM\.diagramId\)\)/);
  assert.match(html, /ApprovalWorkflow\.approvalActions\(approvalStep\)/);
  assert.match(html, /msgType:'StepInformation'/);
  assert.match(html, /questionResponse:Number\(questionResponse\)/);
  assert.match(html, /completeWorkflowDecision/);
});

test("approval header credits ArcGIS Workflow Manager", function () {
  assert.match(html, /Sentinel Emergency Management Agency · FEMA NIMS Common Operating Picture\. Powered by ArcGIS Workflow Manager/);
});
