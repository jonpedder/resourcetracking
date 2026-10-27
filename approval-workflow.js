(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ApprovalWorkflow = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const PRIORITY_RANK = { Emergency: 4, Urgent: 3, High: 3, Routine: 2, Low: 1 };

  function requestTime(request) {
    const value = request && (request.DateNeeded || request.RequestDate || request.CreatedDate || request.OBJECTID);
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : (Date.parse(value) || 0);
  }

  function sortRequests(requests, mode) {
    const rows = (requests || []).slice();
    return rows.sort(function (a, b) {
      if (mode === "priority-asc" || mode === "priority-desc") {
        const direction = mode === "priority-asc" ? 1 : -1;
        const difference = (PRIORITY_RANK[a.Priority] || 0) - (PRIORITY_RANK[b.Priority] || 0);
        return difference ? difference * direction : requestTime(b) - requestTime(a);
      }
      return mode === "date-asc" ? requestTime(a) - requestTime(b) : requestTime(b) - requestTime(a);
    });
  }

  function transitionComment(fromStatus, toStatus, note, username) {
    return "Status: " + fromStatus + " → " + toStatus + " (by " + username + ")\nDecision note: " + note;
  }

  async function applyDecision(options) {
    const o = options || {};
    if (!o.note || !String(o.note).trim()) throw new Error("A decision note is required.");
    if (!o.objectId || !o.fromStatus || !o.toStatus) throw new Error("Decision context is incomplete.");
    if (o.toStatus !== "Approved" && o.toStatus !== "Denied") throw new Error("Unsupported approval decision.");
    if (!o.jobId) throw new Error("This request has no linked Workflow Manager job.");

    const attributes = { OBJECTID: o.objectId, RequestStatus: o.toStatus };
    if (o.toStatus === "Approved") {
      attributes.ApprovedBy = o.username;
      attributes.ApprovedDate = o.timestamp;
    } else {
      attributes.DenialReason = String(o.note).trim();
    }
    await o.updateRequest(attributes);

    const comment = transitionComment(o.fromStatus, o.toStatus, String(o.note).trim(), o.username);
    await o.addWorkflowComment(o.jobId, comment);
    await o.updateWorkflowJob(o.jobId, {
      extendedProperties: [
        { identifier: o.statusExtProp, value: String(o.toStatus) },
        { identifier: o.denialReasonExtProp, value: o.toStatus === "Denied" ? String(o.note).trim() : "" }
      ]
    });
    return { attributes: attributes, jobId: o.jobId, comment: comment };
  }

  return {
    PRIORITY_RANK: PRIORITY_RANK,
    requestTime: requestTime,
    sortRequests: sortRequests,
    transitionComment: transitionComment,
    applyDecision: applyDecision
  };
});
