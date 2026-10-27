"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const workflow = require("./request-workflow.js");

test("header button opens the workflow panel and updates accessibility state", function () {
  const panel = {
    open: false,
    classList: { toggle: function (name, value) { assert.equal(name, "open"); panel.open = value; } }
  };
  const attrs = {};
  const button = { setAttribute: function (name, value) { attrs[name] = value; } };

  assert.equal(workflow.setPanelOpen(panel, button, true), true);
  assert.equal(panel.open, true);
  assert.equal(attrs["aria-expanded"], "true");
});

test("header button closes the workflow panel", function () {
  const panel = {
    open: true,
    classList: { toggle: function (name, value) { panel.open = value; } }
  };
  const attrs = {};
  const button = { setAttribute: function (name, value) { attrs[name] = value; } };

  workflow.setPanelOpen(panel, button, false);
  assert.equal(panel.open, false);
  assert.equal(attrs["aria-expanded"], "false");
});

test("workflow defaults to requests awaiting Approver action", function () {
  assert.deepEqual(workflow.defaultQueue(), { persona: "Approver", status: "Under Review" });
  assert.equal(workflow.pendingWhere("Under Review"), "RequestStatus = 'Under Review'");
});

test("header label displays the pending approval count", function () {
  assert.equal(workflow.buttonLabel("Request Approval", 7), "Request Approval (7)");
  assert.equal(workflow.buttonLabel("Request Approval", 0), "Request Approval (0)");
  assert.equal(workflow.buttonLabel("", 3), "Request Approval (3)");
});

test("header button opens Resource Request Approval in a new tab", function () {
  let args;
  const opened = { location: "approval" };
  const result = workflow.openApprovalPage(function () {
    args = Array.from(arguments);
    return opened;
  }, "./approval.html");
  assert.deepEqual(args, ["./approval.html", "_blank", "noopener"]);
  assert.equal(result, opened);
});
