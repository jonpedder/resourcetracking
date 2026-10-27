"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const filter = require("./request-state-filter.js");

test("request-state filter presents all requested choices in order", function () {
  assert.deepEqual(filter.OPTIONS.map(function (option) { return option.value; }), [
    "", "not-requested", "requested", "awaiting-approval", "approved", "denied", "in-fulfillment", "fulfilled-closed"
  ]);
});

test("maps workflow choices to request statuses", function () {
  assert.deepEqual(filter.statusesFor("requested"), ["Submitted"]);
  assert.deepEqual(filter.statusesFor("awaiting-approval"), ["Under Review"]);
  assert.deepEqual(filter.statusesFor("approved"), ["Approved"]);
  assert.deepEqual(filter.statusesFor("denied"), ["Denied"]);
  assert.deepEqual(filter.statusesFor("in-fulfillment"), ["Sourced", "En Route", "Deployed", "Demobilizing", "Returned"]);
  assert.deepEqual(filter.statusesFor("fulfilled-closed"), ["Closed"]);
});

test("extracts resource names only from generated request titles", function () {
  assert.equal(filter.resourceName({ attributes: { RequestTitle: "Request Aerial Ladder 0022" } }), "Aerial Ladder 0022");
  assert.equal(filter.resourceName({ attributes: { RequestTitle: "Manually entered request" } }), "");
});

test("builds resource clauses for requested and unrequested assets", function () {
  const requests = [{ attributes: { RequestTitle: "Request Aerial Ladder 0022" } }];
  assert.equal(filter.resourceClause("requested", requests, ["Aerial Ladder 0022"]), "ResourceName IN ('Aerial Ladder 0022')");
  assert.equal(filter.resourceClause("not-requested", requests, ["Aerial Ladder 0022"]), "ResourceName NOT IN ('Aerial Ladder 0022')");
  assert.equal(filter.resourceClause("approved", [], ["Aerial Ladder 0022"]), "1=0");
});

test("escapes apostrophes in resource-name clauses", function () {
  const requests = [{ attributes: { RequestTitle: "Request Chief's Vehicle" } }];
  assert.equal(filter.resourceClause("approved", requests, []), "ResourceName IN ('Chief''s Vehicle')");
});
