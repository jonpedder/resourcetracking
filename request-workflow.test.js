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
  assert.equal(workflow.buttonLabel("Resource Request (213RR)", 7), "Resource Request (213RR) (7)");
  assert.equal(workflow.buttonLabel("Resource Request (213RR)", 0), "Resource Request (213RR) (0)");
});
