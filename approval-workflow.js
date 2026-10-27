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

  function approvalActions(step) {
    const responses = step && step.action && step.action.args && step.action.args.questionResponses;
    return Object.keys(responses || {}).map(function (key) {
      const response = responses[key] || {};
      const label = response.displayName || key;
      return { label: label, to: key, questionResponse: response.value, order: response.order || 0 };
    }).filter(function (action) {
      return action.to === "Approved" || action.to === "Denied";
    }).sort(function (a, b) { return a.order - b.order; });
  }

  function personaOwnsStatus(persona, status, steps) {
    return persona === "All Personas" || !!(steps && steps[status] && steps[status].owner === persona);
  }

  async function applyDecision(options) {
    const o = options || {};
    if (!o.note || !String(o.note).trim()) throw new Error("A decision note is required.");
    if (!o.objectId || !o.fromStatus || !o.toStatus) throw new Error("Decision context is incomplete.");
    if (o.toStatus !== "Approved" && o.toStatus !== "Denied") throw new Error("Unsupported approval decision.");
    if (!o.jobId) throw new Error("This request has no linked Workflow Manager job.");

    if (typeof o.completeWorkflowDecision === "function") {
      await o.completeWorkflowDecision(o.jobId, o.questionResponse);
    }

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
    approvalActions: approvalActions,
    personaOwnsStatus: personaOwnsStatus,
    applyDecision: applyDecision
  };
});
