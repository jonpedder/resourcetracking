(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.RequestWorkflow = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function defaultQueue() {
    return { persona: "Approver", status: "Under Review" };
  }

  function pendingWhere(status) {
    return "RequestStatus = '" + String(status || "Under Review").replace(/'/g, "''") + "'";
  }

  function buttonLabel(baseLabel, count) {
    const base = baseLabel || "Request Approval";
    return Number.isFinite(count) && count >= 0 ? base + " (" + count + ")" : base;
  }

  function setPanelOpen(panel, button, open) {
    panel.classList.toggle("open", !!open);
    button.setAttribute("aria-expanded", String(!!open));
    return !!open;
  }

  function openApprovalPage(openWindow, url) {
    return openWindow(url || "./approval.html", "_blank", "noopener");
  }

  return {
    defaultQueue: defaultQueue,
    pendingWhere: pendingWhere,
    buttonLabel: buttonLabel,
    setPanelOpen: setPanelOpen,
    openApprovalPage: openApprovalPage
  };
});
