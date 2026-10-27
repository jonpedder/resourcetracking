"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const workflow = require("./approval-workflow.js");

const requests = [
  { OBJECTID: 1, Priority: "Routine", DateNeeded: 100 },
  { OBJECTID: 2, Priority: "Urgent", DateNeeded: 300 },
  { OBJECTID: 3, Priority: "Emergency", DateNeeded: 200 }
];

test("sorts requests by priority", function () {
  assert.deepEqual(workflow.sortRequests(requests, "priority-desc").map(x => x.OBJECTID), [3, 2, 1]);
  assert.deepEqual(workflow.sortRequests(requests, "priority-asc").map(x => x.OBJECTID), [1, 2, 3]);
});

test("sorts requests by request date", function () {
  assert.deepEqual(workflow.sortRequests(requests, "date-desc").map(x => x.OBJECTID), [2, 3, 1]);
  assert.deepEqual(workflow.sortRequests(requests, "date-asc").map(x => x.OBJECTID), [1, 3, 2]);
});

for (const decision of [
  { toStatus: "Approved", expectedField: "ApprovedBy" },
  { toStatus: "Denied", expectedField: "DenialReason" }
]) {
  test("writes and verifies Workflow Manager payload for " + decision.toStatus, async function () {
    const calls = { request: null, comment: null, job: null };
    const result = await workflow.applyDecision({
      objectId: 42,
      fromStatus: "Under Review",
      toStatus: decision.toStatus,
      note: "Documented decision",
      username: "approver1",
      timestamp: 123456,
      jobId: "job-42",
      statusExtProp: "resource_request.request_status",
      denialReasonExtProp: "resource_request.denial_reason",
      updateRequest: async attrs => { calls.request = attrs; },
      addWorkflowComment: async (jobId, comment) => { calls.comment = { jobId, comment }; },
      updateWorkflowJob: async (jobId, body) => { calls.job = { jobId, body }; }
    });

    assert.equal(calls.request.RequestStatus, decision.toStatus);
    assert.ok(Object.hasOwn(calls.request, decision.expectedField));
    assert.equal(calls.comment.jobId, "job-42");
    assert.match(calls.comment.comment, new RegExp("Under Review → " + decision.toStatus));
    assert.deepEqual(calls.job.body.extendedProperties, [
      { identifier: "resource_request.request_status", value: decision.toStatus },
      { identifier: "resource_request.denial_reason", value: decision.toStatus === "Denied" ? "Documented decision" : "" }
    ]);
    assert.equal(result.jobId, "job-42");
  });
}

test("requires Workflow Manager linkage before editing a request", async function () {
  let requestWritten = false;
  await assert.rejects(workflow.applyDecision({
    objectId: 1,
    fromStatus: "Under Review",
    toStatus: "Approved",
    note: "Approved",
    updateRequest: async () => { requestWritten = true; }
  }), /no linked Workflow Manager job/);
  assert.equal(requestWritten, false);
});
